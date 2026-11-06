import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Languages,
  ArrowRight,
  ArrowLeftRight,
  Settings2,
  Plus,
  X,
  Copy,
  Download,
  Upload,
  Check,
  Trash2,
  BookOpen,
  ShieldCheck,
  Square,
  History,
} from "lucide-react";
import "./style.css";
type Provider = {
  id: string;
  name: string;
  protocol: string;
  baseUrl: string;
  model: string;
  hasKey?: boolean;
  apiKey?: string;
};
type State = { providers: Provider[]; secureStorage: boolean };
type Input = {
  providerId: string;
  text: string;
  source: string;
  target: string;
  style: string;
  glossary: string;
};
declare global {
  interface Window {
    desktop: {
      load: () => Promise<State>;
      saveProvider: (p: Provider) => Promise<State>;
      deleteProvider: (id: string) => Promise<State>;
      translate: (i: Input) => Promise<string>;
      cancel: () => Promise<void>;
      importText: () => Promise<string | null>;
      exportText: (t: string) => Promise<boolean>;
    };
  }
}
const presets = [
  {
    name: "OpenAI",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
  },
  {
    name: "DeepSeek",
    protocol: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  {
    name: "Claude",
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-5",
  },
  {
    name: "Gemini",
    protocol: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash",
  },
  {
    name: "通义千问",
    protocol: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
  {
    name: "Ollama",
    protocol: "openai",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen3:8b",
  },
  { name: "自定义服务", protocol: "openai", baseUrl: "https://", model: "" },
];
const langs = [
  "简体中文",
  "繁體中文",
  "English",
  "日本語",
  "한국어",
  "Français",
  "Deutsch",
  "Español",
  "Русский",
  "Português",
  "العربية",
];
function App() {
  const [state, setState] = useState<State>({
      providers: [],
      secureStorage: false,
    }),
    [providerId, setProviderId] = useState(""),
    [text, setText] = useState(""),
    [result, setResult] = useState(""),
    [source, setSource] = useState("自动检测"),
    [target, setTarget] = useState("简体中文"),
    [style, setStyle] = useState("自然流畅"),
    [glossary, setGlossary] = useState(""),
    [tab, setTab] = useState("translate"),
    [settings, setSettings] = useState(false),
    [draft, setDraft] = useState<Provider>({
      ...presets[0],
      id: "",
      apiKey: "",
    }),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [history, setHistory] = useState<
      { text: string; result: string; target: string; time: string }[]
    >([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const current = state.providers.find((p) => p.id === providerId);
  useEffect(() => {
    window.desktop
      ?.load()
      .then((s) => {
        setState(s);
        setProviderId(s.providers[0]?.id || "");
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  async function translate() {
    if (busy || !text.trim()) return;
    if (!current) {
      setSettings(true);
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    try {
      const output = await window.desktop.translate({
        providerId,
        text,
        source,
        target,
        style,
        glossary,
      });
      setResult(output);
      setHistory((h) =>
        [
          {
            text,
            result: output,
            target,
            time: new Date().toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...h,
        ].slice(0, 30),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save() {
    setSaving(true);
    setError("");
    try {
      const s = await window.desktop.saveProvider(draft);
      setState(s);
      if (!providerId) setProviderId(s.providers.at(-1)!.id);
      setDraft({ ...presets[0], id: "", apiKey: "" });
      setToast("服务已保存");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  function openSettings() {
    setError("");
    setSettings(true);
  }
  return (
    <div
      className="app"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          void translate();
        }
        if (e.key === "Escape" && !saving) setSettings(false);
      }}
    >
      <aside>
        <div className="brand">
          <span className="mark">
            <Languages size={23} />
          </span>
          <div>
            译栈<small>LINGUADOCK</small>
          </div>
        </div>
        <div className="navlabel">工作空间</div>
        <nav>
          <button
            className={tab === "translate" ? "active" : ""}
            onClick={() => setTab("translate")}
          >
            <Languages size={18} />
            文本翻译
          </button>
          <button
            className={tab === "glossary" ? "active" : ""}
            onClick={() => setTab("glossary")}
          >
            <BookOpen size={18} />
            术语表{glossary && <span className="dot" />}
          </button>
          <button
            className={tab === "history" ? "active" : ""}
            onClick={() => setTab("history")}
          >
            <History size={18} />
            本次记录<span className="count">{history.length}</span>
          </button>
        </nav>
        <div className="sidebarbottom">
          <div className="privacy">
            <ShieldCheck size={17} />
            <div>
              你的密钥，你的选择<small>直连 AI 服务 · 无中转服务器</small>
            </div>
          </div>
          <button onClick={openSettings}>
            <Settings2 size={18} />
            AI 服务设置
          </button>
          <div className="version">
            LinguaDock <span>v0.1.0</span>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <div className="breadcrumb">
            工作空间 <span>/</span>{" "}
            <b>
              {tab === "translate"
                ? "文本翻译"
                : tab === "glossary"
                  ? "术语表"
                  : "本次记录"}
            </b>
          </div>
          <button className="service" onClick={openSettings}>
            <span className={current ? "dot" : "dot muted"} />
            {current?.name || "添加 AI 服务"}
            <Settings2 size={14} />
          </button>
        </header>
        {error && (
          <div className="error" role="alert">
            {error}
            <button aria-label="关闭错误" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {tab === "translate" ? (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">WORDS, WITHOUT BORDERS</span>
                <h1>让表达，自在抵达。</h1>
                <p>选择你的 AI，把每一种语言说得更好。</p>
              </div>
              <button
                className="subtle"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const t = await window.desktop.importText();
                    if (t !== null) setText(t);
                  })
                }
              >
                <Upload size={16} />
                导入文本
              </button>
            </div>
            <div className="toolbar">
              <div className="language">
                <select
                  aria-label="源语言"
                  disabled={busy}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  {["自动检测", ...langs].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <button
                  aria-label="交换语言"
                  disabled={busy || source === "自动检测"}
                  onClick={() => {
                    setSource(target);
                    setTarget(source);
                    if (result) {
                      setText(result);
                      setResult(text);
                    }
                  }}
                >
                  <ArrowLeftRight size={17} />
                </button>
                <select
                  aria-label="目标语言"
                  disabled={busy}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {langs.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <label className="stylelabel">
                翻译风格
                <select
                  disabled={busy}
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {[
                    "自然流畅",
                    "忠实原文",
                    "专业学术",
                    "轻松口语",
                    "商务正式",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="editor">
              <div className="pane">
                <div className="panelhead">
                  原文{" "}
                  <button
                    aria-label="清空原文"
                    disabled={busy || !text}
                    onClick={() => {
                      setText("");
                      setResult("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  ref={inputRef}
                  disabled={busy}
                  maxLength={50000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="在这里输入或粘贴要翻译的内容…"
                  aria-label="原文"
                />
                <div className="panelfoot">
                  <span>{text.length.toLocaleString()} / 50,000 字符</span>
                  <span>支持 Markdown</span>
                </div>
              </div>
              <div className="pane output">
                <div className="panelhead">
                  译文 <span>{target}</span>
                </div>
                {busy ? (
                  <div className="empty">
                    <div className="loading" />
                    <h3>正在翻译</h3>
                    <p>正在向 {current?.name} 请求译文…</p>
                  </div>
                ) : result ? (
                  <textarea readOnly value={result} aria-label="译文" />
                ) : (
                  <div className="empty">
                    <div className="emptyicon">
                      <Languages size={32} strokeWidth={1.3} />
                    </div>
                    <h3>每一种语言，都有回响</h3>
                    <p>译文将在这里呈现</p>
                  </div>
                )}
                <div className="panelfoot">
                  <span>
                    {result
                      ? `${result.length.toLocaleString()} 字符`
                      : "等待翻译"}
                  </span>
                  <div>
                    <button
                      aria-label="复制译文"
                      disabled={!result || busy}
                      onClick={() =>
                        run(async () => {
                          await navigator.clipboard.writeText(result);
                          setToast("译文已复制");
                        })
                      }
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      aria-label="导出译文"
                      disabled={!result || busy}
                      onClick={() =>
                        run(async () => {
                          if (await window.desktop.exportText(result))
                            setToast("译文已导出");
                        })
                      }
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="actionbar">
              <div>
                <select
                  aria-label="翻译服务"
                  disabled={busy}
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                >
                  {!state.providers.length && (
                    <option value="">尚未配置服务</option>
                  )}
                  {state.providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.model}
                    </option>
                  ))}
                </select>
                <small>
                  {glossary ? "已应用术语表" : "内容仅发送至你选择的 AI 服务"}
                </small>
              </div>
              {busy ? (
                <button
                  className="primary"
                  onClick={() => run(() => window.desktop.cancel())}
                >
                  <Square size={15} />
                  停止翻译
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={!text.trim()}
                  onClick={() => void translate()}
                >
                  开始翻译 <ArrowRight size={17} />
                </button>
              )}
            </div>
            <div className="workspacefoot">
              <span>
                <ShieldCheck size={14} />
                密钥保存在本机系统安全存储中
              </span>
              <span>⌘ / Ctrl + Enter 翻译</span>
            </div>
          </section>
        ) : tab === "glossary" ? (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">YOUR WORDS, YOUR WAY</span>
                <h1>统一每一个专业表达。</h1>
                <p>
                  每行一个术语，例如：人工智能 = artificial
                  intelligence。本次会话内生效。
                </p>
              </div>
            </div>
            <textarea
              className="glossary"
              value={glossary}
              maxLength={10000}
              onChange={(e) => setGlossary(e.target.value)}
              placeholder={
                "人工智能 = artificial intelligence\n译栈 = LinguaDock"
              }
              aria-label="术语表"
            />
            <p className="hint">
              术语会随原文发送给所选 AI；模型可能无法完全遵循，请审阅译文。
            </p>
          </section>
        ) : (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">THIS SESSION</span>
                <h1>回看刚才的表达。</h1>
                <p>仅保留本次会话最近 30 条翻译，退出后清除。</p>
              </div>
              <button className="subtle" onClick={() => setHistory([])}>
                清空记录
              </button>
            </div>
            {!history.length ? (
              <div className="empty">
                <History size={32} />
                <p>还没有翻译记录</p>
              </div>
            ) : (
              history.map((h, i) => (
                <button
                  className="historyrow"
                  key={i}
                  disabled={busy}
                  onClick={() => {
                    setText(h.text);
                    setResult(h.result);
                    setTarget(h.target);
                    setTab("translate");
                  }}
                >
                  <span>{h.text.slice(0, 120)}</span>
                  <small>
                    {h.time} → {h.target}
                  </small>
                  <ArrowRight size={16} />
                </button>
              ))
            )}
          </section>
        )}
        <footer>
          为跨越语言的日常而造。<span>开源 · 自带密钥 · 本地优先</span>
        </footer>
      </main>
      {settings && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setSettings(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="modalhead">
              <div>
                <span className="eyebrow">BRING YOUR OWN KEY</span>
                <h2 id="settings-title">连接你的 AI</h2>
              </div>
              <button
                aria-label="关闭设置"
                disabled={saving}
                onClick={() => setSettings(false)}
              >
                <X size={22} />
              </button>
            </div>
            <p className="hint">
              密钥仅在本机保存，请求直达下方 API
              地址。修改地址前请确认服务可信。
            </p>
            {!state.secureStorage && (
              <div className="warning">
                系统安全密钥库不可用，暂时无法保存 API
                Key。本地免密服务仍可使用。
              </div>
            )}
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <div className="savedservices">
              {state.providers.map((p) => (
                <div key={p.id}>
                  <button
                    disabled={saving}
                    onClick={() => setDraft({ ...p, apiKey: "" })}
                  >
                    <span className="dot" />
                    <b>{p.name}</b>
                    <small>{p.model}</small>
                  </button>
                  <button
                    aria-label={`删除 ${p.name}`}
                    disabled={saving || busy}
                    onClick={() =>
                      run(async () => {
                        const s = await window.desktop.deleteProvider(p.id);
                        setState(s);
                        if (providerId === p.id)
                          setProviderId(s.providers[0]?.id || "");
                        if (draft.id === p.id)
                          setDraft({ ...presets[0], id: "", apiKey: "" });
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="presets">
              {presets.map((p) => (
                <button
                  disabled={saving}
                  className={
                    draft.name === p.name && !draft.id ? "selected" : ""
                  }
                  key={p.name}
                  onClick={() => setDraft({ ...p, id: "", apiKey: "" })}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="form">
              <label>
                服务名称
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                接口协议
                <select
                  value={draft.protocol}
                  onChange={(e) =>
                    setDraft({ ...draft, protocol: e.target.value })
                  }
                >
                  <option value="openai">OpenAI 兼容</option>
                  <option value="anthropic">Anthropic Messages</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </label>
              <label className="full">
                API 地址
                <input
                  value={draft.baseUrl}
                  placeholder="https://api.example.com/v1"
                  onChange={(e) =>
                    setDraft({ ...draft, baseUrl: e.target.value })
                  }
                />
                <small>
                  填写基础地址，不含 /chat/completions、/messages 或模型路径。
                </small>
              </label>
              <label className="full">
                API Key
                <input
                  type="password"
                  autoComplete="off"
                  value={draft.apiKey}
                  placeholder={
                    draft.hasKey
                      ? "已保存密钥，留空保持不变"
                      : "粘贴密钥，本地 Ollama 可留空"
                  }
                  onChange={(e) =>
                    setDraft({ ...draft, apiKey: e.target.value })
                  }
                />
              </label>
              <label className="full">
                模型名称
                <input
                  value={draft.model}
                  placeholder="填写该服务实际可用的模型 ID"
                  onChange={(e) =>
                    setDraft({ ...draft, model: e.target.value })
                  }
                />
                <small>预设仅作起点，可改成你的账号支持的模型。</small>
              </label>
            </div>
            <div className="modalfoot">
              <span>
                <ShieldCheck size={15} />
                不上传密钥至项目服务器
              </span>
              <button
                className="primary"
                disabled={saving || busy}
                onClick={() => void save()}
              >
                {saving ? "保存中…" : draft.id ? "保存修改" : "添加服务"}
                <Plus size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
