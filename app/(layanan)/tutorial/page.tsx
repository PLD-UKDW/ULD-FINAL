"use client";

import {
  FileText,
  Users,
  BookOpen,
  Car,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
  const layananLainnya = [
    { label: "Layanan Aksesibilitas", icon: HelpCircle, href: "#" },
    { label: "Layanan Akomodasi", icon: ClipboardList, href: "#" },
    { label: "Tutorial", icon: BookOpen, href: "#" },
    { label: "Volunteer", icon: Users, href: "#" },
    { label: "Digitalisasi Buku", icon: FileText, href: "#" },
    { label: "Layanan Mobil", icon: Car, href: "#" },
  ];

  const prosedur = [
    {
      step: "1",
      title: "Mengisi Formulir",
      desc: (
        <>
          Mahasiswa/dosen mengisi formulir pengajuan tutorial melalui{" "}
          <Link
            href="https://forms.gle/xxxxx"
            target="_blank"
            className="text-[#A9C46C] hover:underline"
          >
            link ini
          </Link>
          .
        </>
      ),
    },
    {
      step: "2",
      title: "Menunggu Konfirmasi",
      desc: "Koordinator tutorial akan menghubungi pemohon untuk konfirmasi jadwal dan tutor yang tersedia.",
    },
  ];

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white pt-32 pb-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
              Tutorial
            </h1>
            <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
              Tutorial adalah bentuk pembelajaran intensif yang diberikan untuk
              mendukung mahasiswa penyandang disabilitas dalam memahami materi
              kuliah maupun persiapan akademik lainnya. Jenis tutorial meliputi
              bimbingan skripsi/TA, tutorial bahasa (Indonesia/Inggris), hingga
              pendampingan mata kuliah tertentu.
            </p>
            <p className="text-base md:text-lg text-white leading-relaxed">
              Pengajuan tutorial dapat dilakukan sepanjang semester, sedangkan
              tutorial skripsi/TA/Laporan Magang dianjurkan diajukan sejak awal
              semester agar lebih mudah dijadwalkan.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              Prosedur Pengajuan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prosedur.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#A9C46C] text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-white">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold mb-6 text-[#A9C46C]">
            Layanan Lainnya
          </h2>
          <ul className="space-y-4">
            {layananLainnya.map((layanan) => (
              <li key={layanan.label}>
                <Link
                  href={layanan.href}
                  className="flex items-center gap-3 text-white/90 hover:text-[#A9C46C] transition-colors"
                >
                  <layanan.icon className="w-5 h-5" />
                  {layanan.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
