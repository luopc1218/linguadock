# 译栈 · LinguaDock

自带 API Key 的开源 AI 翻译桌面工具。支持 **Windows x64 / macOS Apple Silicon / Linux x64**。

双栏文本翻译、服务商切换、术语表与翻译风格，让自己的模型服务进入日常翻译工作流。

## 安装

前往 [Releases](https://github.com/luopc1218/linguadock/releases) 下载对应平台安装包：

| 平台 | 安装包 |
| --- | --- |
| Windows x64 | `.exe`（NSIS） |
| macOS arm64 | `.dmg` |
| Linux x64 | `.AppImage` / `.deb` |

当前社区构建未购买 Windows 代码签名证书，也未进行 Apple 公证，系统可能提示发行者未验证。请核对来源，按所在组织的安全政策安装。Linux 保存密钥需要 Secret Service / KWallet；无安全密钥库时拒绝持久化 API Key。

## 使用

1. 打开「AI 服务设置」，选择预设或添加自定义服务。
2. 填写基础 API 地址、API Key 与账号可用的模型 ID，点击「添加服务」。模型预设仅为示例，可自行修改。
3. 输入原文，选择源语言、目标语言和风格，点击「开始翻译」或按 `⌘ / Ctrl + Enter`。
4. 可复制译文、导入 UTF-8 `.txt` / `.md`、导出文本或 Markdown。

支持 OpenAI Chat Completions 兼容服务（含 DeepSeek、通义千问、OpenRouter 等）、Anthropic Messages、Google Gemini GenerateContent。Ollama 可使用 `http://localhost:11434/v1`，模型必须先在本机安装并运行。其他服务请按协议填写正确的基础地址；例如 Claude 为 `https://api.anthropic.com/v1`。

「术语表」每行填写一组术语，例如 `人工智能 = artificial intelligence`，应用到后续请求。最近 30 条记录和术语表仅在当前窗口会话内保留，关闭窗口后清除。单次输入最多 50,000 字符；不支持 PDF、Word、OCR、网页翻译或整站翻译。

## 隐私与密钥

- 无项目中转服务器、账号系统、遥测或云端同步。原文、术语及翻译指令直接发给你配置的 API 服务，服务商可能按自己的政策保存内容并计费。
- API Key 由 Electron `safeStorage` 加密后保存在应用用户数据目录的 `providers.json` 中，明文不会返回渲染进程。加密依赖操作系统账户与密钥库，不防范已控制本机账户的攻击者。
- 服务地址、模型名称以明文保存在本机；原文和译文不会由应用主动写入磁盘，手动导出的文件除外。
- Linux 检测到 `basic_text` 后端时拒绝保存密钥。远程地址只允许 HTTPS，本地 localhost/127.0.0.1/::1 支持 HTTP。API 请求拒绝自动重定向，避免把密钥转发到其他地址。
- 配置可信 API 地址；更改已有服务地址会把已有密钥发送到新地址。第三方兼容服务的能力与隐私政策需自行确认。

## 开发

需要 Node.js 22+、npm 与当前平台的 Electron 运行环境。

```sh
npm ci
npm run dev
```

```sh
npm test           # 请求协议、响应解析与地址校验
npm run build      # TypeScript 检查及前端生产构建
npm run dist       # 当前平台桌面安装包
```

应用采用 Electron + React + TypeScript + Vite。渲染进程启用沙箱、上下文隔离和 CSP，关闭 Node 集成；API 与文件访问均通过受限 preload IPC 在主进程执行。翻译使用完整响应模式，支持取消和两分钟超时，尚未提供逐字流式输出。

## 构建与发布

GitHub Actions 在每次 main 推送及 PR 中构建三个平台，安装包可从 Actions artifacts 下载。推送 `v*` 标签后，待三个构建成功，自动创建 GitHub Release 并上传全部安装包：

```sh
git tag v0.1.0
git push origin v0.1.0
```

发布者可以在本地使用 Electron Builder 的签名环境变量配置正式签名与 Apple 公证。本仓库 CI 默认不签名。首次版本的真实服务调用需使用自己的有效密钥验证；不内置或分发任何密钥。

## 参与与许可

欢迎提交 Issue 或 Pull Request。安全问题请勿在公开 Issue 中粘贴 API Key、私密原文或完整配置文件。MIT License。
