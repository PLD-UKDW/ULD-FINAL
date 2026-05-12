"use client";
import { useState } from "react";

export default function AccordionSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [nestedOpen, setNestedOpen] = useState<number | null>(null);

  return (
    <div id="accordion-nested-parent" className="mt-16 w-full max-w-3xl mx-auto mb-10" data-accordion="collapse">
      <h2 id="faq-heading" className="text-base md:text-2xl lg:text-3xl font-black text-[#3e4095] tracking-tight leading-tight mb-6 text-center">
        Pertanyaan Umum <span className="text-[#02a502]">& </span>Solusinya
      </h2>
      <h2 id="accordion-collapse-heading-1">
        <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-gray-200 rounded-t-xl focus:ring-2 focus:ring-gray-200 gap-3 text-[#02a502] hover:bg-gray-50 hover:border-gray-300 transition-colors" aria-expanded={open === 1} aria-controls="accordion-collapse-body-1" onClick={() => setOpen(open === 1 ? null : 1)}>
          <span>Bagaimana Cara Mendaftar PMJD?</span>
          <svg data-accordion-icon className={`w-3 h-3 rotate-180 shrink-0 transition-transform ${open === 1 ? "" : "-rotate-90"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
          </svg>
        </button>
      </h2>
      <div id="accordion-collapse-body-1" className={`${open === 1 ? "" : "hidden"}`} aria-labelledby="accordion-collapse-heading-1">
        <div className="p-5 border border-gray-200 bg-[#f1f5f9]">
          <p className="mb-2 text-gray-700">Untuk mendaftar Program PMJD, ikuti langkah-langkah berikut. Pastikan Anda menyiapkan dokumen yang diperlukan (KTP, transkrip nilai jika diminta, dan surat rekomendasi bila diperlukan).</p>
          <p className="mb-4 text-gray-700">Bila Anda membutuhkan bantuan lebih lanjut, hubungi tim PMJD lewat email atau kontak yang tercantum pada halaman program.</p>
          <div id="accordion-nested-collapse" data-accordion="collapse">
            <h2 id="accordion-nested-collapse-heading-1">
              <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-gray-200 focus:ring-2 focus:ring-gray-200 gap-3 text-[#02a502] hover:bg-gray-50 hover:border-gray-300 transition-colors" aria-expanded={nestedOpen === 1} aria-controls="accordion-nested-collapse-body-1" onClick={() => setNestedOpen(nestedOpen === 1 ? null : 1)}>
                <span>Langkah 1: Cek Persyaratan & Jadwal</span>
                <svg data-accordion-icon className={`w-3 h-3 rotate-180 shrink-0 transition-transform ${nestedOpen === 1 ? "" : "-rotate-90"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                </svg>
              </button>
            </h2>
            <div id="accordion-nested-collapse-body-1" className={`${nestedOpen === 1 ? "" : "hidden"}`} aria-labelledby="accordion-nested-collapse-heading-1">
              <div className="p-5 border border-gray-200 bg-[#f1f5f9]">
                <p className="text-gray-700">Lihat pengumuman resmi PMJD pada halaman program untuk mengetahui jadwal pendaftaran, syarat khusus jurusan, dan dokumen yang harus dipersiapkan.</p>
              </div>
            </div>
            <h2 id="accordion-nested-collapse-heading-2">
              <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-gray-200 focus:ring-2 focus:ring-gray-200 gap-3 text-[#02a502] hover:bg-gray-50 hover:border-gray-300 transition-colors" aria-expanded={nestedOpen === 2} aria-controls="accordion-nested-collapse-body-2" onClick={() => setNestedOpen(nestedOpen === 2 ? null : 2)}>
                <span>Langkah 2: Isi Formulir Pendaftaran</span>
                <svg data-accordion-icon className={`w-3 h-3 rotate-180 shrink-0 transition-transform ${nestedOpen === 2 ? "" : "-rotate-90"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                </svg>
              </button>
            </h2>
            <div id="accordion-nested-collapse-body-2" className={`${nestedOpen === 2 ? "" : "hidden"}`} aria-labelledby="accordion-nested-collapse-heading-2">
              <div className="p-5 border border-gray-200 bg-[#f1f5f9]">
                <p className="text-gray-700">Isi formulir pendaftaran online (atau cetak bila diwajibkan), lengkapi data pribadi, pilihan jurusan/program, dan unggah dokumen yang diminta.</p>
              </div>
            </div>
            <h2 id="accordion-nested-collapse-heading-3">
              <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-gray-200 focus:ring-2 focus:ring-gray-200 gap-3 text-[#02a502] hover:bg-gray-50 hover:border-gray-300 transition-colors" aria-expanded={nestedOpen === 3} aria-controls="accordion-nested-collapse-body-3" onClick={() => setNestedOpen(nestedOpen === 3 ? null : 3)}>
                <span>Langkah 3: Verifikasi & Konfirmasi</span>
                <svg data-accordion-icon className={`w-3 h-3 rotate-180 shrink-0 transition-transform ${nestedOpen === 3 ? "" : "-rotate-90"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
                </svg>
              </button>
            </h2>
            <div id="accordion-nested-collapse-body-3" className={`${nestedOpen === 3 ? "" : "hidden"}`} aria-labelledby="accordion-nested-collapse-heading-3">
              <div className="p-5 border border-gray-200 bg-[#f1f5f9]">
                <p className="mb-2 text-gray-700">Setelah dokumen diverifikasi oleh panitia, Anda akan menerima konfirmasi melalui email atau SMS. Ikuti instruksi selanjutnya (mis. pembayaran, wawancara, atau orientasi) jika ada.</p>
                <p className="text-gray-700">Jika ada pertanyaan, hubungi tim PMJD di kontak resmi untuk bantuan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 id="accordion-collapse-heading-2">
        <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-gray-200 focus:ring-2 focus:ring-gray-200 gap-3 text-[#02a502] hover:bg-gray-50 hover:border-gray-300 transition-colors" aria-expanded={open === 2} aria-controls="accordion-collapse-body-2" onClick={() => setOpen(open === 2 ? null : 2)}>
          <span>Jurusan apa saja yang tersedia??</span>
          <svg data-accordion-icon className={`w-3 h-3 rotate-180 shrink-0 transition-transform ${open === 2 ? "" : "-rotate-90"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
          </svg>
        </button>
      </h2>
      <div id="accordion-collapse-body-2" className={`${open === 2 ? "" : "hidden"}`} aria-labelledby="accordion-collapse-heading-2">
        <div className="p-5 border border-gray-200 bg-[#f1f5f9]">
          <p className="mb-3 text-gray-700">Berikut jurusan/program studi yang biasanya tersedia. Untuk daftar resmi dan ketersediaan per periode, lihat halaman program atau pengumuman penerimaan.</p>
          <ul className="ps-5 text-gray-700 list-disc space-y-1">
            <li>Informatika</li>
            <li>Sistem Informasi</li>
            <li>Manajemen</li>
            <li>Akuntansi</li>
            <li>Pendidikan Bahasa Inggris</li>
          </ul>
          <p className="mt-3 text-gray-700">Jika Anda ingin memastikan jurusan tertentu tersedia untuk PMJD, silakan hubungi koordinator program atau periksa pengumuman resmi.</p>
        </div>
      </div>
    </div>
  );
}
