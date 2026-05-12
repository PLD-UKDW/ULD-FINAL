"use client";

import { CheckCircle2 } from "lucide-react";

export default function TujuanSasaranPage() {
  return (
    <section className="relative min-h-screen bg-white py-24 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-10 w-40 h-40 bg-[#3e4095]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#02a502]/10 rounded-full blur-3xl"></div>
      </div>

      <div
        className="relative z-10 max-w-6xl mx-auto text-center mb-16
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_0.8s_ease-out_forwards]"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#3e4095] mb-4">
          Tujuan & Sasaran
        </h1>
        <p className="text-lg text-gray-600">
          Arah dan fokus utama ULD dalam menciptakan lingkungan kampus yang inklusif dan aksesibel
        </p>
      </div>

      <div
        className="relative z-10 max-w-5xl mx-auto mb-16 p-10 rounded-2xl shadow-lg bg-white/70 
        backdrop-blur-sm border border-gray-100
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_1s_ease-out_forwards]"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-[#02a502] text-center">
          Tujuan
        </h2>

        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <CheckCircle2 className="w-7 h-7 text-[#02a502] mt-1" />
            <div>
              <h3 className="font-semibold text-xl text-gray-800">Aksesibilitas</h3>
              <p className="text-gray-700 leading-relaxed">
                Tercapainya kemudahan akses fisik, informasi, dan akademik bagi mahasiswa penyandang disabilitas.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <CheckCircle2 className="w-7 h-7 text-[#02a502] mt-1" />
            <div>
              <h3 className="font-semibold text-xl text-gray-800">Inklusivitas</h3>
              <p className="text-gray-700 leading-relaxed">
                Mewujudkan lingkungan kampus yang terbuka dan menerima keberagaman kemampuan.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <CheckCircle2 className="w-7 h-7 text-[#02a502] mt-1" />
            <div>
              <h3 className="font-semibold text-xl text-gray-800">Kemandirian</h3>
              <p className="text-gray-700 leading-relaxed">
                Mendorong pengembangan potensi dan otonomi mahasiswa disabilitas.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <CheckCircle2 className="w-7 h-7 text-[#02a502] mt-1" />
            <div>
              <h3 className="font-semibold text-xl text-gray-800">Kapasitasi</h3>
              <p className="text-gray-700 leading-relaxed">
                Meningkatkan kompetensi civitas akademika dalam layanan disabilitas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 max-w-5xl mx-auto p-10 rounded-2xl shadow-lg bg-white/70 
        backdrop-blur-sm border border-gray-100
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_1.2s_ease-out_forwards]"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-[#02a502] text-center">
          Sasaran
        </h2>

        <ul className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <li className="flex gap-4 items-start">
            <span className="mt-1">
              <CheckCircle2 className="w-6 h-6 text-[#3e4095]" />
            </span>
            Mahasiswa penyandang disabilitas yang mendapatkan layanan sesuai kebutuhan individualnya.
          </li>

          <li className="flex gap-4 items-start">
            <span className="mt-1">
              <CheckCircle2 className="w-6 h-6 text-[#3e4095]" />
            </span>
            Dosen dan tenaga kependidikan yang kompeten dalam mendukung pembelajaran inklusif.
          </li>

          <li className="flex gap-4 items-start">
            <span className="mt-1">
              <CheckCircle2 className="w-6 h-6 text-[#3e4095]" />
            </span>
            Mahasiswa secara umum yang memiliki kesadaran dan sikap inklusif terhadap penyandang disabilitas.
          </li>

          <li className="flex gap-4 items-start">
            <span className="mt-1">
              <CheckCircle2 className="w-6 h-6 text-[#3e4095]" />
            </span>
            Fasilitas dan teknologi kampus yang mendukung aksesibilitas dan kenyamanan bagi semua.
          </li>

          <li className="flex gap-4 items-start">
            <span className="mt-1">
              <CheckCircle2 className="w-6 h-6 text-[#3e4095]" />
            </span>
            Lingkungan kampus yang menerapkan budaya menghargai keberagaman dan ramah disabilitas.
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
