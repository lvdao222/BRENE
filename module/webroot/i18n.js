/**
 * i18n.js — BRENE WebUI 多语言支持
 *
 * 用法：
 *   - 静态文案：在 HTML 元素上加 data-i18n="key"（替换 textContent）
 *               data-i18n-label="key"（替换 label 属性，用于 md-*-text-field）
 *               data-i18n-placeholder="key"（替换 placeholder 属性）
 *   - 动态文案：在 JS 里用 t('key', { name: value }) 取字符串
 *   - 切换语言：setLanguage('zh')，会持久化到 localStorage 并触发 onLanguageChange
 */

const STORAGE_KEY = 'brene_lang'

export const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'zh', label: '简体中文' },
]

const en = {
	// ---- 通用 ----
	'common.failedToLoad': 'Failed to load',
	'common.unknown': 'unknown',
	'common.noMounts': 'No mounts',
	'common.yes': 'Yes',
	'common.no': 'No',
	'common.normal': 'Normal',
	'common.abnormal': 'Abnormal',
	'common.example': 'Example:',
	'common.apply': 'APPLY',
	'common.reset': 'RESET',
	'common.importantNotes': 'Important Notes:',
	'common.experimental': 'EXPERIMENTAL',
	'common.statusInstalled': 'Status: Installed',
	'common.statusNotInstalled': 'Status: Not installed',

	// ---- 提示 toast ----
	'toast.rebootNotRequired': 'Reboot not required',
	'toast.success': 'Success',
	'toast.successReboot': 'Success, reboot to apply',
	'toast.failedToLoad': 'Failed to load',
	'toast.failedToUpdateConfig': 'Failed to update config',
	'toast.failedToUpdateProp': 'Failed to update prop',

	// ---- 内核信息 ----
	'kernel.default': 'Default: {version}',
	'kernel.spoofed': 'Spoofed: {version}',

	// ---- 标签页 ----
	'tab.home': 'Home',
	'tab.android': 'Android',
	'tab.hiding': 'Hiding',
	'tab.spoofing': 'Spoofing',
	'tab.susfs': 'SuSFS',
	'tab.ksu': 'KSU',
	'tab.rom': 'ROM',
	'tab.advanced': 'Advanced',
	'tab.info': 'Info',
	'tab.settings': 'Settings',

	// ---- 首页 ----
	'home.general': 'General',
	'home.deviceModel': 'Device model',
	'home.kernelVersion': 'Kernel version',
	'home.androidVersion': 'Android version',
	'home.customRom': 'Custom ROM',
	'home.recommendations': 'Recommendations',
	'home.recGlobalUmount': '- Global Umount modules enabled',
	'home.recFileManager': '- Use a file manager with root access',
	'home.strongKeyboxes': 'Strong Keyboxes',
	'home.recommendedModules': 'Recommended modules',
	'home.incompatibleModules': 'Incompatible modules',

	// ---- Android ----
	'android.developerOptions': 'Developer options',
	'android.developerOptionsDesc': 'Options for developers',
	'android.usbDebugging': 'USB debugging',
	'android.usbDebuggingDesc': 'Debug mode when USB is connected',
	'android.wirelessDebugging': 'Wireless debugging',
	'android.wirelessDebuggingDesc': 'Debug mode when Wi-Fi is connected',
	'android.showRefreshRate': 'Show refresh rate',
	'android.showRefreshRateDesc': 'Show the current display refresh rate',
	'android.disableChildProcessRestrictions': 'Disable child process restrictions',
	'android.disableChildProcessRestrictionsDesc': 'Disable restrictions on the system resource usage of the app child processes',
	'android.saturation': 'Max color saturation',
	'android.saturationDesc': 'Force maximum color saturation via SurfaceFlinger',
	'android.shrinkBufferSize': 'Set logcat and logd buffer to 64K',
	'android.shrinkBufferSizeDesc': 'Reduce CPU overhead and battery drain by shrinking buffer size',

	// ---- Hiding ----
	'hiding.hideKsuDirectories': 'Hide KernelSU directories',
	'hiding.hideKsuDirectoriesDesc': 'E.g., /storage/emulated/0/Android/[data | obb | media]/me.weishu.kernelsu',
	'hiding.hideThirdPartyApps': 'Hide third party apps',
	'hiding.hideThirdPartyAppsDesc': 'Hide them using set_priority_uid_filter, HMA-OSS is needed for userspace side',
	'hiding.hideCustomRecovery': 'Hide custom recovery',
	'hiding.hideCustomRecoveryDesc': 'TWRP, OrangeFox',
	'hiding.hideNonStandardSdcard': 'Hide non-standard /sdcard paths',
	'hiding.standardPaths': 'Standard paths:',
	'hiding.standardSdcardList': 'Alarms, Android, Audiobooks, DCIM, Documents, Download, Movies, Music, Notifications, Pictures, Podcasts, Recordings, Ringtones, (MIUI)',
	'hiding.hideNonStandardSdcardAndroid': 'Hide non-standard /sdcard/Android paths',
	'hiding.standardSdcardAndroidList': 'data, media, obb',
	'hiding.hideDataLocalTmp': 'Hide /data/local/tmp paths',
	'hiding.hideSuspiciousPty': 'Hide suspicious PTYs',

	// ---- Spoofing ----
	'spoof.spoofUname': 'Spoof uname',
	'spoof.spoofUnameDesc': 'Spoof uname for all processes',
	'spoof.spoofUnameDesc2': "Only 'release' and 'version' are spoofed as others are no longer needed",
	'spoof.spoofCmdline': 'Spoof /proc/cmdline or /proc/bootconfig',
	'spoof.spoofCmdlineDesc': 'Spoof the output of /proc/cmdline (non-gki) or /proc/bootconfig (gki) from a text file',
	'spoof.spoofCmdlineDesc2': "No root process detects it for now, and this spoofing won't help much actually",
	'spoof.propertySpoofing': 'Property spoofing',
	'spoof.spoofSystemProperties': 'Spoof system properties',
	'spoof.spoofSystemPropertiesDesc': 'Spoof some system properties',
	'spoof.spoofUtcProperties': 'Spoof UTC properties',
	'spoof.spoofDateProperties': 'Spoof date properties',
	'spoof.spoofFingerprintProperties': 'Spoof fingerprint properties',
	'spoof.spoofOsPatch': 'Spoof OS security patch level property',
	'spoof.spoofVendorPatch': 'Spoof vendor security patch level property',
	'spoof.vbHashSection': 'Spoof verified boot hash property',
	'spoof.vbHashLabel': 'Verified boot hash value',
	'spoof.vbHashPlaceholder': 'e.g. df2352c282aj56e1489a3e220305hb827e54ba65a1293ab7409f2d46a3666b5a (64 digits)',

	// ---- SuSFS ----
	'susfs.status': 'Status',
	'susfs.variant': 'SuSFS variant',
	'susfs.susStatus': '..5.u.S status',
	'susfs.susStatusDesc':
		"SuSFS redirects the sus path to a supposed not-existing path named '..5.u.S', and this is the only way to settle the cross check of returned errno from various syscalls, but one disadvantage is that if the path itself can be written/created by the app (MANAGE_EXTERNAL_STORAGE granted), then it is futile to hide it",
	'susfs.enabledKernelFeatures': 'Enabled kernel features',
	'susfs.builtInFeatures': 'Built-in features',
	'susfs.hideSusMounts': 'Hide suspicious mounts for non-su processes',
	'susfs.hideSusMountsDesc':
		'Prevent zygote from caching the sus mounts in memory, and to keep them hidden from /proc/self/[mounts|mountinfo|mountstat] for non-su processes',
	'susfs.avcLogSpoofing': 'AVC log spoofing',
	'susfs.avcLogSpoofingDesc': "Spoof the sus tcontext 'su' with 'u:r:priv_app:s0:c512,c768' shown in avc log in kernel",
	'susfs.avcLogSpoofingDesc2':
		'Enabling this may sometimes make developers hard to identify the cause when they are debugging with some permission or selinux issues, so users are advised to disable this when doing so',
	'susfs.logs': 'SuSFS logs',
	'susfs.logsDesc': 'Enable or disable SuSFS logs in kernel',
	'susfs.manualMode': 'Manual mode',
	'susfs.spoofUname': 'Spoof uname',
	'susfs.spoofUnameDesc': "Spoof uname for all processes, set string to 'default' to imply the function to use original string",
	'susfs.kernelReleaseLabel': 'Kernel release',
	'susfs.kernelReleasePlaceholder': 'e.g. 6.1.145-android14',
	'susfs.kernelVersionLabel': 'Kernel version',
	'susfs.kernelVersionPlaceholder': 'e.g. #1 SMP PREEMPT Wed Jun 9 03:20:30 UTC 2025',
	'susfs.onlyEffective': 'Only effective for umounted process with uid ≥ 10.000',
	'susfs.susMapTitle': 'SUS MAP',
	'susfs.susMapDesc': 'Added real file path which gets mmapped will be hidden from /proc/self/[maps|smaps|smaps_rollup|map_files|mem|pagemap]',
	'susfs.susMapNote1': '- It does NOT support hiding for anon memory.',
	'susfs.susMapNote2': '- It does NOT hide any inline hooks or plt hooks cause by the injected library itself',
	'susfs.susMapNote3': '- It may not be able to evade detections by apps that implement a good injection detection',
	'susfs.susPathTitle': 'SUS PATH',
	'susfs.susPathDesc': 'Added path and all its sub-paths will be hidden for umounted app process from several syscalls',
	'susfs.susPathDesc2':
		'Please be reminded that if the target path has upper mounts then make sure the proper layer is added, otherwise it may not be effective for the target process',
	'susfs.susPathDesc3': "For paths that are read-only all the time, add them via 'add_sus_path'",
	'susfs.susPathLoopTitle': 'SUS PATH LOOP',
	'susfs.susPathLoopDesc':
		'The only difference to add_sus_path is that the added sus_path via this cli will be flagged as SUS_PATH again for the app process when it is being spawned by zygote and marked umounted',
	'susfs.susPathLoopDesc2':
		'Also it does not check if the path is existed or not, instead it checks for empty string only, so be careful what to add',
	'susfs.susPathLoopDesc3': "For paths that are frequently modified, we can add them via 'add_sus_path_loop'",
	'susfs.openRedirectTitle': 'OPEN_REDIRECT',
	'susfs.openRedirectDesc': 'Redirect the target path to be opened with user defined path and pre-defined uid scheme',
	'susfs.uidScheme': 'uid_scheme',
	'susfs.uidScheme0': '0: Effective for non-app processes (uid < 10000)',
	'susfs.uidScheme1': '1: Effective for non-su processes of which uid is 0 (All root process but not with su domain)',
	'susfs.uidScheme2': '2: Effective for non-su processes (Use it carefully!)',
	'susfs.uidScheme3': '3: Effective for processes that are marked umounted with uid >= 10000 (Use it carefully!)',
	'susfs.uidScheme4': '4: Effective for processes that are marked umounted (include most of the init spawned process, use it carefully!)',
	'susfs.openRedirectNoteTitle': '* Important Notes *',
	'susfs.openRedirectNote1': '- Both target_pathname and redirected_pathname must be existed before they can be added to open_redirect',
	'susfs.openRedirectNote2': '- Users have to take care of the selinux permission of both target_pathname and redirected_pathname by themselves',
	'susfs.openRedirectNote3': '- Only effective for current process that matches the pre-defined uid scheme',
	'susfs.kernelUmountTitle': 'Kernel umount',
	'susfs.kernelUmountDesc': 'Adding sus mounts to umount list via built-in KernelSU kernel umount',
	'susfs.tabMap': 'MAP',
	'susfs.tabPath': 'PATH',
	'susfs.tabPathLoop': 'PATH LOOP',
	'susfs.tabRedirect': 'OPEN_REDIRECT',
	'susfs.fieldMap': 'SUS MAP',
	'susfs.fieldPath': 'SUS PATH',
	'susfs.fieldPathLoop': 'SUS PATH LOOP',
	'susfs.fieldRedirect': 'OPEN_REDIRECT',
	'susfs.fieldMounts': 'MOUNTS',

	// ---- ROM ----
	'rom.customRom': 'Custom ROM',
	'rom.hideCustomRomPaths': 'Hide custom ROM paths',
	'rom.disableUmountIfBroken': 'If your app does not work, disable umount (App Profile)',
	'rom.exampleWebBrowsers': 'Example: Web Browsers',
	'rom.hideCustomRomPaths2': 'Hide custom ROM paths (Extended)',
	'rom.hideLineageStrings': 'Hide LineageOS strings',
	'rom.hideAddonD': 'Hide /system/addon.d',
	'rom.spoofHosts': 'Spoof /system/etc/hosts',
	'rom.spoofHostsDesc': 'Some custom ROMs use a custom hosts file',
	'rom.spoofLibstagefright': 'Spoof /system/lib64/libstagefright.so',
	'rom.spoofLibstagefrightDesc': 'Some custom ROMs use a custom libstagefright.so file',
	'rom.removeCustomRomProps': 'Remove custom ROM properties',
	'rom.removePifProps': 'Remove Play Integrity Fix properties',
	'rom.hideFrameworkResApk': 'Hide framework-res.apk',

	// ---- Advanced ----
	'advanced.section': 'Advanced',
	'advanced.fixDataLocalTmp': 'Fix /data/local/tmp inconsistencies',
	'advanced.resetSettings': 'Reset settings',
	'advanced.reset': 'Reset',
	'advanced.dialogHeadline': 'Confirm action',
	'advanced.dialogContent': 'Are you sure?',
	'advanced.dialogNo': 'No',
	'advanced.dialogYes': 'Yes',

	// ---- KSU ----
	'ksu.moduleControl': 'Module control',
	'ksu.disableModules': 'Disable modules',
	'ksu.enableModules': 'Enable modules',
	'ksu.features': 'Features',
	'ksu.suCompat': 'SU compat',
	'ksu.suCompatDesc': "SU Compatibility Mode - allows authorized apps to gain root via traditional 'su' command",
	'ksu.kernelUmount': 'Kernel umount',
	'ksu.kernelUmountDesc': 'Kernel Umount - controls whether kernel automatically unmounts modules when not needed',
	'ksu.selinuxHide': 'Hide SELinux modification',
	'ksu.selinuxHideDesc': 'SELinux Hide - sanitize /sys/fs/selinux access results for app UIDs',
	'ksu.manualMode': 'Manual mode',
	'ksu.kernelUmountManualDesc': 'Adding sus mounts to umount list via built-in KernelSU kernel umount',

	// ---- Info ----
	'info.suspiciousMounts': 'Suspicious mounts',
	'info.breneLogs': 'BRENE logs',
	'info.breneLogsDesc': 'Enable or disable BRENE logs',

	// ---- Settings ----
	'settings.languageSection': 'Language',
	'settings.languageTitle': 'Interface language',
	'settings.languageDesc': 'Choose the language used by this interface. The choice is saved on this device.',
}

