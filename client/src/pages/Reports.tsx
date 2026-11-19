import { useMemo } from "react";
import { BarChart3, BookOpen, CalendarCheck2, CircleDollarSign, Clock3, GraduationCap, MapPin, PackageCheck, Sparkles, TrendingUp, UsersRound } from "lucide-react";
import { Card } from "@/components/Card";
import { PageHeader, StatCard } from "@/components/PageHeader";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { packageState, remainingLessons } from "@/lib/types";
import { formatDateShort, formatMonthYear, formatTime } from "@/lib/time";
import { studentsInClass, teacherStats } from "@/lib/selectors";

const STATE_TINT = { healthy: "#C4E4C0", low: "#F8D8A9", empty: "#F7C2CE" };

export default function Reports() {
  const { t, tr, n, lang } = useI18n();
  const { data } = useStudio();
  const now = new Date();
  const monthLabel = formatMonthYear(now, lang);

  const metrics = useMemo(() => {
    const students = data.students;
    const attendance = Object.values(data.attendance);
    const present = attendance.filter((record) => record.status === "present").length;
    const late = attendance.filter((record) => record.status === "late").length;
    const absent = attendance.filter((record) => record.status === "absent").length;
    const marked = present + late + absent;
    const lessonsPurchased = students.reduce((sum, student) => sum + student.purchased, 0);
    const packageValue = (lessonsPurchased / 20) * 400;
    const renewalValue = students.reduce((sum, student) => sum + student.renewals.reduce((inner, renewal) => inner + renewal.price, 0), 0);
    const states = students.reduce((counts, student) => {
      counts[packageState(remainingLessons(student))] += 1;
      return counts;
    }, { healthy: 0, low: 0, empty: 0 });
    return { present, late, absent, marked, packageValue, renewalValue, states, totalLessons: students.reduce((sum, student) => sum + remainingLessons(student), 0) };
  }, [data]);

  const teacherRows = data.teachers.map((teacher) => {
    const stats = teacherStats(data.students, data.classes, teacher.id);
    const sessions = data.classes.filter((cls) => cls.teacherId === teacher.id);
    const seats = sessions.reduce((sum, cls) => sum + (data.rooms.find((room) => room.id === cls.roomId)?.capacity ?? 0), 0);
    const enrolled = sessions.reduce((sum, cls) => sum + studentsInClass(data.students, cls.id).length, 0);
    return { teacher, stats, sessions, occupancy: seats ? Math.round((enrolled / seats) * 100) : 0 };
  });

  const roomRows = data.rooms.map((room) => {
    const sessions = data.classes.filter((cls) => cls.roomId === room.id);
    const enrolled = sessions.reduce((sum, cls) => sum + studentsInClass(data.students, cls.id).length, 0);
    const seats = sessions.length * room.capacity;
    return { room, sessions, enrolled, occupancy: seats ? Math.round((enrolled / seats) * 100) : 0 };
  });

  const recentAttendance = Object.values(data.attendance)
    .sort((a, b) => b.markedAt - a.markedAt)
    .slice(0, 7)
    .map((record) => ({
      record,
      student: data.students.find((student) => student.id === record.studentId),
      cls: data.classes.find((cls) => cls.id === record.classId),
    }))
    .filter((item) => item.student && item.cls);

  const money = (value: number) => `$${Math.round(value).toLocaleString(lang === "fa" ? "fa-IR" : "en-US")}`;
  const stateLabels = { healthy: t("reports.package.healthy"), low: t("reports.package.low"), empty: t("reports.package.empty") };
  const statusLabel = (status: "present" | "late" | "absent") => t(`reports.attendance.${status}`);

  return (
    <div>
      <PageHeader
        eyebrow={t("reports.eyebrow")}
        title={t("reports.title")}
        subtitle={t("reports.subtitle", { month: monthLabel })}
        underline="mint"
        actions={<span className="sticker"><BarChart3 size={14} />{t("reports.live")}</span>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("reports.stat.value")} value={money(metrics.packageValue)} hint={t("reports.stat.valueHint")} tint="#FBE3AE" icon={<CircleDollarSign size={15} />} index={0} />
        <StatCard label={t("reports.stat.renewals")} value={money(metrics.renewalValue)} hint={t("reports.stat.renewalsHint")} tint="#F7C2CE" icon={<TrendingUp size={15} />} index={1} />
        <StatCard label={t("reports.stat.remaining")} value={n(metrics.totalLessons)} hint={t("reports.stat.remainingHint")} tint="#C4E4C0" icon={<BookOpen size={15} />} index={2} />
        <StatCard label={t("reports.stat.attendance")} value={n(metrics.marked)} hint={t("reports.stat.attendanceHint", { present: n(metrics.present), late: n(metrics.late) })} tint="#BCD9EF" icon={<CalendarCheck2 size={15} />} index={3} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="p-4 sm:p-5" tape>
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-display text-xl font-extrabold">{t("reports.packages.title")}</p><p className="mt-1 text-[11px] font-semibold text-ink-soft">{t("reports.packages.body")}</p></div>
            <PackageCheck className="text-[#6BA475]" size={25} />
          </div>
          <div className="mt-5 space-y-4">
            {(["healthy", "low", "empty"] as const).map((state) => {
              const count = metrics.states[state];
              const width = data.students.length ? Math.max(4, (count / data.students.length) * 100) : 0;
              return <div key={state}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-extrabold"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-ink/10" style={{ background: STATE_TINT[state] }} />{stateLabels[state]}</span><span>{n(count)} <span className="font-semibold text-ink-soft">/ {n(data.students.length)}</span></span></div>
                <div className="h-3 overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: STATE_TINT[state] }} /></div>
              </div>;
            })}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-[13px] border-2 border-dashed border-line bg-[#FFF8EA] px-3 py-2.5 text-[11px] font-bold text-ink-soft"><Sparkles size={15} className="shrink-0 text-fawn-deep" />{t("reports.packages.callout", { count: n(metrics.states.low + metrics.states.empty) })}</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="font-display text-xl font-extrabold">{t("reports.attendance.title")}</p><p className="mt-1 text-[11px] font-semibold text-ink-soft">{t("reports.attendance.body")}</p></div><UsersRound className="text-[#719FC5]" size={25} /></div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["present", "late", "absent"] as const).map((status) => { const value = metrics[status]; const total = Math.max(1, metrics.marked); return <div key={status} className="rounded-[15px] border-2 border-line bg-paper/60 p-3 text-center"><p className="font-display text-2xl font-extrabold">{n(value)}</p><p className="mt-1 text-[10px] font-extrabold text-ink-soft">{statusLabel(status)}</p><div className="mx-auto mt-2 h-1.5 max-w-[70px] overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full" style={{ width: `${(value / total) * 100}%`, background: status === "present" ? "#79B982" : status === "late" ? "#E7B460" : "#E49AA7" }} /></div></div>; })}
          </div>
          <div className="mt-4 rounded-[14px] bg-[#EAF5E7] px-3 py-3 text-center"><p className="font-display text-[27px] font-extrabold text-[#42784D]">{metrics.marked ? `${Math.round(((metrics.present + metrics.late) / metrics.marked) * 100)}%` : "—"}</p><p className="text-[10px] font-extrabold text-[#42784D]">{t("reports.attendance.rate")}</p></div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b-2 border-line px-4 py-4 sm:px-5"><div><p className="font-display text-xl font-extrabold">{t("reports.teachers.title")}</p><p className="mt-0.5 text-[11px] font-semibold text-ink-soft">{t("reports.teachers.body")}</p></div><GraduationCap className="text-[#A887C9]" size={25} /></div>
          <div className="divide-y-2 divide-dashed divide-line">
            {teacherRows.map(({ teacher, stats, occupancy }) => <div key={teacher.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><AnimalAvatar animal={teacher.animal} tint={teacher.tint} size={38} ring={false} /><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-3"><p className="truncate font-display text-[15px] font-extrabold">{tr(teacher.name)}</p><span className="shrink-0 text-[11px] font-extrabold text-ink-soft">{n(occupancy)}%</span></div><div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-ink-soft"><span>{t("reports.teachers.sessions", { n: n(stats.sessions) })}</span><span className="opacity-40">·</span><span>{t("reports.teachers.students", { n: n(stats.students) })}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full" style={{ width: `${Math.min(100, occupancy)}%`, background: teacher.tint }} /></div></div></div>)}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b-2 border-line px-4 py-4 sm:px-5"><div><p className="font-display text-xl font-extrabold">{t("reports.rooms.title")}</p><p className="mt-0.5 text-[11px] font-semibold text-ink-soft">{t("reports.rooms.body")}</p></div><MapPin className="text-[#D49255]" size={25} /></div>
          <div className="space-y-3 p-4 sm:p-5">{roomRows.map(({ room, sessions, enrolled, occupancy }) => <div key={room.id} className="rounded-[15px] border-2 border-line bg-paper/45 p-3"><div className="flex items-center justify-between gap-3"><p className="font-display text-[15px] font-extrabold">{tr(room.name)}</p><span className="pill" style={{ background: room.tint }}>{n(sessions.length)} {t("reports.rooms.classes")}</span></div><div className="mt-2 flex items-center justify-between text-[10px] font-bold text-ink-soft"><span>{n(enrolled)} {t("reports.rooms.enrolled")}</span><span>{n(occupancy)}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full" style={{ width: `${Math.min(100, occupancy)}%`, background: room.tint }} /></div></div>)}</div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b-2 border-line px-4 py-4 sm:px-5"><div><p className="font-display text-xl font-extrabold">{t("reports.activity.title")}</p><p className="mt-0.5 text-[11px] font-semibold text-ink-soft">{t("reports.activity.body")}</p></div><Clock3 className="text-[#B88B54]" size={24} /></div>
        <div className="divide-y-2 divide-dashed divide-line">{recentAttendance.length === 0 ? <p className="px-5 py-8 text-center text-sm font-bold text-ink-soft">{t("reports.activity.empty")}</p> : recentAttendance.map(({ record, student, cls }) => <div key={`${record.classId}-${record.date}-${record.studentId}`} className="flex items-center gap-3 px-4 py-3 sm:px-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-[#FBE9CF] font-display text-sm font-extrabold">{student!.name[lang].slice(0, 1)}</span><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-extrabold">{tr(student!.name)} <span className="font-semibold text-ink-soft">· {statusLabel(record.status)}</span></p><p className="truncate text-[10px] font-bold text-ink-soft">{tr(cls!.name)} · {formatDateShort(record.date, lang)}</p></div><span className="hidden shrink-0 items-center gap-1 text-[10px] font-bold text-ink-soft sm:inline-flex"><Clock3 size={11} />{formatTime(new Date(record.markedAt).getHours() * 60 + new Date(record.markedAt).getMinutes(), lang)}</span></div>)}</div>
      </Card>
    </div>
  );
}
