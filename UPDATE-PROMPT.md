# 上游更新后，把这段提示词丢给 AI

> 用途：BRENE 出了新版本时，复制下面整段（把 `<新版本 zip>` 换成实际路径）给任意能读写文件的编码 agent。

---

这是一个已汉化的 BRENE（KernelSU 模块）仓库，仓库根目录：`<仓库绝对路径>`
上游刚发布了新版本，zip 在：`<新版本 zip 的绝对路径>`（例如 `BRENE-v0.0.75.zip`）

**目标**：把汉化同步到新版本，产出可刷入的模块 zip。不要重写架构。

**仓库结构**

- `module/`：汉化后的模块本体（含 `module/webroot/` 汉化版 WebUI）
- `upstream/webroot/`：上次同步的上游 webroot 原文，只作三方合并基线，**不要手改**
- `tools/`：`sync-upstream.py`、`check-i18n.mjs`、`check-html.py`、`pack.py`、`allow-untranslated.txt`

**i18n 架构（务必遵守，别改成别的方案）**

1. 静态文案：元素加 `data-i18n="group.key"`；`md-outlined-text-field` 的 label / placeholder 用 `data-i18n-label` / `data-i18n-placeholder`；元素原文保留上游英文作兜底。
2. 动态文案（JS 写进 DOM 的）：`t('group.key')`，参数用 `{name}` 占位。凡是 exec 回调里写的文本，都要先把**状态**存进模块级变量，在 render 里再调 `t()`，禁止把已翻译字符串缓存起来（否则切语言不重绘）。
3. 字典在 `module/webroot/i18n.js`：`en` 放上游英文原文，`zh` 放中文，key 分组前缀沿用 `common./toast./kernel./tab./home./android./hiding./spoof./susfs./rom./advanced./ksu./info./settings.`。
4. 品牌名 / 模块名 / 文件路径不翻译；新出现的这类词加进 `tools/allow-untranslated.txt`。
5. 语言切换 UI 与「设置」页签已存在（`#language_switch`、`data-tab="settings"`），不要挪位置、不要换成 md-outlined-select。

**步骤（按顺序，每步都要看输出）**

1. `python tools/sync-upstream.py <新版本 zip>`
   - 有冲突：逐个文件解决 `<<<<<<<` 标记（原则：上游逻辑全收，我们的 `data-i18n` / `t()` 保留），再用 `git merge-file` 之外的方式复核一遍该文件能正常渲染。
   - 注意（实测过）：三方合并只保证**代码不丢**，不保证**翻译标记齐**。上游新加的卡片行会原样并进来，例如
     `<span class="card-row__sub status-text">Status: Not installed</span>` 缺少
     `data-i18n="common.statusNotInstalled"`。这类漏标由下一步 `check-html.py` 报出来，照同组已有行补属性即可。
2. `node tools/check-i18n.mjs` → 必须 `OK`（缺 key、en/zh 不对称、占位符不一致都会报）。
3. `python tools/check-html.py` → 必须 `OK`。它列出的每条「未翻译可见文本 / 属性」，要么加 `data-i18n*` 并在字典里补 key，要么确认是品牌名/路径后加进 `tools/allow-untranslated.txt`。
4. 人工过一遍上游 diff（`upstream/` 基线已更新，可用 `git diff` 看）确认新增文案都翻了；重点看 `script.js` 里新写的 `innerText` / `toast(...)` 字符串有没有走 `t()`。
5. 更新 `VERSION.json` 的 `upstream` 字段为新版本号。
6. `python tools/pack.py` → 产出 `dist/BRENE-<版本>-zh.zip`，脚本内部会再跑一遍两项检查，不通过会中断。
7. 用无头浏览器抽查（可选但推荐）：把 `module/webroot` 拷到临时目录，在 `script.js` 前插一行 `localStorage.setItem('brene_lang','zh')` 生成预览页，`http://127.0.0.1:<端口>` 起静态服务，截图确认中文正常、页签和语言切换可用、没有英文残留。

**验收标准**

- `node tools/check-i18n.mjs` 输出 `OK`，HTML key 数 ≈ 原数量 + 新增项。
- `python tools/check-html.py` 输出 `OK`，白名单外 0 处漏翻。
- `dist/BRENE-<版本>-zh.zip` 里 `webroot/i18n.js`、`index.html`、`script.js`、`styles.css` 齐全，`assets/` 与上游字节一致，`module.prop` 的 `version` 是新版本号、`author` 未被改动。
- 中文页无 `Status:` / `Failed to load` / `Settings` 之类英文残留（品牌名与路径除外）；`<html lang="zh-CN">`；切到 English 后全部回到英文。

**禁止**：改 `module.prop` 的作者与 update.json 指向以外的内容；删掉 `upstream/` 基线；把 `assets/mwc.js`、`assets/kernelsu.js` 换成别的版本；为了过检查删除需求或放宽检查；未经确认直接把 zip 发出去（先给路径和检查输出）。
