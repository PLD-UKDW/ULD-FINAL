"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { isLoggedIn } from "@/lib/auth.client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const componentsTentang: { title: string; href: string; description?: string }[] = [
  { title: "Sejarah", href: "/sejarah" },
  { title: "Visi & Misi", href: "/visi-misi" },
  { title: "Struktur Organisasi", href: "/struktur-organisasi" },
  { title: "Tujuan & Sasaran", href: "/tujuan-sasaran" },
  { title: "Program Kerja", href: "/program-kerja" },
];

const componentsProsedur: { title: string; href: string }[] = [
  // { title: "SOP PMJD", href: "/sop-pmjd" },
  { title: "SOP Pendampingan", href: "/sop-pendampingan" },
  { title: "SOP Rekrutmen", href: "/sop-rekrutmen" },
  { title: "SOP Layak Etik", href: "/sop-layak-etik" },
];

const componentsLayanan: { title: string; href: string }[] = [
  { title: "Layanan Akademis", href: "/layanan-akademis" },
  { title: "Layanan Non-Akademis", href: "/layanan-non-akademis" },
];

const componentsBerita: { title: string; href: string }[] = [
  { title: "Statistik Mahasiswa", href: "/statistik-mahasiswa" },
  { title: "Berita Umum", href: "/berita-umum" },
];

