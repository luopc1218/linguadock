export type UiLang = "zh-CN" | "en-US";

export type ErrorCode =
  | "ERR_URL_INVALID"
  | "ERR_URL_CREDENTIALS"
  | "ERR_HTTPS_REQUIRED"
  | "ERR_NAME_MODEL"
  | "ERR_KEYRING_UNAVAILABLE"
  | "ERR_KEY_DECRYPT"
  | "ERR_MODEL_REQUIRED"
  | "ERR_PROTOCOL_INVALID"
  | "ERR_BAD_RESPONSE"
  | "ERR_BUSY"
  | "ERR_NO_PROVIDER"
  | "ERR_TEXT_RANGE"
  | "ERR_HTTP"
  | "ERR_TIMEOUT"
  | "ERR_NETWORK"
  | "ERR_EMPTY_RESPONSE"
  | "ERR_TRUNCATED"
  | "ERR_FILE_TOO_LARGE"
  | "ERR_INVALID_TEXT"
  | "ERR_CONFIG_READ"
  | "ERR_INVALID_SENDER"
  | "ERR_UPDATE_FAILED"
  | "ERR_UPDATE_NO_METADATA"
  | "ERR_UNKNOWN";

export interface LanguageOption {
  id: string;
  prompt: string;
  label: Record<UiLang, string>;
}

export interface StyleOption {
  id: string;
  prompt: string;
  label: Record<UiLang, string>;
}

export interface Preset {
  key: string;
  name: Record<UiLang, string>;
  protocol: "openai" | "anthropic" | "gemini";
  baseUrl: string;
  model: string;
}

export interface Messages {
  appSubtitle: string;
  workspace: string;
  translateTab: string;
  glossaryTab: string;
  historyTab: string;
  privacyTitle: string;
  privacySubtitle: string;
  settings: string;
  interfaceLanguage: string;
  addService: string;

  updates: string;
  currentVersion: string;
  checkUpdate: string;
  checkingUpdate: string;
  updateAvailable: string;
  updateDownloading: string;
  updateDownloaded: string;
  upToDate: string;
  updateError: string;
  updateUnsupported: string;
  restartAndInstall: string;
  manualDownload: string;

  translateEyebrow: string;
  translateTitle: string;
  translateSubtitle: string;
  importText: string;
  sourceLanguage: string;
  swapLanguages: string;
  targetLanguage: string;
  translationStyle: string;
  original: string;
  clearOriginal: string;
  originalPlaceholder: string;
  markdownSupported: string;
  translation: string;
  translating: string;
  translatingWith: string;
  emptyTitle: string;
  emptyHint: string;
  waiting: string;
  copyTranslation: string;
  exportTranslation: string;
  translationService: string;
  noServiceConfigured: string;
  glossaryApplied: string;
  privacyNotice: string;
  startTranslation: string;
  stopTranslation: string;
  keyStored: string;
  shortcutHint: string;
  contextTitle: string;
  contextPlaceholder: string;
  contextHint: string;
  contextClear: string;
  contextActive: string;

  glossaryEyebrow: string;
  glossaryTitle: string;
  glossaryDesc: string;
  glossaryPlaceholder: string;
  glossaryHint: string;

  historyEyebrow: string;
  historyTitle: string;
  historyDesc: string;
  clearHistory: string;
  emptyHistory: string;

  footerTagline: string;
  footerBadges: string;

  settingsEyebrow: string;
  settingsHeading: string;
  settingsHint: string;
  savedServices: string;
  newService: string;
  editService: string;
  usePreset: string;
  choosePreset: string;
  serviceNamePlaceholder: string;
  showKey: string;
  hideKey: string;
  testConnection: string;
  testing: string;
  testHint: string;
  testSuccess: (ms: string) => string;
  about: string;
  aboutDesc: string;
  viewReleases: string;
  cancel: string;
  deleteService: string;
  serviceName: string;
  protocol: string;
  openaiCompatible: string;
  anthropicMessages: string;
  geminiGenerate: string;
  apiUrl: string;
  apiUrlHint: string;
  apiKey: string;
  apiKeySaved: string;
  apiKeyPlaceholder: string;
  modelName: string;
  modelPlaceholder: string;
  modelHint: string;
  noUpload: string;
  closeSettings: string;
  close: string;
  closeError: string;
  addServiceAction: string;
  saveChanges: string;
  saving: string;
  savedToast: string;
  copiedToast: string;
  exportedToast: string;
  sourceAuto: string;

