import { useI18n } from "@/i18n/LanguageProvider";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border-2 border-line bg-card p-[3px] shadow-[0_2px_0_rgba(63,52,43,0.06)] ${className ?? ""}`}
      role="group"
      aria-label={t("aria.toggleLang")}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide transition ${
          lang === "en" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("fa")}
        aria-pressed={lang === "fa"}
        className={`rounded-full px-2.5 py-1 text-[12px] font-extrabold transition ${
          lang === "fa" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep"
        }`}
      >
        فا
      </button>
    </div>
  );
}
