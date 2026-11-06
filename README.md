# 译栈 · LinguaDock

自带 API Key 的开源 AI 翻译桌面工具。支持 **Windows x64 / macOS Apple Silicon / Linux x64**。

双栏文本翻译、服务商切换、翻译背景、术语表与翻译风格，让自己的模型服务进入日常翻译工作流。界面支持简体中文与 English，可随时切换。

## 安装

前往 [Releases](https://github.com/luopc1218/linguadock/releases) 下载对应平台安装包：

| 平台 | 安装包 |
| --- | --- |
| Windows x64 | `.exe`（NSIS） |
| macOS arm64 | `.dmg` |
| Linux x64 | `.AppImage` / `.deb` |

当前社区构建未购买 Windows 代码签名证书，也未进行 Apple 公证，系统可能提示发行者未验证。请核对来源，按所在组织的安全政策安装。Linux 保存密钥需要 Secret Service / KWallet；无安全密钥库时拒绝持久化 API Key。

macOS 构建使用 ad-hoc 签名，避免 arm64 应用因完全未签名而报「已损坏」。首次打开仍可能提示「无法验证开发者」，请在「系统设置 → 隐私与安全性」中允许，或右键应用选择「打开」。若从旧版本升级后仍提示「已损坏」，可清除下载隔离标记：

```sh
xattr -dr com.apple.quarantine /Applications/LinguaDock.app
```

## 使用

1. 打开「AI 服务设置」，从预设开始或添加自定义服务。
2. 填写基础 API 地址、API Key 与账号可用的模型 ID。点击「测试连接」会发送一次很短的真实请求来验证配置；通过后点击「添加服务」。测试不会保存配置。模型预设仅为示例，可自行修改。
3. 输入原文，选择源语言、目标语言和风格，点击「开始翻译」。在原文框中按 `Enter` 直接翻译，`Shift + Enter` 换行，也可使用 `⌘ / Ctrl + Enter`。
4. 遇到游戏、影视、小说等需要统一语境的内容，展开「翻译背景」填写作品名、人物关系、术语偏好等说明；背景会随请求发送，帮助模型统一专有名词与语气。
5. 可复制译文、导入 UTF-8 `.txt` / `.md`、导出文本或 Markdown。
6. 侧边栏底部可切换界面语言（简体中文 / English）。

预设随版本更新（当前参考：OpenAI `gpt-6.1-sol` / `gpt-6-luna`、Claude `claude-sonnet-5-5`、Gemini `gemini-3.8-flash`、DeepSeek `deepseek-flash`、通义千问 `qwen3.5-plus`、Ollama `qwen3.5:9b`）。模型 ID 变化很快，所有字段都可在设置中改为你的账号实际可用的值。

支持 OpenAI Chat Completions 兼容服务（含 DeepSeek、通义千问、OpenRouter 等）、Anthropic Messages、Google Gemini GenerateContent。Ollama 可使用 `http://localhost:11434/v1`，模型必须先在本机安装并运行。其他服务请按协议填写正确的基础地址；例如 Claude 为 `https://api.anthropic.com/v1`。

「术语表」每行填写一组术语，例如 `人工智能 = artificial intelligence`，应用到后续请求。最近 30 条记录、术语表和翻译背景仅在当前窗口会话内保留，关闭窗口后清除。单次输入最多 50,000 字符；不支持 PDF、Word、OCR、网页翻译或整站翻译。

## 隐私与密钥

- 无项目中转服务器、账号系统、遥测或云端同步。原文、翻译背景、术语及翻译指令直接发给你配置的 API 服务，服务商可能按自己的政策保存内容并计费。「测试连接」也会向该服务发送一次很短的请求（原文为 `Hello`）。
- API Key 由 Electron `safeStorage` 加密后保存在应用用户数据目录的 `providers.json` 中，明文不会返回渲染进程。加密依赖操作系统账户与密钥库，不防范已控制本机账户的攻击者。
- 服务地址、模型名称以明文保存在本机；原文和译文不会由应用主动写入磁盘，手动导出的文件除外。
- Linux 检测到 `basic_text` 后端时拒绝保存密钥。远程地址只允许 HTTPS，本地 localhost/127.0.0.1/::1 支持 HTTP。API 请求拒绝自动重定向，避免把密钥转发到其他地址。
- 配置可信 API 地址；更改已有服务地址会把已有密钥发送到新地址。第三方兼容服务的能力与隐私政策需自行确认。

### macOS 钥匙串授权提示

API Key 使用系统钥匙串加密，主密钥保存在登录钥匙串的 `LinguaDock Safe Storage` 条目中。应用只在「保存密钥」或「首次使用已保存密钥翻译」时访问钥匙串，启动时不再做能力探测，因此不会一打开应用就弹窗。

弹窗出现时选择「始终允许」可对当前构建记住授权。社区构建使用 ad-hoc 签名，重新构建会改变应用签名，macOS 可能把它视为新的应用，升级后仍可能再次询问；使用 Developer ID 签名并公证的正式版本不会因升级反复询问。若不想授予钥匙串权限，可使用本地 Ollama 等无需 API Key 的服务。

## 开发

需要 Node.js 22+、npm 与当前平台的 Electron 运行环境。

```sh
npm ci
npm run dev
```

```sh
npm test           # 请求协议、响应解析、地址校验与翻译背景
npm run build      # TypeScript 检查及前端生产构建
npm run dist       # 当前平台桌面安装包
```

应用采用 Electron + React + TypeScript + Vite。渲染进程启用沙箱、上下文隔离和 CSP，关闭 Node 集成；API 与文件访问均通过受限 preload IPC 在主进程执行。翻译使用完整响应模式，支持取消和两分钟超时，尚未提供逐字流式输出。

界面文案集中在 `src/i18n.ts`，新增语言时补充对应字典即可。

## 构建与发布

GitHub Actions 在每次 main 推送及 PR 中构建三个平台，安装包可从 Actions artifacts 下载。推送 `v*` 标签后，待三个构建成功，自动创建 GitHub Release 并上传全部安装包及更新元数据：

```sh
git tag v0.2.2
git push origin v0.2.2
```

macOS 打包后由 `scripts/afterPack.cjs` 执行 ad-hoc 签名；如果配置了 `CSC_LINK` / `CSC_NAME`，则跳过并交由 electron-builder 使用正式证书签名。发布者可在本地使用 Electron Builder 的签名环境变量配置正式签名与 Apple 公证；正式签名并公证时，请同时将 `package.json` 中 `mac.hardenedRuntime` 设为 `true` 并配置相应 entitlements。完成公证后，macOS 自动更新才可用。本仓库 CI 仅做 ad-hoc 签名，不进行正式签名与公证。

## 自动更新

应用使用 `electron-updater` 从 GitHub Releases 检查更新：启动后延迟检查一次，也可在「关于 LinguaDock」（侧边栏底部版本号）中手动检查、下载并重启安装。

- Windows 与 Linux（AppImage）构建可直接使用自动更新。
- macOS 自动更新依赖 Developer ID 签名与公证；当前未公证的社区构建会回退为「手动下载」。
- Release 必须包含 `latest.yml`、`latest-mac.yml`、`latest-linux.yml` 以及 macOS 的 `.zip` 产物，CI 已自动上传。

首次版本的真实服务调用需使用自己的有效密钥验证；不内置或分发任何密钥。

## 参与与许可

欢迎提交 Issue 或 Pull Request。安全问题请勿在公开 Issue 中粘贴 API Key、私密原文或完整配置文件。MIT License。
