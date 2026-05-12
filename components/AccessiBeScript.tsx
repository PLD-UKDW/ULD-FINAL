"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    acsbJS?: {
      init?: () => void;
    };
  }
}

const ACSB_SCRIPT_ID = "acsb-external-script";

function removeAcsbNodes() {
  if (typeof document === "undefined") return;

  const selectors = [
    `script#${ACSB_SCRIPT_ID}`,
    "iframe[src*='acsbapp.com']",
    "[id*='acsb']",
    "[class*='acsb']",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.parentNode?.removeChild(node);
    });
  });
}

export default function AccessiBeScript() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      removeAcsbNodes();
      return;
    }

    const existingScript = document.getElementById(ACSB_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.acsbJS?.init) {
        window.acsbJS.init();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = ACSB_SCRIPT_ID;
    script.src = "https://acsbapp.com/apps/app/dist/js/app.js";
    script.async = true;
    script.onload = () => {
      try {
        window.acsbJS?.init?.();
      } catch {}
    };

    (document.head || document.body).appendChild(script);

    return () => {
      if (isAdminRoute) {
        removeAcsbNodes();
      }
    };
  }, [isAdminRoute]);

  return null;
}
