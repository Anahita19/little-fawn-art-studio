import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Bilingual, Lang } from "@/lib/types";
import { faDigits, formatNumber } from "@/lib/time";
import { dict } from "./dictionary";

const STORAGE_KEY = "littlefawn:lang";

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tr: (value: Bilingual | undefined) => string;
  n: (value: number) => string;
  num: (value: string | number) => string;
  classes: (value: number) => string;
  lessons: (value: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "fa" || param === "en") return param;
  } catch {
    /* ignore */
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fa" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const dir: "ltr" | "rtl" = lang === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = lang === "fa" ? "استودیو هنری بچه‌آهو" : "Little Fawn Art Studio";
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((prev) => (prev === "en" ? "fa" : "en")), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = dict[key];
      let text = entry ? entry[lang] : key;
      if (vars) {
        Object.entries(vars).forEach(([name, value]) => {
          text = text.split(`{${name}}`).join(String(value));
        });
      }
      return text;
    },
    [lang],
  );

  const tr = useCallback((value: Bilingual | undefined) => (value ? value[lang] : ""), [lang]);
  const n = useCallback((value: number) => formatNumber(value, lang), [lang]);
  const num = useCallback((value: string | number) => (lang === "fa" ? faDigits(value) : String(value)), [lang]);
  const classes = useCallback(
    (value: number) =>
      lang === "fa"
        ? `${faDigits(value)} کلاس`
        : `${value} ${value === 1 ? "class" : "classes"}`,
    [lang],
  );
  const lessons = useCallback(
    (value: number) =>
      lang === "fa"
        ? `${faDigits(value)} جلسه`
        : `${value} ${value === 1 ? "lesson" : "lessons"}`,
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, setLang, toggleLang, t, tr, n, num, classes, lessons }),
    [lang, dir, setLang, toggleLang, t, tr, n, num, classes, lessons],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
