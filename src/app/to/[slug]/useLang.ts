"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LANG, LANG_STORAGE_KEY, type Lang } from "@/config/i18n";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === "id" || saved === "en") setLangState(saved);
    } catch {
      // localStorage tidak tersedia (private mode dll) — diam saja, pakai default.
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // abaikan
    }
  }, []);

  return { lang, setLang };
}
