// 校验 i18n 词条：所有 data-i18n* / t() 用到的 key 必须在 en 与 zh 里都存在，且两份字典 key 集合一致
// 用法: node tools/check-i18n.mjs
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const web = join(root, 'module', 'webroot')

const src = readFileSync(join(web, 'i18n.js'), 'utf8') + '\nexport const __probe = { LANGUAGES, en, zh }\n'
const probePath = join(web, '__i18n_probe.mjs')
writeFileSync(probePath, src)
const { __probe } = await import(pathToFileURL(probePath).href)
unlinkSync(probePath)

const { LANGUAGES, en, zh } = __probe
const html = readFileSync(join(web, 'index.html'), 'utf8')
const js = readFileSync(join(web, 'script.js'), 'utf8')

const htmlKeys = new Set()
for (const m of html.matchAll(/data-i18n(?:-label|-placeholder)?="([^"]+)"/g)) htmlKeys.add(m[1])
const jsKeys = new Set()
for (const m of js.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) jsKeys.add(m[1])

const used = new Set([...htmlKeys, ...jsKeys])
const enKeys = new Set(Object.keys(en))
const zhKeys = new Set(Object.keys(zh))

console.log('languages: ' + LANGUAGES.map((l) => l.code + '/' + l.label).join(', '))
console.log(`html keys: ${htmlKeys.size} | js keys: ${jsKeys.size} | union: ${used.size}`)
console.log(`dict en: ${enKeys.size} | dict zh: ${zhKeys.size}`)

let bad = 0
const missing = [...used].filter((k) => !enKeys.has(k) || !zhKeys.has(k))
if (missing.length) {
	bad++
	console.log('\n[!] 缺少词条:')
	for (const k of missing) console.log(`    ${k}  en=${enKeys.has(k)} zh=${zhKeys.has(k)}`)
}
const onlyEn = [...enKeys].filter((k) => !zhKeys.has(k))
const onlyZh = [...zhKeys].filter((k) => !enKeys.has(k))
if (onlyEn.length || onlyZh.length) {
	bad++
	console.log('\n[!] en/zh key 集合不一致:')
	for (const k of onlyEn) console.log(`    仅 en: ${k}`)
	for (const k of onlyZh) console.log(`    仅 zh: ${k}`)
}

// 占位符一致性：en 里出现的 {name} 在 zh 里也该出现
const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')
for (const k of enKeys) {
	if (!zhKeys.has(k)) continue
	if (ph(en[k]) !== ph(zh[k])) {
		bad++
		console.log(`\n[!] 占位符不一致 ${k}: en={${ph(en[k])}} zh={${ph(zh[k])}}`)
	}
}

const unused = [...enKeys].filter((k) => !used.has(k)).sort()
console.log(`\n未使用的 key: ${unused.length} → ${unused.join(', ')}`)

if (bad) {
	console.log('\nFAIL')
	process.exitCode = 1
} else {
	console.log('\nOK: 用到的 key 全在 en/zh 里，两份字典 key 集合一致，占位符一致')
}
