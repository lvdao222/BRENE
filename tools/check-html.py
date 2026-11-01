"""列出 index.html 里还没翻译的可见文本 / 属性，以及 data-i18n 用法问题。

用法: python tools/check-html.py [文件路径]
默认检查 module/webroot/index.html。
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'module' / 'webroot' / 'index.html'

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'}
LATIN = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')


def has_words(t):
    return sum(1 for ch in t if ch in LATIN) >= 2


class Node:
    __slots__ = ('tag', 'attrs', 'children', 'line', 'parent')

    def __init__(self, tag, attrs, line, parent):
        self.tag, self.attrs, self.line, self.parent = tag, attrs, line, parent
        self.children = []


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root', {}, 0, None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        node = Node(tag, dict(attrs), self.getpos()[0], self.cur)
        self.cur.children.append(node)
        self.cur = node

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.getpos()[0], self.cur)
        self.cur.children.append(node)

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(('text', data, self.getpos()[0]))


tb = TreeBuilder()
tb.feed(PATH.read_text(encoding='utf-8'))


def walk(node, under_i18n):
    if isinstance(node, tuple):
        text = node[1].strip()
        if text and has_words(text) and not under_i18n:
            yield ('text', node[2], '', text)
        return
    has = 'data-i18n' in node.attrs
    if has and any(not isinstance(c, tuple) for c in node.children):
        subs = [c.tag for c in node.children if not isinstance(c, tuple)]
        yield ('nested', node.line, node.tag, ','.join(subs))
    for attr, key in (('label', 'data-i18n-label'), ('placeholder', 'data-i18n-placeholder')):
        val = node.attrs.get(attr)
        if val and has_words(val) and key not in node.attrs:
            yield ('attr', node.line, node.tag, f'{attr}="{val}"')
    for c in node.children:
        yield from walk(c, under_i18n or has)


issues = list(walk(tb.root, False))
kinds = {}
for it in issues:
    kinds.setdefault(it[0], []).append(it)

# 白名单 + 路径类自动跳过
ALLOW_FILE = ROOT / 'tools' / 'allow-untranslated.txt'
allow = set()
if ALLOW_FILE.exists():
    for line in ALLOW_FILE.read_text(encoding='utf-8').splitlines():
        s = line.strip()
        if s and not s.startswith('#'):
            allow.add(s)


def exempt(kind, value):
    if kind != 'text':
        return False
    if value in allow:
        return True
    return '/' in value  # 路径 / URL / 命令示例


skipped = 0
kept = {}
for kind, items in kinds.items():
    rest = []
    for it in items:
        if exempt(kind, it[3]):
            skipped += 1
        else:
            rest.append(it)
    kept[kind] = rest

titles = {
    'text': '未翻译可见文本（需要 data-i18n）',
    'attr': '未翻译属性（需要 data-i18n-label / -placeholder）',
    'nested': 'data-i18n 元素内含子元素（textContent 会吃掉子元素）',
}
total = 0
for kind, title in titles.items():
    items = kept.get(kind, [])
    total += 0 if kind == 'i18n-has-text' else len(items)
    print(f'=== {title}: {len(items)} ===')
    for _, line, a, b in items:
        print(f'  {line:5d}: {a} {b}')

print(f'\n白名单/路径跳过: {skipped} 处（见 tools/allow-untranslated.txt）')
print()
if total:
    print(f'FAIL: 还有 {total} 处需要加翻译标记')
    sys.exit(1)
print('OK: 没有遗漏的可见文本/属性')
