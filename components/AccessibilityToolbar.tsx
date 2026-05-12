"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

type A11yState = {
  contrast: "default" | "high";
  fontScale: 1 | 1.25 | 1.5 | 2;
  motion: "normal" | "reduce";
  links: "default" | "underline";
  dyslexia: boolean;
  colorblind: "none" | "rg" | "by" | "mono";
  ttsEnabled?: boolean;
  ttsRate?: number;
  ttsPitch?: number;
  ttsVoiceName?: string;
  keyboardNavEnabled?: boolean;
};

const STORAGE_KEY = "a11y-settings";
const NEEDS_RESET = "a11y-needs-reset";

function getDefaultState(): A11yState {
  const prefersReduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    contrast: "default",
    fontScale: 1,
    motion: prefersReduce ? "reduce" : "normal",
    links: "default",
    dyslexia: false,
    colorblind: "none",
    ttsEnabled: true,
    ttsRate: 1,
    ttsPitch: 1,
    ttsVoiceName: "",
    keyboardNavEnabled: true,
  };
}

function loadState(): A11yState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultState();
}

function applyState(s: A11yState, isTtsDisabled = false) {
  const html = document.documentElement;
  html.setAttribute("data-a11y-contrast", s.contrast);
  html.setAttribute("data-a11y-fontscale", String(s.fontScale));
  html.setAttribute("data-a11y-motion", s.motion);
  html.setAttribute("data-a11y-links", s.links);
  html.setAttribute("data-a11y-dyslexia", s.dyslexia ? "on" : "off");
  html.setAttribute("data-a11y-colorblind", s.colorblind);
  html.setAttribute("data-a11y-tts", s.ttsEnabled && !isTtsDisabled ? "on" : "off");
  html.setAttribute("data-a11y-keyboard-nav", s.keyboardNavEnabled ? "on" : "off");

  if (typeof document !== "undefined") {
    const zoomValue = `${s.fontScale * 100}%`;
    document.body.style.zoom = s.fontScale === 1 ? "" : zoomValue;
  }
}

