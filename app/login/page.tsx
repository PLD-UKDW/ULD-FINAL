// "use client";

// import api from "@/lib/api";
// import { getStoredTtsRate, useTtsRate } from "@/lib/ttsRate";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useCallback, useEffect, useRef, useState } from "react";

// const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// export default function LoginPage() {
//   const [registrationNumber, setRegistrationNumber] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [lastCharIndex, setLastCharIndex] = useState(0);
//   const [currentSpeed, setCurrentSpeed] = useTtsRate(1);

//   const router = useRouter();
//   const inputRef = useRef<HTMLInputElement>(null);
//   const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

//   const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
//     if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

//     const voices = window.speechSynthesis.getVoices();
//     if (!voices.length) return null;

//     const googleIndonesianVoice = voices.find((voice) => /google/i.test(voice.name) && /^id/i.test(voice.lang));
//     if (googleIndonesianVoice) return googleIndonesianVoice;

//     const indonesianVoice = voices.find((voice) => /^id/i.test(voice.lang) || /indones/i.test(voice.lang));
//     if (indonesianVoice) return indonesianVoice;

//     return voices[0] || null;
//   }, []);

//   const createUtterance = useCallback(
//     (text: string) => {
//       const utterance = new SpeechSynthesisUtterance(text);
//       const savedRate = getStoredTtsRate(1);
//       utterance.rate = savedRate;
//       utterance.pitch = 1;
//       utterance.volume = 1;

//       const preferredVoice = preferredVoiceRef.current ?? getPreferredVoice();
//       if (preferredVoice) {
//         utterance.voice = preferredVoice;
//         utterance.lang = preferredVoice.lang;
//       } else {
//         utterance.lang = "id-ID";
//       }

//       return utterance;
//     },
//     [getPreferredVoice],
//   );

//   useEffect(() => {
//     if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

//     const loadVoices = () => {
//       preferredVoiceRef.current = getPreferredVoice();
//     };

//     loadVoices();
//     window.speechSynthesis.onvoiceschanged = loadVoices;

//     return () => {
//       window.speechSynthesis.onvoiceschanged = null;
//     };
//   }, [getPreferredVoice]);

//   const changeSpeed = (delta: number) => {
//     setCurrentSpeed((prev: number) => {
//       const next = Math.min(2, Math.max(0.5, prev + delta));

//       if (typeof window !== "undefined" && "speechSynthesis" in window) {
//         window.speechSynthesis.cancel();
//         const u1 = createUtterance("Kecepatan suara diubah.");
//         u1.rate = next;
//         const u2 = createUtterance(`Kecepatan sekarang ${next.toFixed(1)}`);
//         u2.rate = next;
//         window.speechSynthesis.speak(u1);
//         window.speechSynthesis.speak(u2);
//       }

//       return next;
//     });
//   };

//   const speak = (text: string, cancelPrevious: boolean = true) => {
//     if (typeof window === "undefined") return;

//     if (cancelPrevious) {
//       window.speechSynthesis.cancel();
//     }

//     const utterance = createUtterance(text);

//     window.speechSynthesis.speak(utterance);
//   };

//   const speakChar = (char: string) => {
//     if (typeof window === "undefined") return;

//     window.speechSynthesis.cancel();

//     const utterance = createUtterance(char);

//     window.speechSynthesis.speak(utterance);
//   };

//   const speakAndWait = (text: string): Promise<void> => {
//     return new Promise((resolve) => {
//       if (typeof window === "undefined") {
//         resolve();
//         return;
//       }

//       window.speechSynthesis.cancel();

//       const utterance = createUtterance(text);

//       utterance.onend = () => resolve();
//       utterance.onerror = () => resolve();

//       window.speechSynthesis.speak(utterance);
//     });
//   };

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       window.speechSynthesis.cancel();
//       speak(
//         "Halaman login. ... Tekan Spasi untuk mengetik nomor registrasi. ... Tekan Escape untuk keluar dari mode mengetik. ... Tekan Enter untuk masuk ke halaman tes. ... Gunakan Shift panah atas untuk mempercepat suara, atau Shift panah bawah untuk memperlambat.",
//       );
//     }, 500);

