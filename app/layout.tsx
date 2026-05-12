import AccessiBeScript from "@/components/AccessiBeScript";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import AppShell from "@/components/layouts/AppShell";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const fontMontserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ULD UKDW",
  description: "Unit Layanan Disabilitas UKDW",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="hydrated">
      <body className={`${fontMontserrat.className} antialiased`}>
        <div className="a11y-contrast-root">
          <AppShell>{children}</AppShell>
        </div>
        <AccessibilityToolbar />
        <AccessiBeScript />
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="cb-rg">
              <feColorMatrix type="matrix" values="\n                0.625 0.375 0     0 0\n                0.7   0.3   0     0 0\n                0     0.3   0.7   0 0\n                0     0     0     1 0" />
            </filter>
            <filter id="cb-by">
              <feColorMatrix type="matrix" values="\n                0.95   0.05   0      0 0\n                0      0.4333 0.5667 0 0\n                0      0.475  0.525  0 0\n                0      0      0      1 0" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