function clearAppliedState() {
  const html = document.documentElement;
  html.removeAttribute("data-a11y-contrast");
  html.removeAttribute("data-a11y-fontscale");
  html.removeAttribute("data-a11y-motion");
  html.removeAttribute("data-a11y-links");
  html.removeAttribute("data-a11y-dyslexia");
  html.removeAttribute("data-a11y-colorblind");
  html.removeAttribute("data-a11y-tts");
  html.removeAttribute("data-a11y-keyboard-nav");
  document.body.style.zoom = "";
}

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(loadState());
  const panelId = useId();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const toolbarRole = "a11y-toolbar";
  const [lastShiftPress, setLastShiftPress] = useState(0);
  const a11yShortcutHelpText =
    "Shortcut aksesibilitas low vision: Alt Shift C untuk mengaktifkan atau menonaktifkan kontras tinggi. Tekan Shift Z untuk berpindah ke level zoom berikutnya antara 100 sampai 200 persen. Control Z untuk mereset semua filter dan fitur aksesibilitas. Tekan Shift dua kali untuk mendengar ulang shortcut ini.";
  // const isExcludedRoute = pathname === "/login" || pathname === "/dashboard/camaba" || pathname?.startsWith("/admin") || /^\/test\/[^/]+(?:\/result)?$/.test(pathname ?? "");
  const isExcludedRoute = pathname === "/login" || pathname === "/dashboard/camaba" || /^\/test\/[^/]+(?:\/result)?$/.test(pathname ?? "") || isAdminRoute;

  useEffect(() => {
    if (isExcludedRoute) {
      clearAppliedState();
      return;
    }
    applyState(state, isAdminRoute);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [isExcludedRoute, state]);

  useEffect(() => {
    if (isExcludedRoute) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.key === "Shift" && !e.repeat) {
        const now = Date.now();
        if (now - lastShiftPress < 500) {
          e.preventDefault();
          if (!isAdminRoute) {
            window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: a11yShortcutHelpText } }));
          }
          // window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: a11yShortcutHelpText } }));
          setLastShiftPress(0);
          return;
        }
        setLastShiftPress(now);
        return;
      }

      if (e.key === "F5" && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        const target = e.target as HTMLElement | null;
        const targetTag = target?.tagName;
        if (targetTag !== "INPUT" && targetTag !== "TEXTAREA" && !target?.isContentEditable) {
          e.preventDefault();
          // window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: "Tekan Shift dua kali untuk mendengar panduan shortcut aksesibilitas" } }));
          if (!isAdminRoute) {
            window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: "Tekan Shift dua kali untuk mendengar panduan shortcut aksesibilitas" } }));
          }
          return;
        }
      }

      if (e.shiftKey && key === "z" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement | null;
        const targetTag = target?.tagName;
        if (targetTag !== "INPUT" && targetTag !== "TEXTAREA" && !target?.isContentEditable) {
          e.preventDefault();
          setState((s) => {
            const levels: A11yState["fontScale"][] = [1, 1.25, 1.5, 2];
            const currentIndex = levels.indexOf(s.fontScale);
            const nextIndex = (currentIndex + 1) % levels.length;
            const nextZoom = levels[nextIndex];
            if (s.ttsEnabled && !isAdminRoute) {
              window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: `Zoom diatur ke ${nextZoom * 100} persen` } }));
            }
            return { ...s, fontScale: nextZoom };
          });
          return;
        }
      }

      if (e.altKey && e.shiftKey) {
        if (key === "a") {
          e.preventDefault();
          setOpen((o) => !o);
          if (state.ttsEnabled && !isAdminRoute) {
            window.dispatchEvent(new CustomEvent("tts-say", { detail: { text: "Panel aksesibilitas dibuka atau ditutup." } }));
          }
          return;
        }

        if (key === "c") {
          e.preventDefault();
          setState((s) => {
            const nextContrast = s.contrast === "high" ? "default" : "high";
            if (s.ttsEnabled && !isAdminRoute) {
              window.dispatchEvent(
                new CustomEvent("tts-say", {
                  detail: { text: nextContrast === "high" ? "Kontras tinggi aktif" : "Kontras tinggi nonaktif" },
                }),
              );
            }
            return { ...s, contrast: nextContrast };
          });
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isExcludedRoute, isAdminRoute, state.ttsEnabled, state.ttsRate, state.ttsPitch, state.ttsVoiceName, voices, lastShiftPress, a11yShortcutHelpText]);

  useEffect(() => {
    if (isExcludedRoute) {
      return;
    }
    const onReset = () => {
      setState(getDefaultState());
    };
    window.addEventListener("a11y-reset", onReset as EventListener);
    return () => {
      window.removeEventListener("a11y-reset", onReset as EventListener);
    };
  }, [isExcludedRoute]);

  useEffect(() => {
    if (isExcludedRoute) {
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!state.ttsVoiceName && v.length > 0) {
        const idVoice = v.find((voice) => /id|indones/i.test(voice.lang));
        const defaultVoice = idVoice || v[0];
        setState((s) => ({ ...s, ttsVoiceName: defaultVoice.name }));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isExcludedRoute, state.ttsVoiceName]);

  useEffect(() => {
    if (isExcludedRoute) {
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const onClick = (e: MouseEvent) => {
      if (!state.ttsEnabled || isAdminRoute) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const toolbarEl = document.querySelector(`.${toolbarRole}`) as HTMLElement | null;
      if (toolbarEl && (target === toolbarEl || toolbarEl.contains(target))) return;

      const text = extractReadableText(target);
      if (text) speak(text);
    };
    const onTtsSay = (evt: Event) => {
      if (!state.ttsEnabled || isAdminRoute) return;
      const ce = evt as CustomEvent<{ text?: string }>;
      const txt = (ce.detail?.text || "").trim();
      if (txt) speak(txt);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("tts-say", onTtsSay as EventListener);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("tts-say", onTtsSay as EventListener);
    };
  }, [isExcludedRoute, isAdminRoute,state.ttsEnabled, state.ttsRate, state.ttsPitch, state.ttsVoiceName, voices]);

  // Listen for external TTS control events from other pages/components
  useEffect(() => {
    if (isExcludedRoute) {
      return;
    }
    const handler = (evt: Event) => {
      try {
        const ce = evt as CustomEvent<{ action?: string }>;
        const action = ce?.detail?.action;
        if (!action) return;
        if (action === 'pause') {
          pauseSpeaking();
        } else if (action === 'resume') {
          resumeSpeaking();
        } else if (action === 'stop' || action === 'disable') {
          stopSpeaking();
        }
      } catch {}
    };
    window.addEventListener('a11y-tts-control', handler as EventListener);
    return () => window.removeEventListener('a11y-tts-control', handler as EventListener);
  }, [isExcludedRoute, speaking, paused]);

  // Don't render UI for excluded routes, but all hooks must still run
  if (isExcludedRoute) {
    // return null;
    return <></>;
  }

  function extractReadableText(el: HTMLElement): string {
    let cur: HTMLElement | null = el;
    for (let i = 0; i < 6 && cur; i += 1) {
      const ignore = cur.getAttribute("data-tts-ignore") || "";
      if (ignore === "true") return "";
      const tts = cur.getAttribute("data-tts-text") || "";
      if (tts.trim().length > 0) return tts.trim();
      cur = cur.parentElement as HTMLElement | null;
    }
    const interactiveTags = new Set(["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "OPTION", "SUMMARY", "LABEL"]);
    const interactiveRoles = new Set(["button", "link", "menuitem", "checkbox", "radio", "switch", "tab"]);
    const isInteractive = (node: HTMLElement | null): boolean => {
      if (!node) return false;
      if (interactiveTags.has(node.tagName)) return true;
      const role = (node.getAttribute("role") || "").toLowerCase();
      if (interactiveRoles.has(role)) return true;
      const tabindex = node.getAttribute("tabindex");
      if (tabindex !== null && !Number.isNaN(Number(tabindex))) return true;
      if (node.isContentEditable) return true;
      return false;
    };
    if (el.tagName === "SELECT") {
      const sel = el as HTMLSelectElement;
      const opt = sel.selectedOptions && sel.selectedOptions.length > 0 ? sel.selectedOptions[0] : sel.options[sel.selectedIndex];
      const txt = (opt?.text || "").trim();
      if (txt.length > 0) return txt.slice(0, 2000);
    }
    if (el.tagName === "OPTION") {
      const txt = (el.textContent || "").trim();
      if (txt.length > 0) return txt.slice(0, 2000);
    }
    const textTags = new Set(["P", "SPAN", "LI", "LABEL", "H1", "H2", "H3", "H4", "H5", "H6"]);
    if (!isInteractive(el) && !textTags.has(el.tagName)) return "";
    const aria = el.getAttribute("aria-label") || "";
    const alt = (el as HTMLImageElement).alt || "";
    const candidate = (aria || alt || el.textContent || "").trim();
    const text = candidate.replace(/\s+/g, " ").trim();
    if (text.length < 2) return "";
    return text.slice(0, 2000);
  }

  function clamp(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    setPaused(false);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const rate = clamp(Number(state.ttsRate ?? 1), 0.5, 2);
    const pitch = clamp(Number(state.ttsPitch ?? 1), 0.5, 2);
    utter.rate = rate;
    utter.pitch = pitch;
    const voice = voices.find((v) => v.name === state.ttsVoiceName);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = "id-ID";
    }
    utter.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utter.onpause = () => {
      setPaused(true);
    };
    utter.onresume = () => {
      setPaused(false);
    };
    utter.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utter.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  function pauseSpeaking() {
    if (!("speechSynthesis" in window)) return;
    if (speaking && !paused && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function resumeSpeaking() {
    if (!("speechSynthesis" in window)) return;
    if (speaking && (paused || window.speechSynthesis.paused)) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }

  // Helper: emit TTS events asynchronously to avoid cross-component setState during render
  function emitTtsChanged(detail: Partial<{ ttsEnabled?: boolean; ttsRate?: number; ttsPitch?: number; ttsVoiceName?: string }>) {
    try {
      setTimeout(() => window.dispatchEvent(new CustomEvent('a11y-tts-changed', { detail })), 0);
    } catch {}
  }
  function emitTtsControl(detail: Partial<{ action?: string }>) {
    try {
      setTimeout(() => window.dispatchEvent(new CustomEvent('a11y-tts-control', { detail })), 0);
    } catch {}
  }

  function hasChangedSettings(): boolean {
    const prefersReduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const defaultMotion = prefersReduce ? "reduce" : "normal";

    return (
      state.contrast !== "default" ||
      state.fontScale !== 1 ||
      state.motion !== defaultMotion ||
      state.links !== "default" ||
      state.dyslexia !== false ||
      state.colorblind !== "none" ||
      (!isAdminRoute && state.ttsEnabled !== false) ||
      (!isAdminRoute && state.ttsRate !== undefined && state.ttsRate !== 1) ||
      (!isAdminRoute && state.ttsPitch !== undefined && state.ttsPitch !== 1) ||
      (!isAdminRoute && state.ttsVoiceName !== undefined && state.ttsVoiceName !== "") ||
      state.keyboardNavEnabled !== false
    );
  }

  function resetSettings() {
    if (speaking) {
      stopSpeaking();
    }

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const defaultState: A11yState = {
      contrast: "default",
      fontScale: 1,
      motion: prefersReduce ? "reduce" : "normal",
      links: "default",
      dyslexia: false,
      colorblind: "none",
      ttsEnabled: false,
      ttsRate: 1,
      ttsPitch: 1,
      ttsVoiceName: "",
      keyboardNavEnabled: false,
    };

    setState(defaultState);
    emitTtsChanged({ ttsEnabled: defaultState.ttsEnabled });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${toolbarRole}`}>
      <style>{`
                    [data-a11y-tts="on"] p:hover,
                    [data-a11y-tts="on"] span:hover,
                    [data-a11y-tts="on"] a:hover,
                    [data-a11y-tts="on"] li:hover,
                    [data-a11y-tts="on"] label:hover,
                    [data-a11y-tts="on"] h1:hover,
                    [data-a11y-tts="on"] h2:hover,
                    [data-a11y-tts="on"] h3:hover,
                    [data-a11y-tts="on"] h4:hover,
                    [data-a11y-tts="on"] h5:hover,
                    [data-a11y-tts="on"] h6:hover,
                    [data-a11y-tts="on"] [data-tts-text]:hover {
                        text-decoration: underline;
                        cursor: pointer;
                    }
                `}</style>
      <button
        type="button"
        className="rounded-md bg-[#0f7a0f] hover:bg-[#0c650c] text-white px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e7f0e] flex items-center gap-2"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Image src="/accessibility-icon.png" alt="" aria-hidden="true" width={30} height={30} priority />
        <span>
          <strong>Aksesibilitas</strong>
        </span>
      </button>
      
      {open && (
        <div id={panelId} role="dialog" aria-label="Pengaturan aksesibilitas" className="mt-2 w-auto max-w-sm max-h-[60vh] overflow-y-auto rounded-md bg-white shadow-lg border p-3 text-sm">
          {!isAdminRoute && (
            <div className="mb-3 border-b pb-3">
              <div className="font-semibold flex items-center justify-between">
                <span>Text to Speech (klik teks untuk dibaca)</span>
                <button
                  type="button"
                  aria-pressed={!!state.ttsEnabled}
                  onClick={() => setState((s) => ({ ...s, ttsEnabled: !(s.ttsEnabled ?? false) }))}
                  className={`px-3 py-1 rounded font-bold transition-colors shadow-md ${state.ttsEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}`}
                >
                  {state.ttsEnabled ? "ON" : "OFF"}
                </button>





              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Kecepatan: {(state.ttsRate ?? 1).toFixed(1)}x</label>
                  <input type="range" min={0.5} max={2} step={0.1} value={state.ttsRate ?? 1} onChange={(e) => setState((s) => ({ ...s, ttsRate: Number(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Pitch: {(state.ttsPitch ?? 1).toFixed(2)}</label>
                  <input type="range" min={0.5} max={2} step={0.1} value={state.ttsPitch ?? 1} onChange={(e) => setState((s) => ({ ...s, ttsPitch: Number(e.target.value) }))} className="w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600">Suara</label>
                  <select className="w-full border rounded px-2 py-1" value={state.ttsVoiceName ?? ""} onChange={(e) => setState((s) => ({ ...s, ttsVoiceName: e.target.value }))}>
                    {voices.length === 0 ? (
                      <option value="">Default</option>
                    ) : (
                      voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {speaking && (
                  <>
                    <button
                      type="button"
                      className={`px-2 py-1 border rounded font-semibold transition-colors ${paused ? "bg-blue-100 hover:bg-blue-200" : "bg-yellow-100 hover:bg-yellow-200"}`}
                      onClick={paused ? resumeSpeaking : pauseSpeaking}
                    >
                      {paused ? "▶ Lanjutkan" : "⏸ Jeda"}
                    </button>
                    <button type="button" className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={stopSpeaking}>
                      ⏹ Hentikan
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

      {/* {open && (
        <div id={panelId} role="dialog" aria-label="Pengaturan aksesibilitas" className="mt-2 w-auto max-w-sm max-h-[60vh] overflow-y-auto rounded-md bg-white shadow-lg border p-3 text-sm">
          <div className="mb-3 border-b pb-3">
            <div className="font-semibold flex items-center justify-between">
              <span>Text to Speech (klik teks untuk dibaca)</span>
              <button
                type="button"
                aria-pressed={!!state.ttsEnabled}
                onClick={() => {
                  const nextEnabled = !(state.ttsEnabled ?? false);
                  if (!nextEnabled) {
                    // force stop any ongoing speech immediately
                    stopSpeaking();
                  }
                  setState((s) => {
                    const next = { ...s, ttsEnabled: nextEnabled };
                    emitTtsChanged({ ttsEnabled: next.ttsEnabled, ttsRate: next.ttsRate, ttsPitch: next.ttsPitch, ttsVoiceName: next.ttsVoiceName });
                    emitTtsControl({ action: nextEnabled ? 'enable' : 'disable' });
                    return next;
                  });
                }}
                className={`px-3 py-1 rounded font-bold transition-colors shadow-md ${state.ttsEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}`}
              >
                {state.ttsEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600">Kecepatan: {(state.ttsRate ?? 1).toFixed(1)}x</label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={state.ttsRate ?? 1}
                  onChange={(e) =>
                    setState((s) => {
                      const next = { ...s, ttsRate: Number(e.target.value) };
                      emitTtsChanged({ ttsEnabled: next.ttsEnabled, ttsRate: next.ttsRate, ttsPitch: next.ttsPitch, ttsVoiceName: next.ttsVoiceName });
                      return next;
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Pitch: {(state.ttsPitch ?? 1).toFixed(2)}</label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={state.ttsPitch ?? 1}
                  onChange={(e) =>
                    setState((s) => {
                      const next = { ...s, ttsPitch: Number(e.target.value) };
                      emitTtsChanged({ ttsEnabled: next.ttsEnabled, ttsRate: next.ttsRate, ttsPitch: next.ttsPitch, ttsVoiceName: next.ttsVoiceName });
                      return next;
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600">Suara</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={state.ttsVoiceName ?? ""}
                  onChange={(e) =>
                    setState((s) => {
                      const next = { ...s, ttsVoiceName: e.target.value };
                      emitTtsChanged({ ttsEnabled: next.ttsEnabled, ttsRate: next.ttsRate, ttsPitch: next.ttsPitch, ttsVoiceName: next.ttsVoiceName });
                      return next;
                    })
                  }
                >
                  {voices.length === 0 ? (
                    <option value="">Default</option>
                  ) : (
                    voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {speaking && (
                <>
                  <button
                    type="button"
                    className={`px-2 py-1 border rounded font-semibold transition-colors ${paused ? "bg-blue-100 hover:bg-blue-200" : "bg-yellow-100 hover:bg-yellow-200"}`}
                    onClick={paused ? resumeSpeaking : pauseSpeaking}
                  >
                    {paused ? "▶ Lanjutkan" : "⏸ Jeda"}
                  </button>
                  <button type="button" className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200" onClick={stopSpeaking}>
                    ⏹ Hentikan
                  </button>
                </>
              )}
            </div>
          </div> */}

          <div className="mb-3 border-b pb-3">
            <div className="font-semibold flex items-center justify-between">
              <span>Navigasi Keyboard</span>
              <button
                type="button"
                aria-pressed={!!state.keyboardNavEnabled}
                onClick={() => setState((s) => ({ ...s, keyboardNavEnabled: !(s.keyboardNavEnabled ?? false) }))}
                className={`px-3 py-1 rounded font-bold transition-colors shadow-md ${state.keyboardNavEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}`}
              >
                {state.keyboardNavEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Aktifkan untuk menggunakan shortcut keyboard pada halaman statistik</p>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Kontras</label>
            <div className="mt-1 flex gap-2">
              <button className={`px-2 py-1 border rounded ${state.contrast === "default" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, contrast: "default" }))}>
                Default
              </button>
              <button className={`px-2 py-1 border rounded ${state.contrast === "high" ? "bg-gray-100" : ""}`} aria-keyshortcuts="Alt+Shift+C" onClick={() => setState((s) => ({ ...s, contrast: "high" }))}>
                Tinggi
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Zoom</label>
            <div className="mt-1 flex gap-2">
              <button className={`px-2 py-1 border rounded ${state.fontScale === 1 ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, fontScale: 1 }))}>
                100%
              </button>
              <button className={`px-2 py-1 border rounded ${state.fontScale === 1.25 ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, fontScale: 1.25 }))}>
                125%
              </button>
              <button className={`px-2 py-1 border rounded ${state.fontScale === 1.5 ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, fontScale: 1.5 }))}>
                150%
              </button>
              <button className={`px-2 py-1 border rounded ${state.fontScale === 2 ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, fontScale: 2 }))}>
                200%
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Shortcut: Shift+Z untuk cycle through 100%, 125%, 150%, 200%</p>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Gerak</label>
            <div className="mt-1 flex gap-2">
              <button className={`px-2 py-1 border rounded ${state.motion === "normal" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, motion: "normal" }))}>
                Normal
              </button>
              <button className={`px-2 py-1 border rounded ${state.motion === "reduce" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, motion: "reduce" }))}>
                Kurangi
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Tautan</label>
            <div className="mt-1 flex gap-2">
              <button className={`px-2 py-1 border rounded ${state.links === "default" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, links: "default" }))}>
                Default
              </button>
              <button className={`px-2 py-1 border rounded ${state.links === "underline" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, links: "underline" }))}>
                Garis bawah
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={state.dyslexia} onChange={(e) => setState((s) => ({ ...s, dyslexia: e.target.checked }))} />
              Font ramah disleksia
            </label>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Mode Buta Warna</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button className={`px-2 py-1 border rounded ${state.colorblind === "none" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, colorblind: "none" }))}>
                Tidak ada
              </button>
              <button className={`px-2 py-1 border rounded ${state.colorblind === "rg" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, colorblind: "rg" }))}>
                Merah-Hijau (Parsial)
              </button>
              <button className={`px-2 py-1 border rounded ${state.colorblind === "by" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, colorblind: "by" }))}>
                Biru-Kuning (Parsial)
              </button>
              <button className={`px-2 py-1 border rounded ${state.colorblind === "mono" ? "bg-gray-100" : ""}`} onClick={() => setState((s) => ({ ...s, colorblind: "mono" }))}>
                Total (Monokromasi)
              </button>
            </div>
          </div>

          {hasChangedSettings() && (
            <div className="mt-4 pt-3 border-t">
              <button
                type="button"
                onClick={resetSettings}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                🔄 Reset ke Default
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
