"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, FileText, Home, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const [openInput, setOpenInput] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("popupShown"); // Reset popup flag saat logout
    window.location.href = "/login";
  };

  return (
    <aside className="sticky top-0 min-h-screen w-64 self-stretch flex-shrink-0 bg-[#108607] text-white shadow-xl flex flex-col">
      <Image src="/logo/logould.png" width={100} height={100} alt="Logo" className="invert brightness-0 items-center mx-auto mb-4 mt-24 sm:mt-28" />
      <div className="p-6 border-b border-white/20 text-center text-xl font-bold">ULD UKDW</div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <Link href="/admin/dashboard" className={clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition", pathname === "/dashboard" ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/10")}>
          <Home className="w-5 h-5" />
          Dashboard
        </Link>

        <div>
          <button
            onClick={() => setOpenInput(!openInput)}
            className={clsx("flex items-center justify-between w-full px-4 py-3 rounded-lg transition", pathname.startsWith("/dashboard/input") ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/10")}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Input
            </div>
            {openInput ? <ChevronUp /> : <ChevronDown />}
          </button>

          {openInput && (
            <div className="ml-10 mt-2 space-y-2">
              <Link href="/admin/dashboard/input/berita" className={clsx("block px-3 py-2 rounded-md text-sm transition", pathname === "/dashboard/input/berita" ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/20")}>
                Berita
              </Link>

              <Link href="/admin/dashboard/input/mahasiswa" className={clsx("block px-3 py-2 rounded-md text-sm transition", pathname === "/dashboard/input/mahasiswa" ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/20")}>
                Data Mahasiswa
              </Link>

              <Link
                href="/admin/dashboard/input/kategori-disabilitas"
                className={clsx("block px-3 py-2 rounded-md text-sm transition", pathname === "/dashboard/input/kategori-disabilitas" ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/20")}
              >
                Kategori Disabilitas
              </Link>
              <Link href="/admin/dashboard/input/pmjd" className={clsx("block px-3 py-2 rounded-md text-sm transition", pathname === "/dashboard/input/mahasiswa" ? "bg-white text-[#108607] font-semibold" : "hover:bg-white/20")}>
                Soal Tes
              </Link>
            </div>
          )}
        </div>
      </nav>

      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 text-white bg-red-600 hover:bg-red-700 transition">
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}