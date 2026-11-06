const {
  app,
  BrowserWindow,
  ipcMain,
  safeStorage,
  dialog,
} = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { requestFor, extract } = require("./providers.cjs");
let win,
  state = { providers: [] },
  active;
const file = () => path.join(app.getPath("userData"), "providers.json");
function secure() {
  return (
    safeStorage.isEncryptionAvailable() &&
    (process.platform !== "linux" ||
      safeStorage.getSelectedStorageBackend() !== "basic_text")
  );
}
function publicState() {
  return {
    providers: state.providers.map(({ secret, ...p }) => ({
      ...p,
      hasKey: !!secret,
    })),
    secureStorage: secure(),
  };
}
async function persist() {
  const tmp = file() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state), { mode: 0o600 });
  await fs.rename(tmp, file());
}
function register(name, fn) {
  ipcMain.handle(name, async (event, ...args) => {
    if (event.sender !== win.webContents) throw new Error("Invalid sender");
    return fn(...args);
  });
}
app.whenReady().then(async () => {
  try {
    state = JSON.parse(await fs.readFile(file(), "utf8"));
    if (!Array.isArray(state.providers)) throw Error();
  } catch (e) {
    if (e.code !== "ENOENT") {
      dialog.showErrorBox(
        "配置读取失败",
        "请备份并检查用户数据目录中的 providers.json，应用不会覆盖损坏的配置。",
      );
      app.quit();
      return;
    }
  }
  register("load", () => publicState());
  register("saveProvider", async (p) => {
    if (
      !p ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      !p.model?.trim() ||
      !["openai", "anthropic", "gemini"].includes(p.protocol)
    )
      throw Error("请填写服务名称和模型");
    requestFor(p, "", "test", "自动检测", "中文", "自然", "");
    const old = state.providers.find((x) => x.id === p.id);
    let secret = old?.secret || "";
    if (p.apiKey) {
      if (!secure())
        throw Error(
          "系统安全密钥库不可用，请启用 Keychain / Secret Service / KWallet 后再保存 API Key",
        );
      secret = safeStorage.encryptString(p.apiKey).toString("base64");
    }
    const entry = {
      id: old?.id || require("node:crypto").randomUUID(),
      name: p.name.trim().slice(0, 80),
      protocol: p.protocol,
      baseUrl: p.baseUrl.trim(),
      model: p.model.trim(),
      secret,
    };
    const next = state.providers.filter((x) => x.id !== entry.id).concat(entry);
    const previous = state;
    state = { providers: next };
    try {
      await persist();
    } catch (e) {
      state = previous;
      throw e;
    }
    return publicState();
  });
  register("deleteProvider", async (id) => {
    const previous = state;
    state = { providers: state.providers.filter((x) => x.id !== id) };
    try {
      await persist();
    } catch (e) {
      state = previous;
      throw e;
    }
    return publicState();
  });
  register("translate", async (input) => {
    if (active) throw Error("已有翻译正在进行");
    const p = state.providers.find((x) => x.id === input.providerId);
    if (!p) throw Error("请先添加 AI 服务");
    if (
      typeof input.text !== "string" ||
      !input.text.trim() ||
      input.text.length > 50000
    )
      throw Error("请输入 1–50,000 字符的原文");
    const key = p.secret
      ? safeStorage.decryptString(Buffer.from(p.secret, "base64"))
      : "";
    const { url, options } = requestFor(
      p,
      key,
      input.text,
      input.source,
      input.target,
      input.style,
      String(input.glossary || "").slice(0, 10000),
    );
    const controller = new AbortController();
    active = controller;
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        redirect: "error",
      });
      if (!response.ok)
        throw Error(
          `API 请求失败（HTTP ${response.status}），请检查密钥、额度、模型和服务地址`,
        );
      return extract(p, await response.json());
    } catch (e) {
      if (e.name === "AbortError") throw Error("翻译已取消或请求超时");
      if (e.message === "fetch failed")
        throw Error("连接失败，请检查网络和 API 地址");
      throw e;
    } finally {
      clearTimeout(timeout);
      active = undefined;
    }
  });
  register("cancel", () => {
    active?.abort();
  });
  register("importText", async () => {
    const r = await dialog.showOpenDialog(win, {
      filters: [{ name: "文本 / Markdown", extensions: ["txt", "md"] }],
      properties: ["openFile"],
    });
    if (r.canceled) return null;
    const stat = await fs.stat(r.filePaths[0]);
    if (stat.size > 200000)
      throw Error("文件过大，请导入 200 KB 以内的 UTF-8 文本");
    return fs.readFile(r.filePaths[0], "utf8");
  });
  register("exportText", async (text) => {
    if (typeof text !== "string") throw Error("无效译文");
    const r = await dialog.showSaveDialog(win, {
      defaultPath: "translation.md",
      filters: [
        { name: "Markdown", extensions: ["md"] },
        { name: "文本", extensions: ["txt"] },
      ],
    });
    if (!r.canceled) await fs.writeFile(r.filePath, text, "utf8");
    return !r.canceled;
  });
  function createWindow() {
    win = new BrowserWindow({
      width: 1240,
      height: 820,
      minWidth: 880,
      minHeight: 640,
      backgroundColor: "#f6f7f9",
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    win.webContents.on("will-navigate", (e) => e.preventDefault());
    if (process.argv.includes("--dev")) win.loadURL("http://127.0.0.1:5173");
    else win.loadFile(path.join(__dirname, "../dist/index.html"));
    win.on("closed", () => {
      active?.abort();
      win = null;
    });
  }
  createWindow();
  app.on("activate", () => {
    if (!win) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
