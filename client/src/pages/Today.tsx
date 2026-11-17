import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  Clock3,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/Card";
import { PageHeader, StatCard } from "@/components/PageHeader";
import { PackageBar } from "@/components/PackageBar";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { SparkleDoodle, SunDoodle } from "@/components/brand/Doodles";
import { Illustration } from "@/components/Illustration";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { softTint, tintVars } from "@/lib/palette";
import {
  classesForDay,
  findConflicts,
  lowPackageStudents,
  rollCallStats,
  sessionPhase,
  studentsInClass,
  weeklyLessonSlots,
} from "@/lib/selectors";
import {
  addDays,
  dateKey,
  dayIndexFromDate,
  formatDateLong,
  formatDuration,
  formatTime,
  minutesNow,
} from "@/lib/time";
import { remainingLessons } from "@/lib/types";
import type { ClassSession } from "@/lib/types";

const PHASE_STYLE = {
  live: { bg: "#E7F4E4", color: "#3F7A4B", dot: "#6BB47D" },
  upcoming: { bg: "#FBF1DF", color: "#8A6636", dot: "#E0A959" },
  done: { bg: "#F1EBE0", color: "#8B7C6C", dot: "#B9A894" },
};

function TimelineRow({
  cls,
  index,
  date,
  phase,
}: {
  cls: ClassSession;
  index: number;
  date: Date;
  phase: "live" | "upcoming" | "done";
}) {
  const { t, tr, n, lang } = useI18n();
  const { data } = useStudio();
  const teacher = data.teachers.find((x) => x.id === cls.teacherId);
  const room = data.rooms.find((x) => x.id === cls.roomId);
  const roster = studentsInClass(data.students, cls.id);
  const stats = rollCallStats(data.students, data.attendance, cls.id, dateKey(date));
  const style = PHASE_STYLE[phase];
  const [timePart, suffix] = formatTime(cls.start, lang).split(" ");
  const complete = stats.total > 0 && stats.marked === stats.total;

  return (
    <li className="relative flex gap-3 sm:gap-4" style={{ ...tintVars(cls.tint), ["--i" as string]: index }}>
      <div className="relative z-10 flex w-[58px] shrink-0 flex-col items-center">
        <div
          className="flex h-[56px] w-[56px] flex-col items-center justify-center rounded-full border-2 bg-card text-center shadow-[0_2px_0_rgba(63,52,43,0.07)]"
          style={{ borderColor: phase === "live" ? style.dot : "var(--color-line)" }}
        >
          <span className="font-display text-[13px] font-extrabold leading-none">{timePart}</span>
          {suffix && (
            <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-ink-soft">{suffix}</span>
          )}
          <span className="mt-0.5 text-[8.5px] font-bold text-ink-soft">
            {formatDuration(cls.end - cls.start, lang)}
          </span>
        </div>
        {phase === "live" && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#E7F4E4] px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wide text-[#3F7A4B]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6BB47D]" />
            {t("home.now")}
          </span>
        )}
      </div>

      <Card
        alt={index % 2 === 1}
        className="rise-in mb-3 flex-1 overflow-hidden p-0"
        style={{ ["--i" as string]: index }}
      >
        <div className="flex items-stretch">
          <div
            className="w-[7px] shrink-0 border-e-2"
            style={{ background: `var(--tint)`, borderColor: `var(--tint-deep)` }}
          />
          <div className="min-w-0 flex-1 p-3.5 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <div className="min-w-0">
                <h3 className="truncate font-display text-[16.5px] font-extrabold leading-tight sm:text-[18px]">
                  {tr(cls.name)}
                </h3>
                <p className="mt-0.5 text-[11px] font-bold text-ink-soft">
                  {formatTime(cls.start, lang)} – {formatTime(cls.end, lang)}
                  <span className="mx-1.5 opacity-40">·</span>
                  {tr(cls.level)}
                  <span className="mx-1.5 opacity-40">·</span>
                  {n(cls.ageMin)}–{n(cls.ageMax)} {t("common.years")}
                </p>
              </div>
              <span
                className="pill shrink-0 text-[10px]"
                style={{ background: style.bg, color: style.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.dot }} />
                {t(phase === "live" ? "home.live" : phase === "done" ? "home.done" : "home.upcoming")}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-ink-soft">
              {teacher && (
                <span className="inline-flex items-center gap-1.5">
                  <AnimalAvatar animal={teacher.animal} tint={teacher.tint} size={20} ring={false} />
                  {tr(teacher.name)}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} strokeWidth={2.6} />
                {room ? tr(room.name) : ""}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users size={12} strokeWidth={2.6} />
                {n(roster.length)} {t("common.students")}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[13px] border-2 border-dashed border-line/90 bg-paper/70 px-2.5 py-2">
              <div className="min-w-[140px] flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink-soft">
                    {t("home.rollcallLabel")}
                  </span>
                  <span className="text-[10px] font-extrabold text-ink-soft">
                    {t("home.marked", { done: n(stats.marked), total: n(stats.total) })}
                  </span>
                </div>
                <div className="progress-track" style={{ height: 7 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.total ? (stats.marked / stats.total) * 100 : 0}%`,
                      backgroundColor: complete ? "#7BBE8C" : "var(--tint-deep)",
                    }}
                  />
                </div>
              </div>
              <Link
                href={`/roll-call/${cls.id}`}
                className={`btn btn-sm ${complete ? "btn-ghost" : "btn-primary"}`}
              >
                {complete ? <CheckCheck size={13} strokeWidth={3} /> : <Clock3 size={13} strokeWidth={3} />}
                {complete ? t("home.rollcallDone") : t("home.rollcall")}
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </li>
  );
}

export default function Today() {
  const { t, tr, n, lang } = useI18n();
  const { data, renewPackage } = useStudio();
  const now = new Date();
  const todayIdx = dayIndexFromDate(now);
  const todayClasses = useMemo(() => classesForDay(data.classes, todayIdx), [data.classes, todayIdx]);
  const closed = todayClasses.length === 0;

  const offsetToOpen = useMemo(() => {
    if (!closed) return 0;
    for (let i = 1; i <= 7; i += 1) {
      const idx = (todayIdx + i) % 7;
      if (classesForDay(data.classes, idx).length > 0) return i;
    }
    return 0;
  }, [closed, data.classes, todayIdx]);

  const shownDate = closed ? addDays(now, offsetToOpen) : now;
  const shownIdx = closed ? dayIndexFromDate(shownDate) : todayIdx;
  const shownClasses = useMemo(() => classesForDay(data.classes, shownIdx), [data.classes, shownIdx]);

  const conflicts = useMemo(() => findConflicts(data.classes), [data.classes]);
  const lowStudents = useMemo(() => lowPackageStudents(data.students), [data.students]);
  const lessonSlots = useMemo(() => weeklyLessonSlots(data.students, data.classes), [data.students, data.classes]);

  const greetingKey =
    minutesNow(now) < 12 ? "home.greeting.morning" : minutesNow(now) < 17 ? "home.greeting.afternoon" : "home.greeting.evening";

  const liveClass = shownClasses.find((c) => sessionPhase(c, shownDate, now) === "live");
  const quickClass = liveClass ?? shownClasses.find((c) => sessionPhase(c, shownDate, now) === "upcoming");

  return (
    <div>
      <PageHeader
        eyebrow={formatDateLong(now, lang)}
        title={closed ? t("home.closed.title") : t("home.title")}
        subtitle={
          closed
            ? t("home.closed.body")
            : t("home.subtitle", { count: n(todayClasses.length) })
        }
        actions={
          <>
            <span className="sticker text-[11px]">
              <SunDoodle className="h-4 w-4" />
              {greetingKey === "home.greeting.morning"
                ? t("home.greeting.morning")
                : greetingKey === "home.greeting.afternoon"
                  ? t("home.greeting.afternoon")
                  : t("home.greeting.evening")}
            </span>
            {quickClass && !closed && (
              <Link href={`/roll-call/${quickClass.id}`} className="btn btn-primary btn-sm">
                <Sparkles size={13} strokeWidth={2.8} />
                {t("home.rollcall")}
              </Link>
            )}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard
          index={0}
          label={t("home.stat.students")}
          value={n(data.students.length)}
          hint={`${n(data.classes.length)} ${t("common.classes")}`}
          tint="#F7C2CE"
          icon={<Users size={14} strokeWidth={2.8} />}
        />
        <StatCard
          index={1}
          label={t("home.stat.today")}
          value={n(todayClasses.length)}
          hint={closed ? t("home.closed.next") : `${n(lessonSlots)} ${t("common.lessons")}`}
          tint="#FBE3AE"
          icon={<Clock3 size={14} strokeWidth={2.8} />}
        />
        <StatCard
          index={2}
          label={t("home.stat.week")}
          value={n(lessonSlots)}
          hint={t("home.stat.weekHint", { n: n(data.classes.length) })}
          tint="#BCD9EF"
          icon={<Sparkles size={14} strokeWidth={2.8} />}
        />
        <StatCard
          index={3}
          label={t("home.stat.low")}
          value={n(lowStudents.length)}
          hint={t("home.stat.emptyHint", {
            n: n(lowStudents.filter((s) => remainingLessons(s) === 0).length),
          })}
          tint="#FBD9B6"
          icon={<RefreshCw size={14} strokeWidth={2.8} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_326px]">
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[19px] font-extrabold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-card">
                <Clock3 size={14} strokeWidth={2.8} />
              </span>
              {closed ? t("home.closed.next") : t("home.timeline")}
              <span className="text-[11px] font-bold text-ink-soft">
                {closed ? formatDateLong(shownDate, lang) : ""}
              </span>
            </h2>
            <Link href="/timetable" className="text-[11px] font-extrabold text-fawn-deep hover:underline">
              {t("common.thisWeek")}
            </Link>
          </div>

          {closed && (
            <Card className="mb-4 overflow-hidden p-0" tape>
              <div className="grid sm:grid-cols-[190px_1fr]">
                <Illustration
                  src="/manus-storage/async-images/yTmHw9m4gVn9bNoxXQNRRz/image-2.webp"
                  className="h-full max-h-[190px] w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-soft">
                    {t("home.closed.next")}
                  </p>
                  <p className="mt-1 font-display text-[22px] font-extrabold leading-tight">
                    {formatDateLong(shownDate, lang)}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-ink-soft">
                    {t("home.subtitle", { count: n(shownClasses.length) })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {shownClasses.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="pill text-[10px]"
                        style={{ background: softTint(c.tint), color: "#5a4a3b" }}
                      >
                        {formatTime(c.start, lang)} · {tr(c.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="relative">
            <div className="timeline-line" />
            <ul className="relative space-y-0">
              {shownClasses.map((cls, index) => (
                <TimelineRow
                  key={cls.id}
                  cls={cls}
                  index={index}
                  date={shownDate}
                  phase={closed ? "upcoming" : sessionPhase(cls, shownDate, now)}
                />
              ))}
            </ul>
            {shownClasses.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-sm font-bold text-ink-soft">{t("home.noClasses")}</p>
              </Card>
            )}
          </div>
        </section>

        <aside className="space-y-3.5">
          <Card className="relative overflow-hidden p-4" alt>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#E7C79A] bg-[#FBE3AE]">
                <AlertTriangle size={14} strokeWidth={2.8} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[16px] font-extrabold leading-tight">{t("home.clash.title")}</h3>
                <p className="mt-0.5 text-[11.5px] font-semibold leading-relaxed text-ink-soft">
                  {conflicts.length > 0
                    ? t("home.clash.body", { count: n(conflicts.length) })
                    : t("home.clash.none")}
                </p>
              </div>
            </div>

            {conflicts.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {conflicts.slice(0, 3).map((conflict, i) => (
                  <li
                    key={`${conflict.a.id}-${conflict.b.id}-${i}`}
                    className="rounded-[11px] border-2 border-dashed border-[#E7C79A]/80 bg-[#FDF3E1] px-2.5 py-1.5"
                  >
                    <p className="text-[10.5px] font-extrabold leading-snug text-ink">
                      {tr(conflict.a.name)} × {tr(conflict.b.name)}
                    </p>
                    <p className="text-[10px] font-semibold text-ink-soft">
                      {t(`weekday.${conflict.a.day}`)} ·{" "}
                      {t("timetable.clash.window", {
                        from: formatTime(conflict.from, lang),
                        to: formatTime(conflict.to, lang),
                      })}
                      {" · "}
                      {t(
                        conflict.kind === "room"
                          ? "timetable.clash.room"
                          : conflict.kind === "teacher"
                            ? "timetable.clash.teacher"
                            : "timetable.clash.both",
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/timetable" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-fawn-deep hover:underline">
              {t("home.clash.cta")}
              <ArrowRight size={12} strokeWidth={3} className="rtl:rotate-180" />
            </Link>
            <SparkleDoodle className="pointer-events-none absolute -end-3 -top-3 h-9 w-9 opacity-30" />
          </Card>

          <Card className="p-4" tapeRight>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-[16px] font-extrabold leading-tight">{t("home.nudge.title")}</h3>
                <p className="text-[11px] font-semibold text-ink-soft">{t("home.nudge.body")}</p>
              </div>
              <Link
                href="/students?package=renew"
                className="shrink-0 text-[10.5px] font-extrabold text-fawn-deep hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            </div>

            <ul className="mt-2.5 space-y-2">
              {lowStudents.slice(0, 4).map((student) => {
                const left = remainingLessons(student);
                return (
                  <li key={student.id} className="flex items-center gap-2">
                    <Link href={`/students/${student.id}`} className="shrink-0">
                      <AnimalAvatar animal={student.animal} tint={student.tint} size={34} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/students/${student.id}`}
                        className="block truncate text-[11.5px] font-extrabold leading-tight hover:text-fawn-deep"
                      >
                        {tr(student.name)}
                      </Link>
                      <div className="mt-1">
                        <PackageBar remaining={left} size="sm" showLabel={false} showTicks={false} />
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-[10px] font-extrabold text-ink-soft">
                        {t("home.nudge.left", { n: n(left) })}
                      </p>
                      <button
                        type="button"
                        onClick={() => renewPackage(student.id)}
                        className="mt-0.5 text-[10px] font-extrabold text-fawn-deep hover:underline"
                      >
                        {t("common.renewShort")}
                      </button>
                    </div>
                  </li>
                );
              })}
              {lowStudents.length === 0 && (
                <li className="rounded-[11px] border-2 border-dashed border-line bg-paper/70 px-3 py-3 text-center text-[11px] font-bold text-ink-soft">
                  {t("home.nudge.empty")}
                </li>
              )}
            </ul>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink/10 bg-[#C4E4C0]">
                <Users size={16} strokeWidth={2.8} />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-extrabold leading-tight">{t("home.stat.students")}</p>
                <p className="text-[10px] font-semibold text-ink-soft">
                  {n(data.students.length)} {t("common.students")} · {n(data.teachers.length)}{" "}
                  {t("studio.teachers")}
                </p>
              </div>
              <Link href="/students" className="btn btn-ghost btn-sm">
                {t("common.open")}
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
