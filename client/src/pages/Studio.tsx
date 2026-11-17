import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Check, MapPin, RotateCcw, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { HeartDoodle, SparkleDoodle } from "@/components/brand/Doodles";
import { Illustration } from "@/components/Illustration";
import { useStudio } from "@/data/studio";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n/LanguageProvider";
import { softTint } from "@/lib/palette";
import { findConflicts, roomStats, teacherStats } from "@/lib/selectors";
import { PACKAGE_PRICE, PACKAGE_SIZE } from "@/lib/types";

export default function Studio() {
  const { t, tr, n, lang } = useI18n();
  const { data, reset } = useStudio();
  const { user } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  const conflicts = useMemo(() => findConflicts(data.classes), [data.classes]);
  const totalMinutes = data.classes.reduce((sum, cls) => sum + (cls.end - cls.start), 0);
  const teachingHours = Math.round((totalMinutes / 60) * 10) / 10;
  const maxRoomLoad = Math.max(...data.rooms.map((r) => roomStats(data.classes, r.id).sessions), 1);

  return (
    <div>
      <PageHeader
        eyebrow={t("app.term")}
        title={t("studio.title")}
        subtitle={t("studio.subtitle")}
        underline="mint"
        actions={
          <span className="sticker text-[11px]">
            <Sparkles size={13} strokeWidth={2.8} />
            {t("app.tagline")}
          </span>
        }
      />

      <Card className="mb-4 overflow-hidden p-0" tape>
        <div className="grid sm:grid-cols-[1fr_220px]">
          <div className="p-4 sm:p-5">
            <h2 className="font-display text-[19px] font-extrabold">{t("studio.week")}</h2>
            <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-ink-soft">
              {t("studio.week.body", {
                sessions: n(data.classes.length),
                hours: n(teachingHours),
                clashes: n(conflicts.length),
              })}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-[12px] border-2 border-line bg-paper/70 px-2.5 py-2">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink-soft">
                  {t("common.classes")}
                </p>
                <p className="font-display text-[20px] font-extrabold leading-none">{n(data.classes.length)}</p>
              </div>
              <div className="rounded-[12px] border-2 border-line bg-paper/70 px-2.5 py-2">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink-soft">
                  {t("common.students")}
                </p>
                <p className="font-display text-[20px] font-extrabold leading-none">{n(data.students.length)}</p>
              </div>
              <div className="rounded-[12px] border-2 border-line bg-paper/70 px-2.5 py-2">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink-soft">
                  {t("timetable.clash.badge")}
                </p>
                <p className="font-display text-[20px] font-extrabold leading-none text-[#B4562A]">
                  {n(conflicts.length)}
                </p>
              </div>
            </div>
          </div>
          <Illustration
            src="/manus-storage/async-images/yTmHw9m4gVn9bNoxXQNRRz/image-2.webp"
            className="hidden h-full w-full object-cover sm:block"
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-[#DCC9F0]/70">
                  <Users size={13} strokeWidth={2.8} />
                </span>
                {t("studio.teachers")}
              </h2>
              <span className="pill bg-paper-deep text-[10px] text-ink-soft">{n(data.teachers.length)}</span>
            </div>

            <ul className="space-y-2">
              {data.teachers.map((teacher) => {
                const stats = teacherStats(data.students, data.classes, teacher.id);
                return (
                  <li
                    key={teacher.id}
                    className="flex items-center gap-2.5 rounded-[13px] border-2 border-line/80 px-2.5 py-2"
                    style={{ background: softTint(teacher.tint) }}
                  >
                    <AnimalAvatar animal={teacher.animal} tint={teacher.tint} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-extrabold leading-tight">{tr(teacher.name)}</p>
                      <p className="truncate text-[10.5px] font-semibold text-ink-soft">{tr(teacher.role)}</p>
                      <p className="text-[9.5px] font-bold text-ink-soft/80">
                        {t("studio.teacher.since", { year: n(teacher.since) })}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-[10px] font-extrabold text-ink">{t("studio.teacher.sessions", { n: n(stats.sessions) })}</p>
                      <p className="text-[10px] font-bold text-ink-soft">{t("studio.teacher.students", { n: n(stats.students) })}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-4" alt>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-[#FBE3AE]/70">
                  <MapPin size={13} strokeWidth={2.8} />
                </span>
                {t("studio.rooms")}
              </h2>
              <span className="pill bg-paper-deep text-[10px] text-ink-soft">{n(data.rooms.length)}</span>
            </div>
            <ul className="space-y-2">
              {data.rooms.map((room) => {
                const stats = roomStats(data.classes, room.id);
                return (
                  <li key={room.id} className="rounded-[13px] border-2 border-line/80 bg-paper/50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-extrabold leading-tight">{tr(room.name)}</p>
                        <p className="truncate text-[10.5px] font-semibold text-ink-soft">{tr(room.note)}</p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-[10px] font-extrabold">{t("studio.room.capacity", { n: n(room.capacity) })}</p>
                        <p className="text-[10px] font-bold text-ink-soft">
                          {t("studio.room.load", { n: n(stats.sessions) })}
                        </p>
                      </div>
                    </div>
                    <div className="progress-track mt-1.5" style={{ height: 7 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(stats.sessions / maxRoomLoad) * 100}%`,
                          backgroundColor: room.tint,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="relative overflow-hidden p-0">
            <div className="relative bg-[#FBE3AE]/70 px-4 pb-4 pt-4">
              <HeartDoodle className="absolute end-3 top-3 h-7 w-7 opacity-70" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8A5A22]">
                {t("studio.packages")}
              </p>
              <p className="mt-1 font-display text-[20px] font-extrabold leading-tight">{t("studio.package.name")}</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-[40px] font-extrabold leading-none text-[#6B4512]">
                  ${n(PACKAGE_PRICE)}
                </span>
                <span className="pb-1.5 text-[11px] font-extrabold text-[#8A5A22]">
                  · {n(PACKAGE_SIZE)} {t("common.lessons")}
                </span>
              </div>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-[12px] font-semibold leading-relaxed text-ink-soft">{t("studio.package.body")}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="pill bg-[#EAF5E7] text-[10px] text-[#42784D]">{t("studio.package.perLesson")}</span>
                <span className="pill bg-paper-deep text-[10px] text-ink-soft">
                  {n(PACKAGE_SIZE)} {t("common.lessons")}
                </span>
              </div>
              <p className="rounded-[10px] border-2 border-dashed border-line bg-paper/70 px-2.5 py-2 text-[10.5px] font-bold leading-snug text-ink-soft">
                {t("studio.package.note")}
              </p>
            </div>
          </Card>

          <Card className="p-4" alt>
            <h2 className="flex items-center gap-2 font-display text-[18px] font-extrabold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-[#FBD9B6]/80">
                <CalendarDays size={13} strokeWidth={2.8} />
              </span>
              {t("timetable.clash.title")}
            </h2>
            {conflicts.length === 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-[#42784D]">
                <Check size={13} strokeWidth={3} />
                {t("timetable.clash.none")}
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {conflicts.map((conflict) => (
                  <li key={`${conflict.a.id}-${conflict.b.id}`} className="flex items-start gap-1.5 text-[10.5px] font-bold">
                    <AlertTriangle size={12} strokeWidth={3} className="mt-0.5 shrink-0 text-[#B4562A]" />
                    <span className="leading-snug">
                      {t(`weekdayShort.${conflict.a.day}`)} · {tr(conflict.a.name)} × {tr(conflict.b.name)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {user?.role === "admin" && <Card className="p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-line bg-paper-deep">
                <RotateCcw size={13} strokeWidth={2.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold leading-tight">{t("studio.reset.title")}</p>
                <p className="mt-0.5 text-[10.5px] font-semibold leading-snug text-ink-soft">{t("studio.reset.body")}</p>
              </div>
            </div>
            {confirmReset ? (
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                    toast.success(t("common.resetDone"));
                  }}
                  className="btn btn-primary btn-sm flex-1"
                >
                  {t("common.reset")}
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-ghost btn-sm">
                  {t("common.cancel")}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-ghost btn-sm mt-2 w-full">
                {t("common.reset")}
              </button>
            )}
          </Card>}

          <p className="text-center text-[9.5px] font-bold text-ink-soft/70">
            {lang === "fa" ? "ساخته‌شده با مدادرنگی و کمی چسب" : "Made with crayons and a little glue"}
          </p>
        </div>
      </div>
    </div>
  );
}