const zh = {
	// ---- 通用 ----
	'common.failedToLoad': '加载失败',
	'common.unknown': '未知',
	'common.noMounts': '无挂载',
	'common.yes': '是',
	'common.no': '否',
	'common.normal': '正常',
	'common.abnormal': '异常',
	'common.example': '示例：',
	'common.apply': '应用',
	'common.reset': '重置',
	'common.importantNotes': '重要说明：',
	'common.experimental': '实验性',
	'common.statusInstalled': '状态：已安装',
	'common.statusNotInstalled': '状态：未安装',

	// ---- 提示 toast ----
	'toast.rebootNotRequired': '无需重启',
	'toast.success': '成功',
	'toast.successReboot': '成功，重启后生效',
	'toast.failedToLoad': '加载失败',
	'toast.failedToUpdateConfig': '更新配置失败',
	'toast.failedToUpdateProp': '更新属性失败',

	// ---- 内核信息 ----
	'kernel.default': '默认：{version}',
	'kernel.spoofed': '伪装：{version}',

	// ---- 标签页 ----
	'tab.home': '首页',
	'tab.android': '安卓',
	'tab.hiding': '隐藏',
	'tab.spoofing': '伪装',
	'tab.susfs': 'SuSFS',
	'tab.ksu': 'KSU',
	'tab.rom': 'ROM',
	'tab.advanced': '高级',
	'tab.info': '信息',
	'tab.settings': '设置',

	// ---- 首页 ----
	'home.general': '常规',
	'home.deviceModel': '设备型号',
	'home.kernelVersion': '内核版本',
	'home.androidVersion': '安卓版本',
	'home.customRom': '自定义 ROM',
	'home.recommendations': '建议',
	'home.recGlobalUmount': '- 已启用全局卸载模块（Global Umount）',
	'home.recFileManager': '- 请使用具备 root 权限的文件管理器',
	'home.strongKeyboxes': '强键 Keybox',
	'home.recommendedModules': '推荐模块',
	'home.incompatibleModules': '不兼容模块',

	// ---- Android ----
	'android.developerOptions': '开发者选项',
	'android.developerOptionsDesc': '面向开发者的选项',
	'android.usbDebugging': 'USB 调试',
	'android.usbDebuggingDesc': '连接 USB 时启用调试模式',
	'android.wirelessDebugging': '无线调试',
	'android.wirelessDebuggingDesc': '连接 Wi-Fi 时启用调试模式',
	'android.showRefreshRate': '显示刷新率',
	'android.showRefreshRateDesc': '显示当前屏幕刷新率',
	'android.disableChildProcessRestrictions': '禁用子进程限制',
	'android.disableChildProcessRestrictionsDesc': '解除对应用子进程系统资源占用的限制',
	'android.saturation': '最大色彩饱和度',
	'android.saturationDesc': '通过 SurfaceFlinger 强制开启最高色彩饱和度',
	'android.shrinkBufferSize': '将 logcat 与 logd 缓冲区设为 64K',
	'android.shrinkBufferSizeDesc': '通过缩小缓冲区来降低 CPU 开销与耗电',

	// ---- Hiding ----
	'hiding.hideKsuDirectories': '隐藏 KernelSU 目录',
	'hiding.hideKsuDirectoriesDesc': '例如：/storage/emulated/0/Android/[data | obb | media]/me.weishu.kernelsu',
	'hiding.hideThirdPartyApps': '隐藏第三方应用',
	'hiding.hideThirdPartyAppsDesc': '通过 set_priority_uid_filter 隐藏，用户空间一侧需要 HMA-OSS 配合',
	'hiding.hideCustomRecovery': '隐藏第三方 Recovery',
	'hiding.hideCustomRecoveryDesc': 'TWRP、OrangeFox',
	'hiding.hideNonStandardSdcard': '隐藏非标准 /sdcard 路径',
	'hiding.standardPaths': '标准路径：',
	'hiding.standardSdcardList': 'Alarms、Android、Audiobooks、DCIM、Documents、Download、Movies、Music、Notifications、Pictures、Podcasts、Recordings、Ringtones、（MIUI）',
	'hiding.hideNonStandardSdcardAndroid': '隐藏非标准 /sdcard/Android 路径',
	'hiding.standardSdcardAndroidList': 'data、media、obb',
	'hiding.hideDataLocalTmp': '隐藏 /data/local/tmp 路径',
	'hiding.hideSuspiciousPty': '隐藏可疑 PTY',

	// ---- Spoofing ----
	'spoof.spoofUname': '伪装 uname',
	'spoof.spoofUnameDesc': '对所有进程伪装 uname',
	'spoof.spoofUnameDesc2': '现在只伪装 release 与 version 字段，其余字段已不再需要',
	'spoof.spoofCmdline': '伪装 /proc/cmdline 或 /proc/bootconfig',
	'spoof.spoofCmdlineDesc': '从文本文件读取内容，伪装 /proc/cmdline（非 GKI）或 /proc/bootconfig（GKI）的输出',
	'spoof.spoofCmdlineDesc2': '目前还没有 root 进程会检测它，实际上这个伪装作用不大',
	'spoof.propertySpoofing': '属性伪装',
	'spoof.spoofSystemProperties': '伪装系统属性',
	'spoof.spoofSystemPropertiesDesc': '伪装部分系统属性',
	'spoof.spoofUtcProperties': '伪装 UTC 相关属性',
	'spoof.spoofDateProperties': '伪装日期相关属性',
	'spoof.spoofFingerprintProperties': '伪装系统指纹属性',
	'spoof.spoofOsPatch': '伪装系统安全补丁级别属性',
	'spoof.spoofVendorPatch': '伪装厂商安全补丁级别属性',
	'spoof.vbHashSection': '伪装验证启动哈希属性',
	'spoof.vbHashLabel': '验证启动哈希值',
	'spoof.vbHashPlaceholder': '例如 df2352c282aj56e1489a3e220305hb827e54ba65a1293ab7409f2d46a3666b5a（64 位十六进制）',

	// ---- SuSFS ----
	'susfs.status': '状态',
	'susfs.variant': 'SuSFS 变体',
	'susfs.susStatus': '..5.u.S 状态',
	'susfs.susStatusDesc':
		'SuSFS 会把可疑（sus）路径重定向到一个本不存在的路径「..5.u.S」，这是让各类系统调用返回的 errno 通过交叉校验的唯一办法；但缺点是，如果应用自己就能写入/创建该路径（已授予 MANAGE_EXTERNAL_STORAGE），再隐藏它就没有意义了',
	'susfs.enabledKernelFeatures': '已启用的内核特性',
	'susfs.builtInFeatures': '内置特性',
	'susfs.hideSusMounts': '对非 su 进程隐藏可疑挂载',
	'susfs.hideSusMountsDesc':
		'阻止 zygote 把可疑挂载缓存进内存，并让非 su 进程在 /proc/self/[mounts|mountinfo|mountstat] 中看不到它们',
	'susfs.avcLogSpoofing': 'AVC 日志伪装',
	'susfs.avcLogSpoofingDesc': '把内核 avc 日志里出现的可疑 tcontext「su」伪装成「u:r:priv_app:s0:c512,c768」',
	'susfs.avcLogSpoofingDesc2':
		'开启后开发者在排查权限或 SELinux 问题时可能更难定位原因，因此建议他们在调试期间关闭此功能',
	'susfs.logs': 'SuSFS 日志',
	'susfs.logsDesc': '开启或关闭内核中的 SuSFS 日志',
	'susfs.manualMode': '手动模式',
	'susfs.spoofUname': '伪装 uname',
	'susfs.spoofUnameDesc': '对所有进程伪装 uname；把字符串设为 default 表示改用原始字符串',
	'susfs.kernelReleaseLabel': '内核 release',
	'susfs.kernelReleasePlaceholder': '例如 6.1.145-android14',
	'susfs.kernelVersionLabel': '内核 version',
	'susfs.kernelVersionPlaceholder': '例如 #1 SMP PREEMPT Wed Jun 9 03:20:30 UTC 2025',
	'susfs.onlyEffective': '仅对已卸载（umounted）且 uid ≥ 10000 的进程生效',
	'susfs.susMapTitle': 'SUS MAP',
	'susfs.susMapDesc': '加入的真正文件路径一旦被 mmap，就会从 /proc/self/[maps|smaps|smaps_rollup|map_files|mem|pagemap] 中隐藏',
	'susfs.susMapNote1': '- 不支持隐藏匿名内存（anon memory）。',
	'susfs.susMapNote2': '- 不会隐藏注入库自身产生的 inline hook 或 plt hook',
	'susfs.susMapNote3': '- 对于实现了较强注入检测的应用，可能绕不过去',
	'susfs.susPathTitle': 'SUS PATH',
	'susfs.susPathDesc': '加入的路径及其所有子路径，会在多个系统调用中对已卸载的应用进程隐藏',
	'susfs.susPathDesc2': '请注意：如果目标路径上层还有挂载，务必把正确的层加进去，否则对目标进程可能不生效',
	'susfs.susPathDesc3': '对于始终只读的路径，请用 add_sus_path 添加',
	'susfs.susPathLoopTitle': 'SUS PATH LOOP',
	'susfs.susPathLoopDesc':
		'与 add_sus_path 的唯一区别是：通过此命令加入的 sus_path，会在应用进程由 zygote 派生并标记为已卸载时，被重新标记为 SUS_PATH',
	'susfs.susPathLoopDesc2': '另外它不检查路径是否存在，只检查是否为空字符串，所以添加时要格外小心',
	'susfs.susPathLoopDesc3': '对于会被频繁修改的路径，可以用 add_sus_path_loop 添加',
	'susfs.openRedirectTitle': 'OPEN_REDIRECT',
	'susfs.openRedirectDesc': '把目标路径的重定向到用户指定的路径，并按预定义的 uid 方案生效',
	'susfs.uidScheme': 'uid_scheme',
	'susfs.uidScheme0': '0：对非应用进程生效（uid < 10000）',
	'susfs.uidScheme1': '1：对 uid 为 0 的非 su 进程生效（所有 root 进程，但不含 su 域）',
	'susfs.uidScheme2': '2：对所有非 su 进程生效（请谨慎使用！）',
	'susfs.uidScheme3': '3：对已标记为 umounted 且 uid >= 10000 的进程生效（请谨慎使用！）',
	'susfs.uidScheme4': '4：对已标记为 umounted 的进程生效（包含大部分由 init 派生的进程，请谨慎使用！）',
	'susfs.openRedirectNoteTitle': '* 重要说明 *',
	'susfs.openRedirectNote1': '- target_pathname 与 redirected_pathname 都必须已存在，才能加入 open_redirect',
	'susfs.openRedirectNote2': '- 用户需要自行处理好 target_pathname 与 redirected_pathname 的 SELinux 权限',
	'susfs.openRedirectNote3': '- 仅对匹配预定义 uid 方案的当前进程生效',
	'susfs.kernelUmountTitle': '内核卸载',
	'susfs.kernelUmountDesc': '通过 KernelSU 内置的内核卸载功能，把可疑挂载加入卸载列表',
	'susfs.tabMap': '映射',
	'susfs.tabPath': '路径',
	'susfs.tabPathLoop': '路径循环',
	'susfs.tabRedirect': '重定向',
	'susfs.fieldMap': 'SUS 映射（MAP）',
	'susfs.fieldPath': 'SUS 路径（PATH）',
	'susfs.fieldPathLoop': 'SUS 路径循环（PATH LOOP）',
	'susfs.fieldRedirect': '打开重定向（OPEN_REDIRECT）',
	'susfs.fieldMounts': '挂载列表（MOUNTS）',

	// ---- ROM ----
	'rom.customRom': '自定义 ROM',
	'rom.hideCustomRomPaths': '隐藏自定义 ROM 路径',
	'rom.disableUmountIfBroken': '如果你的应用无法正常工作，请关闭卸载（应用配置）',
	'rom.exampleWebBrowsers': '例如：网页浏览器',
	'rom.hideCustomRomPaths2': '隐藏自定义 ROM 路径（扩展）',
	'rom.hideLineageStrings': '隐藏 LineageOS 特征字符串',
	'rom.hideAddonD': '隐藏 /system/addon.d',
	'rom.spoofHosts': '伪装 /system/etc/hosts',
	'rom.spoofHostsDesc': '部分自定义 ROM 使用自定义的 hosts 文件',
	'rom.spoofLibstagefright': '伪装 /system/lib64/libstagefright.so',
	'rom.spoofLibstagefrightDesc': '部分自定义 ROM 使用自定义的 libstagefright.so 文件',
	'rom.removeCustomRomProps': '移除自定义 ROM 属性',
	'rom.removePifProps': '移除 Play Integrity Fix 属性',
	'rom.hideFrameworkResApk': '隐藏 framework-res.apk',

	// ---- Advanced ----
	'advanced.section': '高级',
	'advanced.fixDataLocalTmp': '修复 /data/local/tmp 不一致问题',
	'advanced.resetSettings': '重置设置',
	'advanced.reset': '重置',
	'advanced.dialogHeadline': '确认操作',
	'advanced.dialogContent': '确定要这样操作吗？',
	'advanced.dialogNo': '取消',
	'advanced.dialogYes': '确定',

	// ---- KSU ----
	'ksu.moduleControl': '模块控制',
	'ksu.disableModules': '禁用模块',
	'ksu.enableModules': '启用模块',
	'ksu.features': '特性',
	'ksu.suCompat': 'SU 兼容',
	'ksu.suCompatDesc': 'SU 兼容模式 —— 允许已授权的应用通过传统的 su 命令获取 root',
	'ksu.kernelUmount': '内核卸载',
	'ksu.kernelUmountDesc': '内核卸载 —— 控制内核是否在不需要时自动卸载模块',
	'ksu.selinuxHide': '隐藏 SELinux 修改',
	'ksu.selinuxHideDesc': 'SELinux 隐藏 —— 净化应用 UID 对 /sys/fs/selinux 的访问结果',
	'ksu.manualMode': '手动模式',
	'ksu.kernelUmountManualDesc': '通过 KernelSU 内置的内核卸载功能，把可疑挂载加入卸载列表',

	// ---- Info ----
	'info.suspiciousMounts': '可疑挂载',
	'info.breneLogs': 'BRENE 日志',
	'info.breneLogsDesc': '开启或关闭 BRENE 日志',

	// ---- Settings ----
	'settings.languageSection': '语言',
	'settings.languageTitle': '界面语言',
	'settings.languageDesc': '选择界面显示所用的语言，选择结果会保存在本机。',
}

