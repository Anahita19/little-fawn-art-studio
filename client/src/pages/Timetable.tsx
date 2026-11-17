import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, Filter, MapPin, Users, X } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { tintVars } from "@/lib/palette";
import { conflictMap, findConflicts, studentsInClass } from "@/lib/selectors";
import type { Conflict } from "@/lib/selectors";
import { dayIndexFromDate, formatHour, formatTime } from "@/lib/time";
import type { ClassSession } from "@/lib/types";

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const PX_PER_MIN = 1.12;
const GRID_HEIGHT = (DAY_END - DAY_START) * PX_PER_MIN;
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

interface Slot {
  lane: number;
  count: number;
}

function layoutDay(classes: ClassSession[]): Map<string, Slot> {
  const sorted = [...classes].sort((a, b) => a.start - b.start || b.end - a.end);
  const clusters: ClassSession[][] = [];
  let current: ClassSession[] = [];
  let clusterEnd = -1;

  sorted.forEach((cls) => {
    if (current.length === 0 || cls.start >= clusterEnd) {
      if (current.length) clusters.push(current);
      current = [cls];
      clusterEnd = cls.end;
    } else {
      current.push(cls);
      clusterEnd = Math.max(clusterEnd, cls.end);
    }
  });
  if (current.length) clusters.push(current);

  const result = new Map<string, Slot>();
  clusters.forEach((cluster) => {
    const laneEnds: number[] = [];
    const laneOf = new Map<string, number>();
    cluster.forEach((cls) => {
      let lane = laneEnds.findIndex((end) => end <= cls.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(cls.end);
      } else {
        laneEnds[lane] = cls.end;
      }
      laneOf.set(cls.id, lane);
    });
    cluster.forEach((cls) => {
      result.set(cls.id, { lane: laneOf.get(cls.id) ?? 0, count: laneEnds.length });
    });
  });
  return result;
}

function conflictLabel(conflict: Conflict): string {
  if (conflict.kind === "room") return "timetable.clash.room";
  if (conflict.kind === "teacher") return "timetable.clash.teacher";
  return "timetable.clash.both";
}

function TimetableBlock({
  cls,
  slot,
  conflicts,
  onSelect,
  index,
}: {
  cls: ClassSession;
  slot: Slot;
  conflicts: Conflict[];
  onSelect: (cls: ClassSession) => void;
  index: number;
}) {
  const { tr, lang, n } = useI18n();
  const { data } = useStudio();
  const teacher = data.teachers.find((t) => t.id === cls.teacherId);
  const roster = studentsInClass(data.students, cls.id);
  const top = (cls.start - DAY_START) * PX_PER_MIN;
  const height = (cls.end - cls.start) * PX_PER_MIN - 4;
  const isClash = conflicts.length > 0;
  const compact = slot.count > 1;

  return (
    <button
      type="button"
      onClick={() => onSelect(cls)}
      className={`tt-block group text-start ${isClash ? "clash-shake" : ""} ${compact ? "px-1.5 py-1" : ""}`}
      style={{
        ...tintVars(cls.tint),
        top,
        height,
        insetInlineStart: `calc(4px + (100% - 8px) * ${slot.lane} / ${slot.count})`,
        width: `calc((100% - 8px) / ${slot.count} - 4px)`,
        ["--shake-delay" as string]: `${index * 0.45}s`,
      }}
      aria-label={`${tr(cls.name)} ${formatTime(cls.start, lang)}`}
    >
      <span className="relative flex h-full flex-col overflow-hidden">
        <span className="flex items-start justify-between gap-1">
          <span
            className={`block overflow-hidden break-words font-extrabold leading-[1.14] ${
              compact ? "line-clamp-4 text-[8.5px]" : "line-clamp-2 text-[11px]"
            }`}
          >
            {tr(cls.name)}
          </span>
          {isClash && (
            <span className="mt-[1px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#FFF3E0] text-[#B4562A]">
              <AlertTriangle size={9} strokeWidth={3} />
            </span>
          )}
        </span>
        {compact ? (
          <span className="mt-auto block text-[8px] font-bold opacity-75">
            {formatTime(cls.start, lang)}
          </span>
        ) : (
          <span className="mt-0.5 block text-[9px] font-bold opacity-75">
            {formatTime(cls.start, lang)}–{formatTime(cls.end, lang)}
          </span>
        )}
        {!compact && height > 52 && teacher && (
          <span className="mt-auto flex items-center gap-1 pt-1 text-[8.5px] font-bold opacity-80">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--tint-deep)" }}
            />
            <span className="truncate">{tr(teacher.name)}</span>
          </span>
        )}
        {!compact && height > 74 && (
          <span className="mt-0.5 flex items-center gap-1 text-[8.5px] font-bold opacity-70">
            <Users size={9} strokeWidth={3} />
            {n(roster.length)}
            <span className="opacity-50">·</span>
            {tr(data.rooms.find((r) => r.id === cls.roomId)?.name ?? { en: "", fa: "" })}
          </span>
        )}
      </span>
    </button>
  );
}

