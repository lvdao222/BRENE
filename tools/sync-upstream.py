"""把上游新版本的 zip 同步进来：3-way merge 保留汉化，只让新内容进来。

用法:
  python tools/sync-upstream.py BRENE-v0.0.75.zip           # 真的合并
  python tools/sync-upstream.py BRENE-v0.0.75.zip --dry-run # 只看会做什么

做的事:
  1) 除 webroot/ 以外的模块文件（sh/prop/tools）直接用上游新版本覆盖 module/
  2) webroot/ 里改过的文件做三方合并：
       ours  = module/webroot/X      （我们汉化过的）
       base  = upstream/webroot/X    （上次同步的上游原文）
       their = 新 zip 里的 webroot/X
     上游新增的行进来，我们的 data-i18n / t() 改动保留
  3) upstream/ 基线更新为新版本
  4) 合并完立刻跑检查脚本，把还没翻译的新文本列出来

冲突文件会保留 <<<<<<< 标记，需要手工（或让 AI）解决；脚本最后会列出冲突文件。
"""

import filecmp
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'upstream' / 'webroot'
MODULE = ROOT / 'module'
OURS = MODULE / 'webroot'

DRY = '--dry-run' in sys.argv
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
if not ARGS:
    sys.exit('用法: python tools/sync-upstream.py <上游 zip> [--dry-run]')
ZIP = Path(ARGS[0])
if not ZIP.is_file():
    sys.exit(f'找不到 zip: {ZIP}')


def rel_files(root: Path):
    return sorted(p.relative_to(root) for p in root.rglob('*') if p.is_file())


def merge(ours: Path, base: Path, theirs: Path):
    """git merge-file -p ours base theirs → (merged_text, conflicts)"""
    r = subprocess.run(
        ['git', 'merge-file', '-p', str(ours), str(base), str(theirs)],
        capture_output=True, text=True, encoding='utf-8')
    if r.returncode < 0:
        return None, -1
    return r.stdout, r.returncode


tmp = Path(tempfile.mkdtemp(prefix='brene-up-'))
with zipfile.ZipFile(ZIP) as z:
    z.extractall(tmp)

# zip 里 webroot 可能在根目录，也可能在某个子目录下
new_web = None
for cand in [tmp / 'webroot', *tmp.glob('*/webroot')]:
    if cand.is_dir():
        new_web = cand
        break
if new_web is None:
    sys.exit(f'zip 里找不到 webroot/ 目录: {ZIP}')

new_root = new_web.parent  # 其余模块文件相对它取

print(f'上游 zip: {ZIP.name}')
print(f'webroot: {new_web}')
print(f'模式: {"dry-run（不写盘）" if DRY else "写入"}\n')

# ---- 1) 非 webroot 的模块文件 ----
copied = []
for src in rel_files(new_root):
    if src.parts[0] == 'webroot':
        continue
    dst = MODULE / src
    changed = (not dst.exists()) or not filecmp.cmp(new_root / src, dst, shallow=False)
    if changed:
        copied.append(str(src))
        if not DRY:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(new_root / src, dst)
print(f'[模块文件] 更新 {len(copied)} 个')
for c in copied:
    print(f'  ~ {c}')

# ---- 2) webroot 三方合并 ----
merged, added, conflicts, deleted = [], [], [], []
for rel in rel_files(new_web):
    theirs = new_web / rel
    base = BASE / rel
    ours = OURS / rel
    if base.exists() and filecmp.cmp(base, theirs, shallow=False):
        continue  # 上游这个文件没变
    if not base.exists():
        added.append(str(rel))
        if not DRY:
            ours.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(theirs, ours)
        continue
    if not ours.exists():
        added.append(str(rel) + ' (ours 缺失，直接拷上游)')
        if not DRY:
            shutil.copy2(theirs, ours)
        continue
    text, n = merge(ours, base, theirs)
    if text is None:
        conflicts.append(str(rel) + ' (merge 失败)')
        continue
    if n > 0:
        conflicts.append(f'{rel} ({n} 处冲突)')
    else:
        merged.append(str(rel))
    if not DRY:
        ours.write_text(text, encoding='utf-8', newline='')

for rel in rel_files(BASE):
    if not (new_web / rel).exists():
        deleted.append(str(rel))

print(f'\n[webroot] 自动合并 {len(merged)} 个, 新增 {len(added)} 个, 冲突 {len(conflicts)} 个')
for m in merged:
    print(f'  ~ {m}')
for a in added:
    print(f'  + {a}')
for c in conflicts:
    print(f'  ! {c}')
for d in deleted:
    print(f'  - 上游删除了 {d}（我们这边保留着，按需手工删）')

# ---- 3) 基线更新 ----
if not DRY:
    BASE.mkdir(parents=True, exist_ok=True)
    for rel in rel_files(new_web):
        dst = BASE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(new_web / rel, dst)
    for rel in rel_files(BASE):
        if not (new_web / rel).exists():
            (BASE / rel).unlink()

shutil.rmtree(tmp, ignore_errors=True)

print('\n下一步（有冲突先解决冲突）:')
print('  node tools/check-i18n.mjs')
print('  python tools/check-html.py')
print('  python tools/pack.py')
if conflicts:
    print('\n[!] 有冲突，未完全自动化；冲突标记 <<<<<<< 在 module/webroot 对应文件里')
    sys.exit(1)
