const {
  app,
  BrowserWindow,
  ipcMain,
  safeStorage,
  dialog,
  shell,
} = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { requestFor, extract } = require("./providers.cjs");
const { autoUpdater } = require("electron-updater");

const RELEASES_URL = "https://github.com/luopc1218/linguadock/releases/latest";
const PROTOCOLS = ["openai", "anthropic", "gemini"];
const MAX_TEXT = 50000;
const MAX_CONTEXT = 2000;
const MAX_GLOSSARY = 10000;

let win,
  state = { providers: [] },
  active,
  updateStatus = { state: "idle" },
  updaterReady = false;

const file = () => path.join(app.getPath("userData"), "providers.json");

function fail(code, detail) {
  throw new Error(detail === undefined ? code : `${code}|${detail}`);
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    fail("ERR_BAD_RESPONSE");
  }
}

const keyCache = new Map();

// Never call safeStorage just to probe availability: on macOS even the
// capability check touches the login keychain and raises an authorization
// dialog. Encryption/decryption below are the only keychain entry points.
function keyStoreUnsupported() {
  try {
    return (
      process.platform === "linux" &&
      safeStorage.getSelectedStorageBackend() === "basic_text"
    );
  } catch {
    return false;
  }
}

function publicState() {
  return {
    providers: state.providers.map(({ secret, ...p }) => ({
      ...p,
      hasKey: !!secret,
    })),
    version: app.getVersion(),
    locale: app.getLocale(),
  };
}

async function persist() {
  const tmp = file() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state), { mode: 0o600 });
  await fs.rename(tmp, file());
}

function register(name, fn) {
  ipcMain.handle(name, async (event, ...args) => {
    if (!win || event.sender !== win.webContents)
      throw new Error("ERR_INVALID_SENDER");
    return fn(...args);
  });
}

function setUpdate(status) {
  updateStatus = status;
  if (win && !win.isDestroyed()) win.webContents.send("update-status", status);
}

function canAutoUpdate() {
  if (!app.isPackaged || process.argv.includes("--dev")) return false;
  // Only AppImage builds can self-update on Linux; .deb installs use the
  // package manager instead.
  if (process.platform === "linux" && !process.env.APPIMAGE) return false;
  return true;
}

function checkForUpdates() {
  if (!canAutoUpdate()) {
    setUpdate({ state: "unsupported" });
    return updateStatus;
  }
  if (updateStatus.state === "checking" || updateStatus.state === "downloading")
    return updateStatus;
  setUpdate({ state: "checking" });
  Promise.resolve()
    .then(() => autoUpdater.checkForUpdates())
    .catch((e) =>
      setUpdate({ state: "error", message: updateErrorMessage(e) }),
    );
  return updateStatus;
}

function updateErrorMessage(e) {
  const text = String(e?.message || e);
  if (/404/.test(text) && /\.ya?ml/i.test(text)) return "ERR_UPDATE_NO_METADATA";
  const line = text.split("\n").find((x) => x.trim()) || text;
  return line.length > 240 ? line.slice(0, 240) + "…" : line;
}