const messages = { en, zh }

let current = 'en'
const listeners = new Set()

function detectLanguage() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved && messages[saved]) return saved
	} catch (e) {}

	const nav = (navigator.language || navigator.userLanguage || '').toLowerCase()
	if (nav.startsWith('zh')) return 'zh'
	return 'en'
}

function syncDocumentLang() {
	document.documentElement.lang = current === 'zh' ? 'zh-CN' : current
}

export function getLanguage() {
	return current
}

export function t(key, params) {
	const dict = messages[current] || messages.en
	let str = dict[key]
	if (str === undefined) str = messages.en[key]
	if (str === undefined) str = key

	if (params) {
		for (const [name, value] of Object.entries(params)) {
			str = str.replaceAll(`{${name}}`, String(value))
		}
	}
	return str
}

export function applyTranslations(root = document) {
	root.querySelectorAll('[data-i18n]').forEach((element) => {
		element.textContent = t(element.dataset.i18n)
	})

	root.querySelectorAll('[data-i18n-label]').forEach((element) => {
		element.setAttribute('label', t(element.dataset.i18nLabel))
	})

	root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
		element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder))
	})
}

export function setLanguage(code) {
	if (!messages[code]) return
	if (code === current) return

	current = code

	try {
		localStorage.setItem(STORAGE_KEY, code)
	} catch (e) {}

	syncDocumentLang()
	applyTranslations(document)
	listeners.forEach((fn) => fn(code))
}

export function onLanguageChange(fn) {
	listeners.add(fn)
	return () => listeners.delete(fn)
}

export function initI18n() {
	current = detectLanguage()
	syncDocumentLang()
	return current
}
