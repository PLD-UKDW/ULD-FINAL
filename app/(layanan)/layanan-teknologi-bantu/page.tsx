"use client";

import {
  Headphones,
  Search,
  Monitor,
  Accessibility,
  Cpu,
  Wrench,
  HelpCircle,
  ClipboardList,
  BookOpen,
  Users,
  FileText,
  Car
} from "lucide-react";
import Link from "next/link";

export default function TeknologiBantuPage() {
  const teknologi = [
    { label: "Mic Clip On", icon: Headphones },
    { label: "Portable Magnifier", icon: Search, note: "Sedang maintenance" },
    { label: "Komputer + Screen Reader & Magnifier", icon: Monitor, note: "Sedang maintenance" },
    { label: "Kursi Roda", icon: Accessibility },
    { label: "Kruk", icon: Accessibility },
    { label: "Instalasi Non-Visual Desktop Access", icon: Cpu, href: "#" },
  ];

    const layananLainnya = [
    { label: "Layanan Aksesibilitas", icon: HelpCircle, href: "#" },
    { label: "Layanan Teknologi Bantu", icon: ClipboardList, href: "#" },
    { label: "Tutorial", icon: BookOpen, href: "#" },
    { label: "Volunteer", icon: Users, href: "#" },
    { label: "Digitalisasi Buku", icon: FileText, href: "#" },
    { label: "Layanan Mobilitas", icon: Car, href: "#" },
  ];

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white pt-32 pb-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 flex items-center gap-3 text-white">
              <Wrench className="w-8 h-8 text-white" />
              Teknologi Bantu
            </h1>
            <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
              Kami menyediakan berbagai teknologi bantu untuk mendukung civitas akademika, 
              khususnya mahasiswa dengan disabilitas, agar lebih mudah mengakses pembelajaran.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">
              Daftar Teknologi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teknologi.map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-green-400/30"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#A9C46C] text-green-900">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.label}
                    </h3>
                  </div>
                  {item.note && (
                    <p className="text-sm italic text-white mb-2">
                      {item.note}
                    </p>
                  )}
                  {item.href && (
                    <Link
                      href={item.href}
                      className="text-sm text-white hover:underline"
                    >
                      Lihat Detail
                    </Link>
                  )}
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
                <Link
                  href={layanan.href}
                  className="flex items-center gap-3 text-gray-100 hover:text-green-400 transition-colors"
                >
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
