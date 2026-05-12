"use client";

import Footer from "@/components/layouts/Footer";
import { NavigationMenuDemo } from "@/components/layouts/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const LOGIN_SHORTCUT_PATHS = new Set([
  "/program-kerja",
  "/sejarah",
  "/struktur-organisasi",
  "/tujuan-sasaran",
  "/visi-misi",
  "/sop-layak-etik",
  "/sop-pendampingan",
  "/sop-pmjd",
  "/sop-rekrutmen",
  "/digitalisasi-buku",
  "/layanan-akademis",
  "/layanan-konseling",
  "/layanan-non-akademis",
  "/layanan-teknologi-bantu",
  "/request-pendamping",
  "/tutorial",
  "/volunteer",
  "/berita-umum",
  "/statistik-mahasiswa",
]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget = target?.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";

      if (isTypingTarget) return;
      if (event.key.toLowerCase() !== "j") return;
      if (!LOGIN_SHORTCUT_PATHS.has(pathname)) return;

      event.preventDefault();
      router.push("/login");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return (
    <div className="min-h-dvh flex flex-col">
      <NavigationMenuDemo />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
