import { BarChart3, CalendarDays, Palette, Sun, UserCog, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { FawnMark, Wordmark } from "@/components/brand/FawnMark";
import { SparkleDoodle } from "@/components/brand/Doodles";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Illustration } from "@/components/Illustration";
import { useI18n } from "@/i18n/LanguageProvider";
import { useStudio } from "@/data/studio";

const NAV = [
  { path: "/", key: "nav.today", icon: Sun, tint: "#FBE3AE" },
  { path: "/timetable", key: "nav.timetable", icon: CalendarDays, tint: "#BCD9EF" },
  { path: "/students", key: "nav.students", icon: Users, tint: "#F7C2CE" },
  { path: "/reports", key: "nav.reports", icon: BarChart3, tint: "#DCC9F0" },
  { path: "/studio", key: "nav.studio", icon: Palette, tint: "#C4E4C0" },
  { path: "/users", key: "nav.users", icon: UserCog, tint: "#DCC9F0", adminOnly: true },
];

function useActive(path: string) {
  const [location] = useLocation();
  if (path === "/") return location === "/";
  return location.startsWith(path);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
        const active = useActive(item.path);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onNavigate}
            className="nav-pill"
            data-active={active}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-ink/10"
              style={{ background: item.tint }}
            >
              <Icon size={16} strokeWidth={2.4} />
            </span>
            <span className="flex-1">{t(item.key)}</span>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-fawn-deep" />}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  const { t, n } = useI18n();
  const { data } = useStudio();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-block-0 inset-inline-start-0 z-20 hidden w-[268px] flex-col border-e-2 border-dashed border-line bg-[#fbf3e4]/80 px-4 py-5 backdrop-blur-sm lg:flex">
      <div className="flex items-center gap-2.5 px-1">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink/10 bg-[#FBE9CF]">
          <FawnMark className="h-8 w-8" title={t("app.name")} />
        </span>
        <div className="flex-1">
          <Wordmark className="block" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 px-1">
        <span className="pill bg-[#E9F1D8] text-[10px] text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7BBE8C]" />
          {t("app.term")}
        </span>
        <span className="pill bg-white/70 text-[10px] text-ink-soft">
          {n(data.students.length)} {t("common.students")}
        </span>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pb-3">
        <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink-soft/80">
          {t("nav.menu")}
        </p>
        <NavList />
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-[18px] border-2 border-line bg-card px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-line bg-[#DCC9F0]/70 text-[12px] font-extrabold">
              {(user?.name || user?.email || "L").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-extrabold text-ink">{user?.name || user?.email}</p>
              <p className="truncate text-[9px] font-semibold text-ink-soft">{user?.role === "admin" ? t("auth.admin") : user?.role === "teacher" ? t("auth.teacher") : t("auth.team")}</p>
            </div>
            <button type="button" className="text-[9px] font-extrabold text-ink-soft underline decoration-dashed underline-offset-2" onClick={() => void logout()}>
              {t("auth.signOut")}
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[18px] border-2 border-line bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
                {t("nav.language")}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">English · فارسی</p>
            </div>
            <LanguageToggle />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border-2 border-line bg-[#FBE9CF]/60">
          <Illustration
            src="/manus-storage/async-images/yTmHw9m4gVn9bNoxXQNRRz/image-1.webp"
            className="h-[112px] w-full object-cover"
          />
          <SparkleDoodle className="absolute end-2 top-2 h-5 w-5 opacity-70" />
          <p className="border-t-2 border-line/70 px-3 py-2 text-[11px] font-bold leading-snug text-ink-soft">
            {t("app.tagline")}
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-dashed border-line bg-paper/90 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink/10 bg-[#FBE9CF]">
          <FawnMark className="h-7 w-7" title={t("app.name")} />
        </span>
        <Wordmark className="block flex-1" />
        <LanguageToggle />
      </div>
    </header>
  );
}

function MobileNav() {
  const { t } = useI18n();
  const { user } = useAuth();
  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === "admin");
  return (
    <nav className="fixed inset-inline-0 bottom-0 z-30 border-t-2 border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className={`grid ${visibleNav.length >= 6 ? "grid-cols-6" : visibleNav.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {visibleNav.map((item) => {
          const active = useActive(item.path);
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-extrabold ${
                  active ? "text-ink" : "text-ink-soft"
                }`}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-[11px] border-2 transition"
                  style={{
                    background: active ? item.tint : "transparent",
                    borderColor: active ? "rgba(63,52,43,0.16)" : "transparent",
                  }}
                >
                  <Icon size={17} strokeWidth={2.4} />
                </span>
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { loading, user } = useAuth();
  const studio = useStudio();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-5">
        <div className="card paper-dots w-full max-w-sm p-8 text-center">
          <FawnMark className="mx-auto h-16 w-16" title={t("app.name")} />
          <p className="mt-4 font-display text-xl font-extrabold">{t("auth.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="wash" />
        <div className="paper-grain" />
        <div className="card relative z-10 w-full max-w-md overflow-hidden p-7 text-center sm:p-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-line bg-[#FBE9CF]">
            <FawnMark className="h-14 w-14" title={t("app.name")} />
          </span>
          <Wordmark className="mx-auto mt-4" />
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">{t("auth.signIn.title")}</h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] font-semibold leading-relaxed text-ink-soft">{t("auth.signIn.body")}</p>
          <button type="button" className="btn btn-primary mt-6 w-full" onClick={() => startLogin()}>
            {t("auth.signIn.cta")}
          </button>
          <p className="mt-3 text-[10px] font-bold text-ink-soft">{t("auth.signIn.note")}</p>
          <div className="mt-5 flex justify-center"><LanguageToggle /></div>
        </div>
      </div>
    );
  }

  if (studio.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-5">
        <div className="card relative z-10 w-full max-w-sm p-8 text-center">
          <FawnMark className="mx-auto h-16 w-16" title={t("app.name")} />
          <p className="mt-4 font-display text-xl font-extrabold">{t("auth.databaseLoading")}</p>
        </div>
      </div>
    );
  }

  if (studio.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-5">
        <div className="card relative z-10 w-full max-w-sm p-8 text-center">
          <FawnMark className="mx-auto h-16 w-16" title={t("app.name")} />
          <p className="mt-4 font-display text-xl font-extrabold">{t("auth.databaseError")}</p>
          <p className="mt-2 text-[12px] font-semibold leading-relaxed text-ink-soft">{String(studio.error instanceof Error ? studio.error.message : "")}</p>
          <button type="button" className="btn btn-primary mt-5" onClick={studio.retry}>{t("auth.retry")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="wash" />
      <div className="paper-grain" />
      <Sidebar />
      <MobileHeader />
      <main className="relative z-10 pb-24 lg:ps-[268px] lg:pb-10">
        <div className="mx-auto w-full max-w-[1340px] px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
          <div key={location} className="story-page">
            {children}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