export function NavigationMenuDemo() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");
  const [dashboardHref, setDashboardHref] = useState("/dashboard/camaba");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncAuthStatus = () => {
      const loginState = isLoggedIn();
      setLoggedIn(loginState);

      if (!loginState) {
        setProfileInitial("U");
        setDashboardHref("/dashboard/camaba");
        return;
      }

      const cookieRole = document.cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith("role="))
        ?.split("=")[1];

      const role = cookieRole || "";
      setProfileInitial(role ? role.charAt(0).toUpperCase() : "U");
      setDashboardHref(role === "ADMIN" ? "/admin/dashboard" : "/dashboard/camaba");
    };

    syncAuthStatus();
    window.addEventListener("storage", syncAuthStatus);
    window.addEventListener("auth-change", syncAuthStatus);

    return () => {
      window.removeEventListener("storage", syncAuthStatus);
      window.removeEventListener("auth-change", syncAuthStatus);
    };
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("popupShown");

    document.cookie = "authToken=; Max-Age=0; path=/";
    document.cookie = "role=; Max-Age=0; path=/";
    document.cookie = "authStage=; Max-Age=0; path=/";
    document.cookie = "pendingRegNumber=; Max-Age=0; path=/";

    window.dispatchEvent(new Event("auth-change"));
    setLoggedIn(false);
    setMobileOpen(false);
    router.replace("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#02a502] shadow z-50 font-sans">
      <div className="flex items-center justify-between px-9 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logouldup.png" alt="Logo ULD" width={40} height={40} className="h-auto w-auto scale-120 object-contain" />
          <div className="flex flex-col leading-tight text-white font-sans px-0.5">
            <span className="text-sm font-semibold">UNIT LAYANAN</span>
            <span className="text-sm font-semibold">DISABILITAS</span>
            <span className="text-sm font-semibold">UKDW</span>
          </div>
        </Link>

        <button className="min-[975px]:hidden flex items-center font-sans text-white" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className="hidden min-[975px]:flex flex-1 justify-center">
          <NavigationMenu viewport={false} className="flex justify-center">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tentang</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 p-4 animate-in fade-in-80 slide-in-from-top-5">
                  <ul className="grid w-65 gap-2">
                    {componentsTentang.map((c) => (
                      <li key={c.title}>
                        <NavigationMenuLink asChild>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium font-sans text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors duration-200">
                            {c.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Prosedur Operasional</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 p-4 animate-in fade-in-80 slide-in-from-top-5">
                  <ul className="grid w-70 gap-2">
                    {componentsProsedur.map((c) => (
                      <li key={c.title}>
                        <NavigationMenuLink asChild>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors duration-200">
                            {c.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Layanan</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 p-4 animate-in fade-in-80 slide-in-from-top-5">
                  <ul className="grid w-65 gap-2">
                    {componentsLayanan.map((c) => (
                      <li key={c.title}>
                        <NavigationMenuLink asChild>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors duration-200">
                            {c.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Berita</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 p-4 animate-in fade-in-80 slide-in-from-top-5">
                  <ul className="grid w-65 gap-2">
                    {componentsBerita.map((c) => (
                      <li key={c.title}>
                        <NavigationMenuLink asChild>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors duration-200">
                            {c.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/* <NavigationMenuItem>
                <NavigationMenuTrigger>PMJD</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200 p-4 animate-in fade-in-80 slide-in-from-top-5">
                  <ul className="grid w-[260px] gap-2">
                    {componentsPMJD.map((c) => (
                      <li key={c.title}>
                        <NavigationMenuLink asChild>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors duration-200">
                            {c.title}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="https://pmb.ukdw.ac.id/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:text-green-700 hover:bg-green-50 transition-colors duration-200">
                    PMB
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden min-[975px]:flex items-center gap-4">
          {loggedIn ? (
            <>
              <Link
                href={dashboardHref}
                aria-label="Kembali ke dashboard"
                title="Dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#108607] font-bold shadow hover:bg-[#e8f5e8] transition"
              >
                {profileInitial}
              </Link>
              <button onClick={handleLogout} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition" type="button">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#008000] shadow hover:bg-gray-100 transition">
              Login
            </Link>
          )}
        </div>
      </div>
      {mobileOpen && (
        <div className="min-[975px]:hidden bg-[#008000] px-6 pb-4">
          <ul className="flex flex-col gap-2">
            <li>
              <details>
                <summary className="cursor-pointer text-white py-2 px-2 rounded hover:bg-[#006400]">Tentang</summary>
                <ul className="pl-4">
                  {componentsTentang.map((c) => (
                    <li key={c.title}>
                      <Link href={c.href} className="block py-1 text-white hover:underline" onClick={() => setMobileOpen(false)}>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary className="cursor-pointer text-white py-2 px-2 rounded hover:bg-[#006400]">Prosedur Operasional</summary>
                <ul className="pl-4">
                  {componentsProsedur.map((c) => (
                    <li key={c.title}>
                      <Link href={c.href} className="block py-1 text-white hover:underline" onClick={() => setMobileOpen(false)}>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary className="cursor-pointer text-white py-2 px-2 rounded hover:bg-[#006400]">Layanan</summary>
                <ul className="pl-4">
                  {componentsLayanan.map((c) => (
                    <li key={c.title}>
                      <Link href={c.href} className="block py-1 text-white hover:underline" onClick={() => setMobileOpen(false)}>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary className="cursor-pointer text-white py-2 px-2 rounded hover:bg-[#006400]">Berita</summary>
                <ul className="pl-4">
                  {componentsBerita.map((c) => (
                    <li key={c.title}>
                      <Link href={c.href} className="block py-1 text-white hover:underline" onClick={() => setMobileOpen(false)}>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            {/* <li>
              <details>
                <summary className="cursor-pointer text-white py-2 px-2 rounded hover:bg-[#006400]">PMJD</summary>
                <ul className="pl-4">
                  {componentsPMJD.map((c) => (
                    <li key={c.title}>
                      <Link href={c.href} className="block py-1 text-white hover:underline">
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li> */}
            <li>
              <Link href="https://pmb.ukdw.ac.id/" className="block py-2 px-2 text-white rounded hover:bg-[#006400]" onClick={() => setMobileOpen(false)}>
                PMB
              </Link>
            </li>
            <li>
              {loggedIn ? (
                <div className="mt-2 space-y-2">
                  <Link href={dashboardHref} className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#108607] shadow hover:bg-gray-100 transition" onClick={() => setMobileOpen(false)}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#108607] text-white font-bold">{profileInitial}</span>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition text-left" type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#008000] shadow hover:bg-gray-100 transition mt-2" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