  charCount: (n: string, max: string) => string;
  resultCharCount: (n: string) => string;
  updateProgress: (percent: string) => string;
  errors: Record<ErrorCode, string>;
}

export const LANGUAGES: LanguageOption[] = [
  { id: "zh-Hans", prompt: "Simplified Chinese", label: { "zh-CN": "简体中文", "en-US": "Simplified Chinese" } },
  { id: "zh-Hant", prompt: "Traditional Chinese", label: { "zh-CN": "繁體中文", "en-US": "Traditional Chinese" } },
  { id: "en", prompt: "English", label: { "zh-CN": "English", "en-US": "English" } },
  { id: "ja", prompt: "Japanese", label: { "zh-CN": "日本語", "en-US": "Japanese" } },
  { id: "ko", prompt: "Korean", label: { "zh-CN": "한국어", "en-US": "Korean" } },
  { id: "fr", prompt: "French", label: { "zh-CN": "Français", "en-US": "French" } },
  { id: "de", prompt: "German", label: { "zh-CN": "Deutsch", "en-US": "German" } },
  { id: "es", prompt: "Spanish", label: { "zh-CN": "Español", "en-US": "Spanish" } },
  { id: "ru", prompt: "Russian", label: { "zh-CN": "Русский", "en-US": "Russian" } },
  { id: "pt", prompt: "Portuguese", label: { "zh-CN": "Português", "en-US": "Portuguese" } },
  { id: "it", prompt: "Italian", label: { "zh-CN": "Italiano", "en-US": "Italian" } },
  { id: "nl", prompt: "Dutch", label: { "zh-CN": "Nederlands", "en-US": "Dutch" } },
  { id: "pl", prompt: "Polish", label: { "zh-CN": "Polski", "en-US": "Polish" } },
  { id: "tr", prompt: "Turkish", label: { "zh-CN": "Türkçe", "en-US": "Turkish" } },
  { id: "uk", prompt: "Ukrainian", label: { "zh-CN": "Українська", "en-US": "Ukrainian" } },
  { id: "ar", prompt: "Arabic", label: { "zh-CN": "العربية", "en-US": "Arabic" } },
  { id: "vi", prompt: "Vietnamese", label: { "zh-CN": "Tiếng Việt", "en-US": "Vietnamese" } },
  { id: "th", prompt: "Thai", label: { "zh-CN": "ไทย", "en-US": "Thai" } },
  { id: "id", prompt: "Indonesian", label: { "zh-CN": "Bahasa Indonesia", "en-US": "Indonesian" } },
];

export const STYLES: StyleOption[] = [
  {
    id: "natural",
    prompt: "natural and fluent",
    label: { "zh-CN": "自然流畅", "en-US": "Natural" },
  },
  {
    id: "faithful",
    prompt: "faithful to the source, preserving nuance",
    label: { "zh-CN": "忠实原文", "en-US": "Faithful" },
  },
  {
    id: "academic",
    prompt: "academic and precise",
    label: { "zh-CN": "专业学术", "en-US": "Academic" },
  },
  {
    id: "casual",
    prompt: "casual and conversational",
    label: { "zh-CN": "轻松口语", "en-US": "Casual" },
  },
  {
    id: "business",
    prompt: "formal and business-appropriate",
    label: { "zh-CN": "商务正式", "en-US": "Business" },
  },
];

// Presets are kept current for 2026-11. Model IDs change often; every field
// remains editable in the settings dialog.
export const PRESETS: Preset[] = [
  {
    key: "openai-sol",
    name: { "zh-CN": "OpenAI", "en-US": "OpenAI" },
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-6.1-sol",
  },
  {
    key: "openai-luna",
    name: { "zh-CN": "OpenAI Luna", "en-US": "OpenAI Luna" },
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-6-luna",
  },
  {
    key: "deepseek",
    name: { "zh-CN": "DeepSeek", "en-US": "DeepSeek" },
    protocol: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-flash",
  },
  {
    key: "claude",
    name: { "zh-CN": "Claude", "en-US": "Claude" },
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-5-5",
  },
  {
    key: "gemini",
    name: { "zh-CN": "Gemini", "en-US": "Gemini" },
    protocol: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-3.8-flash",
  },
  {
    key: "qwen",
    name: { "zh-CN": "通义千问", "en-US": "Qwen" },
    protocol: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3.5-plus",
  },
  {
    key: "ollama",
    name: { "zh-CN": "Ollama", "en-US": "Ollama" },
    protocol: "openai",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen3.5:9b",
  },
  {
    key: "custom",
    name: { "zh-CN": "自定义服务", "en-US": "Custom service" },
    protocol: "openai",
    baseUrl: "https://",
    model: "",
  },
];

