"use client";
import { API_BASE } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [activeCount, setActiveCount] = useState<number>(0);
  const [graduateCount, setGraduateCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize ttsEnabled from localStorage to respect user's last setting
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("a11y-settings");
      if (raw) {
        const settings = JSON.parse(raw);
        return settings.ttsEnabled !== false;
      }
    } catch {}
    return true; // default to true if not in localStorage
  });
  const introSpokenRef = useRef(false);

  const normalizeStatus = (s?: string) => (s ?? "").trim().toLowerCase();
  // Listen to accessibility toolbar state changes
  useEffect(() => {
    const checkTtsState = () => {
      try {
        const raw = localStorage.getItem("a11y-settings");
        if (raw) {
          const settings = JSON.parse(raw);
          setTtsEnabled(settings.ttsEnabled !== false);
        }
      } catch {}
    };

    checkTtsState();
    window.addEventListener("storage", checkTtsState);
    const onTtsChanged = (evt: Event) => {
      try {
        const ce = evt as CustomEvent<{ ttsEnabled?: boolean }>;
        const enabled = ce?.detail?.ttsEnabled;
        if (typeof enabled === "boolean") {
          // schedule state update asynchronously to avoid updating this component
          // while another component (toolbar) is rendering
          setTimeout(() => {
            try {
              setTtsEnabled(enabled);
              if (!enabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            } catch {}
          }, 0);
        } else {
          checkTtsState();
        }
      } catch {}
    };
    window.addEventListener("a11y-tts-changed", onTtsChanged as EventListener);
    return () => {
      window.removeEventListener("storage", checkTtsState);
      window.removeEventListener("a11y-tts-changed", onTtsChanged as EventListener);
    };
  }, []);


  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/statistik-mahasiswa`);
        const json = await res.json();
        const data: any[] = Array.isArray(json?.data) ? json.data : [];
        const aktif = data.filter((d) => normalizeStatus(d.status) === "aktif").length;
        const lulus = data.filter((d) => normalizeStatus(d.status) === "lulus").length;
        setActiveCount(aktif);
        setGraduateCount(lulus);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (introSpokenRef.current) return;

    const synth = window.speechSynthesis;
    const text = "Selamat datang di Web Unit Layanan Disabilitas, tekan F jika ingin melihat statistik dan tekan J untuk ke halaman login";

    // Only speak if TTS is enabled
    const speakIntro = () => {
      if (!ttsEnabled) return; // Guard: don't speak if TTS is disabled
      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.rate = Number(localStorage.getItem("tts:rate") || 1);
        synth.speak(utterance);
        introSpokenRef.current = true;
      } catch {}
    };

    if (ttsEnabled && !introSpokenRef.current) {
      speakIntro();
    }

    // If TTS toggled off elsewhere, stop speaking immediately
    const onExternalTtsToggle = (evt: Event) => {
      try {
        const ce = evt as CustomEvent<{ ttsEnabled?: boolean; ttsRate?: number; ttsPitch?: number; ttsVoiceName?: string }>;
        const detail = ce?.detail || {};

        // If TTS disabled -> stop immediately
        if (detail.ttsEnabled === false) {
          synth.cancel();
          return;
        }

        // If TTS enabled and intro not yet spoken -> speak
        if (detail.ttsEnabled === true && !introSpokenRef.current) {
          speakIntro();
          return;
        }

        // If rate/pitch/voice changed while speaking -> restart with new settings
        const rate = detail.ttsRate ?? Number(localStorage.getItem("tts:rate") || 1);
        const pitch = detail.ttsPitch ?? Number(localStorage.getItem("tts:pitch") || 1);
        const voiceName = detail.ttsVoiceName ?? (localStorage.getItem("tts:voice") || "");

        if (synth.speaking) {
          try {
            synth.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "id-ID";
            utter.rate = rate;
            utter.pitch = pitch;
            if (voiceName) {
              const v = synth.getVoices().find((x) => x.name === voiceName || x.voiceURI === voiceName);
              if (v) utter.voice = v;
            }
            synth.speak(utter);
            introSpokenRef.current = true;
          } catch {}
        }
      } catch {}
    };
    window.addEventListener("a11y-tts-changed", onExternalTtsToggle as EventListener);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget = target?.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";

      if (isTypingTarget) return;

      // Check if keyboard navigation is enabled before handling custom shortcuts
      let keyboardNavEnabled = true;
      try {
        const raw = localStorage.getItem("a11y-settings");
        if (raw) {
          const settings = JSON.parse(raw);
          keyboardNavEnabled = settings.keyboardNavEnabled !== false;
        }
      } catch {}

      if (!keyboardNavEnabled) return; // Skip custom shortcuts if navigation is disabled

      const key = event.key.toLowerCase();

      if (key === "f") {
        event.preventDefault();
        synth.cancel();
        router.push("/statistik-mahasiswa");
      }

      if (key === "j") {
        event.preventDefault();
        synth.cancel();
        router.push("/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("a11y-tts-changed", onExternalTtsToggle as EventListener);
      // reset intro flag so revisiting the page will play again
      introSpokenRef.current = false;
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      } catch {}
    };
  }, [router, ttsEnabled]);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#43c458] via-[#049f04] to-[#2d8a3a] px-6 md:px-12 pt-24 md:pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-lime-400/8 to-green-400/8 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex justify-center w-full md:w-1/2 mt-6 md:mt-0 order-1 md:order-2">
        <Image src="/heroCharA.png" alt="Character" width={420} height={420} className="object-contain drop-shadow-xl hover:scale-[1.03] transition-transform duration-500" />
      </div>

      <div className="relative z-20 flex flex-col max-w-lg text-white mt-6 md:mt-0 order-2 md:order-1">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-bebas-neue bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent drop-shadow-lg">Unit Layanan Disabilitas</h1>
        <p className="text-lg md:text-xl mb-8 text-green-50/90 leading-relaxed">Mari bersama membangun lingkungan belajar yang ramah, setara, dan inklusif di UKDW</p>
        <div className="flex gap-4 mb-8">
          <div className="flex-1 rounded-2xl border border-white/40 bg-white/10 p-6 backdrop-blur-md text-center">
            <span className="text-4xl font-bold text-lime-200 block">{loading ? "…" : activeCount}</span>
            <p className="text-sm text-green-100">Active Students</p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/40 bg-white/10 p-6 backdrop-blur-md text-center">
            <span className="text-4xl font-bold text-lime-200 block">{loading ? "…" : graduateCount}</span>
            <p className="text-sm text-green-100">Graduates</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/statistik-mahasiswa" className="group relative rounded-2xl bg-gradient-to-r from-white to-green-50 px-8 py-4 text-base font-bold text-[#008000] shadow-lg hover:scale-105 transition-all w-max">
            View Statistics
          </Link>
        </div>
        {error && <p className="mt-3 text-sm text-red-100">{error}</p>}
      </div>
    </section>
  );
}
