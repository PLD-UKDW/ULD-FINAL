"use client";

import { FileText, Users, BookOpen, Car, HelpCircle, ClipboardList, HeartHandshake, GraduationCap, User, Briefcase, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function KonselingPage() {
  const layananLainnya = [
    { label: "Layanan Aksesibilitas", icon: HelpCircle, href: "#" },
    { label: "Layanan Akomodasi", icon: ClipboardList, href: "#" },
    { label: "Tutorial", icon: BookOpen, href: "#" },
    { label: "Volunteer", icon: Users, href: "#" },
    { label: "Digitalisasi Buku", icon: FileText, href: "#" },
    { label: "Layanan Mobil", icon: Car, href: "#" },
  ];

  const jenisKonseling = [
    {
      title: "Konseling Akademik",
      desc: "Membantu mahasiswa mengatasi kesulitan belajar, manajemen waktu, dan adaptasi metode pembelajaran.",
      icon: GraduationCap,
    },
    {
      title: "Konseling Pribadi",
      desc: "Dukungan psikologis untuk menghadapi masalah pribadi, sosial, maupun emosional.",
      icon: User,
    },
    {
      title: "Konseling Karier",
      desc: "Pendampingan dalam menentukan arah karier, persiapan kerja, dan pengembangan potensi diri.",
      icon: Briefcase,
    },
  ];

  const prosedur = [
    {
      title: "Isi Formulir Pengajuan",
      desc: (
        <>
          Lengkapi data diri dan kebutuhan konseling melalui{" "}
          <Link href="https://forms.gle/xxxxx" target="_blank" className="text-white hover:underline">
            formulir online
          </Link>
          .
        </>
      ),
      icon: ClipboardList,
    },
    {
      title: "Jadwal Konseling",
      desc: "Koordinator akan menghubungi Anda untuk menentukan jadwal sesi konseling.",
      icon: Calendar,
    },
    {
      title: "Pelaksanaan Sesi",
      desc: "Sesi konseling dilakukan secara tatap muka atau daring sesuai kesepakatan.",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="relative w-full min-h-screen  bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white pt-32 pb-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 flex items-center gap-3 text-white">
              <HeartHandshake className="w-8 h-8 text-white" />
              Layanan Konseling
            </h1>
            <p className="text-lg md:text-xl text-green-50 leading-relaxed">
              Layanan konseling disediakan untuk mendukung kesejahteraan akademik dan personal mahasiswa. Melalui pendampingan profesional, mahasiswa dapat menemukan solusi atas permasalahan yang dihadapi, baik di bidang akademik, pribadi,
              maupun karier.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Jenis Layanan Konseling</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {jenisKonseling.map((item, idx) => (
                <div key={idx} className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-400/30">
                  <item.icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-white">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Prosedur Pengajuan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prosedur.map((item, idx) => (
                <div key={idx} className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-400/30">
                  <item.icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-white">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold mb-6 text-green-400">Layanan Lainnya</h2>
          <ul className="space-y-4">
            {layananLainnya.map((layanan) => (
              <li key={layanan.label}>
                <Link href={layanan.href} className="flex items-center gap-3 text-gray-100 hover:text-green-400 transition-colors">
                  <layanan.icon className="w-5 h-5" />
                  {layanan.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