function setupUpdater() {
  if (updaterReady) return;
  updaterReady = true;
  if (!canAutoUpdate()) {
    setUpdate({ state: "unsupported" });
    return;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("checking-for-update", () =>
    setUpdate({ state: "checking" }),
  );
  autoUpdater.on("update-available", (info) =>
    setUpdate({ state: "available", version: info?.version }),
  );
  autoUpdater.on("update-not-available", () =>
    setUpdate({ state: "none" }),
  );
  autoUpdater.on("download-progress", (p) =>
    setUpdate({
      state: "downloading",
      version: updateStatus.version,
      percent: Math.round(p?.percent || 0),
    }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    setUpdate({ state: "downloaded", version: info?.version }),
  );
  autoUpdater.on("error", (e) =>
    setUpdate({ state: "error", message: updateErrorMessage(e) }),
  );
  setTimeout(() => {
    if (updateStatus.state === "idle") checkForUpdates();
  }, 8000);
}

app.whenReady().then(async () => {
  app.setAppUserModelId("io.github.luopc1218.linguadock");
  try {
    state = JSON.parse(await fs.readFile(file(), "utf8"));
    if (!Array.isArray(state.providers)) throw Error("invalid");
  } catch (e) {
    if (e.code !== "ENOENT") {
      const zh = app.getLocale().toLowerCase().startsWith("zh");
      dialog.showErrorBox(
        zh ? "配置读取失败" : "Configuration error",
        zh
          ? "请备份并检查用户数据目录中的 providers.json，应用不会覆盖损坏的配置。"
          : "Back up and inspect providers.json in the user data folder. The app will not overwrite a damaged configuration.",
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
      typeof p.model !== "string" ||
      !p.model.trim() ||
      !PROTOCOLS.includes(p.protocol)
    )
      fail("ERR_NAME_MODEL");
    if (typeof p.baseUrl !== "string" || !p.baseUrl.trim())
      fail("ERR_URL_INVALID");
    requestFor(
      { ...p, baseUrl: p.baseUrl.trim() },
      "",
      "test",
      "auto",
      "Simplified Chinese",
      "natural and fluent",
      "",
      "",
    );
    const old = state.providers.find((x) => x.id === p.id);
    const id = old?.id || randomUUID();
    const newApiKey =
      typeof p.apiKey === "string" ? p.apiKey.trim() : "";
    let secret = old?.secret || "";
    if (newApiKey) {
      if (keyStoreUnsupported()) fail("ERR_KEYRING_UNAVAILABLE");
      try {
        secret = (
          await safeStorage.encryptStringAsync(newApiKey)
        ).toString("base64");
      } catch {
        fail("ERR_KEYRING_UNAVAILABLE");
      }
    }
    const entry = {
      id,
      name: p.name.trim().slice(0, 80),
      protocol: p.protocol,
      baseUrl: p.baseUrl.trim().slice(0, 2048),
      model: p.model.trim().slice(0, 200),
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
    if (newApiKey) keyCache.set(entry.id, newApiKey);
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
    keyCache.delete(id);
    return publicState();
  });
  register("testProvider", async (p) => {
    if (!p || typeof p !== "object") fail("ERR_UNKNOWN");
    if (typeof p.model !== "string" || !p.model.trim())
      fail("ERR_MODEL_REQUIRED");
    if (!PROTOCOLS.includes(p.protocol)) fail("ERR_PROTOCOL_INVALID");
    if (typeof p.baseUrl !== "string" || !p.baseUrl.trim())
      fail("ERR_URL_INVALID");
    let key = typeof p.apiKey === "string" ? p.apiKey.trim() : "";
    if (!key && p.id) {
      const cached = keyCache.get(p.id);
      if (cached !== undefined) {
        key = cached;
      } else {
        const saved = state.providers.find((x) => x.id === p.id);
        if (saved?.secret) {
          try {
            key = (
              await safeStorage.decryptStringAsync(
                Buffer.from(saved.secret, "base64"),
              )
            ).result;
            keyCache.set(p.id, key);
          } catch {
            fail("ERR_KEY_DECRYPT");
          }
        }
      }
    }
    const provider = {
      ...p,
      baseUrl: p.baseUrl.trim(),
      model: p.model.trim(),
    };
    const { url, options } = requestFor(
      provider,
      key,
      "Hello",
      "auto",
      "Simplified Chinese",
      "natural and fluent",
      "",
      "",
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const started = Date.now();
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        redirect: "error",
      });
      if (!response.ok) fail("ERR_HTTP", String(response.status));
      extract(provider, await readJson(response));
      return { ms: Date.now() - started };
    } catch (e) {
      if (e.name === "AbortError") fail("ERR_TIMEOUT");
      if (e.message === "fetch failed") fail("ERR_NETWORK");
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  });
  register("translate", async (input) => {
    if (active) fail("ERR_BUSY");
    if (!input || typeof input !== "object") fail("ERR_UNKNOWN");
    const p = state.providers.find((x) => x.id === input.providerId);
    if (!p) fail("ERR_NO_PROVIDER");
    const text = typeof input.text === "string" ? input.text : "";
    if (!text.trim() || text.length > MAX_TEXT) fail("ERR_TEXT_RANGE");
    let key = keyCache.get(p.id);
    if (key === undefined) {
      key = "";
      if (p.secret) {
        try {
          const decrypted = await safeStorage.decryptStringAsync(
            Buffer.from(p.secret, "base64"),
          );
          key = decrypted.result;
          keyCache.set(p.id, key);
        } catch {
          keyCache.delete(p.id);
          fail("ERR_KEY_DECRYPT");
        }
      }
    }
    const { url, options } = requestFor(
      p,
      key,
      text,
      typeof input.source === "string" ? input.source.slice(0, 80) : "auto",
      typeof input.target === "string" && input.target
        ? input.target.slice(0, 80)
        : "Simplified Chinese",
      typeof input.style === "string" && input.style
        ? input.style.slice(0, 120)
        : "natural and fluent",
      String(input.glossary || "").slice(0, MAX_GLOSSARY),
      typeof input.context === "string"
        ? input.context.slice(0, MAX_CONTEXT)
        : "",
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
      if (!response.ok) fail("ERR_HTTP", String(response.status));
      return extract(p, await readJson(response));
    } catch (e) {
      if (e.name === "AbortError") fail("ERR_TIMEOUT");
      if (e.message === "fetch failed") fail("ERR_NETWORK");
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
      filters: [{ name: "Text / Markdown", extensions: ["txt", "md"] }],
      properties: ["openFile"],
    });
    if (r.canceled) return null;
    const stat = await fs.stat(r.filePaths[0]);
    if (stat.size > 200000) fail("ERR_FILE_TOO_LARGE");
    const content = await fs.readFile(r.filePaths[0], "utf8");
    if (content.length > MAX_TEXT) fail("ERR_TEXT_RANGE");
    return content;
  });
  register("exportText", async (text) => {
    if (typeof text !== "string") fail("ERR_INVALID_TEXT");
    const r = await dialog.showSaveDialog(win, {
      defaultPath: "translation.md",
      filters: [
        { name: "Markdown", extensions: ["md"] },
        { name: "Text", extensions: ["txt"] },
      ],
    });
    if (!r.canceled) await fs.writeFile(r.filePath, text, "utf8");
    return !r.canceled;
  });
  register("getUpdateStatus", () => updateStatus);
  register("checkUpdate", () => checkForUpdates());
  register("installUpdate", () => {
    if (updateStatus.state !== "downloaded") return false;
    setImmediate(() => autoUpdater.quitAndInstall());
    return true;
  });
  register("openReleases", () => shell.openExternal(RELEASES_URL));

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
    if (process.argv.includes("--dev"))
      win.loadURL("http://127.0.0.1:5173");
    else win.loadFile(path.join(__dirname, "../dist/index.html"));
    win.on("closed", () => {
      active?.abort();
      win = null;
    });
  }
  createWindow();
  setupUpdater();
  app.on("activate", () => {
    if (!win) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