const zh: Messages = {
  appSubtitle: "LINGUADOCK",
  workspace: "工作空间",
  translateTab: "文本翻译",
  glossaryTab: "术语表",
  historyTab: "本次记录",
  privacyTitle: "你的密钥，你的选择",
  privacySubtitle: "直连 AI 服务 · 无中转服务器",
  settings: "AI 服务设置",
  interfaceLanguage: "界面语言",
  addService: "添加 AI 服务",

  updates: "软件更新",
  currentVersion: "当前版本",
  checkUpdate: "检查更新",
  checkingUpdate: "正在检查更新…",
  updateAvailable: "发现新版本 {v}，正在下载…",
  updateDownloading: "正在下载更新 {p}%",
  updateDownloaded: "新版本 {v} 已下载，重启后安装",
  upToDate: "已是最新版本",
  updateError: "检查更新失败：{msg}",
  updateUnsupported: "开发模式或未签名版本不支持自动更新，请手动下载",
  restartAndInstall: "重启并安装",
  manualDownload: "手动下载",

  translateEyebrow: "WORDS, WITHOUT BORDERS",
  translateTitle: "让表达，自在抵达。",
  translateSubtitle: "选择你的 AI，把每一种语言说得更好。",
  importText: "导入文本",
  sourceLanguage: "源语言",
  swapLanguages: "交换语言",
  targetLanguage: "目标语言",
  translationStyle: "翻译风格",
  original: "原文",
  clearOriginal: "清空原文",
  originalPlaceholder: "在这里输入或粘贴要翻译的内容…",
  markdownSupported: "支持 Markdown",
  translation: "译文",
  translating: "正在翻译",
  translatingWith: "正在向 {name} 请求译文…",
  emptyTitle: "每一种语言，都有回响",
  emptyHint: "译文将在这里呈现",
  waiting: "等待翻译",
  copyTranslation: "复制译文",
  exportTranslation: "导出译文",
  translationService: "翻译服务",
  noServiceConfigured: "尚未配置服务",
  glossaryApplied: "已应用术语表",
  privacyNotice: "内容仅发送至你选择的 AI 服务",
  startTranslation: "开始翻译",
  stopTranslation: "停止翻译",
  keyStored: "密钥保存在本机系统安全存储中",
  shortcutHint: "Enter 翻译 · Shift + Enter 换行",
  contextTitle: "翻译背景",
  contextPlaceholder:
    "例如：这是一款赛博朋克题材游戏的对话，保留街头俚语；或《三体》小说节选，注意科幻术语。",
  contextHint:
    "背景会随原文发送给所选 AI，用于统一专有名词、人物关系和语气；背景中的指令不会被执行。",
  contextClear: "清除背景",
  contextActive: "已设置翻译背景",

  glossaryEyebrow: "YOUR WORDS, YOUR WAY",
  glossaryTitle: "统一每一个专业表达。",
  glossaryDesc:
    "每行一个术语，例如：人工智能 = artificial intelligence。本次会话内生效。",
  glossaryPlaceholder: "人工智能 = artificial intelligence\n译栈 = LinguaDock",
  glossaryHint: "术语会随原文发送给所选 AI；模型可能无法完全遵循，请审阅译文。",

  historyEyebrow: "THIS SESSION",
  historyTitle: "回看刚才的表达。",
  historyDesc: "仅保留本次会话最近 30 条翻译，退出后清除。",
  clearHistory: "清空记录",
  emptyHistory: "还没有翻译记录",

  footerTagline: "为跨越语言的日常而造。",
  footerBadges: "开源 · 自带密钥 · 本地优先",

  settingsEyebrow: "AI SERVICES",
  settingsHeading: "AI 服务",
  settingsHint:
    "从预设开始，或填写自建服务。API Key 只保存在本机系统密钥库，不会上传；保存前可先测试连接（会发送一次真实请求）。",
  savedServices: "已保存的服务",
  newService: "新增服务",
  editService: "编辑服务",
  usePreset: "从预设开始",
  choosePreset: "选择服务商…",
  serviceNamePlaceholder: "例如：我的 DeepSeek",
  showKey: "显示密钥",
  hideKey: "隐藏密钥",
  testConnection: "测试连接",
  testing: "正在连接…",
  testHint: "使用当前填写的地址、密钥和模型发送一次很短的请求；测试不会保存配置。",
  testSuccess: (ms) => `连接成功 · ${ms} ms`,
  about: "关于 LinguaDock",
  aboutDesc:
    "开源、自带密钥的 AI 翻译工具。原文只发送到你选择的 AI 服务，不经过项目中转。",
  viewReleases: "查看发布页",
  cancel: "取消",
  deleteService: "删除 {name}",
  serviceName: "服务名称",
  protocol: "接口协议",
  openaiCompatible: "OpenAI 兼容",
  anthropicMessages: "Anthropic Messages",
  geminiGenerate: "Google Gemini",
  apiUrl: "API 地址",
  apiUrlHint:
    "只填到 /v1，不含具体接口路径；更换地址会使已保存密钥发往新地址。",
  apiKey: "API Key",
  apiKeySaved: "已保存密钥，留空保持不变",
  apiKeyPlaceholder: "粘贴密钥，本地 Ollama 可留空",
  modelName: "模型 ID",
  modelPlaceholder: "填写该服务实际可用的模型 ID",
  modelHint: "预设只是起点，请填写账号实际支持的模型 ID。",
  noUpload: "不上传密钥至项目服务器",
  closeSettings: "关闭设置",
  close: "关闭",
  closeError: "关闭错误",
  addServiceAction: "添加服务",
  saveChanges: "保存修改",
  saving: "保存中…",
  savedToast: "服务已保存",
  copiedToast: "译文已复制",
  exportedToast: "译文已导出",
  sourceAuto: "自动检测",

  charCount: (n, max) => `${n} / ${max} 字符`,
  resultCharCount: (n) => `${n} 字符`,
  updateProgress: (p) => `正在下载更新 ${p}%`,
  errors: {
    ERR_URL_INVALID: "API 地址格式无效",
    ERR_URL_CREDENTIALS: "API 地址不能包含凭据、查询参数或片段",
    ERR_HTTPS_REQUIRED: "远程 API 必须使用 HTTPS，本地服务可使用 HTTP",
    ERR_NAME_MODEL: "请填写服务名称和模型",
    ERR_KEYRING_UNAVAILABLE:
      "系统安全密钥库不可用，请启用 Keychain / Secret Service / KWallet 后再保存 API Key",
    ERR_KEY_DECRYPT: "无法读取已保存的密钥，请重新输入 API Key 后保存",
    ERR_MODEL_REQUIRED: "请填写模型 ID",
    ERR_PROTOCOL_INVALID: "请选择有效的接口协议",
    ERR_BAD_RESPONSE: "服务返回了无法解析的内容，请检查 API 地址和协议",
    ERR_BUSY: "已有翻译正在进行",
    ERR_NO_PROVIDER: "请先添加 AI 服务",
    ERR_TEXT_RANGE: "请输入 1–50,000 字符的原文",
    ERR_HTTP: "API 请求失败（HTTP {status}），请检查密钥、额度、模型和服务地址",
    ERR_TIMEOUT: "请求已取消或超时",
    ERR_NETWORK: "连接失败，请检查网络和 API 地址",
    ERR_EMPTY_RESPONSE: "服务未返回译文，请检查模型名称或内容限制",
    ERR_TRUNCATED: "译文超过模型输出上限，请将原文拆分后翻译",
    ERR_FILE_TOO_LARGE: "文件过大，请导入 200 KB 以内的 UTF-8 文本",
    ERR_INVALID_TEXT: "无效译文",
    ERR_CONFIG_READ:
      "配置读取失败，请备份并检查用户数据目录中的 providers.json，应用不会覆盖损坏的配置。",
    ERR_INVALID_SENDER: "无效请求来源",
    ERR_UPDATE_FAILED: "更新检查失败：{detail}",
    ERR_UPDATE_NO_METADATA: "未找到更新元数据，请手动下载最新版本",
    ERR_UNKNOWN: "操作失败，请重试",
  },
};

