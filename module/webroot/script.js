import { exec, toast } from './assets/kernelsu.js'
import './assets/mwc.js'
import { applyTranslations, getLanguage, initI18n, LANGUAGES, onLanguageChange, setLanguage, t } from './i18n.js'

const MODDIR = '/data/adb/modules/brene'
const PERSISTENT_DIR = '/data/adb/brene'
const configs = [
	{
		id: 'hide_sus_mnts_for_non_su_procs',
		action: (enabled) => setFeature(`susfs hide_sus_mnts_for_non_su_procs ${enabled ? 1 : 0}`),
	},
	{
		id: 'su_compat',
		action: (enabled) => setFeature(`ksud feature set su_compat ${enabled ? 1 : 0} && ksud feature save`),
	},
	{
		id: 'kernel_umount',
		action: (enabled) => setFeature(`ksud feature set kernel_umount ${enabled ? 1 : 0} && ksud feature save`),
	},
	{
		id: 'selinux_hide',
		action: (enabled) => setFeature(`ksud feature set selinux_hide ${enabled ? 1 : 0} && ksud feature save`),
	},
	{
		id: 'developer_options',
		action: (enabled) => setFeature(`settings put global development_settings_enabled ${enabled ? 1 : 0}`),
	},
	{
		id: 'usb_debugging',
		action: (enabled) => setFeature(`settings put global adb_enabled ${enabled ? 1 : 0}`),
	},
	{
		id: 'wireless_debugging',
		action: (enabled) => setFeature(`settings put global adb_wifi_enabled ${enabled ? 1 : 0}`),
	},
	{
		id: 'saturation',
		action: (enabled) => setFeature(`service call SurfaceFlinger 1022 f ${enabled ? 2.0 : 1.0}`),
	},
	{
		id: 'show_refresh_rate',
		action: (enabled) => setFeature(`service call SurfaceFlinger 1034 i32 ${enabled ? 1 : 0}`),
	},
	{
		id: 'disable_child_process_restrictions',
		action: (enabled) => {
			setFeature(`resetprop -n persist.sys.fflag.override.settings_enable_monitor_phantom_procs ${enabled ? false : true}`)
		},
	},
	{ id: 'pif_props' },
	{ id: 'rom_props' },
	{ id: 'brene_logs' },
	{ id: 'enable_log' },
	{ id: 'spoof_uname' },
	{ id: 'spoof_hosts' },
	{ id: 'hide_addon_d' },
	{ id: 'shrink_buffer_size' },
	{ id: 'custom_spoof_uname' },
	{ id: 'hide_suspicious_pty' },
	{ id: 'hide_custom_recovery' },
	{ id: 'hide_lineage_strings' },
	{ id: 'spoof_libstagefright' },
	{ id: 'hide_ksu_directories' },
	{ id: 'hide_third_party_apps' },
	{ id: 'hide_custom_rom_paths' },
	{ id: 'hide_custom_rom_paths_2' },
	{ id: 'hide_framework_res_apk' },
	{ id: 'enable_avc_log_spoofing' },
	{ id: 'spoof_cmdline_or_bootconfig' },
	{ id: 'fix_data_local_tmp_inconsistencies' },
	{ id: 'spoof_system_properties' },
	{ id: 'spoof_fingerprint_properties' },
	{ id: 'spoof_utc_properties' },
	{ id: 'spoof_date_properties' },
	{ id: 'spoof_os_security_patch_level_property' },
	{ id: 'spoof_vendor_security_patch_level_property' },

	{ id: 'paths_hiding__non_standard_sdcard' },
	{ id: 'paths_hiding__non_standard_sdcard_android' },
	{ id: 'paths_hiding__data_local_tmp' },
]

// ---- i18n: 先定语言、把静态文案翻好，再把内容显示出来，避免闪一下英文 ----
initI18n()
applyTranslations()

document.querySelector('div.preload-hidden').classList.remove('preload-hidden')

// 需要跟随语言重绘的动态内容：注册渲染函数，数据到了 / 语言变了都重绘一次
const renderers = []
function onRender(fn) {
	renderers.push(fn)
	fn()
}
function rerenderAll() {
	renderers.forEach((fn) => fn())
}

