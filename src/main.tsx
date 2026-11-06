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
  Lightbulb,
  RefreshCw,
  Eye,
  EyeOff,
  Pencil,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./style.css";
import {
  detectLang,
  langPrompt,
  languageLabel,
  localizeError,
  messages,
  presetName,
  stylePrompt,
  LANGUAGES,
  PRESETS,
  STYLES,
  UI_LANGUAGES,
  type UiLang,
} from "./i18n";

type Provider = {
  id: string;
  name: string;
  protocol: string;
  baseUrl: string;
  model: string;
  hasKey?: boolean;
  apiKey?: string;
};
type State = {
  providers: Provider[];
  version?: string;
  locale?: string;
};
type Input = {
  providerId: string;
  text: string;
  source: string;
  target: string;
  style: string;
  glossary: string;
  context: string;
};
type UpdateStatus = {
  state:
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "downloaded"
    | "none"
    | "error"
    | "unsupported";
  version?: string;
  percent?: number;
  message?: string;
};
type HistoryEntry = {
  text: string;
  result: string;
  target: string;
  at: number;
};
type Toast = "" | "saved" | "copied" | "exported";
type TestResult = { ok: true; ms: number } | { ok: false; message: string } | null;

declare global {
  interface Window {
    desktop: {
      load: () => Promise<State>;
      saveProvider: (p: Provider) => Promise<State>;
      deleteProvider: (id: string) => Promise<State>;
      testProvider: (p: Provider) => Promise<{ ms: number }>;
      translate: (i: Input) => Promise<string>;
      cancel: () => Promise<void>;
      importText: () => Promise<string | null>;
      exportText: (t: string) => Promise<boolean>;
      getUpdateStatus: () => Promise<UpdateStatus>;
      checkUpdate: () => Promise<UpdateStatus>;
      installUpdate: () => Promise<boolean>;
      openReleases: () => Promise<void>;
      onUpdateStatus: (cb: (s: UpdateStatus) => void) => () => void;
    };
  }
}

const LANG_STORAGE = "linguadock.uiLang";

function storedLang(): UiLang | null {
  try {
    const value = localStorage.getItem(LANG_STORAGE);
    return value === "zh-CN" || value === "en-US" ? value : null;
  } catch {
    return null;
  }
}

function emptyDraft(lang: UiLang): Provider {
  const preset = PRESETS[0];
  return {
    id: "",
    name: presetName(preset, lang),
    protocol: preset.protocol,
    baseUrl: preset.baseUrl,
    model: preset.model,
    apiKey: "",
  };
}

function errorText(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  // ipcRenderer wraps thrown main-process errors, e.g.
  // "Error invoking remote method 'translate': Error: ERR_HTTP|401".
  const code = raw.match(/ERR_[A-Z_]+(?:\|[^\s]*)?/);
  return code ? code[0] : raw;
}

