"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSpeedLabel } from "@/components/TTSControl";
import { getStoredTtsRate, useTtsRate } from "@/lib/ttsRate";

export default function TestResultPage() {
  const { id } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const attemptId = params.get("attemptId");

  const [attempt, setAttempt] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [useTTS, setUseTTS] = useState(true);



  const [speechRate, setSpeechRate] = useTtsRate(1);
  const objectiveQuestionTypes = new Set(["MULTIPLE_CHOICE", "CHECKBOX", "RADIO", "SINGLE_CHOICE"]);
  const isObjectiveOnlyTest = Array.isArray(test?.questions) && test.questions.length > 0 && test.questions.every((q: any) => objectiveQuestionTypes.has(q?.questionType));
  const displayedScore = attempt?.finalScore ?? (isObjectiveOnlyTest ? (attempt?.autoScore ?? null) : null);







































































  /* =====================================================
     🔊 SPEECH ENGINE
  ===================================================== */
  const speakQueue = (texts: string[], rate?: number) => {
    if (!useTTS || !("speechSynthesis" in window)) return;


    window.speechSynthesis.cancel();
    const currentRate = rate ?? getStoredTtsRate();

    texts.forEach((text) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID";
      u.rate = currentRate;
      window.speechSynthesis.speak(u);
    });
  };

  /* =====================================================
     🔊 SPEECH QUEUE WITH PROMISE (WAIT UNTIL FINISH)
  ===================================================== */
  const speakQueueAndWait = (texts: string[], rate?: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!useTTS || !("speechSynthesis" in window)) {





        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const currentRate = rate ?? getStoredTtsRate();

      if (texts.length === 0) {
        resolve();
        return;
      }

      texts.forEach((text, index) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "id-ID";
        u.rate = currentRate;

        // Resolve when the last utterance ends
        if (index === texts.length - 1) {
          u.onend = () => resolve();
          u.onerror = () => resolve();
        }

        window.speechSynthesis.speak(u);
      });
    });
  };

  // Fetch result data
  const fetchResult = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !attemptId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/test/${id}/result?attemptId=${attemptId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAttempt(data.attempt);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch result error:", err);
    }
  }, [id, attemptId]);

  // Initial fetch + test info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setUseTTS(localStorage.getItem("accessMode") !== "no-tts");

    fetchResult();

    fetch(`http://localhost:4000/api/test/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTest);
  }, [id, attemptId, fetchResult]);

  // Auto-refresh setiap 10 detik untuk live update hasil dari admin
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResult();
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, [fetchResult]);

  /* =====================================================
     TTS: Bacakan hasil saat data tersedia
  ===================================================== */
  useEffect(() => {
    if (!attempt || !test || hasSpoken || !useTTS) return;

    // Delay untuk memastikan TTS halaman sebelumnya sudah selesai
    const timeout = setTimeout(() => {
      // Pastikan tidak ada TTS yang berjalan dari halaman sebelumnya
      window.speechSynthesis.cancel();

      const texts: string[] = [];

      texts.push(`Hasil  ${test.title}. ...`);


      if (displayedScore !== null && displayedScore !== undefined) {
        texts.push(`Nilai Anda adalah ${displayedScore}. ...`);




      } else {
        texts.push("Nilai Anda sedang menunggu penilaian admin. ...");
      }

      if (attempt.passStatus) {
        texts.push(attempt.passStatus === "PASS" ? "Selamat, Anda dinyatakan lulus. ..." : "Maaf, Anda dinyatakan tidak lulus. ...");
      } else {
        texts.push("Status kelulusan sedang menunggu penilaian admin. ...");
      }

      texts.push("Tekan Spasi untuk kembali ke Halaman Utama Tes. Gunakan Shift panah atas atau Shift panah bawah untuk mengatur kecepatan suara.");

      speakQueue(texts);
      setHasSpoken(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [attempt, test, hasSpoken, useTTS, speechRate, displayedScore]);

  // Fungsi untuk mengubah kecepatan
  const changeSpeed = useCallback(
    (delta: number) => {
      if (!useTTS) return;

      const newRate = setSpeechRate((prev) => Math.max(0.5, Math.min(2, prev + delta)));





      // Feedback audio
      window.speechSynthesis.cancel();
      const label = getSpeedLabel(newRate);
      speakQueue([`Kecepatan ${label}`], newRate);
    },
    [setSpeechRate, useTTS],
  );

  // Fungsi untuk membacakan ulang hasil
  const replayResult = useCallback(() => {
    if (!useTTS || !attempt || !test) return;


    window.speechSynthesis.cancel();
    const texts: string[] = [];

    texts.push(`Hasil Tes ${test.title}. ...`);


    if (displayedScore !== null && displayedScore !== undefined) {
      texts.push(`Nilai Anda adalah ${displayedScore}. ...`);




    } else {
      texts.push("Nilai Anda sedang menunggu penilaian admin. ...");
    }

    if (attempt.passStatus) {
      texts.push(attempt.passStatus === "PASS" ? "Selamat, Anda dinyatakan lulus. ..." : "Maaf, Anda dinyatakan tidak lulus. ...");
    } else {
      texts.push("Status kelulusan sedang menunggu penilaian admin. ...");
    }

    speakQueue(texts);
  }, [useTTS, attempt, test, displayedScore]);













  /* =====================================================
     KEYBOARD NAVIGATION
  ===================================================== */
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      // Abaikan jika sedang mengetik di input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (useTTS) {
            window.speechSynthesis.cancel();
            await speakQueueAndWait(["Kembali ke dashboard. ..."]);

          }



          router.push("/dashboard/camaba");
          break;














        case "ArrowUp":
          if (useTTS && e.shiftKey) {
            e.preventDefault();
            changeSpeed(0.1);
          }
          break;

        case "ArrowDown":
          if (useTTS && e.shiftKey) {
            e.preventDefault();
            changeSpeed(-0.1);
          }
          break;

        case "KeyR":
          if (useTTS) {
            e.preventDefault();
            replayResult();
          }
          break;

        case "KeyF":
          if (useTTS) {
            e.preventDefault();
            replayResult();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, useTTS, changeSpeed, replayResult]);

  if (!attempt || !test) return <p className="p-8 text-2xl">Memuat...</p>;

  // Cek apakah keputusan kelulusan admin masih menunggu
  const isPending = attempt.passStatus === null;

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-3 sm:text-4xl">Hasil {test.title}</h1>












        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 sm:p-8">
          <p className="text-base sm:text-xl">
            <b>Nilai Anda:</b> {displayedScore !== null && displayedScore !== undefined ? <span className="text-xl sm:text-2xl font-bold">{displayedScore}</span> : <span className="text-orange-500 italic">Menunggu penilaian admin...</span>}
          </p>

          {attempt.passStatus && (
            <p className="text-xl sm:text-2xl">
              <b>Status:</b> <span className={`font-bold ${attempt.passStatus === "PASS" ? "text-green-600" : "text-red-600"}`}>{attempt.passStatus === "PASS" ? "✓ LULUS" : "✗ TIDAK LULUS"}</span>
            </p>
          )}

          {isPending && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-base text-yellow-800 sm:text-lg">⏳ Status kelulusan sedang diproses oleh admin. Halaman ini akan otomatis diperbarui.</p>
            </div>
          )}

          {lastUpdated && <p className="text-xs text-gray-400 mt-2">Terakhir diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}</p>}
        </div>

        {useTTS ? (
          <p className="mt-4 text-center text-base text-blue-600 font-medium sm:text-lg">Tekan Spasi untuk kembali ke Dashboard. Tekan F untuk membaca ulang hasil. Gunakan Shift + Panah Atas/Bawah untuk kecepatan suara.</p>
        ) : (
          <p className="mt-4 text-center text-base text-blue-600 font-medium sm:text-lg">Tekan Spasi untuk kembali ke Dashboard.</p>
        )}

        <a href="/dashboard/camaba" className="block mt-4 bg-blue-600 text-white py-3 text-center rounded-lg text-base font-semibold sm:text-lg">
          Kembali ke Dashboard
        </a>

        {/* =====================================================
            FLOATING SPEED CONTROL - KONSISTEN DENGAN HALAMAN LAIN
        ===================================================== */}
        {useTTS && (
          <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 rounded-xl border bg-white p-4 shadow-xl sm:bottom-6 sm:right-6">
            <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

            <div className="flex items-center gap-3">
              <button onClick={() => changeSpeed(-0.1)} className="rounded-lg bg-gray-200 px-3 py-2 text-lg font-bold">
                −
              </button>

              <span className="text-lg font-semibold w-12 text-center">{speechRate.toFixed(1)}</span>

              <button onClick={() => changeSpeed(0.1)} className="rounded-lg bg-gray-200 px-3 py-2 text-lg font-bold">
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}