onLanguageChange(() => {
	rerenderAll()
	syncLanguageSwitch()
})

// ---- 语言切换按钮（设置页） ----
function syncLanguageSwitch() {
	const current = getLanguage()
	document.querySelectorAll('#language_switch .lang-switch__btn').forEach((btn) => {
		btn.classList.toggle('active', btn.dataset.lang === current)
	})
}

function buildLanguageSwitch() {
	const container = document.getElementById('language_switch')
	if (!container) return

	container.innerHTML = ''
	LANGUAGES.forEach(({ code, label }) => {
		const btn = document.createElement('button')
		btn.type = 'button'
		btn.className = 'lang-switch__btn'
		btn.dataset.lang = code
		btn.textContent = label
		btn.addEventListener('click', () => setLanguage(code))
		container.appendChild(btn)
	})

	syncLanguageSwitch()
}

buildLanguageSwitch()

// Open URLs
document.querySelectorAll('a[href]').forEach((element) => {
	element.addEventListener('click', (event) => {
		event.preventDefault()
		exec(`am start -a android.intent.action.VIEW -d ${element.href}`)
	})
})

// Load Android Version
let androidInfo = null
onRender(() => {
	const container = document.querySelector('#android-version .card-row__sub')
	if (!androidInfo) return
	if (androidInfo.failed) {
		container.innerText = t('common.failedToLoad')
		return
	}
	container.innerText = `${androidInfo.release} (API ${androidInfo.sdk}) | SDK ${androidInfo.sdk}`
})

exec('resetprop ro.build.version.release && resetprop ro.build.version.sdk').then((result) => {
	if (result.errno !== 0) {
		androidInfo = { failed: true }
	} else {
		const results = result.stdout.replaceAll('\n', ' ')
		const splits = results.split(' ')
		androidInfo = { release: splits[0], sdk: splits[1] }
	}
	rerenderAll()
})

// Load SuSFS Variant
let susfsVariant = null
onRender(() => {
	const container = document.querySelector('#susfs-variant .card-row__sub')
	if (susfsVariant === null) return
	container.innerText = susfsVariant.failed ? t('common.failedToLoad') : susfsVariant.text
})

exec('susfs show variant').then((result) => {
	susfsVariant = result.errno !== 0 ? { failed: true } : { text: result.stdout }
	rerenderAll()
})

// Load Kernel Version
let kernelVersion = null
onRender(() => {
	const container = document.querySelector('#kernel-version .card-row__sub')
	if (!kernelVersion) return
	if (kernelVersion.failed) {
		container.innerText = t('common.failedToLoad')
		return
	}
	const { procVersion, uname } = kernelVersion
	if (procVersion === uname) {
		container.innerText = t('kernel.default', { version: procVersion })
	} else {
		container.innerText = `${t('kernel.default', { version: procVersion })}\n${t('kernel.spoofed', { version: uname })}`
	}
})

exec("cat /proc/version | awk '{print $3}' && uname -r").then((result) => {
	if (result.errno !== 0) {
		kernelVersion = { failed: true }
	} else {
		const [procVersion, uname] = result.stdout.split('\n')
		kernelVersion = { procVersion, uname }
	}
	rerenderAll()
})

// Load Device Model Status
let deviceModel = null
onRender(() => {
	const container = document.querySelector('#device-model .card-row__sub')
	if (!deviceModel) return
	container.innerText = deviceModel.failed ? t('common.failedToLoad') : `${deviceModel.manufacturer} ${deviceModel.model} | ${deviceModel.device}`
})

exec('resetprop ro.product.manufacturer && resetprop ro.product.model && resetprop ro.product.device').then((result) => {
	if (result.errno !== 0) {
		deviceModel = { failed: true }
		rerenderAll()
		return
	}

	const splits = result.stdout.split('\n')

	exec('resetprop ro.product.marketname').then((marketName) => {
		const model = (marketName.errno === 0 && marketName.stdout) || splits[1]
		deviceModel = { manufacturer: splits[0], model, device: splits[2] }
		rerenderAll()
	})
})

// Load Custom ROM Status
let customRom = null
onRender(() => {
	const container = document.querySelector('#custom-rom .card-row__sub')
	if (!customRom) return
	container.innerText = customRom.failed ? t('common.failedToLoad') : t(customRom.yes ? 'common.yes' : 'common.no')
})