const en: Messages = {
  appSubtitle: "LINGUADOCK",
  workspace: "Workspace",
  translateTab: "Translate",
  glossaryTab: "Glossary",
  historyTab: "History",
  privacyTitle: "Your keys, your choice",
  privacySubtitle: "Direct to your AI · no relay server",
  settings: "AI service settings",
  interfaceLanguage: "Interface language",
  addService: "Add AI service",

  updates: "Software updates",
  currentVersion: "Current version",
  checkUpdate: "Check for updates",
  checkingUpdate: "Checking for updates…",
  updateAvailable: "Version {v} is available, downloading…",
  updateDownloading: "Downloading update {p}%",
  updateDownloaded: "Version {v} is ready. Restart to install.",
  upToDate: "You're up to date",
  updateError: "Update check failed: {msg}",
  updateUnsupported:
    "Automatic updates are unavailable in development or unsigned builds. Download manually.",
  restartAndInstall: "Restart and install",
  manualDownload: "Download manually",

  translateEyebrow: "WORDS, WITHOUT BORDERS",
  translateTitle: "Let every idea arrive.",
  translateSubtitle: "Pick your AI and make every language land better.",
  importText: "Import text",
  sourceLanguage: "Source language",
  swapLanguages: "Swap languages",
  targetLanguage: "Target language",
  translationStyle: "Style",
  original: "Source",
  clearOriginal: "Clear source text",
  originalPlaceholder: "Type or paste the text you want to translate…",
  markdownSupported: "Markdown supported",
  translation: "Translation",
  translating: "Translating",
  translatingWith: "Requesting a translation from {name}…",
  emptyTitle: "Every language has an echo",
  emptyHint: "Your translation will appear here",
  waiting: "Waiting",
  copyTranslation: "Copy translation",
  exportTranslation: "Export translation",
  translationService: "Translation service",
  noServiceConfigured: "No service configured",
  glossaryApplied: "Glossary applied",
  privacyNotice: "Content is sent only to the AI service you choose",
  startTranslation: "Translate",
  stopTranslation: "Stop",
  keyStored: "Keys are protected by your system key store",
  shortcutHint: "Enter to translate · Shift + Enter for a new line",
  contextTitle: "Translation context",
  contextPlaceholder:
    "e.g. Dialogue from a cyberpunk game, keep the street slang; or an excerpt from a sci-fi novel, preserve the invented terminology.",
  contextHint:
    "The context is sent with the source text so the model can keep names, relationships, and tone consistent. Instructions inside it are not executed.",
  contextClear: "Clear context",
  contextActive: "Translation context set",

  glossaryEyebrow: "YOUR WORDS, YOUR WAY",
  glossaryTitle: "One term, everywhere.",
  glossaryDesc:
    "One term per line, for example: artificial intelligence = 人工智能. Applies to this session.",
  glossaryPlaceholder: "artificial intelligence = 人工智能\nLinguaDock = 译栈",
  glossaryHint:
    "Terms are sent with the source text. Models may not follow them perfectly—review the result.",

  historyEyebrow: "THIS SESSION",
  historyTitle: "Revisit what you just said.",
  historyDesc:
    "The latest 30 translations from this session are kept in memory and cleared on exit.",
  clearHistory: "Clear history",
  emptyHistory: "No translations yet",

  footerTagline: "Built for everyday life across languages.",
  footerBadges: "Open source · BYOK · Local-first",

  settingsEyebrow: "AI SERVICES",
  settingsHeading: "AI services",
  settingsHint:
    "Start from a preset or add a custom service. API keys stay in your system key store and are never uploaded. Test the connection before saving (it sends one real request).",
  savedServices: "Saved services",
  newService: "New service",
  editService: "Edit service",
  usePreset: "Start from a preset",
  choosePreset: "Choose a provider…",
  serviceNamePlaceholder: "e.g. My DeepSeek",
  showKey: "Show key",
  hideKey: "Hide key",
  testConnection: "Test connection",
  testing: "Connecting…",
  testHint:
    "Sends one short request with this endpoint, key, and model. Nothing is saved.",
  testSuccess: (ms) => `Connected · ${ms} ms`,
  about: "About LinguaDock",
  aboutDesc:
    "An open-source, bring-your-own-key translation app. Source text goes only to the AI service you choose—never through a project relay.",
  viewReleases: "View releases",
  cancel: "Cancel",
  deleteService: "Delete {name}",
  serviceName: "Service name",
  protocol: "Protocol",
  openaiCompatible: "OpenAI-compatible",
  anthropicMessages: "Anthropic Messages",
  geminiGenerate: "Google Gemini",
  apiUrl: "API base URL",
  apiUrlHint:
    "Base URL only, up to /v1. Changing it sends the saved key to the new address.",
  apiKey: "API key",
  apiKeySaved: "A key is saved; leave blank to keep it",
  apiKeyPlaceholder: "Paste your key, or leave blank for local Ollama",
  modelName: "Model ID",
  modelPlaceholder: "The model ID enabled for your account",
  modelHint: "Presets are a starting point. Use the model ID your account supports.",
  noUpload: "Keys are never uploaded to a project server",
  closeSettings: "Close settings",
  close: "Close",
  closeError: "Dismiss error",
  addServiceAction: "Add service",
  saveChanges: "Save changes",
  saving: "Saving…",
  savedToast: "Service saved",
  copiedToast: "Translation copied",
  exportedToast: "Translation exported",
  sourceAuto: "Detect language",

  charCount: (n, max) => `${n} / ${max} characters`,
  resultCharCount: (n) => `${n} characters`,
  updateProgress: (p) => `Downloading update ${p}%`,
  errors: {
    ERR_URL_INVALID: "The API URL is not valid",
    ERR_URL_CREDENTIALS:
      "The API URL must not contain credentials, query parameters, or fragments",
    ERR_HTTPS_REQUIRED: "Remote APIs must use HTTPS; local services may use HTTP",
    ERR_NAME_MODEL: "Enter a service name and model",
    ERR_KEYRING_UNAVAILABLE:
      "The system key store is unavailable. Enable Keychain / Secret Service / KWallet before saving an API key.",
    ERR_KEY_DECRYPT:
      "Could not read the saved key. Re-enter your API key and save it again.",
    ERR_MODEL_REQUIRED: "Enter a model ID",
    ERR_PROTOCOL_INVALID: "Choose a valid protocol",
    ERR_BAD_RESPONSE:
      "The service returned an unreadable response. Check the API URL and protocol.",
    ERR_BUSY: "A translation is already in progress",
    ERR_NO_PROVIDER: "Add an AI service first",
    ERR_TEXT_RANGE: "Enter 1–50,000 characters of source text",
    ERR_HTTP:
      "API request failed (HTTP {status}). Check the key, quota, model, and endpoint.",
    ERR_TIMEOUT: "Request canceled or timed out",
    ERR_NETWORK: "Connection failed. Check your network and the API address.",
    ERR_EMPTY_RESPONSE:
      "The service returned no translation. Check the model name or content filters.",
    ERR_TRUNCATED: "The translation hit the output limit. Split the text and try again.",
    ERR_FILE_TOO_LARGE: "File too large. Import UTF-8 text under 200 KB.",
    ERR_INVALID_TEXT: "Invalid translation text",
    ERR_CONFIG_READ:
      "Could not read the configuration. Back up and inspect providers.json in the user data folder—the app will not overwrite a damaged file.",
    ERR_INVALID_SENDER: "Invalid request origin",
    ERR_UPDATE_FAILED: "Update check failed: {detail}",
    ERR_UPDATE_NO_METADATA:
      "No update metadata found. Download the latest build manually.",
    ERR_UNKNOWN: "Something went wrong. Try again.",
  },
};

export const messages: Record<UiLang, Messages> = {
  "zh-CN": zh,
  "en-US": en,
};

export const UI_LANGUAGES: { id: UiLang; label: string }[] = [
  { id: "zh-CN", label: "简体中文" },
  { id: "en-US", label: "English" },
];

export function detectLang(locale?: string): UiLang {
  return (locale || "").toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

export function langPrompt(id: string): string {
  return LANGUAGES.find((l) => l.id === id)?.prompt ?? id;
}

export function stylePrompt(id: string): string {
  return STYLES.find((s) => s.id === id)?.prompt ?? id;
}

export function languageLabel(lang: UiLang, id: string): string {
  return LANGUAGES.find((l) => l.id === id)?.label[lang] ?? id;
}

export function presetName(preset: Preset, lang: UiLang): string {
  return preset.name[lang];
}

export function localizeError(lang: UiLang, raw: string): string {
  const text = raw || messages[lang].errors.ERR_UNKNOWN;
  const [code, ...rest] = text.split("|");
  const detail = rest.join("|");
  const template = messages[lang].errors[code as ErrorCode];
  if (!template) return text;
  return template
    .replace("{status}", detail)
    .replace("{detail}", detail)
    .replace("{msg}", detail);
}