export default function Timetable() {
  const { t, tr, n, lang } = useI18n();
  const { data } = useStudio();
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [selected, setSelected] = useState<ClassSession | null>(null);
  const todayIdx = dayIndexFromDate(new Date());
  const [mobileDay, setMobileDay] = useState(todayIdx === 6 ? 0 : todayIdx);

  const conflicts = useMemo(() => findConflicts(data.classes), [data.classes]);
  const conflictIndex = useMemo(() => conflictMap(conflicts), [conflicts]);

  const filtered = useMemo(
    () =>
      data.classes.filter(
        (cls) =>
          (teacherFilter === "all" || cls.teacherId === teacherFilter) &&
          (roomFilter === "all" || cls.roomId === roomFilter),
      ),
    [data.classes, teacherFilter, roomFilter],
  );

  const byDay = useMemo(() => {
    const map = new Map<number, ClassSession[]>();
    for (let d = 0; d < 7; d += 1) {
      map.set(
        d,
        filtered.filter((c) => c.day === d).sort((a, b) => a.start - b.start),
      );
    }
    return map;
  }, [filtered]);

  const activeFilters = teacherFilter !== "all" || roomFilter !== "all";
  const selectedTeacher = selected ? data.teachers.find((x) => x.id === selected.teacherId) : undefined;
  const selectedRoom = selected ? data.rooms.find((x) => x.id === selected.roomId) : undefined;
  const selectedRoster = selected ? studentsInClass(data.students, selected.id) : [];
  const selectedConflicts = selected ? conflictIndex.get(selected.id) ?? [] : [];

  return (
    <div>
      <PageHeader
        eyebrow={t("app.term")}
        title={t("timetable.title")}
        subtitle={t("timetable.subtitle")}
        underline="mint"
        actions={
          <>
            <span
              className="sticker text-[11px]"
              style={{
                background: conflicts.length ? "#FDF0DC" : "#EAF5E7",
                borderColor: conflicts.length ? "#EBCF9E" : "#C7E3C0",
              }}
            >
              <AlertTriangle size={13} strokeWidth={2.8} className={conflicts.length ? "text-[#B4562A]" : "text-[#4C8A57]"} />
              {conflicts.length
                ? t("timetable.clash.count", { n: n(conflicts.length) })
                : t("home.clash.none")}
            </span>
            <span className="sticker text-[11px]">
              <CalendarDays size={13} strokeWidth={2.8} />
              {n(data.classes.length)} {t("common.classes")}
            </span>
          </>
        }
      />

      <Card className="mb-3.5 p-3">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              <Filter size={10} strokeWidth={3} />
              {t("timetable.filter.teacher")}
            </label>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="field field-select"
            >
              <option value="all">{t("common.allTeachers")}</option>
              {data.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {tr(teacher.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              <MapPin size={10} strokeWidth={3} />
              {t("timetable.filter.room")}
            </label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="field field-select"
            >
              <option value="all">{t("common.allRooms")}</option>
              {data.rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {tr(room.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            {activeFilters && (
              <button
                type="button"
                onClick={() => {
                  setTeacherFilter("all");
                  setRoomFilter("all");
                }}
                className="btn btn-ghost btn-sm"
              >
                <X size={12} strokeWidth={3} />
                {t("timetable.clearFilters")}
              </button>
            )}
            <span className="text-[10.5px] font-extrabold text-ink-soft">
              {t("timetable.filtered", { n: n(filtered.length), total: n(data.classes.length) })}
            </span>
          </div>
        </div>
      </Card>

      {conflicts.length > 0 && (
        <Card className="mb-3.5 overflow-hidden p-0" alt>
          <div className="flex items-center gap-2 border-b-2 border-dashed border-line bg-[#FDF3E1] px-3.5 py-2">
            <AlertTriangle size={15} strokeWidth={2.8} className="text-[#B4562A]" />
            <p className="flex-1 text-[11.5px] font-extrabold">{t("timetable.clash.title")}</p>
            <p className="text-[10px] font-bold text-ink-soft">{t("timetable.clash.hint")}</p>
          </div>
          <ul className="divide-y divide-line/70">
            {conflicts.map((conflict, index) => (
              <li key={`${conflict.a.id}-${conflict.b.id}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3.5 py-2">
                <span className="pill bg-[#FBE3AE] text-[9.5px] text-[#7A5622]">
                  {t(`weekday.${conflict.a.day}`)}
                </span>
                <span className="text-[11px] font-extrabold">
                  {tr(conflict.a.name)} <span className="text-ink-soft">×</span> {tr(conflict.b.name)}
                </span>
                <span className="text-[10px] font-bold text-ink-soft">
                  {t("timetable.clash.window", {
                    from: formatTime(conflict.from, lang),
                    to: formatTime(conflict.to, lang),
                  })}
                </span>
                <span className="ms-auto rounded-full border-2 border-dashed border-[#DDAF72] bg-white/70 px-2 py-0.5 text-[9.5px] font-extrabold text-[#8A5A22]">
                  {t(conflictLabel(conflict))}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(conflict.a)}
                  className="text-[10px] font-extrabold text-fawn-deep hover:underline"
                  aria-label={`${t("common.open")} ${index + 1}`}
                >
                  <ArrowRight size={12} strokeWidth={3} className="rtl:rotate-180" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* desktop / tablet week grid */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-line px-3.5 py-2">
          <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
            <CalendarDays size={13} strokeWidth={2.8} />
            {t("timetable.weekView")}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-ink-soft">{t("timetable.legend")}</p>
            <span className="pill bg-paper-deep text-[9.5px] text-ink-soft">
              {t("weekday.6")} · {t("timetable.closed")}
            </span>
          </div>
        </div>

        <div className="tt-scroll">
          <div style={{ minWidth: 780 }}>
            <div
              className="sticky top-0 z-10 grid border-b-2 border-line bg-card/95 backdrop-blur"
              style={{ gridTemplateColumns: "54px repeat(6, minmax(0, 1fr))" }}
            >
              <div />
              {Array.from({ length: 6 }, (_, d) => {
                const isToday = d === todayIdx;
                return (
                  <div
                    key={d}
                    className={`border-s border-dashed border-line/80 px-1.5 py-2 text-center ${
                      isToday ? "bg-[#FFF4DC]" : ""
                    }`}
                  >
                    <p className={`text-[11px] font-extrabold ${isToday ? "text-[#8A5A22]" : "text-ink"}`}>
                      {t(`weekday.${d}`)}
                    </p>
                    {isToday && (
                      <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#F6C878] px-1.5 text-[8.5px] font-extrabold text-[#6B4512]">
                        <span className="h-1 w-1 rounded-full bg-[#8A5A22]" />
                        {t("timetable.today")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="grid"
              style={{ gridTemplateColumns: "54px repeat(6, minmax(0, 1fr))" }}
            >
              <div className="relative" style={{ height: GRID_HEIGHT }}>
                {HOURS.filter((hour) => hour !== DAY_START && hour !== DAY_END).map((hour) => (
                  <div
                    key={hour}
                    className="absolute inset-inline-0 flex -translate-y-1/2 justify-end pe-1.5"
                    style={{ top: (hour - DAY_START) * PX_PER_MIN }}
                  >
                    <span className="text-[9.5px] font-extrabold text-ink-soft/80">{formatHour(hour, lang)}</span>
                  </div>
                ))}
              </div>

              {Array.from({ length: 6 }, (_, d) => {
                const dayClasses = byDay.get(d) ?? [];
                const slots = layoutDay(dayClasses);
                const isToday = d === todayIdx;
                return (
                  <div
                    key={d}
                    className={`tt-day-col ${isToday ? "bg-[#FFFBF0]" : ""}`}
                    style={{ height: GRID_HEIGHT }}
                  >
                    {HOURS.map((hour) => (
                      <div key={hour} className="tt-hour-line" style={{ top: (hour - DAY_START) * PX_PER_MIN }} />
                    ))}
                    {dayClasses.length === 0 && (
                      <p className="absolute inset-x-0 top-6 text-center text-[9.5px] font-bold text-ink-soft/50">
                        {t("timetable.emptyDay")}
                      </p>
                    )}
                    {dayClasses.map((cls, index) => (
                      <TimetableBlock
                        key={cls.id}
                        cls={cls}
                        slot={slots.get(cls.id) ?? { lane: 0, count: 1 }}
                        conflicts={conflictIndex.get(cls.id) ?? []}
                        onSelect={setSelected}
                        index={index}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* mobile day view */}
      <div className="md:hidden">
        <div className="no-scrollbar -mx-4 mb-3 flex gap-1 overflow-x-auto px-4 pb-1">
          {Array.from({ length: 6 }, (_, d) => {
            const active = d === mobileDay;
            const count = (byDay.get(d) ?? []).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setMobileDay(d)}
                className={`flex min-w-[52px] flex-1 flex-col items-center rounded-[14px] border-2 px-1.5 py-1.5 transition ${
                  active
                    ? "border-[#E0B169] bg-[#FBE3AE] text-[#6B4512] shadow-[0_2px_0_#D8A05A]"
                    : "border-line bg-card text-ink-soft"
                }`}
              >
                <span className="text-[11px] font-extrabold">{t(`weekdayShort.${d}`)}</span>
                <span className="text-[9px] font-bold">{n(count)}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {(byDay.get(mobileDay) ?? []).map((cls, index) => {
            const teacher = data.teachers.find((x) => x.id === cls.teacherId);
            const room = data.rooms.find((x) => x.id === cls.roomId);
            const roster = studentsInClass(data.students, cls.id);
            const isClash = (conflictIndex.get(cls.id) ?? []).length > 0;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelected(cls)}
                className={`flex w-full items-stretch gap-0 overflow-hidden rounded-[16px] border-2 border-[var(--tint-deep)] bg-card text-start shadow-[0_2px_0_rgba(63,52,43,0.07)] ${
                  isClash ? "clash-shake" : ""
                }`}
                style={{ ...tintVars(cls.tint), ["--shake-delay" as string]: `${index * 0.4}s` }}
              >
                <span className="w-[68px] shrink-0 px-2 py-2.5 text-center" style={{ background: "var(--tint)" }}>
                  <span className="block text-[11px] font-extrabold leading-tight">{formatTime(cls.start, lang)}</span>
                  <span className="block text-[9px] font-bold opacity-70">{formatTime(cls.end, lang)}</span>
                </span>
                <span className="min-w-0 flex-1 px-2.5 py-2">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[12.5px] font-extrabold">{tr(cls.name)}</span>
                    {isClash && <AlertTriangle size={12} strokeWidth={3} className="shrink-0 text-[#B4562A]" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-bold text-ink-soft">
                    {teacher ? tr(teacher.name) : ""} · {room ? tr(room.name) : ""}
                  </span>
                  <span className="mt-0.5 block text-[9.5px] font-bold text-ink-soft">
                    {n(roster.length)} {t("common.students")} · {n(cls.ageMin)}–{n(cls.ageMax)} {t("common.years")}
                  </span>
                </span>
              </button>
            );
          })}
          {(byDay.get(mobileDay) ?? []).length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-[12px] font-bold text-ink-soft">{t("timetable.emptyDay")}</p>
            </Card>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#3F342B]/35 p-3 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <Card
            className="rise-in w-full max-w-[440px] overflow-hidden p-0"
            style={{ ["--i" as string]: 0 }}
          >
            <div
              className="relative px-4 pb-3 pt-4"
              style={{ ...tintVars(selected.tint), background: "var(--tint)" }}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink/15 bg-white/80"
                aria-label={t("common.close")}
              >
                <X size={14} strokeWidth={3} />
              </button>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                {t(`weekday.${selected.day}`)} · {formatTime(selected.start, lang)}–{formatTime(selected.end, lang)}
              </p>
              <h3 className="mt-0.5 pe-8 font-display text-[22px] font-extrabold leading-tight">{tr(selected.name)}</h3>
              <p className="mt-0.5 text-[11.5px] font-bold opacity-80">
                {tr(selected.level)} · {n(selected.ageMin)}–{n(selected.ageMax)} {t("common.years")}
              </p>
            </div>

            <div className="space-y-2.5 p-4">
              {selectedConflicts.length > 0 && (
                <div className="rounded-[12px] border-2 border-dashed border-[#E0A15C] bg-[#FDF0DC] px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[10.5px] font-extrabold text-[#8A4A1E]">
                    <AlertTriangle size={12} strokeWidth={3} />
                    {t("timetable.clash.title")}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {selectedConflicts.map((c) => {
                      const other = c.a.id === selected.id ? c.b : c.a;
                      return (
                        <li key={other.id} className="text-[10.5px] font-semibold text-[#8A4A1E]">
                          {tr(other.name)} · {t(conflictLabel(c))}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2">
                {selectedTeacher && (
                  <AnimalAvatar animal={selectedTeacher.animal} tint={selectedTeacher.tint} size={34} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-extrabold leading-tight">
                    {selectedTeacher ? tr(selectedTeacher.name) : ""}
                  </p>
                  <p className="text-[10px] font-semibold text-ink-soft">
                    {selectedTeacher ? tr(selectedTeacher.role) : ""}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-[11.5px] font-extrabold leading-tight">{selectedRoom ? tr(selectedRoom.name) : ""}</p>
                  <p className="text-[10px] font-semibold text-ink-soft">
                    {selectedRoom ? tr(selectedRoom.note) : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border-2 border-dashed border-line bg-paper/60 px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink-soft">
                    {t("rollcall.enrolled", { n: n(selectedRoster.length) })}
                  </p>
                  <div className="flex -space-x-1.5 rtl:space-x-reverse">
                    {selectedRoster.slice(0, 6).map((s) => (
                      <AnimalAvatar key={s.id} animal={s.animal} tint={s.tint} size={22} />
                    ))}
                  </div>
                </div>
              </div>

              <Link href={`/roll-call/${selected.id}`} className="btn btn-primary w-full">
                {t("home.rollcall")}
                <ArrowRight size={14} strokeWidth={3} className="rtl:rotate-180" />
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
