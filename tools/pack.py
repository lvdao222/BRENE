"""把 module/ 打包成可刷入的 KernelSU 模块 zip（含汉化 webui）。

用法: python tools/pack.py
输出: dist/BRENE-<version>-zh.zip   （zip 根目录就是模块文件，和官方 release 结构一致）
"""

import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULE = ROOT / 'module'
DIST = ROOT / 'dist'

prop = (MODULE / 'module.prop').read_text(encoding='utf-8')
version = re.search(r'^version=(.+)$', prop, re.M).group(1).strip()

# 打包前必须过检查脚本，避免把半成品发出去
checks = [
    ('node', 'tools/check-i18n.mjs'),
    (sys.executable, 'tools/check-html.py'),
]
for exe, script in checks:
    import subprocess
    r = subprocess.run([exe, script], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    tail = (r.stdout or '').strip().splitlines()[-3:]
    print(f'$ {exe} {script}\n  ' + '\n  '.join(tail))
    if r.returncode != 0:
        sys.exit(f'检查未通过，已中断打包: {script}')

DIST.mkdir(exist_ok=True)
out = DIST / f'BRENE-{version}-zh.zip'
if out.exists():
    out.unlink()

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for path in sorted(MODULE.rglob('*')):
        arc = path.relative_to(MODULE).as_posix()
        if path.is_dir():
            z.writestr(zipfile.ZipInfo(arc + '/'), '')
        else:
            z.write(path, arc)

print(f'\n打包完成: {out}  ({out.stat().st_size} bytes, {version})')
with zipfile.ZipFile(out) as z:
    for i in z.infolist():
        print(f'  {i.file_size:8d}  {i.filename}')
