"use client";

import api from "@/lib/api";
import { getStoredTtsRate, useTtsRate } from "@/lib/ttsRate";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* =====================================================
   DO TEST PAGE – SCREEN READER FIRST
===================================================== */

export default function DoTestPage() {
  const { id } = useParams();
  const router = useRouter();

  /* ==========================
     DATA STATE
  ========================== */
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showBackConfirmPopup, setShowBackConfirmPopup] = useState(false);

  /* ==========================
     ACCESSIBILITY
  ========================== */
  const [useTTS, setUseTTS] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useTtsRate(1);
  const [optionIndex, setOptionIndex] = useState(0);
  const [isTypingEssay, setIsTypingEssay] = useState(false);
  const [lastArrowLeftTime, setLastArrowLeftTime] = useState(0);
  const [lastSpaceTime, setLastSpaceTime] = useState(0);
  const essayRef = useRef<HTMLTextAreaElement>(null);
  const isTypingRef = useRef(false);
  const showConfirmRef = useRef(false);
  const arrowLeftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const introSpokenRef = useRef(false);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const getStoredVoicePreference = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const directVoice = localStorage.getItem("tts:voice");
    if (directVoice) return directVoice;

    const rawA11ySettings = localStorage.getItem("a11y-settings");
    if (!rawA11ySettings) return null;

    try {
      const parsed = JSON.parse(rawA11ySettings) as { ttsVoiceName?: string };
      return parsed.ttsVoiceName?.trim() || null;
    } catch {
      return null;
    }
  }, []);

  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const storedVoice = getStoredVoicePreference();
    if (storedVoice) {
      const matchedStoredVoice = voices.find((voice) => voice.voiceURI === storedVoice || voice.name === storedVoice);
      if (matchedStoredVoice) return matchedStoredVoice;
    }

    const googleIndonesianVoice = voices.find((voice) => /google/i.test(voice.name) && /^id/i.test(voice.lang));
    if (googleIndonesianVoice) return googleIndonesianVoice;

    const indonesianVoice = voices.find((voice) => /^id/i.test(voice.lang) || /indones/i.test(voice.lang));
    if (indonesianVoice) return indonesianVoice;

    return voices[0] || null;
  }, [getStoredVoicePreference]);

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

    let fallbackLoadTimeout: NodeJS.Timeout | null = null;

    const loadVoices = () => {
      preferredVoiceRef.current = getPreferredVoice();

      // Safari/Chrome kadang butuh trigger ulang setelah render awal.
      if (!preferredVoiceRef.current) {
        fallbackLoadTimeout = setTimeout(() => {
          preferredVoiceRef.current = getPreferredVoice();
        }, 400);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (fallbackLoadTimeout) {
        clearTimeout(fallbackLoadTimeout);
      }
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [getPreferredVoice]);

  /* ==========================
     HELPER: GET LETTER LABEL
  ========================== */
  const getLetter = useCallback((index: number, uppercase = true) => {
    const letter = String.fromCharCode(65 + index); // A=65, B=66, etc.
    return uppercase ? letter : letter.toLowerCase();
  }, []);

  /* ==========================
     HELPER: SPEAK SINGLE CHAR
  ========================== */
  const speakChar = (char: string) => {
    if (!useTTS) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    // Map special characters to readable text
    const charMap: Record<string, string> = {
      " ": "spasi",
      ".": "titik",
      ",": "koma",
      "!": "tanda seru",
      "?": "tanda tanya",
      ":": "titik dua",
      ";": "titik koma",
      "'": "kutip satu",
      '"': "kutip dua",
      "(": "kurung buka",
      ")": "kurung tutup",
      "-": "strip",
      _: "garis bawah",
      "/": "garis miring",
      "\\": "backslash",
      "@": "at",
      "#": "hashtag",
      $: "dollar",
      "%": "persen",
      "&": "dan",
      "*": "bintang",
      "+": "tambah",
      "=": "sama dengan",
      "<": "kurang dari",
      ">": "lebih dari",
      "\n": "enter",
    };

    const text = charMap[char] || char;
    const u = createUtterance(text, getStoredTtsRate(1));
    window.speechSynthesis.speak(u);
  };

  /* ==========================
     HELPER: PARSE OPTIONS (string or array)
  ========================== */
  const getOptionsArray = useCallback((options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  // Sync ref dengan state
  useEffect(() => {
    isTypingRef.current = isTypingEssay;
  }, [isTypingEssay]);

  /* =====================================================
     CHANGE SPEECH SPEED
  ===================================================== */
  const changeSpeed = (delta: number) => {
    setCurrentSpeed((prev) => {
      const next = Math.min(2, Math.max(0.5, prev + delta));

      // Speak feedback
      if (useTTS && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u1 = createUtterance("Kecepatan suara diubah.", next);
        const u2 = createUtterance(`Kecepatan sekarang ${next.toFixed(1)}`, next);
        window.speechSynthesis.speak(u1);
        window.speechSynthesis.speak(u2);
      }

      return next;
    });
  };

  useEffect(() => {
    showConfirmRef.current = showConfirmPopup || showBackConfirmPopup;
  }, [showConfirmPopup, showBackConfirmPopup]);

  /* =====================================================
     🔊 SPEECH ENGINE
  ===================================================== */
  const speakQueue = (texts: string[]) => {
    if (!useTTS) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const savedRate = getStoredTtsRate(1);

    texts.forEach((text) => {
      const u = createUtterance(text, savedRate);
      window.speechSynthesis.speak(u);
    });
  };

  /* =====================================================
     🔊 SPEECH QUEUE WITH PROMISE (WAIT UNTIL FINISH)
  ===================================================== */
  const speakQueueAndWait = useCallback(
    (texts: string[]): Promise<void> => {
      return new Promise((resolve) => {
        if (!useTTS || !("speechSynthesis" in window)) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const savedRate = getStoredTtsRate(1);

        if (texts.length === 0) {
          resolve();
          return;
        }

        texts.forEach((text, index) => {
          const u = createUtterance(text, savedRate);

          // Resolve when the last utterance ends
          if (index === texts.length - 1) {
            u.onend = () => resolve();
            u.onerror = () => resolve();
          }

          window.speechSynthesis.speak(u);
        });
      });
    },
    [useTTS, createUtterance],
  );

  /* ==========================
     FETCH TEST
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setUseTTS(localStorage.getItem("accessMode") !== "no-tts");

    api
      .get(`/test/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((r) => {
        setTest(r.data);
        setQuestions(r.data.questions || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil data tes:", err);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  /* =====================================================
     READ QUESTION (defined before useEffect that uses it)
  ===================================================== */
  const readQuestion = useCallback(
    async (index: number, questionsData?: any[]) => {
      const questionsToUse = questionsData || questions;
      const q = questionsToUse[index];
      if (!q) return;

      const queue: string[] = [`Soal ${index + 1}. ...`, `${q.text} ...`];

      if (q.questionType === "MULTIPLE_CHOICE") {
        getOptionsArray(q.options).forEach((opt: string, i: number) => {
          const label = getLetter(i);
          queue.push(` ${label}. ... ${opt} ...`);
        });

        queue.push("Gunakan panah atas dan bawah untuk memilih jawaban. ... Tekan enter untuk memilih.");
      } else if (q.questionType === "CHECKBOX") {
        getOptionsArray(q.options).forEach((opt: string, i: number) => {
          const label = getLetter(i);
          queue.push(`${label}. ... ${opt} ...`);
        });

        queue.push("Soal checklist. ... Gunakan panah atas dan bawah untuk berpindah jawaban. ... Tekan enter untuk mencentang atau menghapus centang.");
      } else {
        queue.push("Soal esai. ... Tekan enter untuk masuk ke mode mengetik. ... Tekan escape untuk keluar dari mode mengetik.");
      }

      await speakQueueAndWait(queue);
    },
    [questions, speakQueueAndWait, getLetter],
  );

  /* =====================================================
     INTRO + SOAL PERTAMA
  ===================================================== */
  useEffect(() => {
    if (loading || !test || !questions.length || !useTTS) return;

    // Prevent multiple intro reads due to dependency changes
    if (introSpokenRef.current) return;

    // Delay untuk memastikan TTS halaman sebelumnya sudah selesai
    const timeout = setTimeout(async () => {
      // Mark as spoken INSIDE timeout so it's set after timeout runs
      introSpokenRef.current = true;

      // Pastikan tidak ada TTS yang berjalan dari halaman sebelumnya
      window.speechSynthesis.cancel();

      // Gabungkan intro DAN soal pertama dalam satu queue agar tidak ada cancel
      const q = questions[0];
      const introAndFirstQuestion: string[] = [
        `Anda mengerjakan ${test.title}.`,
        `Ada ${questions.length} soal.`,
        "Panah kiri atau kanan untuk pindah soal.",
        "Panah atas atau bawah untuk pindah jawaban.",
        "Tekan enter untuk memilih.",
        "Tekan F untuk membaca ulang soal.",
        "Tekan panah kiri dua kali untuk ulang instruksi.",
        "Gunakan Shift panah atas untuk mempercepat suara, atau Shift panah bawah untuk memperlambat.",
        // "Soal pertama.",
        `Soal 1. ...`,
        `${q.text} ...`,
      ];

      // Tambahkan opsi soal pertama
      if (q.questionType === "MULTIPLE_CHOICE") {
        getOptionsArray(q.options).forEach((opt: string, i: number) => {
          const label = getLetter(i);
          introAndFirstQuestion.push(` ${label}. ... ${opt} ...`);
        });
        introAndFirstQuestion.push("Gunakan panah atas dan bawah untuk berpindah jawaban. ... Tekan enter untuk memilih jawaban.");
      } else if (q.questionType === "CHECKBOX") {
        getOptionsArray(q.options).forEach((opt: string, i: number) => {
          const label = getLetter(i);
          introAndFirstQuestion.push(` ${label}. ... ${opt} ...`);
        });
        introAndFirstQuestion.push("Soal checklist. ... Gunakan panah atas dan bawah untuk berpindah jawaban. ... Tekan enter untuk mencentang atau menghapus centang.");
      } else {
        introAndFirstQuestion.push("Soal esai. ... Tekan enter untuk masuk ke mode mengetik. ... Tekan escape untuk keluar dari mode mengetik.");
      }

      await speakQueueAndWait(introAndFirstQuestion);
    }, 500);

    return () => clearTimeout(timeout);
  }, [loading, test, questions, useTTS, getLetter, speakQueueAndWait]);

  /* =====================================================
     KEYBOARD NAVIGATION (TTS MODE)
  ===================================================== */
  useEffect(() => {
    if (!useTTS || !questions.length) return;

    const handler = (e: KeyboardEvent) => {
      // Jika popup konfirmasi muncul, abaikan keyboard navigation
      if (showConfirmRef.current) return;

      // Jika sedang mengetik essay, abaikan keyboard navigation
      if (isTypingRef.current) return;

      /* SPEED CONTROL - Shift + Arrow Up/Down */
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

      const q = questions[current];

      // Deteksi double left arrow untuk mengulang instruksi
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        const now = Date.now();

        if (now - lastArrowLeftTime < 500) {
          // Double press detected - ulang instruksi
          // Batalkan timeout navigasi jika ada
          if (arrowLeftTimeoutRef.current) {
            clearTimeout(arrowLeftTimeoutRef.current);
            arrowLeftTimeoutRef.current = null;
          }

          speakQueue([
            "Instruksi penggunaan. ...",
            `Anda sedang mengerjakan soal ${current + 1} dari ${questions.length}. ...`,
            "Gunakan panah kiri dan kanan untuk berpindah soal. ...",
            "Gunakan panah atas dan bawah untuk berpindah jawaban. ...",
            "Tekan enter untuk memilih jawaban. ...",
            "Tekan F untuk membaca ulang soal. ...",
            "Tekan panah kiri dua kali untuk mengulang instruksi ini. ...",
            "Pada soal esai, tekan enter untuk masuk ke mode mengetik, atau tekan escape untuk keluar dari mode mengetik. ...",
            "Gunakan Shift panah atas untuk mempercepat suara, atau Shift panah bawah untuk memperlambat.",
          ]);
          setLastArrowLeftTime(0);
          return;
        }

        setLastArrowLeftTime(now);

        // Set timeout untuk navigasi setelah 500ms jika tidak ada double press
        if (arrowLeftTimeoutRef.current) {
          clearTimeout(arrowLeftTimeoutRef.current);
        }

        arrowLeftTimeoutRef.current = setTimeout(() => {
          if (current > 0) {
            // Jika soal sekarang adalah essay dan ada jawaban, bacakan dulu
            if (q.questionType === "ESSAY") {
              const essayAnswer = (answers[q.id] as string) ?? "";
              if (essayAnswer.trim()) {
                speakQueue(["Jawaban essay Anda: ...", essayAnswer]);
                setTimeout(() => {
                  setCurrent((c) => {
                    const prev = c - 1;
                    setOptionIndex(0);
                    setIsTypingEssay(false);
                    setTimeout(() => readQuestion(prev), 2000);
                    return prev;
                  });
                }, 1500);
                return;
              }
            }

            setCurrent((c) => {
              const prev = c - 1;
              setOptionIndex(0);
              setIsTypingEssay(false);
              readQuestion(prev);
              return prev;
            });
          } else {
            // Soal pertama, tampilkan popup konfirmasi kembali
            setShowBackConfirmPopup(true);
            speakQueue(["Apakah Anda ingin kembali ke halaman utama? ...", "Tekan Enter untuk ya. ...", "Tekan Escape untuk batal."]);

          }
          arrowLeftTimeoutRef.current = null;
        }, 500);

        return;
      }

      // PINDAH SOAL
      if (e.code === "ArrowRight") {
        e.preventDefault();

        if (current < questions.length - 1) {
          setCurrent((c) => {
            const next = c + 1;
            setOptionIndex(0);
            setIsTypingEssay(false);
            readQuestion(next);
            return next;
          });
        } else {
          // Soal terakhir, tampilkan popup submit
          setShowConfirmPopup(true);
          speakQueue(["Ini adalah soal terakhir. ...", "Apakah Anda yakin ingin mengirim jawaban? ...", "Tekan Enter untuk konfirmasi. ...", "Tekan Escape untuk batal."]);
        }
      }

      // Tekan F untuk baca ulang soal
      if (e.code === "KeyF") {
        e.preventDefault();
        readQuestion(current);
        return;
      }

      // MULTIPLE CHOICE
      if (q.questionType === "MULTIPLE_CHOICE") {
        if (e.code === "ArrowDown" || e.code === "ArrowUp") {
          e.preventDefault();

          setOptionIndex((prev) => {
            const next = e.code === "ArrowDown" ? (prev + 1) % q.options.length : (prev - 1 + q.options.length) % q.options.length;

            speakQueue([`${getLetter(next)}. ...`, q.options[next]]);

            return next;
          });
        }

        // Enter untuk memilih jawaban
        if (e.code === "Enter") {
          e.preventDefault();
          const key = getLetter(optionIndex, false);
          setAnswers((prev) => ({ ...prev, [q.id]: key }));
          speakQueue(["Jawaban dipilih. ...", `Pilihan ${getLetter(optionIndex)}.`]);
        }
      }

      // CHECKBOX
      if (q.questionType === "CHECKBOX") {
        if (e.code === "ArrowDown" || e.code === "ArrowUp") {
          e.preventDefault();

          setOptionIndex((prev) => {
            const next = e.code === "ArrowDown" ? (prev + 1) % q.options.length : (prev - 1 + q.options.length) % q.options.length;

            const selected = (answers[q.id] as string[]) || [];
            const isChecked = selected.includes(getLetter(next, false));
            speakQueue([` ${getLetter(next)}. ...`, q.options[next], isChecked ? "Sudah dicentang." : "Belum dicentang."]);

            return next;
          });
        }

        // Enter untuk toggle centang
        if (e.code === "Enter") {
          e.preventDefault();
          const key = getLetter(optionIndex, false);
          setAnswers((prev) => {
            const currentAnswers = (prev[q.id] as string[]) || [];
            if (currentAnswers.includes(key)) {
              speakQueue(["Centang dihapus. ...", `Pilihan ${getLetter(optionIndex)}.`]);
              return { ...prev, [q.id]: currentAnswers.filter((k) => k !== key) };
            } else {
              speakQueue(["Dicentang. ...", `Pilihan ${getLetter(optionIndex)}.`]);
              return { ...prev, [q.id]: [...currentAnswers, key] };
            }
          });
        }
      }

      // ESSAY - tekan enter untuk mulai mengetik
      if (q.questionType === "ESSAY" && !isTypingRef.current) {
        // Enter untuk mulai mengetik
        if (e.code === "Enter") {
          e.preventDefault();
          setIsTypingEssay(true);
          speakQueue(["Mode mengetik aktif. ...", "Ketik jawaban Anda. ...", "Tekan Escape untuk keluar dari mode mengetik."]);
          setTimeout(() => {
            essayRef.current?.focus();
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [useTTS, questions, current, optionIndex, answers, lastArrowLeftTime, readQuestion, speakQueueAndWait, getLetter, router]);

  /* ==========================
     BACK POPUP KEYBOARD NAVIGATION (TTS ONLY)
  ========================== */
  useEffect(() => {
    if (!showBackConfirmPopup || !useTTS) return;

    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        setShowBackConfirmPopup(false);
        speakQueue(["Kembali ke halaman utama dibatalkan. ..."]);
      }

      if (e.code === "Space") {
        e.preventDefault();
        setShowBackConfirmPopup(false);
        sessionStorage.setItem("announceMainPage", "true");
        router.push("/dashboard/camaba");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showBackConfirmPopup, useTTS, router]);

  /* ==========================
     SUBMIT
  ========================== */
  const handleSubmit = useCallback(async () => {
    const token = localStorage.getItem("token");

    setSubmitting(true);

    try {
      const res = await api.post(
        `/test/${id}/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const attemptId = res.data.attempt?.id;
      if (!attemptId) return;

      await speakQueueAndWait(["Jawaban berhasil dikirim. ... Membuka hasil tes."]);
      router.push(`/test/${id}/result?attemptId=${attemptId}`);
    } catch (err) {
      console.error("Gagal submit jawaban:", err);
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, router]);

  /* ==========================
     POPUP KEYBOARD NAVIGATION
  ========================== */
  useEffect(() => {
    if (!showConfirmPopup) return;

    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        setShowConfirmPopup(false);
        speakQueue(["Pengiriman dibatalkan. ..."]);
      }

      if (e.code === "Space") {
        e.preventDefault();
        setShowConfirmPopup(false);
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showConfirmPopup, handleSubmit]);

  /* ==========================
     UI
  ========================== */
  if (loading) return <p className="min-h-[100dvh] px-4 pt-24 text-xl sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">Memuat soal...</p>;
  if (!test) return <p className="min-h-[100dvh] px-4 pt-24 text-xl sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">Test tidak ditemukan.</p>;

  const q = questions[current];

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-3 sm:text-4xl">{test.title}</h1>
        <p className="text-base text-gray-500 mb-6 sm:text-xl">{test.description}</p>

        <div className="border rounded-xl bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold mb-5 sm:text-2xl">
            Soal {current + 1} dari {questions.length}
          </h2>

          <p className="text-base mb-5 sm:text-xl">{q.text}</p>

          {q.questionType === "MULTIPLE_CHOICE" && (
            <div className="space-y-4">
              {getOptionsArray(q.options).map((opt: string, i: number) => {
                const key = getLetter(i, false);
                const isKeyboardFocused = useTTS && optionIndex === i;

                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg text-lg cursor-pointer transition-colors ${answers[q.id] === key ? "border-green-500 bg-green-50" : isKeyboardFocused ? "border-green-800 bg-green-50" : "border-green-200 hover:bg-green-50 hover:border-green-400"}`}
                  >
                    <input type="radio" name={String(q.id)} checked={answers[q.id] === key} onChange={() => setAnswers((p) => ({ ...p, [q.id]: key }))} className="w-5 h-5" />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {q.questionType === "CHECKBOX" && (
            <div className="space-y-4">
              {getOptionsArray(q.options).map((opt: string, i: number) => {
                const key = getLetter(i, false);
                const selected = (answers[q.id] as string[]) || [];
                const isKeyboardFocused = useTTS && optionIndex === i;

                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg text-lg cursor-pointer transition-colors ${selected.includes(key) ? "border-green-500 bg-green-50" : isKeyboardFocused ? "border-green-800 bg-green-50" : "border-green-200 hover:bg-green-50 hover:border-green-400"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(key)}
                      onChange={(e) => {
                        setAnswers((p) => {
                          const prev = (p[q.id] as string[]) || [];
                          if (e.target.checked) {
                            return { ...p, [q.id]: [...prev, key] };
                          } else {
                            return { ...p, [q.id]: prev.filter((k) => k !== key) };
                          }
                        });
                      }}
                      className="w-5 h-5"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {q.questionType === "ESSAY" && (
            <div className="space-y-3">
              {!isTypingEssay && useTTS && <p className="text-lg text-blue-600 font-medium">Tekan Enter untuk mulai mengetik jawaban</p>}
              <textarea
                ref={essayRef}
                className={`w-full border rounded-lg p-4 text-lg ${isTypingEssay ? "border-blue-500 ring-2 ring-blue-300" : ""}`}
                rows={6}
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => {
                  const oldValue = (answers[q.id] as string) ?? "";
                  const newValue = e.target.value;

                  // Detect what character was typed
                  if (newValue.length > oldValue.length) {
                    const newChar = newValue[newValue.length - 1];
                    speakChar(newChar);
                  } else if (newValue.length < oldValue.length) {
                    // Character was deleted
                    speakChar("hapus");
                  }

                  setAnswers((p) => ({ ...p, [q.id]: newValue }));
                }}
                onKeyDown={(e) => {
                  if (e.code === "Escape") {
                    e.preventDefault();
                    setIsTypingEssay(false);
                    essayRef.current?.blur();

                    const essayAnswer = (answers[q.id] as string) ?? "";
                    if (essayAnswer.trim()) {
                      speakQueue(["Keluar dari mode mengetik. ...", "Jawaban Anda: ...", essayAnswer]);
                    } else {
                      speakQueue(["Keluar dari mode mengetik. ..."]);
                    }
                  }
                }}
                onBlur={() => {
                  if (useTTS) setIsTypingEssay(false);
                }}
                placeholder={useTTS && !isTypingEssay ? "Tekan Enter untuk mengetik..." : "Ketik jawaban Anda di sini..."}
                readOnly={useTTS && !isTypingEssay}
              />
              {isTypingEssay && <p className="text-sm text-gray-500">Tekan Escape untuk keluar dari mode mengetik</p>}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={() => {
              if (current === 0) {
                setShowBackConfirmPopup(true);
                if (useTTS) {
                  speakQueue(["Apakah Anda ingin kembali ke halaman utama? ...", "Tekan Spasi untuk ya. ...", "Tekan Escape untuk batal."]);
                }
                return;
              }

              setCurrent((c) => c - 1);
            }}
            className="w-full rounded-lg border px-5 py-3 text-base font-semibold sm:w-auto sm:text-lg"
          >
            {current === 0 ? "← Kembali" : "← Sebelumnya"}
          </button>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg">
              Selanjutnya →
            </button>
          ) : (
            <button
              onClick={() => {
                setShowConfirmPopup(true);
                speakQueue(["Apakah Anda yakin ingin mengirim jawaban? ...", "Tekan Spasi untuk konfirmasi. ...", "Tekan Escape untuk batal."]);
              }}
              disabled={submitting}
              className="w-full rounded-lg bg-green-600 px-5 py-3 text-base font-semibold text-white sm:w-auto sm:text-lg"
            >
              {submitting ? "Mengirim..." : "Kirim Jawaban"}
            </button>
          )}
        </div>

        {/* ================= POPUP KONFIRMASI SUBMIT ================= */}
        {showConfirmPopup && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-8">
              <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">Konfirmasi Pengiriman</h2>
              <p className="mb-6 text-center text-base sm:text-lg">Apakah Anda yakin ingin mengirim jawaban Anda?</p>
              <p className="mb-6 text-center text-sm text-gray-600 sm:text-base">Jawaban yang sudah dikirim tidak dapat diubah.</p>
              <p className="mb-6 text-center text-sm font-medium text-blue-600 sm:text-base">Escape = Batal | Spasi = Kirim</p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowConfirmPopup(false);
                    speakQueue(["Pengiriman dibatalkan. ..."]);
                  }}
                  className="flex-1 rounded-lg bg-gray-300 px-5 py-3 text-base font-semibold text-gray-800 transition hover:bg-gray-400 sm:text-lg"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowConfirmPopup(false);
                    handleSubmit();
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-green-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-green-700 sm:text-lg"
                >
                  {submitting ? "Mengirim..." : "Ya, Kirim"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= POPUP KONFIRMASI KEMBALI ================= */}
        {showBackConfirmPopup && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-8">
              <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">Kembali ke Halaman Utama</h2>
              <p className="mb-6 text-center text-base sm:text-lg">Apakah Anda yakin ingin kembali ke halaman utama?</p>

              {useTTS && <p className="mb-6 text-center text-sm font-medium text-blue-600 sm:text-base">Spasi = Ya | Escape = Batal</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowBackConfirmPopup(false);
                    if (useTTS) speakQueue(["Kembali ke halaman utama dibatalkan. ..."]);
                  }}
                  className="flex-1 rounded-lg bg-gray-300 px-5 py-3 text-base font-semibold text-gray-800 transition hover:bg-gray-400 sm:text-lg"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowBackConfirmPopup(false);
                    sessionStorage.setItem("announceMainPage", "true");
                    router.push("/dashboard/camaba");
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 sm:text-lg"
                >
                  Ya, Kembali
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING SPEED CONTROL */}
        {useTTS && !showConfirmPopup && !showBackConfirmPopup && (
          <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 rounded-xl border bg-white p-4 shadow-xl sm:bottom-6 sm:right-6">
            <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

            <div className="flex items-center gap-3">
              <button onClick={() => changeSpeed(-0.1)} className="rounded-lg bg-gray-200 px-3 py-2 text-lg font-bold">
                −
              </button>

              <span className="text-lg font-semibold w-12 text-center">{currentSpeed.toFixed(1)}</span>

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