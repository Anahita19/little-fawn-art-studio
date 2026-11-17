import { useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCheck, Clock3, Eraser, MapPin, Sparkles, Users, X } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { PackageBar } from "@/components/PackageBar";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { softTint, tintVars } from "@/lib/palette";
import { attendanceFor, studentsInClass } from "@/lib/selectors";
import { dateKey, formatTime, parseDateKey } from "@/lib/time";
import { remainingLessons, type AttendanceStatus } from "@/lib/types";
import NotFound from "./NotFound";

const STATUS_STYLE: Record<AttendanceStatus, { bg: string; color: string; border: string }> = {
  present: { bg: "#E7F4E4", color: "#3F7A4B", border: "#9ED0A8" },
  late: { bg: "#FDEBD6", color: "#A85F16", border: "#EBC186" },
  absent: { bg: "#FBE0DB", color: "#A33E33", border: "#EDB1A7" },
};

const STAMPS: { status: AttendanceStatus; icon: typeof Check; key: string }[] = [
  { status: "present", icon: Check, key: "rollcall.present" },
  { status: "late", icon: Clock3, key: "rollcall.late" },
  { status: "absent", icon: X, key: "rollcall.absent" },
];

export default function RollCall() {
  const { classId } = useParams<{ classId: string }>();
  const [, navigate] = useLocation();
  const { t, tr, n, lang } = useI18n();
  const { data, markAttendance, markMany, clearClass } = useStudio();
  const [date, setDate] = useState(() => dateKey(new Date()));

  const cls = data.classes.find((c) => c.id === classId);

  const roster = useMemo(() => {
    if (!cls) return [];
    return studentsInClass(data.students, cls.id).sort((a, b) =>
      a.name[lang].localeCompare(b.name[lang], lang === "fa" ? "fa" : "en"),
    );
  }, [cls, data.students, lang]);

  const marked = roster.filter((s) => attendanceFor(data.attendance, cls?.id ?? "", date, s.id));
  const presentCount = roster.filter(
    (s) => attendanceFor(data.attendance, cls?.id ?? "", date, s.id)?.status === "present",
  ).length;
  const lateCount = roster.filter(
    (s) => attendanceFor(data.attendance, cls?.id ?? "", date, s.id)?.status === "late",
  ).length;
  const absentCount = roster.filter(
    (s) => attendanceFor(data.attendance, cls?.id ?? "", date, s.id)?.status === "absent",
  ).length;

  if (!cls) return <NotFound />;

  const teacher = data.teachers.find((x) => x.id === cls.teacherId);
  const room = data.rooms.find((x) => x.id === cls.roomId);
  const progress = roster.length ? (marked.length / roster.length) * 100 : 0;
  const allMarked = roster.length > 0 && marked.length === roster.length;
  const lessonDate = parseDateKey(date);

  const handleFinish = () => {
    const deducted = presentCount + lateCount;
    toast.success(t("rollcall.finished", { n: n(deducted) }));
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-[820px]">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink-soft hover:text-fawn-deep"
      >
        <ArrowLeft size={13} strokeWidth={3} className="rtl:rotate-180" />
        {t("rollcall.backToToday")}
      </Link>

      <Card className="mb-3.5 overflow-hidden p-0" tape>
        <div className="relative p-4 sm:p-5" style={{ ...tintVars(cls.tint), background: softTint(cls.tint) }}>
          <div
            className="pointer-events-none absolute -end-8 -top-12 h-36 w-36 rounded-full opacity-50"
            style={{ background: "var(--tint)" }}
          />
          <p className="relative text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink-soft">
            {t("rollcall.title")} · {t(`weekday.${cls.day}`)}
          </p>
          <h1 className="relative mt-0.5 font-display text-[25px] font-extrabold leading-tight sm:text-[30px]">
            {tr(cls.name)}
          </h1>
          <div className="relative mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-bold text-ink-soft">
            {teacher && (
              <span className="inline-flex items-center gap-1.5">
                <AnimalAvatar animal={teacher.animal} tint={teacher.tint} size={20} ring={false} />
                {tr(teacher.name)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} strokeWidth={2.8} />
              {room ? tr(room.name) : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} strokeWidth={2.8} />
              {formatTime(cls.start, lang)}–{formatTime(cls.end, lang)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} strokeWidth={2.8} />
              {t("rollcall.enrolled", { n: n(roster.length) })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-line px-4 py-2.5">
          <label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
            {t("rollcall.date")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || dateKey(new Date()))}
            className="field w-auto px-2.5 py-1 text-[11px]"
          />
          <span className="ms-auto flex items-center gap-1.5 text-[10.5px] font-extrabold text-ink-soft">
            <Sparkles size={12} strokeWidth={2.8} />
            {formatDateLabel(lessonDate, lang)}
          </span>
        </div>
      </Card>

      <Card className="mb-3.5 p-3.5" alt>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold">{t("rollcall.progress", { done: n(marked.length), total: n(roster.length) })}</p>
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
            <span className="text-[#42784D]">{n(presentCount)}</span>
            <span className="text-ink-soft">/</span>
            <span className="text-[#A85F16]">{n(lateCount)}</span>
            <span className="text-ink-soft">/</span>
            <span className="text-[#A33E33]">{n(absentCount)}</span>
          </div>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: allMarked ? "#7BBE8C" : "#E39A4E",
            }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => markMany(cls.id, date, roster.map((s) => s.id), "present")}
            className="btn btn-ghost btn-sm"
          >
            <CheckCheck size={13} strokeWidth={3} />
            {t("rollcall.markAll")}
          </button>
          <button
            type="button"
            onClick={() => clearClass(cls.id, date, roster.map((s) => s.id))}
            className="btn btn-ghost btn-sm"
          >
            <Eraser size={13} strokeWidth={3} />
            {t("rollcall.clear")}
          </button>
          <span className="ms-auto text-[10px] font-bold text-ink-soft">
            {allMarked ? t("rollcall.allDone") : t("rollcall.notAll", { n: n(roster.length - marked.length) })}
          </span>
        </div>
      </Card>

      <ul className="space-y-2">
        {roster.map((student, index) => {
          const record = attendanceFor(data.attendance, cls.id, date, student.id);
          const status = record?.status;
          const remaining = remainingLessons(student);
          const style = status ? STATUS_STYLE[status] : null;
          const drained = remaining === 0;

          return (
            <li
              key={student.id}
              className="rise-in flex flex-wrap items-center gap-2.5 rounded-[16px] border-2 bg-card p-2.5 shadow-[0_2px_0_rgba(63,52,43,0.05)] transition"
              style={{
                ["--i" as string]: index % 10,
                borderColor: style ? style.border : "var(--color-line)",
                background: style ? softTint(style.bg) : "#FFFDF8",
              }}
            >
              <Link href={`/students/${student.id}`} className="relative shrink-0">
                <AnimalAvatar animal={student.animal} tint={student.tint} size={46} />
                {status && (
                  <span
                    className="stamp-mark absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
                    style={{ background: style?.color, color: "#fff" }}
                  >
                    {status === "present" ? (
                      <Check size={11} strokeWidth={4} />
                    ) : status === "late" ? (
                      <Clock3 size={10} strokeWidth={3.4} />
                    ) : (
                      <X size={11} strokeWidth={4} />
                    )}
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/students/${student.id}`}
                    className="truncate text-[13px] font-extrabold leading-tight hover:text-fawn-deep"
                  >
                    {tr(student.name)}
                  </Link>
                  {drained && (
                    <span className="pill bg-[#FBE0DB] px-1.5 py-0 text-[8.5px] text-[#A33E33]">
                      {t("students.filter.empty")}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="w-[92px]">
                    <PackageBar remaining={remaining} size="sm" showLabel={false} showTicks={false} />
                  </div>
                  <span
                    className="text-[10px] font-extrabold"
                    style={{ color: remaining <= 4 ? "#C2621B" : "#5E9E6C" }}
                  >
                    {n(remaining)} {t("common.lessons")}
                  </span>
                  {status && (status === "present" || status === "late") && (
                    <span className="text-[9.5px] font-extrabold text-[#B06A22]">{t("rollcall.deduct")}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {STAMPS.map(({ status: value, icon: Icon, key }) => {
                  const active = status === value;
                  const palette = STATUS_STYLE[value];
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => markAttendance(cls.id, date, student.id, value)}
                      aria-pressed={active}
                      aria-label={t(key)}
                      className="flex h-8 items-center gap-1 rounded-full border-2 px-2 text-[10px] font-extrabold transition active:translate-y-[1px] sm:px-2.5"
                      style={{
                        background: active ? palette.color : "#FFFDF8",
                        borderColor: active ? palette.color : "var(--color-line)",
                        color: active ? "#FFFDF8" : "#7B6A5A",
                      }}
                    >
                      <Icon size={12} strokeWidth={3.2} />
                      <span className="hidden sm:inline">{t(key)}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-[76px] z-20 mt-4 lg:bottom-4">
        <Card className="flex flex-wrap items-center gap-2 p-2.5 shadow-[0_10px_30px_-18px_rgba(63,52,43,0.7)]">
          <p className="min-w-0 flex-1 text-[11px] font-extrabold text-ink-soft">
            {allMarked
              ? t("rollcall.allDone")
              : t("rollcall.notAll", { n: n(roster.length - marked.length) })}
          </p>
          <button type="button" onClick={handleFinish} className="btn btn-primary btn-sm sm:btn">
            <CheckCheck size={14} strokeWidth={3} />
            {t("rollcall.finish")}
          </button>
        </Card>
      </div>

      <p className="mt-2 text-center text-[10px] font-semibold text-ink-soft">{t("rollcall.absentHint")}</p>
    </div>
  );
}

function formatDateLabel(date: Date, lang: "en" | "fa") {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
