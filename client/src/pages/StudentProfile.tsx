import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Cake,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Phone,
  RefreshCw,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { PackageBar } from "@/components/PackageBar";
import { ArtworkThumb } from "@/components/ArtworkThumb";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { SquiggleDoodle } from "@/components/brand/Doodles";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { softTint, tintVars } from "@/lib/palette";
import { formatDateShort, formatTime } from "@/lib/time";
import { remainingLessons, packageState } from "@/lib/types";
import type { Artwork } from "@/lib/types";
import NotFound from "./NotFound";

const STATUS_STYLE = {
  present: { bg: "#EAF5E7", color: "#42784D" },
  late: { bg: "#FDEBD6", color: "#A85F16" },
  absent: { bg: "#FBE0DB", color: "#A33E33" },
};

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const { t, tr, n, num, lang } = useI18n();
  const { data, renewPackage } = useStudio();
  const [confirming, setConfirming] = useState(false);
  const [lightbox, setLightbox] = useState<Artwork | null>(null);

  const student = data.students.find((s) => s.id === id);

  const records = useMemo(() => {
    if (!student) return [];
    return Object.values(data.attendance)
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => b.markedAt - a.markedAt)
      .slice(0, 8);
  }, [data.attendance, student]);

  if (!student) return <NotFound />;

  const remaining = remainingLessons(student);
  const state = packageState(remaining);
  const classes = student.classIds
    .map((cid) => data.classes.find((c) => c.id === cid))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const stateMessage =
    state === "empty"
      ? t("student.emptyWarning")
      : state === "low"
        ? t("student.lowWarning", { n: n(remaining) })
        : t("student.healthy");

  return (
    <div>
      <Link
        href="/students"
        className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink-soft hover:text-fawn-deep"
      >
        <ArrowLeft size={13} strokeWidth={3} className="rtl:rotate-180" />
        {t("student.back")}
      </Link>

      <Card className="mb-4 overflow-hidden p-0" tape>
        <div className="relative p-4 sm:p-5" style={tintVars(student.tint)}>
          <div
            className="pointer-events-none absolute -end-10 -top-14 h-40 w-40 rounded-full opacity-60"
            style={{ background: softTint(student.tint) }}
          />
          <div className="relative flex flex-wrap items-start gap-3.5">
            <AnimalAvatar animal={student.animal} tint={student.tint} size={92} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[26px] font-extrabold leading-tight sm:text-[32px]">
                {tr(student.name)}
              </h1>
              <p className="text-[13px] font-bold text-ink-soft" dir={lang === "en" ? "rtl" : "ltr"}>
                {student.name[lang === "en" ? "fa" : "en"]}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <Cake size={12} strokeWidth={2.8} />
                  {n(student.age)} {t("common.years")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <UserRound size={12} strokeWidth={2.8} />
                  {tr(student.guardian)}
                </span>
                <span className="inline-flex items-center gap-1" dir="ltr">
                  <Phone size={12} strokeWidth={2.8} />
                  {num(student.phone)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} strokeWidth={2.8} />
                  {t("student.joined")} {formatDateShort(student.joined, lang)}
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <PackageBar remaining={remaining} className="sm:w-[210px]" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_332px]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-[#F7C2CE]/60">
                  <StickyNote size={13} strokeWidth={2.8} />
                </span>
                {t("student.artwork")}
              </h2>
              <span className="pill bg-paper-deep text-[10px] text-ink-soft">
                {n(student.artworks.length)}
              </span>
            </div>
            {student.artworks.length === 0 ? (
              <p className="rounded-[12px] border-2 border-dashed border-line bg-paper/60 p-6 text-center text-[12px] font-bold text-ink-soft">
                {t("student.noArtwork")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {student.artworks.map((artwork, index) => (
                  <ArtworkThumb
                    key={artwork.id}
                    artwork={artwork}
                    tilt={index % 3 === 0 ? -0.8 : index % 3 === 1 ? 0.6 : 0}
                    showCaption
                    onClick={() => setLightbox(artwork)}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4" alt>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-[#BCD9EF]/60">
                  <CheckCheck size={13} strokeWidth={2.8} />
                </span>
                {t("student.attendance")}
              </h2>
              <span className="text-[10px] font-bold text-ink-soft">{t("rollcall.deduct")}</span>
            </div>
            {records.length === 0 ? (
              <p className="rounded-[12px] border-2 border-dashed border-line bg-paper/60 p-5 text-center text-[12px] font-bold text-ink-soft">
                {t("student.noAttendance")}
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {records.map((record) => {
                  const cls = data.classes.find((c) => c.id === record.classId);
                  const style = STATUS_STYLE[record.status];
                  return (
                    <li key={`${record.classId}-${record.date}-${record.studentId}`} className="flex items-center gap-2 py-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {record.status === "present" ? (
                          <Check size={12} strokeWidth={3.4} />
                        ) : record.status === "late" ? (
                          <Clock3 size={12} strokeWidth={3} />
                        ) : (
                          <X size={12} strokeWidth={3.4} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-extrabold leading-tight">
                          {cls ? tr(cls.name) : ""}
                        </p>
                        <p className="text-[10px] font-semibold text-ink-soft">
                          {formatDateShort(record.date, lang)}
                          {cls ? ` · ${formatTime(cls.start, lang)}` : ""}
                        </p>
                      </div>
                      <span className="pill text-[9.5px]" style={{ background: style.bg, color: style.color }}>
                        {t(`rollcall.${record.status}`)}
                      </span>
                      {(record.status === "present" || record.status === "late") && (
                        <span className="text-[9.5px] font-extrabold text-[#B06A22]">{t("rollcall.deduct")}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="font-display text-[18px] font-extrabold">{t("student.package")}</h2>
            <div className="mt-2 flex items-end gap-2">
              <span
                className="font-display text-[46px] font-extrabold leading-none"
                style={{ color: state === "healthy" ? "#5E9E6C" : state === "low" ? "#E3812C" : "#D35E51" }}
              >
                {n(remaining)}
              </span>
              <span className="pb-1.5 text-[11px] font-extrabold text-ink-soft">
                / {n(student.purchased)} {t("common.lessons")}
              </span>
            </div>
            <PackageBar remaining={remaining} showLabel={false} className="mt-2" />
            <p
              className="mt-2 rounded-[10px] px-2 py-1.5 text-[11px] font-extrabold leading-snug"
              style={{
                background: state === "healthy" ? "#EAF5E7" : state === "low" ? "#FDEBD6" : "#FBE0DB",
                color: state === "healthy" ? "#42784D" : state === "low" ? "#A85F16" : "#A33E33",
              }}
            >
              {stateMessage}
            </p>

            <div className="mt-2.5 space-y-1 text-[10.5px] font-bold text-ink-soft">
              <p className="flex items-center justify-between">
                <span>{t("student.used", { n: n(student.used) })}</span>
                <span>{t("student.packageSize")}</span>
              </p>
              {student.renewals.map((renewal) => (
                <p key={`${renewal.date}-${renewal.lessons}`} className="flex items-center gap-1 text-[#4C8A57]">
                  <RefreshCw size={10} strokeWidth={3} />
                  {t("student.renewedOn", { date: formatDateShort(renewal.date, lang) })} · {n(renewal.lessons)}{" "}
                  {t("common.lessons")} · ${n(renewal.price)}
                </p>
              ))}
            </div>

            {confirming ? (
              <div className="mt-3 rounded-[12px] border-2 border-dashed border-[#E0A15C] bg-[#FDF0DC] p-2.5">
                <p className="text-[11px] font-extrabold text-[#8A4A1E]">{t("student.renewTitle")}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-[#8A4A1E]/90">{t("student.renewBody")}</p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      renewPackage(student.id);
                      setConfirming(false);
                      toast.success(t("home.nudge.renewed"));
                    }}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {t("student.renewConfirm")}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="btn btn-primary mt-3 w-full">
                <RefreshCw size={14} strokeWidth={3} />
                {t("common.renew")}
              </button>
            )}
          </Card>

          <Card className="p-4" alt>
            <h2 className="font-display text-[18px] font-extrabold">{t("student.classes")}</h2>
            <ul className="mt-2 space-y-1.5">
              {classes.map((cls) => {
                const teacher = data.teachers.find((x) => x.id === cls.teacherId);
                const room = data.rooms.find((x) => x.id === cls.roomId);
                const mates = data.students.filter((s) => s.classIds.includes(cls.id)).length;
                return (
                  <li
                    key={cls.id}
                    className="rounded-[11px] border-2 border-ink/10 px-2.5 py-2"
                    style={{ ...tintVars(cls.tint), background: softTint(cls.tint) }}
                  >
                    <p className="text-[11.5px] font-extrabold leading-tight">{tr(cls.name)}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">
                      {t(`weekday.${cls.day}`)} · {formatTime(cls.start, lang)}–{formatTime(cls.end, lang)}
                    </p>
                    <p className="text-[10px] font-semibold text-ink-soft">
                      {teacher ? tr(teacher.name) : ""} · {room ? tr(room.name) : ""}
                    </p>
                    <p className="mt-0.5 text-[9.5px] font-extrabold text-ink-soft/80">
                      {t("student.classmates", { n: n(mates) })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="relative rotate-[-0.6deg] rounded-[14px] border-2 border-[#E8D08C] bg-[#FBF0C9] p-3.5 shadow-[0_2px_0_rgba(63,52,43,0.06)]">
            <p className="mb-1 flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#8A6A22]">
              <StickyNote size={11} strokeWidth={3} />
              {t("student.note")}
            </p>
            <p className="text-[11.5px] font-bold leading-relaxed text-[#5C4A1E]">{tr(student.note)}</p>
            <SquiggleDoodle className="mt-1.5 h-3 w-16 opacity-50" stroke="#C9A24A" />
          </div>
        </aside>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F342B]/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <div className="rise-in w-full max-w-[560px] rounded-[22px] border-2 border-line bg-card p-3 shadow-2xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-[18px] font-extrabold leading-tight">{tr(lightbox.title)}</p>
                <p className="text-[10.5px] font-bold text-ink-soft">
                  {formatDateShort(lightbox.date, lang)} · {tr(lightbox.medium)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-paper"
                aria-label={t("common.close")}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
            <img
              src={lightbox.image}
              alt={tr(lightbox.title)}
              className="w-full rounded-[14px] border-2 border-line object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
