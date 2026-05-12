import { Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#02a502] text-gray-200 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="text-lg font-bold mb-4 text-white">Kontak Kami</h3>
          <p className="mb-2">
            <span className="font-semibold">WhatsApp:</span>{" "}
            <a href="https://wa.me/6285126425599" target="_blank" className="text-[#4ADE80] hover:underline">
              +62 851-2642-5599
            </a>
          </p>
          <p className="mb-4">
            <span className="font-semibold">Email:</span>{" "}
            <a href="mailto:uld@staff.ukdw.ac.id" className="text-[#4ADE80] hover:underline">
              uld@staff.ukdw.ac.id
            </a>
          </p>
          {/* <p className="font-semibold mb-2">Sosial Media Kami</p>
          <div className="flex gap-3 text-xl">
            <a href="#" className="hover:text-white"><Facebook /></a>
            <a href="#" className="hover:text-white"><Youtube /></a>
            <a href="#" className="hover:text-white"><Instagram /></a>
          </div> */}
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-white">Site Menu</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline">Halaman Utama</Link></li>
            <li><Link href="/sejarah" className="hover:underline">Tentang</Link></li>
            <li><Link href="/sop-pmj" className="hover:underline">Prosedur Operasional</Link></li>
            <li><Link href="/layanan-akademis" className="hover:underline">Layanan</Link></li>
            <li><Link href="/berita-umum" className="hover:underline">Berita</Link></li>
            <li><Link href="/pmjd" className="hover:underline">PMJD</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-white">Layanan</h3>
          <ul className="space-y-2">
            <li><Link href="/layanan-akademis" className="hover:underline">Layanan Akademis</Link></li>
            <li><Link href="/layanan-non-akademis" className="hover:underline">Layanan Non Akademis</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4 text-white">Pranala</h3>
          <ul className="space-y-2">
            <li><Link href="/unduh" className="hover:underline">Unduh</Link></li>
            <li><Link href="/prosedur-penelitian" className="hover:underline">Prosedur Penelitian</Link></li>
            <li><Link href="/laporkan-hambatan" className="hover:underline">Laporkan Hambatan</Link></li>
            <li><Link href="/kunjungan" className="hover:underline">Kunjungan</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-600 mt-10 pt-6 text-center text-sm text-white">Copyright © 2025 - Unit Layanan Disabilitas UKDW. All rights reserved.</div>
    </footer>
  );
}
