export type Lang = "en" | "fa";

export interface Bilingual {
  en: string;
  fa: string;
}

export type AnimalKind =
  | "fawn"
  | "bunny"
  | "bear"
  | "cat"
  | "fox"
  | "owl"
  | "chick"
  | "panda"
  | "koala"
  | "mouse"
  | "hedgehog"
  | "frog";

export interface Teacher {
  id: string;
  name: Bilingual;
  role: Bilingual;
  animal: AnimalKind;
  tint: string;
  since: number;
}

export interface Room {
  id: string;
  name: Bilingual;
  note: Bilingual;
  capacity: number;
  tint: string;
}

export interface ClassSession {
  id: string;
  name: Bilingual;
  level: Bilingual;
  teacherId: string;
  roomId: string;
  /** 0 = Saturday … 6 = Friday (Iranian week) */
  day: number;
  /** minutes from midnight */
  start: number;
  end: number;
  ageMin: number;
  ageMax: number;
  tint: string;
}

export interface Artwork {
  id: string;
  title: Bilingual;
  medium: Bilingual;
  image: string;
  date: string;
}

export interface Renewal {
  date: string;
  lessons: number;
  price: number;
}

export interface Student {
  id: string;
  name: Bilingual;
  age: number;
  animal: AnimalKind;
  tint: string;
  guardian: Bilingual;
  phone: string;
  joined: string;
  classIds: string[];
  purchased: number;
  used: number;
  renewals: Renewal[];
  artworks: Artwork[];
  note: Bilingual;
}

export type AttendanceStatus = "present" | "late" | "absent";

export interface AttendanceRecord {
  classId: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: number;
}

export interface StudioData {
  version: number;
  students: Student[];
  classes: ClassSession[];
  teachers: Teacher[];
  rooms: Room[];
  attendance: Record<string, AttendanceRecord>;
}

export const PACKAGE_SIZE = 20;
export const PACKAGE_PRICE = 400;
export const LOW_LESSON_THRESHOLD = 4;

export type PackageState = "healthy" | "low" | "empty";

export function packageState(remaining: number): PackageState {
  if (remaining <= 0) return "empty";
  if (remaining <= LOW_LESSON_THRESHOLD) return "low";
  return "healthy";
}

export function remainingLessons(student: Student): number {
  return Math.max(0, student.purchased - student.used);
}

export function attendanceKey(classId: string, date: string, studentId: string): string {
  return `${classId}|${date}|${studentId}`;
}
