"use client";

import {
  ExternalLink,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Heart,
  HelpCircle,
  ClipboardList,
  BookOpen,
  Car,
} from "lucide-react";
import Link from "next/link";

export default function RequestPendampingPage() {
  const layananLainnya = [
    { label: "Layanan Aksesibilitas", icon: HelpCircle, href: "#" },
    { label: "Layanan Akomodasi", icon: ClipboardList, href: "#" },
    { label: "Tutorial", icon: BookOpen, href: "#" },
    { label: "Volunteer", icon: Users, href: "#" },
    { label: "Digitalisasi Buku", icon: FileText, href: "#" },
    { label: "Layanan Mobilitas", icon: Car, href: "#" },
  ];



  return (
    <section className="relative w-full min-h-screen  bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 text-white pt-32 pb-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 flex items-center gap-3 text-white">
              <Users className="w-8 h-8 text-white" />
              Permintaan Pendamping
            </h1>
            <p className="text-lg md:text-xl text-white leading-relaxed">
              Layanan khusus untuk mendukung mahasiswa, dosen, dan staf yang membutuhkan{" "}
              <span className="font-semibold text-white">
                pendampingan mobilitas, akademik, ujian, dan interpretasi
              </span>
              . Kami siap membantu Anda dengan layanan yang profesional dan terpercaya.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-400/30 text-center">
            <FileText className="w-10 h-10 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Ajukan Permintaan Anda
            </h2>
            <p className="text-white mb-6">
              Isi formulir di bawah untuk mengajukan layanan pendampingan
            </p>

            <Link
              href="https://forms.gle/isi-link-form"
              target="_blank"
              className="inline-flex items-center gap-3 bg-[#A9C46C] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#8DB255] transition-all duration-300"
            >
              <FileText className="w-6 h-6" />
              Isi Formulir Permintaan
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-400/30">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white">
                Syarat & Ketentuan
              </h3>
            </div>
            <ul className="space-y-4 text-white">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                Ajukan permintaan minimal{" "}
                <strong className="text-white">7 hari kerja</strong> sebelum kegiatan berlangsung
              </li>
              <li className="flex items-start gap-1">
                <FileText className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                Pastikan semua data yang diisi sudah{" "}
                <strong className="text-white">benar dan lengkap</strong> agar dapat diproses dengan cepat
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                Hubungi tim layanan kami jika mengalami kendala dalam mengakses formulir
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-400/30 text-center">
              <Users className="w-8 h-8 text-white mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">
                Pendampingan Mobilitas
              </h4>
              <p className="text-sm text-white">
                Bantuan perpindahan dan aksesibilitas di lingkungan kampus
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-400/30 text-center">
              <FileText className="w-8 h-8 text-white mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">
                Pendampingan Akademik
              </h4>
              <p className="text-sm text-white">
                Dukungan dalam kegiatan pembelajaran dan ujian
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-400/30 text-center">
              <Heart className="w-8 h-8 text-white mx-auto mb-4" />
              <h4 className="font-bold text-white mb-2">
                Layanan Interpretasi
              </h4>
              <p className="text-sm text-white">
                Bantuan komunikasi dan interpretasi bahasa isyarat
              </p>
            </div>
          </div>
        </div>

         <aside className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-green-400/30">
          <h2 className="text-xl font-bold mb-6 text-[#A9C46C]">Layanan Lainnya</h2>
          <ul className="space-y-4">
            {layananLainnya.map((layanan) => (
              <li key={layanan.label}>
                <Link href={layanan.href} className="flex items-center gap-3 text-green-100 hover:text-[#A9C46C] transition-colors">
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