exec('[[ -n "$(find /system -iname "*lineage*")" ]] && echo "Yes" || echo "No"').then((result) => {
	customRom = result.errno !== 0 ? { failed: true } : { yes: result.stdout.trim() === 'Yes' }
	rerenderAll()
})

// Load ..5.u.S Status
let susStatus = null
onRender(() => {
	const container = document.querySelector('#sus-status .card-row__sub')
	if (!susStatus) return
	container.innerText = susStatus.failed ? t('common.failedToLoad') : t(susStatus.abnormal ? 'common.abnormal' : 'common.normal')
})

exec('[[ -e /storage/emulated/0/..5.u.S ]] && echo "Abnormal" || echo "Normal"').then((result) => {
	susStatus = result.errno !== 0 ? { failed: true } : { abnormal: result.stdout.trim() === 'Abnormal' }
	rerenderAll()
})

// Recommended / Incompatible Modules
const installedRecommended = new Set()
const installedIncompatible = new Set()

function renderModuleStatus(containerId, keys) {
	const container = document.getElementById(containerId)
	if (!container) return

	container.querySelectorAll('.card-row').forEach((row) => {
		const moduleKey = row.getAttribute('data-module')
		const statusSpan = row.querySelector('.status-text')
		if (!statusSpan) return

		const installed = keys.has(moduleKey)
		statusSpan.innerText = t(installed ? 'common.statusInstalled' : 'common.statusNotInstalled')
		statusSpan.style.color = installed ? (containerId === 'recommended-modules' ? '#4CAF50' : '#ff0000be') : ''
	})
}

onRender(() => renderModuleStatus('recommended-modules', installedRecommended))
onRender(() => renderModuleStatus('incompatible-modules', installedIncompatible))

exec('ksud module list').then((result) => {
	if (result.errno !== 0) return

	try {
		const modules = JSON.parse(result.stdout)
		const moduleIds = modules.map((mod) => mod.id)

		moduleIds.forEach((id) => {
			installedRecommended.add(id)
			installedIncompatible.add(id)
		})

		// Tricky Addon: 目录名与模块 id 不一致，单独判断
		exec('[[ -e /data/adb/modules/TA_utl ]]').then((ta) => {
			if (ta.errno === 0) installedRecommended.add('tricky_addon')
			rerenderAll()
		})
	} catch (e) {
		rerenderAll()
	}
})

// Load enabled features
let kernelFeatures = null
onRender(() => {
	const container = document.getElementById('kernel-features-container')
	if (kernelFeatures === null) return
	container.innerText = kernelFeatures.failed ? t('common.failedToLoad') : kernelFeatures.text
})

exec('susfs show enabled_features').then((result) => {
	kernelFeatures = result.errno !== 0 ? { failed: true } : { text: result.stdout.replaceAll('CONFIG_KSU_SUSFS_', '') }
	rerenderAll()
})

// Load Suspicious Mounts
let suspiciousMounts = null
onRender(() => {
	const container = document.getElementById('suspicious_mounts')
	if (suspiciousMounts === null) return
	if (suspiciousMounts.failed) {
		container.innerText = t('common.failedToLoad')
		return
	}
	container.innerText = suspiciousMounts.text.length > 0 ? suspiciousMounts.text : t('common.noMounts')
})

exec(`cat /proc/1/mountinfo | grep -E "^2[0-9]{9,} .*$|KSU" | awk '{print $5}'`).then((result) => {
	suspiciousMounts = result.errno !== 0 ? { failed: true } : { text: result.stdout }
	rerenderAll()
})

// Load logs
let logPieces = null
onRender(() => {
	const container = document.getElementById('logs')
	if (logPieces === null) {
		container.textContent = ''
		return
	}

	container.textContent = logPieces.map((piece) => (piece.failed ? t('common.failedToLoad') : piece.text)).join('') + '\n'
})

exec(`cat ${PERSISTENT_DIR}/log.txt`).then((result) => {
	logPieces = [result.errno !== 0 ? { failed: true } : { text: result.stdout }]

	exec(`cat ${PERSISTENT_DIR}/logs.txt`).then((result2) => {
		logPieces.push(result2.errno !== 0 ? { failed: true } : { text: result2.stdout })
		rerenderAll()
	})
})