function App() {
  const [lang, setLang] = useState<UiLang>(() => storedLang() ?? detectLang(navigator.language));
  const m = messages[lang];
  const [state, setState] = useState<State>({
      providers: [],
    }),
    [providerId, setProviderId] = useState(""),
    [text, setText] = useState(""),
    [result, setResult] = useState(""),
    [source, setSource] = useState("auto"),
    [target, setTarget] = useState("zh-Hans"),
    [style, setStyle] = useState("natural"),
    [glossary, setGlossary] = useState(""),
    [context, setContext] = useState(""),
    [contextOpen, setContextOpen] = useState(false),
    [tab, setTab] = useState("translate"),
    [settings, setSettings] = useState(false),
    [about, setAbout] = useState(false),
    [draft, setDraft] = useState<Provider>(() => emptyDraft(lang)),
    [showKey, setShowKey] = useState(false),
    [testing, setTesting] = useState(false),
    [test, setTest] = useState<TestResult>(null),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState<Toast>(""),
    [update, setUpdate] = useState<UpdateStatus>({ state: "idle" }),
    [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const testSeq = useRef(0);
  const hadStoredLang = useRef(storedLang() !== null);
  const current = state.providers.find((p) => p.id === providerId);
  const hasContext = !!context.trim();

  useEffect(() => {
    window.desktop
      ?.load()
      .then((s) => {
        setState(s);
        setProviderId(s.providers[0]?.id || "");
        if (!hadStoredLang.current && s.locale) setLang(detectLang(s.locale));
      })
      .catch((e) => setError(errorText(e)));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE, lang);
    } catch {
      /* storage can be unavailable; the UI still works */
    }
  }, [lang]);
  useEffect(() => {
    const api = window.desktop;
    if (!api?.onUpdateStatus) return;
    const off = api.onUpdateStatus(setUpdate);
    api.getUpdateStatus().then(setUpdate).catch(() => {});
    return () => off?.();
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    testSeq.current++;
    setTest(null);
    setTesting(false);
  }, [draft]);
  useEffect(() => {
    setShowKey(false);
  }, [draft.id]);

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
        source: source === "auto" ? "auto" : langPrompt(source),
        target: langPrompt(target),
        style: stylePrompt(style),
        glossary,
        context,
      });
      setResult(output);
      setHistory((h) =>
        [{ text, result: output, target, at: Date.now() }, ...h].slice(0, 30),
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function save() {
    setSaving(true);
    setError("");
    try {
      const s = await window.desktop.saveProvider(draft);
      setState(s);
      if (!providerId) setProviderId(s.providers.at(-1)?.id || "");
      setDraft(emptyDraft(lang));
      setToast("saved");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  }
  function openSettings() {
    setError("");
    setSettings(true);
  }
  function newProvider() {
    setDraft(emptyDraft(lang));
    setError("");
  }
  function editProvider(p: Provider) {
    setDraft({ ...p, apiKey: "" });
    setError("");
  }
  function applyPreset(key: string) {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setDraft({
      id: "",
      name: presetName(preset, lang),
      protocol: preset.protocol,
      baseUrl: preset.baseUrl,
      model: preset.model,
      apiKey: "",
    });
    setError("");
  }
  async function testConnection() {
    const seq = ++testSeq.current;
    setTesting(true);
    setTest(null);
    try {
      const result = await window.desktop.testProvider({
        ...draft,
        apiKey: draft.apiKey?.trim() || "",
      });
      if (seq !== testSeq.current) return;
      setTest({ ok: true, ms: result.ms });
    } catch (e) {
      if (seq !== testSeq.current) return;
      setTest({ ok: false, message: errorText(e) });
    } finally {
      if (seq === testSeq.current) setTesting(false);
    }
  }
  function updateText(): string {
    switch (update.state) {
      case "checking":
        return m.checkingUpdate;
      case "available":
        return m.updateAvailable.replace("{v}", update.version || "");
      case "downloading":
        return m.updateProgress(String(update.percent ?? 0));
      case "downloaded":
        return m.updateDownloaded.replace("{v}", update.version || "");
      case "none":
        return m.upToDate;
      case "error":
        return m.updateError.replace(
          "{msg}",
          localizeError(lang, update.message || ""),
        );
      case "unsupported":
        return m.updateUnsupported;
      default:
        return "";
    }
  }
  const toastText =
    toast === "saved" ? m.savedToast : toast === "copied" ? m.copiedToast : toast === "exported" ? m.exportedToast : "";
  const tabName =
    tab === "translate" ? m.translateTab : tab === "glossary" ? m.glossaryTab : m.historyTab;

  return (
    <div
      className="app"
      onKeyDown={(e) => {
        if (about) {
          if (e.key === "Escape") setAbout(false);
          return;
        }
        if (settings) {
          if (e.key === "Escape" && !saving) setSettings(false);
          return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          void translate();
        }
      }}
    >
      <aside>
        <div className="brand">
          <span className="mark">
            <Languages size={23} />
          </span>
          <div>
            译栈<small>{m.appSubtitle}</small>
          </div>
        </div>
        <div className="navlabel">{m.workspace}</div>
        <nav>
          <button
            className={tab === "translate" ? "active" : ""}
            onClick={() => setTab("translate")}
          >
            <Languages size={18} />
            {m.translateTab}
          </button>
          <button
            className={tab === "glossary" ? "active" : ""}
            onClick={() => setTab("glossary")}
          >
            <BookOpen size={18} />
            {m.glossaryTab}
            {glossary && <span className="dot" />}
          </button>
          <button
            className={tab === "history" ? "active" : ""}
            onClick={() => setTab("history")}
          >
            <History size={18} />
            {m.historyTab}
            <span className="count">{history.length}</span>
          </button>
        </nav>
        <div className="sidebarbottom">
          <div className="privacy">
            <ShieldCheck size={17} />
            <div>
              {m.privacyTitle}
              <small>{m.privacySubtitle}</small>
            </div>
          </div>
          <label className="langswitch">
            <Languages size={15} />
            <select
              aria-label={m.interfaceLanguage}
              value={lang}
              onChange={(e) => setLang(e.target.value as UiLang)}
            >
              {UI_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={openSettings}>
            <Settings2 size={18} />
            {m.settings}
          </button>
          <button className="version" aria-label={m.about} onClick={() => setAbout(true)}>
            <span>LinguaDock {state.version ? `v${state.version}` : ""}</span>
            <Info size={13} />
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div className="breadcrumb">
            {m.workspace} <span>/</span> <b>{tabName}</b>
          </div>
          <button className="service" onClick={openSettings}>
            <span className={current ? "dot" : "dot muted"} />
            {current?.name || m.addService}
            <Settings2 size={14} />
          </button>
        </header>
        {error && (
          <div className="error" role="alert">
            {localizeError(lang, error)}
            <button aria-label={m.closeError} onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {tab === "translate" ? (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">{m.translateEyebrow}</span>
                <h1>{m.translateTitle}</h1>
                <p>{m.translateSubtitle}</p>
              </div>
              <button
                className="subtle"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const t = await window.desktop.importText();
                    if (t !== null) {
                      setText(t);
                      setResult("");
                    }
                  })
                }
              >
                <Upload size={16} />
                {m.importText}
              </button>
            </div>
            <div className="toolbar">
              <div className="language">
                <select
                  aria-label={m.sourceLanguage}
                  disabled={busy}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="auto">{m.sourceAuto}</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label[lang]}
                    </option>
                  ))}
                </select>
                <button
                  aria-label={m.swapLanguages}
                  disabled={busy || source === "auto"}
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
                  aria-label={m.targetLanguage}
                  disabled={busy}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbarright">
                <label className="stylelabel">
                  {m.translationStyle}
                  <select
                    disabled={busy}
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    {STYLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label[lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={"contexttoggle" + (hasContext ? " active" : "")}
                  aria-expanded={contextOpen || hasContext}
                  onClick={() => setContextOpen((open) => !open)}
                >
                  <Lightbulb size={15} />
                  {m.contextTitle}
                  {hasContext && <span className="dot" />}
                </button>
              </div>
            </div>
            {(contextOpen || hasContext) && (
              <div className="contextpanel">
                <div className="contexthead">
                  <span>
                    <Lightbulb size={14} />
                    {m.contextTitle}
                  </span>
                  <span>{context.length.toLocaleString(lang)} / 2,000</span>
                </div>
                <textarea
                  value={context}
                  maxLength={2000}
                  disabled={busy}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={m.contextPlaceholder}
                  aria-label={m.contextTitle}
                />
                <div className="contextfoot">
                  <p className="hint">{m.contextHint}</p>
                  <button
                    className="subtle"
                    disabled={!context}
                    onClick={() => setContext("")}
                  >
                    {m.contextClear}
                  </button>
                </div>
              </div>
            )}
            <div className="editor">
              <div className="pane">
                <div className="panelhead">
                  {m.original}{" "}
                  <button
                    aria-label={m.clearOriginal}
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
                  onKeyDown={(e) => {
                    if (
                      e.key !== "Enter" ||
                      e.shiftKey ||
                      e.metaKey ||
                      e.ctrlKey ||
                      e.altKey ||
                      e.nativeEvent.isComposing ||
                      e.nativeEvent.keyCode === 229 ||
                      !text.trim() ||
                      !current
                    )
                      return;
                    e.preventDefault();
                    e.stopPropagation();
                    void translate();
                  }}
                  placeholder={m.originalPlaceholder}
                  aria-label={m.original}
                />
                <div className="panelfoot">
                  <span>
                    {m.charCount(text.length.toLocaleString(lang), "50,000")}
                  </span>
                  <span>{m.markdownSupported}</span>
                </div>
              </div>
              <div className="pane output">
                <div className="panelhead">
                  {m.translation} <span>{languageLabel(lang, target)}</span>
                </div>
                {busy ? (
                  <div className="empty">
                    <div className="loading" />
                    <h3>{m.translating}</h3>
                    <p>
                      {m.translatingWith.replace("{name}", current?.name || "")}
                    </p>
                  </div>
                ) : result ? (
                  <textarea readOnly value={result} aria-label={m.translation} />
                ) : (
                  <div className="empty">
                    <div className="emptyicon">
                      <Languages size={32} strokeWidth={1.3} />
                    </div>
                    <h3>{m.emptyTitle}</h3>
                    <p>{m.emptyHint}</p>
                  </div>
                )}
                <div className="panelfoot">
                  <span>
                    {result
                      ? m.resultCharCount(result.length.toLocaleString(lang))
                      : m.waiting}
                  </span>
                  <div>
                    <button
                      aria-label={m.copyTranslation}
                      disabled={!result || busy}
                      onClick={() =>
                        run(async () => {
                          await navigator.clipboard.writeText(result);
                          setToast("copied");
                        })
                      }
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      aria-label={m.exportTranslation}
                      disabled={!result || busy}
                      onClick={() =>
                        run(async () => {
                          if (await window.desktop.exportText(result))
                            setToast("exported");
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
                  aria-label={m.translationService}
                  disabled={busy}
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                >
                  {!state.providers.length && (
                    <option value="">{m.noServiceConfigured}</option>
                  )}
                  {state.providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.model}
                    </option>
                  ))}
                </select>
                <small>
                  {glossary
                    ? m.glossaryApplied
                    : hasContext
                      ? m.contextActive
                      : m.privacyNotice}
                </small>
              </div>
              {busy ? (
                <button
                  className="primary"
                  onClick={() => run(() => window.desktop.cancel())}
                >
                  <Square size={15} />
                  {m.stopTranslation}
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={!text.trim()}
                  onClick={() => void translate()}
                >
                  {m.startTranslation} <ArrowRight size={17} />
                </button>
              )}
            </div>
            <div className="workspacefoot">
              <span>
                <ShieldCheck size={14} />
                {m.keyStored}
              </span>
              <span>{m.shortcutHint}</span>
            </div>
          </section>
        ) : tab === "glossary" ? (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">{m.glossaryEyebrow}</span>
                <h1>{m.glossaryTitle}</h1>
                <p>{m.glossaryDesc}</p>
              </div>
            </div>
            <textarea
              className="glossary"
              value={glossary}
              maxLength={10000}
              onChange={(e) => setGlossary(e.target.value)}
              placeholder={m.glossaryPlaceholder}
              aria-label={m.glossaryTab}
            />
            <p className="hint">{m.glossaryHint}</p>
          </section>
        ) : (
          <section className="workspace">
            <div className="heading">
              <div>
                <span className="eyebrow">{m.historyEyebrow}</span>
                <h1>{m.historyTitle}</h1>
                <p>{m.historyDesc}</p>
              </div>
              <button className="subtle" onClick={() => setHistory([])}>
                {m.clearHistory}
              </button>
            </div>
            {!history.length ? (
              <div className="empty">
                <History size={32} />
                <p>{m.emptyHistory}</p>
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
                    {new Date(h.at).toLocaleTimeString(lang, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    → {languageLabel(lang, h.target)}
                  </small>
                  <ArrowRight size={16} />
                </button>
              ))
            )}
          </section>
        )}
        <footer>
          {m.footerTagline}
          <span>{m.footerBadges}</span>
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
                <span className="eyebrow">{m.settingsEyebrow}</span>
                <h2 id="settings-title">{m.settingsHeading}</h2>
              </div>
              <button
                aria-label={m.closeSettings}
                disabled={saving}
                onClick={() => setSettings(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="modalbody">
              <p className="hint">{m.settingsHint}</p>
              {error && (
                <div className="error" role="alert">
                  {localizeError(lang, error)}
                </div>
              )}
              {!!state.providers.length && (
                <section className="modal-section">
                  <div className="sectionhead">
                    <h3>{m.savedServices}</h3>
                    <span className="sectioncount">
                      {state.providers.length}
                    </span>
                  </div>
                  <div className="savedservices">
                    {state.providers.map((p) => (
                      <div className="savedrow" key={p.id}>
                        <button
                          className="savedmain"
                          disabled={saving}
                          onClick={() => editProvider(p)}
                        >
                          <span className={p.hasKey ? "dot" : "dot muted"} />
                          <span className="savedmeta">
                            <b>{p.name}</b>
                            <small>{p.model}</small>
                          </span>
                        </button>
                        <button
                          className="iconbtn"
                          aria-label={`${m.editService} ${p.name}`}
                          disabled={saving}
                          onClick={() => editProvider(p)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="iconbtn danger"
                          aria-label={m.deleteService.replace("{name}", p.name)}
                          disabled={saving || busy}
                          onClick={() =>
                            run(async () => {
                              const s = await window.desktop.deleteProvider(
                                p.id,
                              );
                              setState(s);
                              if (providerId === p.id)
                                setProviderId(s.providers[0]?.id || "");
                              if (draft.id === p.id) setDraft(emptyDraft(lang));
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section className="modal-section">
                <div className="sectionhead">
                  <h3>{draft.id ? m.editService : m.newService}</h3>
                  <div className="sectiontools">
                    {draft.id && (
                      <button
                        className="linkbtn"
                        disabled={saving}
                        onClick={newProvider}
                      >
                        {m.newService}
                      </button>
                    )}
                    <label className="presetinline">
                      <span>{m.usePreset}</span>
                      <select
                        value=""
                        disabled={saving}
                        onChange={(e) => applyPreset(e.target.value)}
                      >
                        <option value="">{m.choosePreset}</option>
                        {PRESETS.map((p) => (
                          <option key={p.key} value={p.key}>
                            {presetName(p, lang)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="form">
                  <label>
                    {m.serviceName}
                    <input
                      value={draft.name}
                      placeholder={m.serviceNamePlaceholder}
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {m.protocol}
                    <select
                      value={draft.protocol}
                      onChange={(e) =>
                        setDraft({ ...draft, protocol: e.target.value })
                      }
                    >
                      <option value="openai">{m.openaiCompatible}</option>
                      <option value="anthropic">{m.anthropicMessages}</option>
                      <option value="gemini">{m.geminiGenerate}</option>
                    </select>
                  </label>
                  <label className="full">
                    {m.apiUrl}
                    <input
                      value={draft.baseUrl}
                      placeholder="https://api.example.com/v1"
                      onChange={(e) =>
                        setDraft({ ...draft, baseUrl: e.target.value })
                      }
                    />
                    <small>{m.apiUrlHint}</small>
                  </label>
                  <label className="full">
                    {m.apiKey}
                    <div className="keyfield">
                      <input
                        type={showKey ? "text" : "password"}
                        autoComplete="off"
                        value={draft.apiKey}
                        placeholder={
                          draft.hasKey ? m.apiKeySaved : m.apiKeyPlaceholder
                        }
                        onChange={(e) =>
                          setDraft({ ...draft, apiKey: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="keytoggle"
                        aria-label={showKey ? m.hideKey : m.showKey}
                        onClick={() => setShowKey((v) => !v)}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                  <label className="full">
                    {m.modelName}
                    <input
                      value={draft.model}
                      placeholder={m.modelPlaceholder}
                      onChange={(e) =>
                        setDraft({ ...draft, model: e.target.value })
                      }
                    />
                    <small>{m.modelHint}</small>
                  </label>
                </div>
              </section>
            </div>
            {test && (
              <div
                className={"testresult " + (test.ok ? "ok" : "bad")}
                role="status"
              >
                {test.ok ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertCircle size={15} />
                )}
                <span>
                  {test.ok
                    ? m.testSuccess(String(test.ms))
                    : localizeError(lang, test.message)}
                </span>
              </div>
            )}
            <div className="modalfoot">
              <div className="testfoot">
                <button
                  className="subtle"
                  title={m.testHint}
                  disabled={saving || busy || testing}
                  onClick={() => void testConnection()}
                >
                  <Zap size={15} />
                  {testing ? m.testing : m.testConnection}
                </button>
              </div>
              <div className="modalfoot-actions">
                <button
                  className="subtle"
                  disabled={saving}
                  onClick={() => setSettings(false)}
                >
                  {m.cancel}
                </button>
                <button
                  className="primary"
                  disabled={saving || busy || testing}
                  onClick={() => void save()}
                >
                  {saving
                    ? m.saving
                    : draft.id
                      ? m.saveChanges
                      : m.addServiceAction}
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
      {about && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbout(false);
          }}
        >
          <section
            className="modal about"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
          >
            <div className="modalhead">
              <div>
                <span className="eyebrow">LINGUADOCK</span>
                <h2 id="about-title">{m.about}</h2>
              </div>
              <button
                aria-label={m.close}
                onClick={() => setAbout(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="modalbody">
              <p className="hint">{m.aboutDesc}</p>
              <div className="aboutmeta">
                <span>LinguaDock</span>
                <b>{state.version ? `v${state.version}` : ""}</b>
              </div>
              <div className="updatebox">
                <div className="updateinfo">
                  <RefreshCw size={17} />
                  <div>
                    <b>{m.updates}</b>
                    <small>
                      {m.currentVersion} v{state.version || "0.2.2"}
                    </small>
                  </div>
                </div>
                <div className="updateactions">
                  <span
                    className={
                      "updatestate " +
                      (update.state === "error" ? "is-error" : update.state)
                    }
                  >
                    {updateText()}
                  </span>
                  {update.state === "downloaded" ? (
                    <button
                      className="primary"
                      onClick={() => run(() => window.desktop.installUpdate())}
                    >
                      {m.restartAndInstall}
                    </button>
                  ) : update.state === "unsupported" ||
                    update.state === "error" ? (
                    <button
                      className="subtle"
                      onClick={() => run(() => window.desktop.openReleases())}
                    >
                      {m.manualDownload}
                    </button>
                  ) : (
                    <button
                      className="subtle"
                      disabled={
                        update.state === "checking" ||
                        update.state === "downloading"
                      }
                      onClick={() => run(() => window.desktop.checkUpdate())}
                    >
                      {m.checkUpdate}
                    </button>
                  )}
                </div>
              </div>
              <button
                className="subtle releaselink"
                onClick={() => run(() => window.desktop.openReleases())}
              >
                {m.viewReleases}
              </button>
            </div>
            <div className="modalfoot">
              <span>
                <ShieldCheck size={15} />
                {m.noUpload}
              </span>
              <button className="subtle" onClick={() => setAbout(false)}>
                {m.close}
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toastText}
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
