"use client";

import { CheckCircle2 } from "lucide-react";

export default function LayananNonAkademis() {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">Layanan Non-Akademis</h1>

        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">Bentuk layanan non-akademis untuk mendukung mahasiswa penyandang disabilitas dalam aktivitas kampus secara nyaman, aman, dan inklusif.</p>
      </div>

      <div className="mt-14 max-w-4xl space-y-8">
        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">Asesmen kebutuhan sarana dan prasarana pendukung di lingkungan kampus disertai penyusunan rekomendasi aksesibilitas fasilitas kampus (toilet, lift, jalur khusus, dll.).</p>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">Pendampingan non-akademik, seperti orientasi kampus, mobilitas, dan pengembangan kemandirian.</p>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">Konseling dan advokasi untuk mahasiswa penyandang disabilitas terkait hak dan layanan mereka.</p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">Kampanye dan edukasi inklusi kepada civitas akademika untuk menciptakan budaya ramah disabilitas.</p>
        </div>
      </div>
    </section>
  );
}
