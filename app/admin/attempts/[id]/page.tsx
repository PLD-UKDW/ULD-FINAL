// "use client";

// import { API_BASE } from "@/lib/api";
// import { getAuthToken } from "@/lib/auth.client";
// import { useParams } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";

// export default function AttemptReview() {
//   const params = useParams();
//   const attemptId = params.id as string;

//   const [token, setToken] = useState<string | null>(null);
//   const [attempt, setAttempt] = useState<any>(null);
//   const [manualScore, setManualScore] = useState("");
//   const [statusOverride, setStatusOverride] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setToken(getAuthToken());
//   }, []);

//   const fetchDetail = useCallback(async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) {
//         console.error("fetchDetail error:", res.status);
//         return;
//       }
//       const data = await res.json();
//       setAttempt(data);
//       setStatusOverride(data.passStatus ?? "");
//     } catch (err) {
//       console.error("fetchDetail:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, attemptId]);

//   useEffect(() => {
//     fetchDetail();
//   }, [fetchDetail]);

//   async function submitManualScore() {
//     if (!token) return;
//     try {
//       const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}/score`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ manualScore: Number(manualScore) }),
//       });
//       if (!res.ok) {
//         alert("Gagal menyimpan manual score");
//         return;
//       }
//       alert("Manual score berhasil disimpan!");
//       fetchDetail();
//     } catch (err) {
//       console.error("submitManualScore:", err);
//       alert("Gagal menyimpan manual score");
//     }
//   }

//   async function updatePassStatus() {
//     if (!token) return;
//     try {
//       const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}/status`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: statusOverride }),
//       });
//       if (!res.ok) {
//         alert("Gagal mengubah status");
//         return;
//       }
//       alert("Status berhasil diperbarui!");
//       fetchDetail();
//     } catch (err) {
//       console.error("updatePassStatus:", err);
//       alert("Gagal mengubah status");
//     }
//   }

//   if (loading) return <p className="p-6">Loading...</p>;
//   if (!attempt) return <p className="p-6 text-red-600">Attempt tidak ditemukan.</p>;

//   const answers = attempt.answers || {};

//   return (
//     <div className="p-8 space-y-6 text-black">
//       <h1 className="text-2xl font-bold mb-4">Review Attempt #{attempt.id}</h1>
//       <div className="p-4 border rounded-lg bg-white shadow">
//         <p><b>Nama Peserta:</b> {attempt.user?.name}</p>
//         <p><b>Test:</b> {attempt.test?.title}</p>
//         <p><b>Tipe:</b> {attempt.test?.type}</p>
//         <p><b>Auto Score:</b> {attempt.autoScore}</p>
//         <p><b>Manual Score:</b> {attempt.manualScore ?? "-"}</p>
//         <p><b>Final Score:</b> {attempt.finalScore ?? "-"}</p>
//         <p><b>Status:</b> {attempt.passStatus ?? "Pending"}</p>
//       </div>

//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold">Jawaban Peserta</h2>
//         {attempt.test?.questions?.map((q: any) => (
//           <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
//             <p className="font-medium mb-2">• {q.text}</p>
//             <p className="text-sm text-gray-700"><b>Jawaban:</b> {answers[q.id] ?? "-"}</p>
//           </div>
//         ))}
//       </div>

//       {attempt.test?.type === "COLLEGE_READINESS" && (
//         <div className="p-4 border rounded-lg bg-white shadow space-y-3">
//           <h2 className="font-semibold">Input Manual Score</h2>
//           <input type="number" value={manualScore} onChange={(e) => setManualScore(e.target.value)} className="border p-2 rounded w-40" placeholder="Nilai manual" />
//           <button onClick={submitManualScore} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Manual Score</button>
//         </div>
//       )}

