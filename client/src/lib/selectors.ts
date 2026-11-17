import type { AttendanceRecord, ClassSession, Student } from "./types";
import { remainingLessons } from "./types";
import { dayIndexFromDate, minutesNow, overlaps } from "./time";

export type ConflictKind = "room" | "teacher" | "both";

export interface Conflict {
  a: ClassSession;
  b: ClassSession;
  kind: ConflictKind;
  from: number;
  to: number;
}

export function findConflicts(classes: ClassSession[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const sorted = [...classes].sort((x, y) => (x.day - y.day) || (x.start - y.start));

  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i];
      const b = sorted[j];
      if (a.day !== b.day) continue;
      if (b.start >= a.end) continue;
      if (!overlaps(a.start, a.end, b.start, b.end)) continue;
      const sameRoom = a.roomId === b.roomId;
      const sameTeacher = a.teacherId === b.teacherId;
      if (!sameRoom && !sameTeacher) continue;
      conflicts.push({
        a,
        b,
        kind: sameRoom && sameTeacher ? "both" : sameRoom ? "room" : "teacher",
        from: Math.max(a.start, b.start),
        to: Math.min(a.end, b.end),
      });
    }
  }
  return conflicts;
}

export function conflictMap(conflicts: Conflict[]): Map<string, Conflict[]> {
  const map = new Map<string, Conflict[]>();
  conflicts.forEach((conflict) => {
    [conflict.a.id, conflict.b.id].forEach((id) => {
      const list = map.get(id) ?? [];
      list.push(conflict);
      map.set(id, list);
    });
  });
  return map;
}

export function classesForDay(classes: ClassSession[], day: number): ClassSession[] {
  return classes.filter((c) => c.day === day).sort((a, b) => a.start - b.start);
}

export function classesForDate(classes: ClassSession[], date: Date): ClassSession[] {
  return classesForDay(classes, dayIndexFromDate(date));
}

export type SessionPhase = "done" | "live" | "upcoming";

export function sessionPhase(cls: ClassSession, date: Date, now = new Date()): SessionPhase {
  const isToday = dayIndexFromDate(date) === cls.day && dateKeyEqual(date, now);
  if (!isToday) {
    const todayIndex = dayIndexFromDate(now);
    if (cls.day < todayIndex) return "done";
    if (cls.day > todayIndex) return "upcoming";
    return "upcoming";
  }
  const mins = minutesNow(now);
  if (mins >= cls.end) return "done";
  if (mins >= cls.start) return "live";
  return "upcoming";
}

function dateKeyEqual(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function studentsInClass(students: Student[], classId: string): Student[] {
  return students.filter((s) => s.classIds.includes(classId));
}

export function attendanceFor(
  attendance: Record<string, AttendanceRecord>,
  classId: string,
  date: string,
  studentId: string,
): AttendanceRecord | undefined {
  return attendance[`${classId}|${date}|${studentId}`];
}

export function rollCallStats(
  students: Student[],
  attendance: Record<string, AttendanceRecord>,
  classId: string,
  date: string,
): { total: number; marked: number; present: number; late: number; absent: number } {
  const roster = studentsInClass(students, classId);
  let marked = 0;
  let present = 0;
  let late = 0;
  let absent = 0;
  roster.forEach((student) => {
    const record = attendanceFor(attendance, classId, date, student.id);
    if (!record) return;
    marked += 1;
    if (record.status === "present") present += 1;
    if (record.status === "late") late += 1;
    if (record.status === "absent") absent += 1;
  });
  return { total: roster.length, marked, present, late, absent };
}

export function lowPackageStudents(students: Student[], threshold = 4): Student[] {
  return students
    .filter((s) => remainingLessons(s) <= threshold)
    .sort((a, b) => remainingLessons(a) - remainingLessons(b));
}

export function weeklyLessonSlots(students: Student[], classes: ClassSession[]): number {
  return classes.reduce((sum, cls) => sum + studentsInClass(students, cls.id).length, 0);
}

export function teacherStats(students: Student[], classes: ClassSession[], teacherId: string) {
  const own = classes.filter((c) => c.teacherId === teacherId);
  const studentIds = new Set<string>();
  own.forEach((c) => studentsInClass(students, c.id).forEach((s) => studentIds.add(s.id)));
  return { sessions: own.length, students: studentIds.size };
}

export function roomStats(classes: ClassSession[], roomId: string) {
  return { sessions: classes.filter((c) => c.roomId === roomId).length };
}

export function sortStudents(students: Student[], mode: "name" | "remaining" | "age", lang: "en" | "fa"): Student[] {
  const copy = [...students];
  if (mode === "remaining") return copy.sort((a, b) => remainingLessons(a) - remainingLessons(b));
  if (mode === "age") return copy.sort((a, b) => a.age - b.age);
  return copy.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang === "fa" ? "fa" : "en"));
}
