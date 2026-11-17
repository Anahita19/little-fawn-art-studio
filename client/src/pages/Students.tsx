import { useMemo, useState } from "react";
import { ArrowRight, Download, Search, SlidersHorizontal, Users } from "lucide-react";
import { Link, useSearch } from "wouter";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PackageBar } from "@/components/PackageBar";
import { ArtworkThumb } from "@/components/ArtworkThumb";
import { AnimalAvatar } from "@/components/avatar/AnimalAvatar";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { softTint, tintVars } from "@/lib/palette";
import { sortStudents } from "@/lib/selectors";
import { remainingLessons, packageState } from "@/lib/types";
import type { PackageState, Student } from "@/lib/types";

type PackageFilter = "all" | PackageState | "renew";

const STATE_STYLE: Record<PackageState, { bg: string; color: string; key: string }> = {
  healthy: { bg: "#EAF5E7", color: "#42784D", key: "students.filter.healthy" },
  low: { bg: "#FDEBD6", color: "#A85F16", key: "students.filter.low" },
  empty: { bg: "#FBE0DB", color: "#A33E33", key: "students.filter.empty" },
};

function StudentCard({ student, index }: { student: Student; index: number }) {
  const { t, tr, n, lang, classes: classCount } = useI18n();
  const { data } = useStudio();
  const remaining = remainingLessons(student);
  const state = packageState(remaining);
  const style = STATE_STYLE[state];
  const classes = student.classIds
    .map((id) => data.classes.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <Link href={`/students/${student.id}`} className="block">
      <Card
        alt={index % 3 === 1}
        lift
        className="rise-in group h-full overflow-hidden p-3"
        style={{ ["--i" as string]: index % 8 }}
      >
        <div className="flex items-start gap-2.5">
          <AnimalAvatar animal={student.animal} tint={student.tint} size={52} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-extrabold leading-tight group-hover:text-fawn-deep">
              {tr(student.name)}
            </p>
            <p className="truncate text-[10.5px] font-semibold text-ink-soft" dir={lang === "en" ? "rtl" : "ltr"}>
              {student.name[lang === "en" ? "fa" : "en"]}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-ink-soft">
              {n(student.age)} {t("common.years")} · {classCount(classes.length)}
            </p>
          </div>
          <span className="pill shrink-0 text-[9px]" style={{ background: style.bg, color: style.color }}>
            {t(style.key)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {classes.slice(0, 2).map((cls) => (
            <span
              key={cls.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-ink/10 px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink"
              style={{ background: softTint(cls.tint) }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--tint-deep)" }} />
              <span className="truncate">{tr(cls.name)}</span>
            </span>
          ))}
          {classes.length > 2 && (
            <span className="rounded-full bg-paper-deep px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink-soft">
              +{n(classes.length - 2)}
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <PackageBar remaining={remaining} size="sm" showLabel={false} showTicks={false} />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] font-extrabold" style={{ color: style.color }}>
              {t("home.nudge.left", { n: n(remaining) })}
            </span>
            <span className="text-[9.5px] font-bold text-ink-soft">
              {t("common.of")} {n(student.purchased)}
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5" style={tintVars(student.tint)}>
          {student.artworks.slice(0, 3).map((artwork, i) => (
            <ArtworkThumb key={artwork.id} artwork={artwork} tilt={i === 1 ? 1.2 : i === 2 ? -1 : 0} />
          ))}
        </div>
      </Card>
    </Link>
  );
}

export default function Students() {
  const { t, tr, n, lang } = useI18n();
  const { data } = useStudio();
  const search = useSearch();
  const initialPackage = new URLSearchParams(search).get("package");
  const [query, setQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState<PackageFilter>(
    initialPackage === "low" ||
      initialPackage === "empty" ||
      initialPackage === "healthy" ||
      initialPackage === "renew"
      ? initialPackage
      : "all",
  );
  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [sortMode, setSortMode] = useState<"name" | "remaining" | "age">("name");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.students.filter((student) => {
      const remaining = remainingLessons(student);
      if (packageFilter === "renew" && remaining > 4) return false;
      if (
        packageFilter !== "all" &&
        packageFilter !== "renew" &&
        packageState(remaining) !== packageFilter
      )
        return false;
      if (classFilter !== "all" && !student.classIds.includes(classFilter)) return false;
      if (
        teacherFilter !== "all" &&
        !student.classIds.some((id) => data.classes.find((cls) => cls.id === id)?.teacherId === teacherFilter)
      )
        return false;
      if (!q) return true;
      const haystack = [
        student.name.en,
        student.name.fa,
        student.guardian.en,
        student.guardian.fa,
        student.phone,
        ...student.classIds.map((id) => {
          const cls = data.classes.find((c) => c.id === id);
          return cls ? `${cls.name.en} ${cls.name.fa}` : "";
        }),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    return sortStudents(filtered, sortMode, lang);
  }, [data.students, data.classes, query, packageFilter, classFilter, teacherFilter, sortMode, lang]);

  const exportCsv = () => {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const headers = [t("common.student"), t("common.age"), t("students.export.guardian"), t("students.export.phone"), t("students.filter.class"), t("common.teacher"), t("common.remaining"), t("students.filter.status")];
    const rows = results.map((student) => {
      const classes = student.classIds.map((id) => data.classes.find((cls) => cls.id === id)).filter(Boolean);
      const teachers = [...new Set(classes.map((cls) => data.teachers.find((teacher) => teacher.id === cls!.teacherId)).filter(Boolean).map((teacher) => tr(teacher!.name)))];
      return [tr(student.name), n(student.age), tr(student.guardian), student.phone, classes.map((cls) => tr(cls!.name)).join(" / "), teachers.join(" / "), n(remainingLessons(student)), t(STATE_STYLE[packageState(remainingLessons(student))].key)].map(escape).join(",");
    });
    const csv = `\uFEFF${[headers.map(escape).join(","), ...rows].join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `little-fawn-students-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow={t("app.term")}
        title={t("students.title")}
        subtitle={t("students.subtitle", {
          count: n(data.students.length),
          classes: n(data.classes.length),
        })}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv} title={t("students.export")}>
              <Download size={13} strokeWidth={2.8} />
              <span className="hidden sm:inline">{t("students.export")}</span>
            </button>
            <span className="sticker text-[11px]">
              <Users size={13} strokeWidth={2.8} />
              {t("students.resultCount", { n: n(results.length) })}
            </span>
          </div>
        }
      />

      <Card className="mb-4 p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              <Search size={10} strokeWidth={3} />
              {t("common.search")}
            </label>
            <div className="relative">
              <Search
                size={14}
                strokeWidth={2.6}
                className="pointer-events-none absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-ink-soft"
                style={{ insetInlineStart: 12 }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search")}
                className="field ps-8"
                style={{ paddingInlineStart: 32 }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              {t("students.filter.status")}
            </label>
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value as PackageFilter)}
              className="field field-select"
            >
              <option value="all">{t("students.filter.all")}</option>
              <option value="renew">{t("students.filter.renew")}</option>
              <option value="low">{t("students.filter.low")}</option>
              <option value="empty">{t("students.filter.empty")}</option>
              <option value="healthy">{t("students.filter.healthy")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              {t("students.filter.class")}
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="field field-select"
            >
              <option value="all">{t("common.all")}</option>
              {data.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {tr(cls.name)} · {t(`weekdayShort.${cls.day}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              {t("common.teacher")}
            </label>
            <select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} className="field field-select">
              <option value="all">{t("common.allTeachers")}</option>
              {data.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{tr(teacher.name)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
              <SlidersHorizontal size={10} strokeWidth={3} />
              {t("students.sort.name")}
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as "name" | "remaining" | "age")}
              className="field field-select"
            >
              <option value="name">{t("students.sort.name")}</option>
              <option value="remaining">{t("students.sort.remaining")}</option>
              <option value="age">{t("students.sort.age")}</option>
            </select>
          </div>
        </div>
      </Card>

      {results.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-lg font-extrabold">{t("students.empty")}</p>
            <Link href="/students" onClick={() => { setQuery(""); setPackageFilter("all"); setClassFilter("all"); setTeacherFilter("all"); }} className="btn btn-ghost btn-sm mt-3">
            {t("timetable.clearFilters")}
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} />
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-1 text-[10.5px] font-bold text-ink-soft">
        <ArrowRight size={12} strokeWidth={3} className="rtl:rotate-180" />
        {t("student.back")} · {n(data.students.length)}
      </p>
    </div>
  );
}
