"use client";

import { useEffect, useState } from "react";

const TTS_RATE_KEY = "tts:rate";
const TTS_RATE_EVENT = "tts:rate-change";

function normalizeRate(value: number, fallback: number): number {
  if (Number.isNaN(value)) return fallback;
  return Math.min(2, Math.max(0.5, value));
}

export function getStoredTtsRate(fallback = 1): number {
  if (typeof window === "undefined") return fallback;
  const raw = Number(localStorage.getItem(TTS_RATE_KEY) ?? fallback);
  return normalizeRate(raw, fallback);
}

export function setStoredTtsRate(rate: number): number {
  const normalized = normalizeRate(rate, 1);

  if (typeof window === "undefined") return normalized;

  localStorage.setItem(TTS_RATE_KEY, String(normalized));
  window.dispatchEvent(new CustomEvent(TTS_RATE_EVENT, { detail: { rate: normalized } }));

  return normalized;
}

export function useTtsRate(defaultRate = 1): [number, (updater: number | ((prev: number) => number)) => number] {
  const [rate, setRate] = useState<number>(defaultRate);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setRate(getStoredTtsRate(defaultRate));

    const syncRate = () => {
      setRate(getStoredTtsRate(defaultRate));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== TTS_RATE_KEY) return;
      syncRate();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(TTS_RATE_EVENT, syncRate as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TTS_RATE_EVENT, syncRate as EventListener);
    };
  }, [defaultRate]);

  const updateRate = (updater: number | ((prev: number) => number)) => {
    const current = getStoredTtsRate(defaultRate);
    const next = typeof updater === "function" ? (updater as (prev: number) => number)(current) : updater;
    const normalized = setStoredTtsRate(next);
    setRate(normalized);
    return normalized;
  };

  return [rate, updateRate];
}
