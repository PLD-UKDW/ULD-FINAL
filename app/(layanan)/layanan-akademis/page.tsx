"use client";

import { CheckCircle2 } from "lucide-react";
// import Link from "next/link";

export default function LayananAkademis() {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white py-30 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">Layanan Akademis</h1>

        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">Pendampingan Penerimaan Mahasiswa Baru Jalur Disabilitas UKDW. Asesmen kebutuhan pembelajaran untuk mahasiswa penyandang disabilitas.</p>
      </div>

      <div className="mt-14 max-w-4xl space-y-8">
        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">Berkoordinasi dengan Dekanat, Kaprodi, Dosen Wali, dan Pengajar Mata Kuliah, tentang kondisi mahasiswa disabilitas dan kebutuhannya.</p>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">
            Bekerja sama dengan LPKKSK, memberikan pendampingan pendukung pembelajaran bagi mahasiswa dengan disabilitas. <span className="italic">Bentuk layanan menyusul.</span>
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CheckCircle2 className="w-7 h-7 text-green-300" />
          <p className="text-lg leading-relaxed text-gray-200">
            Bersama LPAIP menyusun rekomendasi penyesuaian pembelajaran (seperti metode pengajaran, evaluasi, dan materi ajar) yang inklusif, serta memberikan pelatihan inklusif bagi dosen dan tenaga kependidikan dalam mendukung proses
            belajar mahasiswa disabilitas.
          </p>
        </div>
      </div>
    </section>
  );
}