// Load brene version
let breneVersion = null
onRender(() => {
	document.getElementById('brene-version').innerText = breneVersion === null ? '' : breneVersion.failed ? t('common.unknown') : breneVersion.text
})

exec(`grep "^version=" ${MODDIR}/module.prop | cut -d'=' -f2`).then((result) => {
	breneVersion = result.errno === 0 ? { text: result.stdout } : { failed: true }
	rerenderAll()
})

// Load susfs version
let susfsVersion = null
onRender(() => {
	document.getElementById('susfs-version').innerText = susfsVersion === null ? '' : susfsVersion.failed ? t('common.unknown') : susfsVersion.text
})

exec('susfs show version').then((result) => {
	susfsVersion = result.errno === 0 ? { text: `${result.stdout}` } : { failed: true }
	rerenderAll()
})

// Helper function to update config
function updateConfig(config, value) {
	exec(`sed -i "s/^${config}=.*/${config}=${value}/" ${PERSISTENT_DIR}/config.sh`).then((result) => {
		if (result.errno !== 0) toast(t('toast.failedToUpdateConfig'))
	})
}

// TEMP
// Helper function to update config
function updateConfig2(config, value) {
	exec(`sed -i "s/^${config}=.*/${config}='${value}'/" ${PERSISTENT_DIR}/config.sh`).then((result) => {
		if (result.errno !== 0) toast(t('toast.failedToUpdateConfig'))
	})
}

// Helper function to set config immedialtely that no need to reboot
function setFeature(cmd) {
	exec(cmd).then((result) => {
		toast(result.errno === 0 ? t('toast.rebootNotRequired') : result.stderr)
	})
}

