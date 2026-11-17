import { useEffect } from "react";
import { Home } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/Card";
import { FawnMark } from "@/components/brand/FawnMark";
import { useI18n } from "@/i18n/LanguageProvider";

const NOT_FOUND_PATH = "/404";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);

    if (window.location.pathname.replace(/\/$/, "") !== NOT_FOUND_PATH) {
      window.location.replace(NOT_FOUND_PATH);
    }

    return () => robots.remove();
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-[440px] p-6 text-center" tape>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink/10 bg-[#FBE9CF]">
          <FawnMark className="h-11 w-11" />
        </span>
        <p className="mt-3 font-display text-[44px] font-extrabold leading-none text-fawn-deep">404</p>
        <h1 className="mt-1 font-display text-[20px] font-extrabold leading-tight">{t("notfound.title")}</h1>
        <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">{t("notfound.body")}</p>
        <button type="button" onClick={() => setLocation("/")} className="btn btn-primary mt-4">
          <Home size={14} strokeWidth={3} />
          {t("notfound.cta")}
        </button>
      </Card>
    </div>
  );
}