//       <div className="p-4 border rounded-lg bg-white shadow space-y-3">
//         <h2 className="font-semibold">Override Status</h2>
//         <select value={statusOverride} onChange={(e) => setStatusOverride(e.target.value)} className="border p-2 rounded w-40">
//           <option value="">-- pilih status --</option>
//           <option value="PASS">PASS</option>
//           <option value="FAIL">FAIL</option>
//         </select>
//         <button onClick={updatePassStatus} className="px-4 py-2 bg-green-600 text-white rounded">Update Status</button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AttemptReview() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id;

  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [manualScore, setManualScore] = useState("");
  const [finalScoreInput, setFinalScoreInput] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingEssay, setSavingEssay] = useState<number | null>(null);
  const [savingMC, setSavingMC] = useState<number | null>(null);
  const [savingFinalScore, setSavingFinalScore] = useState(false);
  const autoFinalScoreSyncedRef = useRef(false);

  // State untuk input nilai essay per pertanyaan (belum disimpan)
  const [essayInputs, setEssayInputs] = useState<Record<number, string>>({});
  // State untuk input nilai pilihan ganda/checkbox/radio per pertanyaan
  const [mcInputs, setMcInputs] = useState<Record<number, string>>({});

  const essayScores = attempt?.essayScores || {};
  const mcScores = attempt?.mcScores || {};
  const answers = attempt?.answers || {};

  // Sync essayInputs dengan essayScores dari server saat data berubah
  useEffect(() => {
    if (attempt?.essayScores) {
      const inputs: Record<number, string> = {};
      Object.entries(attempt.essayScores).forEach(([key, val]) => {
        inputs[Number(key)] = String(val);
      });
      setEssayInputs(inputs);
    }
  }, [attempt?.essayScores]);

  // Sync mcInputs dengan mcScores dari server saat data berubah
  useEffect(() => {
    if (attempt?.mcScores) {
      const inputs: Record<number, string> = {};
      Object.entries(attempt.mcScores).forEach(([key, val]) => {
        inputs[Number(key)] = String(val);
      });
      setMcInputs(inputs);
    }
  }, [attempt?.mcScores]);

  // ===============================
  // LOAD TOKEN
  // ===============================
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // ===============================
  // FETCH ATTEMPT DETAIL + TEST QUESTIONS
  // ===============================
  const fetchDetail = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Fetch attempt detail
      const res = await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fetch attempt failed");


      const data = await res.json();
      setAttempt(data);
      setStatusOverride(data.passStatus ?? "");
      setManualScore(data.manualScore !== null && data.manualScore !== undefined ? String(data.manualScore) : "");
      setFinalScoreInput(data.finalScore !== null && data.finalScore !== undefined ? String(data.finalScore) : "");

      // Jika ada questions dari response, gunakan itu
      if (data.test?.questions?.length > 0) {
        setQuestions(data.test.questions);
      } else if (data.testId || data.test?.id) {
        // Fetch test detail untuk mendapatkan questions
        const testId = data.testId || data.test?.id;
        const testRes = await fetch(`http://localhost:4000/api/admin/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (testRes.ok) {
          const testData = await testRes.json();
          setQuestions(testData.questions || []);
        }
      }
    } catch (err) {
      console.error("fetchDetail:", err);
    } finally {
      setLoading(false);
    }
  }, [token, attemptId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ===============================
  // SAVE ESSAY SCORE PER QUESTION
  // ===============================
  async function saveEssayScore(questionId: number, score: string) {
    if (!token) return;

    setSavingEssay(questionId);

    // Simpan posisi scroll sebelum fetch
    const scrollPosition = window.scrollY;

    try {
      await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/essay-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          score: Number(score),
        }),
      });

      await fetchDetail();

      // Kembalikan posisi scroll setelah fetch
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    } catch (err) {
      console.error("saveEssayScore:", err);
    } finally {
      setSavingEssay(null);
    }
  }

  // ===============================
  // SAVE MC/CHECKBOX/RADIO SCORE PER QUESTION
  // ===============================
  async function saveMCScore(questionId: number, score: string) {
    if (!token) return;

    setSavingMC(questionId);

    // Simpan posisi scroll sebelum fetch
    const scrollPosition = window.scrollY;

    try {
      await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/mc-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          score: Number(score),
        }),
      });

      await fetchDetail();

      // Kembalikan posisi scroll setelah fetch
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    } catch (err) {
      console.error("saveMCScore:", err);
    } finally {
      setSavingMC(null);
    }
  }

  // ===============================
  // SUBMIT TOTAL MANUAL SCORE (optional)
  // ===============================
  async function submitManualScore() {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          manualScore: Number(manualScore),
        }),
      });

      if (!res.ok) throw new Error();

      alert("Manual score saved");
      fetchDetail();
    } catch {
      alert("Gagal menyimpan manual score");
    }
  }

  // ===============================
  // SAVE FINAL SCORE (send finalScore directly, with manualScore fallback)
  // ===============================
  async function submitFinalScore() {
    if (!token || !attempt) return;

    if (finalScoreInput.trim() === "") {
      alert("Final score tidak boleh kosong");
      return;
    }

    const finalScore = Number(finalScoreInput);
    if (Number.isNaN(finalScore) || finalScore < 0) {
      alert("Final score harus berupa angka valid >= 0");
      return;
    }

    const autoScore = Number(attempt.autoScore ?? 0);
    const manualFromFinal = finalScore - autoScore;

    setSavingFinalScore(true);
    try {
      const payload: { finalScore: number; manualScore?: number } = { finalScore };
      // Keep backward-compatibility for backends that still derive finalScore from manualScore.
      if (manualFromFinal >= 0) {
        payload.manualScore = manualFromFinal;
      }

      const res = await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Gagal menyimpan final score";
        try {
          const errData = await res.json();
          if (errData?.message) {
            message = errData.message;
          }
        } catch {
          // Keep default message when response body is not JSON.
        }
        throw new Error(message);
      }

      alert("Final score berhasil disimpan");
      fetchDetail();
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan final score");
    } finally {
      setSavingFinalScore(false);
    }
  }

  const objectiveQuestionTypes = new Set(["MULTIPLE_CHOICE", "CHECKBOX", "RADIO", "SINGLE_CHOICE"]);
  const isObjectiveOnlyTest = questions.length > 0 && questions.every((q: any) => objectiveQuestionTypes.has(q.questionType));

  useEffect(() => {
    if (!token || !attempt || !isObjectiveOnlyTest) return;
    if (attempt.finalScore !== null && attempt.finalScore !== undefined) return;
    if (autoFinalScoreSyncedRef.current) return;

    autoFinalScoreSyncedRef.current = true;

    (async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            manualScore: 0,
          }),
        });

        if (res.ok) {
          fetchDetail();
        }
      } catch (err) {
        console.error("auto sync final score failed:", err);
      }
    })();
  }, [token, attempt, isObjectiveOnlyTest, attemptId, fetchDetail]);

  // ===============================
  // OVERRIDE STATUS
  // ===============================
  async function updatePassStatus() {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/admin/attempts/${attemptId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statusOverride,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Status updated");

      fetchDetail();
    } catch {
      alert("Gagal update status");

    }
  }

  if (loading) return <p className="px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:px-8">Loading...</p>;
  if (!attempt) return <p className="px-4 pb-8 pt-24 text-red-600 sm:px-6 sm:pt-28 lg:px-8">Attempt tidak ditemukan</p>;

  const parsedFinalScore = Number(finalScoreInput);
  const manualFromFinalPreview = Number.isNaN(parsedFinalScore) ? null : parsedFinalScore - Number(attempt.autoScore ?? 0);
  const displayedFinalScore = attempt.finalScore ?? (isObjectiveOnlyTest ? (attempt.autoScore ?? "-") : "-");

  // ===============================
  // UI
  // ===============================
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-10 pt-24 text-black sm:space-y-6 sm:px-6 sm:pt-28 lg:px-8">
      {/* ===== BACK BUTTON ===== */}
      <button onClick={() => router.push("/admin/dashboard/input/pmjd")} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800 sm:text-base">
        <ArrowLeft className="w-5 h-5" />
        Kembali ke Dashboard
      </button>

      <h1 className="text-xl font-bold leading-tight sm:text-2xl">Penilaian {attempt.user?.name ?? "User"}</h1>

      {/* ===== DETAIL ===== */}
      <div className="grid gap-2 rounded-lg border bg-white p-4 shadow sm:grid-cols-2 sm:gap-3">
        <p className="break-words">
          <b>Peserta:</b> {attempt.user?.name}
        </p>
        <p className="break-words">
          <b>Test:</b> {attempt.test?.title}
        </p>
        {/* <p>
          <b>Tipe:</b> {attempt.test?.type}
        </p> */}
        {/* <p>
          <b>Auto Score:</b> {attempt.autoScore}
        </p> */}
        {/* <p>
          <b>Manual Score:</b> {attempt.manualScore ?? "-"}
        </p> */}
        <p>
          <b>Final Score:</b> {displayedFinalScore}
        </p>
        <p>
          <b>Status:</b> {attempt.passStatus ?? "Pending"}
        </p>
      </div>

      {/* ===== ANSWERS & ESSAY SCORING ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold sm:text-xl">Jawaban Peserta</h2>

        {questions.length === 0 && <p className="text-gray-500 italic">Tidak ada soal ditemukan</p>}

        {questions.map((q: any, index: number) => {
          const isEssay = q.questionType === "ESSAY";
          const currentInput = essayInputs[q.id] ?? "";
          const savedScore = essayScores[q.id];
          const hasUnsavedChanges = currentInput !== String(savedScore ?? "");
          const studentAnswer = answers[q.id] || answers[String(q.id)];

          // Untuk soal pilihan ganda/checkbox/radio
          const mcCurrentInput = mcInputs[q.id] ?? "";
          const mcSavedScore = mcScores[q.id];
          const mcHasUnsavedChanges = mcCurrentInput !== String(mcSavedScore ?? "");
          // Hitung auto score berdasarkan jawaban benar/salah
          const autoCalculatedScore = studentAnswer === q.answer ? q.autoScore || 1 : 0;
          // Gunakan manual score jika ada, jika tidak gunakan auto calculated
          const displayMCScore = mcSavedScore !== undefined ? mcSavedScore : autoCalculatedScore;

          return (
            <div key={q.id} className={`space-y-2 rounded-lg border p-4 ${isEssay ? "border-yellow-200 bg-yellow-50" : "bg-gray-50"}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-medium break-words">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  {q.text}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Tampilkan score pada card */}
                  {isEssay && savedScore !== undefined && (
                    <span className="text-sm font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                      Nilai: {savedScore}/{q.autoScore || 100}
                    </span>
                  )}
                  {isEssay && savedScore === undefined && <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-500">Belum dinilai</span>}

                  {/* Tampilkan score untuk pilihan ganda, checkbox, radio button */}
                  {/* {!isEssay && (
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      mcSavedScore !== undefined 
                        ? "bg-purple-100 text-purple-700" 
                        : displayMCScore > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                    }`}>
                      Nilai: {displayMCScore}/{q.autoScore || 1}
                      {mcSavedScore !== undefined && <span className="ml-1 text-xs">(manual)</span>}
                    </span>
                  )} */}

                  <span className={`text-xs px-2 py-1 rounded ${isEssay ? "bg-yellow-200 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{isEssay ? "Essay" : q.questionType || "Pilihan Ganda"}</span>
                </div>
              </div>

              {/* Tampilkan opsi jika ada (untuk pilihan ganda) */}
              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <div className="space-y-1 pl-4 text-sm text-gray-600">
                  {q.options.map((opt: string, i: number) => (
                    <p key={i} className={`break-words ${studentAnswer === opt ? "font-semibold text-blue-700" : ""}`}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </p>
                  ))}
                </div>
              )}

              <div className="rounded border bg-white p-3">
                <p className="text-sm font-medium mb-1">Jawaban Mahasiswa:</p>
                {studentAnswer ? (
                  <p className={`text-sm whitespace-pre-wrap break-words ${!isEssay && q.answer && studentAnswer === q.answer ? "text-green-700" : !isEssay && q.answer && studentAnswer !== q.answer ? "text-red-700" : "text-gray-800"}`}>
                    {studentAnswer}
                    {!isEssay && q.answer && <span className="ml-2">{studentAnswer === q.answer ? "✓" : "✗"}</span>}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">Tidak dijawab</p>
                )}
              </div>

              {/* Kunci jawaban untuk soal non-essay */}
              {!isEssay && q.answer && (
                <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <b>Kunci Jawaban:</b> {q.answer}
                </p>
              )}

              {/* Form penilaian essay */}
              {isEssay && (
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t pt-2">
                  <label className="text-sm font-medium">Nilai Essay:</label>
                  <input
                    type="number"
                    min={0}
                    max={q.autoScore || 100}
                    className="w-full rounded border p-2 text-center sm:w-24"
                    placeholder="0"
                    value={currentInput}
                    onChange={(e) =>
                      setEssayInputs((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-500">/ {q.autoScore || 100} poin</span>

                  <button
                    onClick={() => saveEssayScore(q.id, currentInput)}
                    disabled={savingEssay === q.id || !currentInput}
                    className={`w-full rounded px-3 py-1.5 text-sm font-medium transition sm:w-auto ${
                      savingEssay === q.id ? "bg-gray-300 text-gray-500 cursor-not-allowed" : hasUnsavedChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {savingEssay === q.id ? "Menyimpan..." : "Simpan Nilai"}
                  </button>

                  {savedScore !== undefined && !hasUnsavedChanges && <span className="text-sm text-green-600 flex items-center gap-1">✓ Tersimpan</span>}
                  {hasUnsavedChanges && savedScore !== undefined && <span className="text-sm text-orange-500">• Ada perubahan belum disimpan</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* ===== ESSAY SCORING SUMMARY ===== */}
      {(() => {
        const essayQuestions = questions.filter((q: any) => q.questionType === "ESSAY") || [];

        if (essayQuestions.length === 0) return null;

        const gradedCount = essayQuestions.filter((q: any) => essayScores[q.id] !== undefined).length;
        const totalEssayPoints = essayQuestions.reduce((sum: number, q: any) => sum + (q.autoScore || 100), 0);
        const earnedPoints = Object.values(essayScores).reduce((sum: number, score: any) => sum + Number(score || 0), 0);

        return (
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow">
            <h2 className="font-semibold text-blue-800">Ringkasan Penilaian Essay</h2>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
              <div>
                <span className="text-gray-600">Jumlah Soal Essay:</span> <span className="font-medium">{essayQuestions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Sudah Dinilai:</span>{" "}
                <span className={`font-medium ${gradedCount === essayQuestions.length ? "text-green-600" : "text-orange-500"}`}>
                  {gradedCount} / {essayQuestions.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Poin Essay:</span>{" "}
                <span className="font-medium">
                  {earnedPoints} 
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>{" "}
                {gradedCount === essayQuestions.length ? <span className="text-green-600 font-medium">✓ Semua essay sudah dinilai</span> : <span className="text-orange-500 font-medium">⏳ Perlu penilaian</span>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== FINAL SCORE INPUT ===== */}
      {!isObjectiveOnlyTest ? (
        <div className="space-y-3 rounded-lg border bg-white p-4 shadow">
          <h2 className="font-semibold">Input Final Score</h2>

          <input type="number" min={0} value={finalScoreInput} onChange={(e) => setFinalScoreInput(e.target.value)} className="w-full rounded border p-2 sm:w-48" placeholder="Final score" />

          {/* <p className="text-xs text-gray-600">Manual score dihitung otomatis: final score - auto score = {manualFromFinalPreview !== null ? manualFromFinalPreview : "-"}</p> */}

          <button onClick={submitFinalScore} disabled={savingFinalScore} className={`w-full rounded mx-2 px-4 py-2 text-white sm:w-auto ${savingFinalScore ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {savingFinalScore ? "Menyimpan..." : "Simpan Final Score"}
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow">
          <h2 className="font-semibold text-green-800">Final Score Otomatis</h2>
          <p className="text-sm text-green-700 mt-1">Tes ini berisi soal pilihan ganda/objektif saja, jadi nilai akhir otomatis mengikuti auto score.</p>
        </div>
      )}

      {/* ===== OPTIONAL MANUAL SCORE OVERRIDE ===== */}
      {attempt.test.type === "COLLEGE_READINESS" && (
        <div className="space-y-3 rounded-lg border bg-white p-4 shadow">
          <h2 className="font-semibold">Manual Score (Override)</h2>

          <input type="number" value={manualScore} onChange={(e) => setManualScore(e.target.value)} className="w-full rounded border p-2 sm:w-48" placeholder="Total manual" />

          <button onClick={submitManualScore} className="w-full rounded bg-blue-600 mx-2 px-4 py-2 text-white sm:w-auto">
            Simpan Manual Score
          </button>
        </div>
      )}

      {/* ===== STATUS ===== */}
      <div className="space-y-3 rounded-lg border bg-white p-4 shadow">
        <h2 className="font-semibold">Status Peserta</h2>

        <select value={statusOverride} onChange={(e) => setStatusOverride(e.target.value)} className="w-full rounded border p-2 sm:w-48">
          <option value="">-- pilih status --</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
        </select>

        <button onClick={updatePassStatus} className="w-full rounded bg-green-600 mx-2 px-4 py-2 text-white sm:w-auto">
          Update Status
        </button>
      </div>
    </div>
  );
}