// Load config and add toggle event
exec(`cat ${PERSISTENT_DIR}/config.sh`).then((result) => {
	if (result.errno !== 0) {
		toast(t('toast.failedToLoad'))
		return
	}

	const configValues = Object.fromEntries(
		result.stdout
			.split('\n')
			.filter((line) => line.includes('='))
			.map((line) => {
				const [key, ...val] = line.split('=')
				return [
					key.trim(),
					val
						.join('=')
						.trim()
						.replace(/^['"](.*)['"]$/, '$1'),
				]
			}),
	)

	// custom uname
	document.getElementById('custom_uname_release').value = configValues['config_custom_uname_kernel_release']
	document.getElementById('custom_uname_version').value = configValues['config_custom_uname_kernel_version']

	// Verified Boot Hash
	document.getElementById('vbh_text_field').value = configValues['config_spoof_verified_boot_hash']

	// toggle
	configs.forEach((config) => {
		const configId = `config_${config.id}`
		const element = document.getElementById(config.id)
		if (!element) return

		const value = configValues[configId]
		if (value !== undefined) {
			element.selected = parseInt(value) === 1
		}

		element.addEventListener('change', async () => {
			const enabled = element.selected
			const newConfigValue = +enabled
			updateConfig(configId, newConfigValue)
			if (config.action) config.action(enabled)
		})
	})

	// Reset Settings
	const dialog = document.getElementById('dialog')
	const openButton = document.getElementById('reset_settings')
	openButton.addEventListener('click', () => {
		dialog.show()
	})
	dialog.addEventListener('close', () => {
		if (dialog.returnValue === 'confirm') {
			exec(`
				cp -f ${MODDIR}/config.sh ${PERSISTENT_DIR}
			`).then((result) => {
				configs.forEach((config) => {
					const configId = `config_${config.id}`
					const element = document.getElementById(config.id)
					if (!element) return

					const value = configValues[configId]
					if (value !== undefined) {
						element.selected = parseInt(value) === 1
					}
				})

				toast(result.errno === 0 ? t('toast.success') : result.stderr)
			})
		}
	})
})

// KSU Module Control
;(async () => {
	const enableButton = document.getElementById('enable_ksu_modules')
	const disableButton = document.getElementById('disable_ksu_modules')

	const toggleAllModules = (enable) => {
		exec(`
			for i in /data/adb/modules/*; do
				${enable ? 'rm -f' : 'touch'} "$i/disable"
			done
		`).then((result) => {
			toast(result.errno === 0 ? t('toast.success') : result.stderr)
		})
	}

	enableButton.addEventListener('click', () => toggleAllModules(true))
	disableButton.addEventListener('click', () => toggleAllModules(false))
})()

// Custom Uname buttons
;(async () => {
	const unameRelease = document.getElementById('custom_uname_release')
	const unameVersion = document.getElementById('custom_uname_version')

	const updateUname = (release, version) => {
		updateConfig2('config_custom_uname_kernel_release', release)
		updateConfig2('config_custom_uname_kernel_version', version)
		setFeature(`susfs set_uname "${release}" "${version}"`)
	}

	// Apply
	document.getElementById(`button_custom_uname_apply`).onclick = () => {
		if (unameRelease.value !== '' && unameVersion.value !== '') {
			updateUname(unameRelease.value, unameVersion.value)
		}
	}

	// Reset
	document.getElementById(`button_custom_uname_reset`).onclick = () => {
		updateUname('default', 'default')
		unameRelease.value = 'default'
		unameVersion.value = 'default'
	}
})()

// Verified Boot Hash
;(async () => {
	const button = document.getElementById('vbh_button')
	const textField = document.getElementById('vbh_text_field')

	button.addEventListener('click', () => {
		updateConfig2('config_spoof_verified_boot_hash', textField.value)

		exec(`resetprop -n ro.boot.vbmeta.digest ${textField.value}`).then((result) => {
			if (result.errno === 0) {
				toast(t('toast.rebootNotRequired'))
			} else {
				toast(t('toast.failedToUpdateProp'))
			}
		})
	})
})()

//
;(async () => {
	const mapField = document.getElementById('custom_sus_map_text_field')
	const pathField = document.getElementById('custom_sus_path_text_field')
	const loopField = document.getElementById('custom_sus_path_loop_text_field')
	const openRedirectField = document.getElementById('custom_open_redirect_text_field')
	const applyButton = document.getElementById('unified_apply_button')
	const tabs = document.getElementById('sus_tabs')
	const scrollContainer = document.getElementById('horizontal_scroll_container')

	// Load all contents
	exec(`cat ${PERSISTENT_DIR}/custom_sus_map.txt`).then((result) => {
		mapField.value = result.errno === 0 ? `${result.stdout}` : ''
	})
	exec(`cat ${PERSISTENT_DIR}/custom_sus_path.txt`).then((result) => {
		pathField.value = result.errno === 0 ? `${result.stdout}` : ''
	})
	exec(`cat ${PERSISTENT_DIR}/custom_sus_path_loop.txt`).then((result) => {
		loopField.value = result.errno === 0 ? `${result.stdout}` : ''
	})
	exec(`cat ${PERSISTENT_DIR}/custom_open_redirect.txt`).then((result) => {
		openRedirectField.value = result.errno === 0 ? `${result.stdout}` : ''
	})

	// Tabs and Scroll Sync
	tabs.addEventListener('change', () => {
		const index = tabs.activeTabIndex
		const width = scrollContainer.getBoundingClientRect().width
		scrollContainer.scrollTo({
			left: width * index,
			behavior: 'smooth',
		})
	})

	let scrollTimeout
	scrollContainer.addEventListener('scroll', () => {
		clearTimeout(scrollTimeout)
		scrollTimeout = setTimeout(() => {
			const width = scrollContainer.getBoundingClientRect().width
			const index = Math.round(scrollContainer.scrollLeft / width)
			if (tabs.activeTabIndex !== index) {
				tabs.activeTabIndex = index
			}
		}, 50)
	})

	applyButton.onclick = () => {
		const index = tabs.activeTabIndex
		let file = ''
		let content = ''

		switch (index) {
			case 0:
				file = 'custom_sus_map.txt'
				content = mapField.value
				break
			case 1:
				file = 'custom_sus_path.txt'
				content = pathField.value
				break
			case 2:
				file = 'custom_sus_path_loop.txt'
				content = loopField.value
				break
			case 3:
				file = 'custom_open_redirect.txt'
				content = openRedirectField.value
				break
		}

		if (file) {
			if (content === '') {
				exec(`printf '' > ${PERSISTENT_DIR}/${file}`).then((result) => {
					toast(result.errno === 0 ? t('toast.successReboot') : result.stderr)
				})
			} else {
				content = content.replaceAll('/sdcard', '/storage/emulated/0')

				exec(`
cat <<'UNIQUE_EOF' > ${PERSISTENT_DIR}/${file}
${content}
UNIQUE_EOF
				`).then((result) => {
					toast(result.errno === 0 ? t('toast.successReboot') : result.stderr)
				})
			}
		}
	}
})()

// Manual Kernel Umount
;(async () => {
	const mountField = document.getElementById('custom_kernel_umount_text_field')
	const applyButton = document.getElementById('kernel_umount_apply_button')

	// Load all content
	exec(`cat ${PERSISTENT_DIR}/custom_kernel_umount.txt`).then((result) => {
		mountField.value = result.errno === 0 ? `${result.stdout}` : ''
	})

	applyButton.onclick = () => {
		let file = 'custom_kernel_umount.txt'
		let content = mountField.value

		if (file) {
			if (content === '') {
				exec(`printf '' > ${PERSISTENT_DIR}/${file}`).then((result) => {
					toast(result.errno === 0 ? t('toast.success') : result.stderr)
				})
			} else {
				exec(`
cat <<'UNIQUE_EOF' > ${PERSISTENT_DIR}/${file}
${content}
UNIQUE_EOF
				`).then((result) => {
					toast(result.errno === 0 ? t('toast.success') : result.stderr)
				})
			}
		}
	}
})()

// tabs.js — tab switching
;(async () => {
	var btns = document.querySelectorAll('.tab-btn')
	var panels = document.querySelectorAll('.tab-panel')

	function activate(id) {
		btns.forEach(function (b) {
			b.classList.toggle('active', b.dataset.tab === id)
		})
		panels.forEach(function (p) {
			p.classList.toggle('active', p.dataset.panel === id)
		})
	}

	btns.forEach(function (btn) {
		btn.addEventListener('click', function () {
			activate(btn.dataset.tab)
			try {
				sessionStorage.setItem('brene_tab', btn.dataset.tab)
			} catch (e) {}
		})
	})

	try {
		var saved = sessionStorage.getItem('brene_tab')
		if (saved) activate(saved)
	} catch (e) {}
})()

// Swipe
;(async () => {
	const tabBar = document.getElementById('tab-bar')
	const bodyContent = document
	const buttons = Array.from(tabBar.querySelectorAll('button.tab-btn'))
	const SWIPE_THRESHOLD = 10
	let currentIndex = buttons.findIndex((btn) => btn.classList.contains('active')) || 0
	let touchStartX = 0
	let touchStartY = 0

	const updateUI = (index) => {
		buttons[index].click()

		buttons[index].scrollIntoView({
			behavior: 'auto',
			block: 'nearest',
			inline: 'center',
		})
	}

	const changeTab = (index) => {
		if (index >= 0 && index < buttons.length) {
			currentIndex = index
			updateUI(index)
		}
	}

	bodyContent.addEventListener(
		'touchstart',
		(e) => {
			touchStartX = e.touches[0].clientX
			touchStartY = e.touches[0].clientY
		},
		{ passive: true },
	)

	bodyContent.addEventListener(
		'touchend',
		(e) => {
			if (e.target.closest('.tab-bar') === null) {
				const touchEndX = e.changedTouches[0].clientX
				const touchEndY = e.changedTouches[0].clientY

				const diffX = touchStartX - touchEndX
				const diffY = touchStartY - touchEndY

				const isHorizontalSwipe = Math.abs(diffX) > SWIPE_THRESHOLD
				const isDominantX = Math.abs(diffX) > Math.abs(diffY) * 3

				if (isHorizontalSwipe && isDominantX) {
					if (diffX > 0) {
						changeTab(currentIndex + 1)
					} else {
						changeTab(currentIndex - 1)
					}
				}
			}
		},
		{ passive: true },
	)

	tabBar.addEventListener('click', (e) => {
		const btn = e.target.closest('.tab-btn')
		if (btn) {
			currentIndex = buttons.indexOf(btn)
		}
	})
})()