//     return () => clearTimeout(timeout);
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (typeof window !== "undefined" && "speechSynthesis" in window) {
//         window.speechSynthesis.cancel();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (isTyping && registrationNumber.length > lastCharIndex) {
//       const newChar = registrationNumber[registrationNumber.length - 1];
//       speakChar(newChar);
//       setLastCharIndex(registrationNumber.length);
//     } else if (registrationNumber.length < lastCharIndex) {
//       speakChar("hapus");
//       setLastCharIndex(registrationNumber.length);
//     }
//   }, [registrationNumber, isTyping, lastCharIndex]);

//   const getKeyName = (e: KeyboardEvent): string => {
//     const key = typeof e.key === "string" ? e.key : "";

//     const keyMap: Record<string, string> = {
//       Escape: "escape",
//       Enter: "enter",
//       Backspace: "hapus",
//       Delete: "delete",
//       Tab: "tab",
//       CapsLock: "caps lock",
//       Shift: "shift",
//       Control: "control",
//       Alt: "alt",
//       Meta: "command",
//       Space: "spasi",
//       ArrowUp: "panah atas",
//       ArrowDown: "panah bawah",
//       ArrowLeft: "panah kiri",
//       ArrowRight: "panah kanan",
//       F1: "f 1",
//       F2: "f 2",
//       F3: "f 3",
//       F4: "f 4",
//       F5: "f 5",
//       F6: "f 6",
//       F7: "f 7",
//       F8: "f 8",
//       F9: "f 9",
//       F10: "f 10",
//       F11: "f 11",
//       F12: "f 12",
//       Home: "home",
//       End: "end",
//       PageUp: "page up",
//       PageDown: "page down",
//       Insert: "insert",
//       NumLock: "num lock",
//       ScrollLock: "scroll lock",
//       Pause: "pause",
//       ContextMenu: "menu",
//     };

//     if (keyMap[key]) {
//       return keyMap[key];
//     }

//     if (key.length === 1) {
//       return key;
//     }

//     return key;
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const key = typeof e.key === "string" ? e.key : "";
//       const code = typeof e.code === "string" ? e.code : "";

//       const keyName = getKeyName(e);

//       if (e.shiftKey && code === "ArrowUp") {
//         e.preventDefault();
//         changeSpeed(0.1);
//         return;
//       }

//       if (e.shiftKey && code === "ArrowDown") {
//         e.preventDefault();
//         changeSpeed(-0.1);
//         return;
//       }

//       if (code === "Space" && !isTyping) {
//         e.preventDefault();
//         setIsTyping(true);
//         inputRef.current?.focus();
//         speak("spasi. Silakan ketik nomor registrasi.");
//         return;
//       }

//       if (key === "Escape") {
//         e.preventDefault();
//         setIsTyping(false);
//         inputRef.current?.blur();

//         if (registrationNumber.trim()) {
//           speak(`escape. Keluar dari mode mengetik. Nomor registrasi Anda adalah ... ${registrationNumber.split("").join(" ... ")}`);
//         } else {
//           speak("escape. Keluar dari mode mengetik. Nomor registrasi masih kosong.");
//         }
//         return;
//       }

//       if (key === "Enter" && !isTyping) {
//         e.preventDefault();
//         speak("enter. Mengirim login.");
//         document.querySelector("form")?.requestSubmit();
//         return;
//       }
//       if (key.length > 1) {
//         speakChar(keyName);
//       } else if (!isTyping) {
//         speakChar(keyName);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isTyping, registrationNumber]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     await speakAndWait("Sedang memproses login. ... Mohon tunggu.");

//     try {
//       const API_BASE = process.env.NEXT_PUBLIC_API_URL
//       const res = await api.post(`${API_BASE}/api/login`, { registrationNumber });

//       if (res.data.message === "OTP sent") {
//         document.cookie = `authStage=otp; path=/; max-age=600`;
//         document.cookie = `pendingRegNumber=${registrationNumber}; path=/; max-age=600`;
//         router.push(`/otp?registrationNumber=${registrationNumber}`);
//         return;
//       }

//       if (res.data.token) {
//         const role = res.data.user?.role;
//         const testId = res.data.testId || res.data.user?.testId;

//         window.dispatchEvent(new Event("auth-change"));

//         document.cookie = `authToken=${res.data.token}; path=/`;
//         document.cookie = `role=${role}; path=/`;

//         if (role === "ADMIN") {
//           await speakAndWait("Login berhasil. ... Anda akan dialihkan ke halaman admin.");
//           router.push("/admin/dashboard");
//         } else {
//           await speakAndWait("Login berhasil. ... Anda akan dialihkan ke halaman tes.");
//           // window.location.href = "http://localhost:3000/dashboard/camaba";
//           router.push("/dashboard/camaba");
//         }
//         return;
//       }

//       setError("Unexpected response from server");
//       speak("Terjadi kesalahan pada sistem.");
//     } catch (err: unknown) {
//       let message = "Login gagal";
//       if (typeof err === "object" && err !== null) {
//         const maybeResp = err as {
//           response?: { data?: { message?: string } };
//         };
//         message = maybeResp.response?.data?.message || (err instanceof Error ? err.message : message);
//       }
//       setError(message);
//       speak("Login gagal. Periksa kembali nomor registrasi Anda.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-[#8db93f] min-h-dvh flex items-start justify-center px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:items-center lg:pt-32">
//       <div className="w-full max-w-md bg-[#108607] rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
//         <div className="flex justify-center mb-6">
//           <Image src="/logo/logould.png" width={120} height={120} alt="Logo" className="invert brightness-0" />
//         </div>

//         <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back!</h1>

//         <p className="text-white/90 text-center mb-8 px-4">Please sign in to your account by completing the necessary fields below</p>

//         <form onSubmit={handleLogin} className="mt-4">
//           <label className="text-white text-sm mb-2 block">Nomor Registrasi</label>

//           <input
//             ref={inputRef}
//             type="text"
//             name="registrationNumber"
//             value={registrationNumber}
//             onChange={(e) => setRegistrationNumber(e.target.value)}
//             placeholder="Masukkan Nomor Registrasi Anda"
//             className="w-full px-4 py-3 mb-6 rounded-lg border border-white/60 bg-white/10 text-white placeholder-white/70 focus:border-white"
//           />

//           {error && <p className="mb-3 text-center text-sm text-red-300">{error}</p>}

//           <button type="submit" disabled={loading} className="w-full bg-white text-[#108607] py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-70 flex items-center justify-center gap-2">
//             Sign In
//             {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#108607] border-t-transparent" />}
//           </button>

//           <button
//             type="button"
//             onClick={() => {
//               document.cookie = "authStage=; Max-Age=0; path=/";
//               document.cookie = "pendingRegNumber=; Max-Age=0; path=/";
//               document.cookie = "authToken=; Max-Age=0; path=/";
//               document.cookie = "role=; Max-Age=0; path=/";
//               window.location.href = FRONTEND_URL;
//             }}
//             className="mt-3 w-full border border-white/60 text-white py-3 rounded-lg font-semibold hover:bg-white/10 transition"
//           >
//             Kembali ke Halaman Utama
//           </button>
//         </form>
//       </div>

//       {/* FLOATING SPEED CONTROL */}
//       <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-xl p-4 flex flex-col gap-3 items-center">
//         <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

//         <div className="flex items-center gap-3">
//           <button type="button" onClick={() => changeSpeed(-0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold text-black">
//             −
//           </button>

//           <span className="text-lg font-semibold w-12 text-center text-black">{currentSpeed.toFixed(1)}</span>

//           <button type="button" onClick={() => changeSpeed(0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold text-black">
//             +
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import api from "@/lib/api";
import { getStoredTtsRate, useTtsRate } from "@/lib/ttsRate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export default function LoginPage() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastCharIndex, setLastCharIndex] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useTtsRate(1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
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
    (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const savedRate = getStoredTtsRate(1);
      utterance.rate = savedRate;
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

  const changeSpeed = (delta: number) => {
    setCurrentSpeed((prev: number) => {
      const next = Math.min(2, Math.max(0.5, prev + delta));

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u1 = createUtterance("Kecepatan suara diubah.");
        u1.rate = next;
        const u2 = createUtterance(`Kecepatan sekarang ${next.toFixed(1)}`);
        u2.rate = next;
        window.speechSynthesis.speak(u1);
        window.speechSynthesis.speak(u2);
      }

      return next;
    });
  };

  const speak = (text: string, cancelPrevious: boolean = true) => {
    if (typeof window === "undefined") return;

    if (cancelPrevious) {
      window.speechSynthesis.cancel();
    }

    const utterance = createUtterance(text);

    window.speechSynthesis.speak(utterance);
  };

  const speakChar = (char: string) => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = createUtterance(char);

    window.speechSynthesis.speak(utterance);
  };

  const speakAndWait = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = createUtterance(text);

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.speechSynthesis.cancel();
      speak(
        "Halaman login. ... Tekan Spasi untuk mengetik nomor registrasi. ... Tekan Escape untuk keluar dari mode mengetik. ... Tekan Enter untuk masuk ke halaman tes. ... Gunakan Shift panah atas untuk mempercepat suara, atau Shift panah bawah untuk memperlambat.",
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isTyping && registrationNumber.length > lastCharIndex) {
      const newChar = registrationNumber[registrationNumber.length - 1];
      speakChar(newChar);
      setLastCharIndex(registrationNumber.length);
    } else if (registrationNumber.length < lastCharIndex) {
      speakChar("hapus");
      setLastCharIndex(registrationNumber.length);
    }
  }, [registrationNumber, isTyping, lastCharIndex]);

  const getKeyName = (e: KeyboardEvent): string => {
    const key = typeof e.key === "string" ? e.key : "";

    const keyMap: Record<string, string> = {
      Escape: "escape",
      Enter: "enter",
      Backspace: "hapus",
      Delete: "delete",
      Tab: "tab",
      CapsLock: "caps lock",
      Shift: "shift",
      Control: "control",
      Alt: "alt",
      Meta: "command",
      Space: "spasi",
      ArrowUp: "panah atas",
      ArrowDown: "panah bawah",
      ArrowLeft: "panah kiri",
      ArrowRight: "panah kanan",
      F1: "f 1",
      F2: "f 2",
      F3: "f 3",
      F4: "f 4",
      F5: "f 5",
      F6: "f 6",
      F7: "f 7",
      F8: "f 8",
      F9: "f 9",
      F10: "f 10",
      F11: "f 11",
      F12: "f 12",
      Home: "home",
      End: "end",
      PageUp: "page up",
      PageDown: "page down",
      Insert: "insert",
      NumLock: "num lock",
      ScrollLock: "scroll lock",
      Pause: "pause",
      ContextMenu: "menu",
    };

    if (keyMap[key]) {
      return keyMap[key];
    }

    if (key.length === 1) {
      return key;
    }

    return key;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      const code = typeof e.code === "string" ? e.code : "";

      const keyName = getKeyName(e);

      if (e.shiftKey && code === "ArrowUp") {
        e.preventDefault();
        changeSpeed(0.1);
        return;
      }

      if (e.shiftKey && code === "ArrowDown") {
        e.preventDefault();
        changeSpeed(-0.1);
        return;
      }

      if (code === "Space" && !isTyping) {
        e.preventDefault();
        setIsTyping(true);
        inputRef.current?.focus();
        speak("spasi. Silakan ketik nomor registrasi.");
        return;
      }

      if (key === "Escape") {
        e.preventDefault();
        setIsTyping(false);
        inputRef.current?.blur();

        if (registrationNumber.trim()) {
          speak(`escape. Keluar dari mode mengetik. Nomor registrasi Anda adalah ... ${registrationNumber.split("").join(" ... ")}`);
        } else {
          speak("escape. Keluar dari mode mengetik. Nomor registrasi masih kosong.");
        }
        return;
      }

      if (key === "Enter" && !isTyping) {
        e.preventDefault();
        speak("enter. Mengirim login.");
        document.querySelector("form")?.requestSubmit();
        return;
      }
      if (key.length > 1) {
        speakChar(keyName);
      } else if (!isTyping) {
        speakChar(keyName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, registrationNumber]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await speakAndWait("Sedang memproses login. ... Mohon tunggu.");

    try {
      const res = await api.post("/login", { registrationNumber });

      if (res.data.message === "OTP sent") {
        document.cookie = `authStage=otp; path=/; max-age=600`;
        document.cookie = `pendingRegNumber=${registrationNumber}; path=/; max-age=600`;
        router.push(`/otp?registrationNumber=${registrationNumber}`);
        return;
      }

      if (res.data.token) {
        const role = res.data.user?.role;
        const testId = res.data.testId || res.data.user?.testId;

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("auth-change"));

        document.cookie = `authToken=${res.data.token}; path=/; max-age=86400`;
        document.cookie = `role=${role}; path=/; max-age=86400`;

        if (role === "ADMIN") {
          await speakAndWait("Login berhasil. ... Anda akan dialihkan ke halaman admin.");
          router.push("/admin/dashboard");
        } else {
          await speakAndWait("Login berhasil. ... Anda akan dialihkan ke halaman tes.");
          // window.location.href = "http://localhost:3000/dashboard/camaba";
          router.push("/dashboard/camaba");
        }
        return;
      }

      setError("Unexpected response from server");
      speak("Terjadi kesalahan pada sistem.");
    } catch (err: unknown) {
      let message = "Login gagal";
      if (typeof err === "object" && err !== null) {
        const maybeResp = err as {
          response?: { data?: { message?: string } };
        };
        message = maybeResp.response?.data?.message || (err instanceof Error ? err.message : message);
      }
      setError(message);
      speak("Login gagal. Periksa kembali nomor registrasi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#8db93f] min-h-[100dvh] flex items-start justify-center px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:items-center lg:pt-32">
      <div className="w-full max-w-md bg-[#108607] rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="flex justify-center mb-6">
          <Image src="/logo/logould.png" width={120} height={120} alt="Logo" className="invert brightness-0" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back!</h1>

        <p className="text-white/90 text-center mb-8 px-4">Please sign in to your account by completing the necessary fields below</p>

        <form onSubmit={handleLogin} className="mt-4">
          <label className="text-white text-sm mb-2 block">Nomor Registrasi</label>

          <input
            ref={inputRef}
            type="text"
            name="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Masukkan Nomor Registrasi Anda"
            className="w-full px-4 py-3 mb-6 rounded-lg border border-white/60 bg-white/10 text-white placeholder-white/70 focus:border-white"
          />

          {error && <p className="mb-3 text-center text-sm text-red-300">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-white text-[#108607] py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-70 flex items-center justify-center gap-2">
            Sign In
            {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#108607] border-t-transparent" />}
          </button>

          <button
            type="button"
            onClick={() => {
              document.cookie = "authStage=; Max-Age=0; path=/";
              document.cookie = "pendingRegNumber=; Max-Age=0; path=/";
              window.location.href = FRONTEND_URL;
            }}
            className="mt-3 w-full border border-white/60 text-white py-3 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Kembali ke Halaman Utama
          </button>
        </form>
      </div>

      {/* FLOATING SPEED CONTROL */}
      <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-xl p-4 flex flex-col gap-3 items-center">
        <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => changeSpeed(-0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold text-black">
            −
          </button>

          <span className="text-lg font-semibold w-12 text-center text-black">{currentSpeed.toFixed(1)}</span>

          <button type="button" onClick={() => changeSpeed(0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold text-black">
            +
          </button>
        </div>
      </div>
    </div>
  );
}