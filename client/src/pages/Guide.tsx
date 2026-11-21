import { Link } from "wouter";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Heart,
  KeyRound,
  Palette,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Card } from "@/components/Card";
import { PageHeader, StatCard } from "@/components/PageHeader";
import { FawnMark } from "@/components/brand/FawnMark";
import { SparkleDoodle } from "@/components/brand/Doodles";
import { useI18n } from "@/i18n/LanguageProvider";

const FEATURE_CARDS = [
  { key: "reports", icon: BarChart3, tint: "#DCC9F0", href: "/reports" },
  { key: "schedule", icon: CalendarDays, tint: "#BCD9EF", href: "/timetable" },
  { key: "students", icon: UsersRound, tint: "#F7C2CE", href: "/students" },
  { key: "attendance", icon: ClipboardCheck, tint: "#C4E4C0", href: "/roll-call/c-little-hands-a" },
  { key: "access", icon: KeyRound, tint: "#FBE3AE", href: "/users" },
  { key: "storybook", icon: Palette, tint: "#FBE9CF", href: "/" },
] as const;

const GUIDE_SECTIONS = [
  { key: "tour", icon: BookOpen },
  { key: "rules", icon: CircleDollarSign },
  { key: "roles", icon: KeyRound },
  { key: "motion", icon: Sparkles },
] as const;

export default function Guide() {
  const { t, n } = useI18n();

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[30px] border-2 border-line bg-[#FFF4D9] p-5 shadow-[0_8px_0_rgba(63,52,43,0.06)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -end-8 -top-10 h-44 w-44 rounded-full bg-[#F7C2CE]/55 blur-[1px]" />
        <div className="pointer-events-none absolute -bottom-16 start-1/3 h-40 w-40 rounded-full bg-[#BCD9EF]/45" />
        <SparkleDoodle className="absolute end-7 top-7 h-8 w-8 opacity-70" stroke="#D79242" />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-line bg-card px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">
              <span className="h-2 w-2 rounded-full bg-[#79B982]" />
              {t("guide.release")}
            </div>
            <h1 className="font-display text-[30px] font-extrabold leading-[1.12] sm:text-[44px]">
              <span className="crayon-underline">{t("guide.hero.title")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[13px] font-semibold leading-relaxed text-ink-soft sm:text-[15px]">{t("guide.hero.body")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/reports" className="btn btn-primary"><BarChart3 size={15} />{t("guide.hero.cta")}</Link>
              <a href="#documentation" className="btn btn-ghost"><FileText size={15} />{t("guide.hero.docs")}</a>
            </div>
          </div>
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-[36px] border-2 border-line bg-card shadow-[0_6px_0_rgba(63,52,43,0.08)] sm:h-48 sm:w-48">
            <div className="absolute -start-5 -top-5 rotate-[-9deg] rounded-[10px] border-2 border-line bg-[#C4E4C0] px-2.5 py-1 text-[10px] font-extrabold shadow-[0_3px_0_rgba(63,52,43,0.08)]">{t("guide.hero.sticker")}</div>
            <FawnMark className="h-28 w-28 sm:h-36 sm:w-36" title={t("app.name")} />
            <Heart className="absolute -bottom-3 -end-4 rotate-12 text-[#E79BAB]" size={28} fill="#F7C2CE" />
          </div>
        </div>
      </section>

      <PageHeader eyebrow={t("guide.eyebrow")} title={t("guide.features.title")} subtitle={t("guide.features.subtitle")} underline="mint" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FEATURE_CARDS.map(({ key, icon: Icon, tint, href }, index) => (
          <Link key={key} href={href} className="group">
            <Card className="h-full p-4 transition-transform duration-300 group-hover:-translate-y-1" style={{ ["--i" as string]: index }}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[13px] border-2 border-ink/10" style={{ background: tint }}><Icon size={19} /></span>
                <ArrowUpRight className="text-ink-soft transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={17} />
              </div>
              <h2 className="mt-4 font-display text-[18px] font-extrabold">{t(`guide.feature.${key}.title`)}</h2>
              <p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-ink-soft">{t(`guide.feature.${key}.body`)}</p>
              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-fawn-deep">{t("guide.open")}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <StatCard label={t("guide.stat.students")} value={n(120)} hint={t("guide.stat.studentsHint")} tint="#F7C2CE" icon={<UsersRound size={15} />} index={0} />
        <StatCard label={t("guide.stat.teachers")} value={n(5)} hint={t("guide.stat.teachersHint")} tint="#C4E4C0" icon={<Heart size={15} />} index={1} />
        <StatCard label={t("guide.stat.package")} value="$400" hint={t("guide.stat.packageHint")} tint="#FBE3AE" icon={<CircleDollarSign size={15} />} index={2} />
      </div>

      <div id="documentation" className="mt-8 scroll-mt-6">
        <PageHeader eyebrow={t("guide.docs.eyebrow")} title={t("guide.docs.title")} subtitle={t("guide.docs.subtitle")} />
        <div className="grid gap-3 md:grid-cols-2">
          {GUIDE_SECTIONS.map(({ key: sectionKey, icon: Icon }) => (
            <Card key={sectionKey} className="p-4 sm:p-5" tape={sectionKey === "tour"} tapeRight={sectionKey === "roles"}>
              <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-2 border-line bg-[#FFF8EA]"><Icon size={17} /></span><div className="min-w-0"><h2 className="font-display text-[17px] font-extrabold">{t(`guide.doc.${sectionKey}.title`)}</h2><p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-ink-soft">{t(`guide.doc.${sectionKey}.body`)}</p></div></div>
              <ul className="mt-4 space-y-2 border-t-2 border-dashed border-line pt-3">{[1, 2, 3].map((item) => <li key={item} className="flex gap-2 text-[11px] font-bold text-ink-soft"><CheckCircle2 className="mt-0.5 shrink-0 text-[#6DA577]" size={14} />{t(`guide.doc.${sectionKey}.item${item}`)}</li>)}</ul>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-7 overflow-hidden p-0" alt>
        <div className="grid items-center gap-4 p-5 sm:grid-cols-[1fr_auto] sm:p-7"><div><p className="font-display text-xl font-extrabold">{t("guide.footer.title")}</p><p className="mt-1.5 max-w-xl text-[12px] font-semibold leading-relaxed text-ink-soft">{t("guide.footer.body")}</p></div><Link href="/" className="btn btn-ink shrink-0"><Sparkles size={15} />{t("guide.footer.cta")}</Link></div>
      </Card>
    </div>
  );
}
