"use client";

import { 
  FileText, 
  Users, 
  BookOpen, 
  Car, 
  HelpCircle, 
  ClipboardList 
} from "lucide-react";
import Link from "next/link";

export default function DigitalisasiBukuPage() {
  const layananLainnya = [
    { label: "Layanan Aksesibilitas", icon: HelpCircle, href: "#" },
    { label: "Layanan Akomodasi", icon: ClipboardList, href: "#" },
    { label: "Tutorial", icon: BookOpen, href: "#" },
    { label: "Volunteer", icon: Users, href: "#" },
    { label: "Digitalisasi Buku", icon: FileText, href: "#" },
    { label: "Layanan Mobil", icon: Car, href: "#" },
  ];

  return (
  <section className="relative w-full min-h-screen bg-gradient-to-br from-[#14532d] via-[#064e3b] to-[#166534] text-white pt-32 pb-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Konten utama */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <header>
            <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-3 mb-4 text-white">
              <FileText className="w-8 h-8 text-white" />
              Digitalisasi Buku
            </h1>
            <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
              Layanan digitalisasi buku ini ditujukan untuk membantu mahasiswa
              dan dosen mendapatkan bahan bacaan dalam format digital yang lebih
              mudah diakses.
            </p>
          </header>

          {/* Ketentuan */}
          <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-green-400/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ketentuan Digitalisasi Buku
            </h2>
            <ul className="list-disc list-inside space-y-2 text-green-100 leading-relaxed">
              <li>
                Mahasiswa/dosen mengunduh dan mengisi form pengajuan digitalisasi.
              </li>
              <li>
                Formulir yang sudah diisi diserahkan bersama buku yang ingin
                didigitalkan.
              </li>
              <li>
                Pengajuan minimal dilakukan <strong>pertengahan semester</strong>.
              </li>
              <li>
                Berkas akan diproses oleh staf koordinasi akomodasi pembelajaran.
              </li>
            </ul>
          </section>

          {/* Prosedur */}
          <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-green-400/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Prosedur Digitalisasi
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-green-100 leading-relaxed">
              <li>
                Staf melakukan penyekenan atau pemotretan halaman buku dalam
                format JPG.
              </li>
              <li>
                File dibagi ke relawan untuk diketik ulang menjadi teks.
              </li>
              <li>
                Hasil dikompilasi kembali dan diverifikasi oleh staf.
              </li>
              <li>
                Buku digital disediakan dalam format <strong>PDF</strong> dan{" "}
                <strong>Word</strong>.
              </li>
              <li>
                File digital kemudian dikirimkan kepada pemohon.
              </li>
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold mb-6 text-green-400">
            Layanan Lainnya
          </h2>
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
        </aside>
      </div>
    </section>
  );
}
