"use client";

import api from "@/lib/api";
import { getAuthToken } from "@/lib/auth.client";
import { useTtsRate } from "@/lib/ttsRate";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* =====================================================
   DASHBOARD CAMABA – ACCESSIBILITY & SCREEN READER FIRST
===================================================== */

export default function CamabaDashboardPage() {
  const router = useRouter();

  /* ==========================
     DATA STATE
  ========================== */
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ==========================
     ACCESSIBILITY STATE
  ========================== */
  const [useTTS, setUseTTS] = useState(true);
  const [useKeyboardNav, setUseKeyboardNav] = useState(true);
  const [showAccessPopup, setShowAccessPopup] = useState(false);

  /* ==========================
     TTS SPEED CONTROL
  ========================== */
  const [speechRate, setSpeechRate] = useTtsRate(1.1);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const googleIndonesianVoice = voices.find((voice) => /google/i.test(voice.name) && /^id/i.test(voice.lang));
    if (googleIndonesianVoice) return googleIndonesianVoice;

    const indonesianVoice = voices.find((voice) => /^id/i.test(voice.lang) || /indones/i.test(voice.lang));
    if (indonesianVoice) return indonesianVoice;

    return voices[0] || null;
  }, []);

  const createUtterance = useCallback(
    (text: string, rate: number) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      const preferredVoice = preferredVoiceRef.current ?? getPreferredVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        utterance.lang = "id-ID";
      }

      return utterance;
    },
    [getPreferredVoice],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      preferredVoiceRef.current = getPreferredVoice();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [getPreferredVoice]);

  /* ==========================
     NAVIGATION STATE
  ========================== */
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [accessIndex, setAccessIndex] = useState(0);
  const [lastArrowLeftTime, setLastArrowLeftTime] = useState(0);

  /* ==========================
     ACCESS OPTIONS
  ========================== */
  const accessOptions = [
    {
      id: "tts",
      label: "Gunakan Bantuan Suara",
      description: "Semua informasi akan dibacakan.",
    },
    {
      id: "no-tts",
      label: "Tanpa Bantuan Suara",
      description: "Anda menggunakan tampilan layar seperti biasa.",
    },
  ];

  /* =====================================================
     🔊 SPEECH QUEUE ENGINE
  ===================================================== */
  const speakQueue = (texts: string[], overrideRate?: number) => {
    if (!useTTS) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const rate = overrideRate ?? speechRate;

    texts.forEach((text) => {
      const u = createUtterance(text, rate);
      window.speechSynthesis.speak(u);
    });
  };

  /* =====================================================
     🔊 SPEECH QUEUE WITH PROMISE
  ===================================================== */
  const speakQueueAndWait = (texts: string[]): Promise<void> => {
    return new Promise((resolve) => {
      if (!useTTS || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      if (texts.length === 0) {
        resolve();
        return;
      }

      texts.forEach((text, index) => {
        const u = createUtterance(text, speechRate);

        if (index === texts.length - 1) {
          u.onend = () => resolve();
          u.onerror = () => resolve();
        }

        window.speechSynthesis.speak(u);
      });
    });
  };

  /* =====================================================
     CHANGE SPEECH SPEED
  ===================================================== */
  const changeSpeed = (delta: number) => {
    setSpeechRate((prev) => {
      const next = Math.min(2, Math.max(0.5, prev + delta));

      // Gunakan rate baru langsung untuk feedback suara
      speakQueue(["Kecepatan suara diubah.", `Kecepatan sekarang ${next.toFixed(1)}`], next);

      return next;
    });
  };

  /* ==========================
     AUTH + FETCH TEST
  ========================== */
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((r) => {
        setTests(r.data);
      })
      .catch((err) => {
        console.error("Gagal mengambil data tes:", err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  /* =====================================================
     INTRO + POPUP
  ===================================================== */
  useEffect(() => {
    if (loading) return;

    const savedMode = localStorage.getItem("accessMode");
    if (savedMode === "no-tts") {
      setUseTTS(false);
      setUseKeyboardNav(false);
      setAccessIndex(1);
    } else {
      setUseTTS(true);
      setUseKeyboardNav(true);
      setAccessIndex(0);
    }

    const popupShown = sessionStorage.getItem("popupShown");
    if (popupShown === "true") return;

    sessionStorage.setItem("popupShown", "true");

    setUseTTS(true);
    setUseKeyboardNav(true);
    setShowAccessPopup(true);

    const timeout = setTimeout(() => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      speakQueue(["Selamat datang di halaman tes.", "Silakan pilih cara penggunaan.", "Gunakan panah atas atau bawah.", "Tekan enter untuk memilih.", `Pilihan satu. ${accessOptions[0].label}.`, `Pilihan dua. ${accessOptions[1].label}.`]);
    }, 500);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (loading || showAccessPopup) return;

    const shouldAnnounceMainPage = sessionStorage.getItem("announceMainPage") === "true";
    if (!shouldAnnounceMainPage) return;

    sessionStorage.removeItem("announceMainPage");

    if (!useTTS) return;

    const timeout = setTimeout(() => {
      speakQueue(["Anda berada di halaman utama."]);
    }, 300);

    return () => clearTimeout(timeout);
  }, [loading, showAccessPopup, useTTS]);

  /* =====================================================
     POPUP KEYBOARD NAVIGATION
  ===================================================== */
  useEffect(() => {
    if (!showAccessPopup) return;

    const handler = async (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        e.preventDefault();

        setAccessIndex((prev) => {
          const next = e.code === "ArrowDown" ? (prev + 1) % accessOptions.length : (prev - 1 + accessOptions.length) % accessOptions.length;

          speakQueue([`Opsi ${next + 1}.`, accessOptions[next].label, accessOptions[next].description]);

          return next;
        });
      }

      if (e.code === "Enter") {
        e.preventDefault();

        const selected = accessOptions[accessIndex];

        if (selected.id === "tts") {
          setUseTTS(true);
          setUseKeyboardNav(true);
          localStorage.setItem("accessMode", "tts");

          speakQueue([
            "Bantuan suara aktif.",
            `Ada ${tests.length} tes tersedia.`,
            "Gunakan panah kanan atau kiri untuk memilih.",
            "Tekan enter untuk membuka.",
            "Tekan panah kiri dua kali untuk mendengar ulang instruksi.",
            "Tekan escape untuk keluar akun.",
            "Gunakan Shift dan panah atas atau bawah untuk mengatur kecepatan suara.",
          ]);
        } else {
          window.speechSynthesis.cancel();
          setUseTTS(false);
          setUseKeyboardNav(false);
          localStorage.setItem("accessMode", "no-tts");
        }

        setShowAccessPopup(false);
      }

      if (e.code === "Escape") {
        e.preventDefault();

        await speakQueueAndWait(["Anda akan logout."]);

        window.speechSynthesis.cancel();
        localStorage.removeItem("token");
        sessionStorage.removeItem("popupShown");

        window.location.href = "/login";
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showAccessPopup, accessIndex, tests]);

  /* =====================================================
     DASHBOARD KEYBOARD NAV
  ===================================================== */
  useEffect(() => {
    if (!useTTS || !useKeyboardNav || showAccessPopup || !tests.length) return;

    const handler = async (e: KeyboardEvent) => {
      /* SPEED CONTROL */
      if (e.shiftKey && e.code === "ArrowUp") {
        e.preventDefault();
        changeSpeed(0.1);
        return;
      }

      if (e.shiftKey && e.code === "ArrowDown") {
        e.preventDefault();
        changeSpeed(-0.1);
        return;
      }

      /* DOUBLE LEFT FOR INSTRUCTION */
      if (e.code === "ArrowLeft") {
        const now = Date.now();

        if (now - lastArrowLeftTime < 500) {
          e.preventDefault();

          speakQueue([
            "Instruksi.",
            // `Anda berada di tes ${selectedIndex + 1} dari ${tests.length}.`,
            "Gunakan panah kanan atau kiri untuk memilih.",
            "Tekan enter untuk membuka.",
            "Tekan panah kiri dua kali untuk mengulang instruksi.",
            "Tekan escape untuk keluar akun.",
            "Gunakan shift panah atas atau bawah untuk mengatur kecepatan suara.",
          ]);

          setLastArrowLeftTime(0);
          return;
        }

        setLastArrowLeftTime(now);
      }

      if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
        e.preventDefault();

        setSelectedIndex((prev) => {
          const next = e.code === "ArrowRight" ? (prev + 1) % tests.length : (prev - 1 + tests.length) % tests.length;

          const t = tests[next];

          speakQueue([`Tes ${next + 1}.`, t.title, t.completed ? "Sudah dikerjakan. Tekan spasi untuk melihat hasil." : "Belum dikerjakan. Tekan spasi untuk mulai."]);

          return next;
        });
      }

      if (e.code === "Enter") {
        e.preventDefault();

        const t = tests[selectedIndex];

        if (t.completed) {
          await speakQueueAndWait([`Membuka hasil ${t.title}.`]);

          router.push(`/test/${t.id}/result?attemptId=${t.latestAttemptId}`);
        } else {
          await speakQueueAndWait([`Memulai ${t.title}.`]);

          router.push(`/test/${t.id}`);
        }
      }

      if (e.code === "Escape") {
        e.preventDefault();

        await speakQueueAndWait(["Anda keluar dari akun."]);

        window.speechSynthesis.cancel();

        localStorage.removeItem("token");
        sessionStorage.removeItem("popupShown");

        window.location.href = "/login";
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [useTTS, useKeyboardNav, tests, selectedIndex, showAccessPopup, lastArrowLeftTime]);

  /* ==========================
     UI
  ========================== */
  if (loading) return <p className="px-4 pt-24 text-black text-lg sm:px-6 sm:pt-28 sm:text-xl">Memuat...</p>;

  return (
    <div className="min-h-[100dvh] max-w-5xl mx-auto px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:pt-32">
      {showAccessPopup && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Pengaturan Aksesibilitas</h2>

            <ul className="space-y-4">
              {accessOptions.map((opt, idx) => (
                <li key={opt.id} className={`p-4 border rounded-lg ${idx === accessIndex ? "outline outline-2 outline-green-600" : ""}`}>
                  <p className="font-semibold text-xl">{opt.label}</p>
                  <p className="text-lg text-green-700">{opt.description}</p>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-lg text-green-600">Gunakan ↑ ↓ lalu Enter</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Halaman Tes Calon Mahasiswa</h1>
      </div>

      {!useTTS && <p className="mb-4 text-base text-black sm:text-lg lg:text-xl">Klik tombol pada kartu tes untuk memulai atau melihat hasil.</p>}

      {/* LIST TES */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {tests.map((t, idx) => (
          <div key={t.id} className={`rounded-xl border bg-white p-4 shadow sm:p-6 ${useTTS && idx === selectedIndex ? "outline outline-3 outline-green-600" : ""}`}>
            <h2 className="text-xl font-semibold sm:text-2xl">{t.title}</h2>

            <p className="mt-2 text-base text-green-700 sm:text-lg">{t.description}</p>

            <span className={`mt-3 inline-block rounded-full px-3 py-2 text-sm sm:px-4 sm:text-base lg:text-lg ${t.completed ? "bg-green-100 text-green-700" : "bg-green-50 text-green-800"}`}>
              {t.completed ? "Sudah mengerjakan" : "Belum mengerjakan"}
            </span>

            {!useTTS && (
              <button onClick={() => router.push(t.completed ? `/test/${t.id}/result?attemptId=${t.latestAttemptId}` : `/test/${t.id}`)} className="mt-4 w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white sm:text-lg">
                {t.completed ? "Lihat Hasil" : "Mulai Mengerjakan"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FLOATING SPEED CONTROL */}
      {useTTS && !showAccessPopup && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-xl p-4 flex flex-col gap-3 items-center">
          <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

          <div className="flex items-center gap-3">
            <button onClick={() => changeSpeed(-0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold">
              −
            </button>

            <span className="text-lg font-semibold w-12 text-center">{speechRate.toFixed(1)}</span>

            <button onClick={() => changeSpeed(0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}