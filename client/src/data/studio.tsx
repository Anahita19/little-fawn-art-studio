import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { createSeedData } from "./seed";
import type { AttendanceRecord, AttendanceStatus, StudioData } from "@/lib/types";
import { attendanceKey, PACKAGE_PRICE, PACKAGE_SIZE } from "@/lib/types";
import { dateKey } from "@/lib/time";

const STORAGE_KEY = "littlefawn:studio:v1";
const DATA_VERSION = 2;

type Action =
  | { type: "mark"; classId: string; date: string; studentId: string; status: AttendanceStatus }
  | { type: "markMany"; classId: string; date: string; studentIds: string[]; status: AttendanceStatus }
  | { type: "clearClass"; classId: string; date: string; studentIds: string[] }
  | { type: "renew"; studentId: string }
  | { type: "reset" };

function counts(record: AttendanceRecord | undefined): boolean {
  return !!record && (record.status === "present" || record.status === "late");
}

function reducer(state: StudioData, action: Action): StudioData {
  switch (action.type) {
    case "mark": {
      const key = attendanceKey(action.classId, action.date, action.studentId);
      const previous = state.attendance[key];
      if (previous && previous.status === action.status) return state;
      const nextCounts = action.status === "present" || action.status === "late";
      const delta = (nextCounts ? 1 : 0) - (counts(previous) ? 1 : 0);
      const attendance: Record<string, AttendanceRecord> = {
        ...state.attendance,
        [key]: {
          classId: action.classId,
          date: action.date,
          studentId: action.studentId,
          status: action.status,
          markedAt: Date.now(),
        },
      };
      return applyLessonDelta({ ...state, attendance }, new Map([[action.studentId, delta]]));
    }
    case "markMany": {
      const deltas = new Map<string, number>();
      const attendance = { ...state.attendance };
      action.studentIds.forEach((studentId) => {
        const key = attendanceKey(action.classId, action.date, studentId);
        const previous = attendance[key];
        if (previous && previous.status === action.status) return;
        const delta = 1 - (counts(previous) ? 1 : 0);
        deltas.set(studentId, (deltas.get(studentId) ?? 0) + delta);
        attendance[key] = {
          classId: action.classId,
          date: action.date,
          studentId,
          status: action.status,
          markedAt: Date.now(),
        };
      });
      if (deltas.size === 0) return state;
      return applyLessonDelta({ ...state, attendance }, deltas);
    }
    case "clearClass": {
      const attendance = { ...state.attendance };
      const deltas = new Map<string, number>();
      action.studentIds.forEach((studentId) => {
        const key = attendanceKey(action.classId, action.date, studentId);
        const previous = attendance[key];
        if (!previous) return;
        if (counts(previous)) deltas.set(studentId, (deltas.get(studentId) ?? 0) - 1);
        delete attendance[key];
      });
      return applyLessonDelta({ ...state, attendance }, deltas);
    }
    case "renew": {
      const students = state.students.map((student) => {
        if (student.id !== action.studentId) return student;
        return {
          ...student,
          purchased: student.purchased + PACKAGE_SIZE,
          renewals: [
            ...student.renewals,
            { date: dateKey(new Date()), lessons: PACKAGE_SIZE, price: PACKAGE_PRICE },
          ],
        };
      });
      return { ...state, students };
    }
    case "reset":
      return createSeedData();
    default:
      return state;
  }
}

function applyLessonDelta(state: StudioData, deltas: Map<string, number>): StudioData {
  if (deltas.size === 0) return state;
  const students = state.students.map((student) => {
    const delta = deltas.get(student.id);
    if (!delta) return student;
    const used = Math.min(student.purchased, Math.max(0, student.used + delta));
    if (used === student.used) return student;
    return { ...student, used };
  });
  return { ...state, students };
}

function loadState(): StudioData {
  if (typeof window === "undefined") return createSeedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedData();
    const parsed = JSON.parse(raw) as StudioData;
    if (!parsed || parsed.version !== DATA_VERSION || !Array.isArray(parsed.students)) {
      return createSeedData();
    }
    if (!parsed.attendance) parsed.attendance = {};
    return parsed;
  } catch {
    return createSeedData();
  }
}

interface StudioContextValue {
  data: StudioData;
  markAttendance: (classId: string, date: string, studentId: string, status: AttendanceStatus) => void;
  markMany: (classId: string, date: string, studentIds: string[], status: AttendanceStatus) => void;
  clearClass: (classId: string, date: string, studentIds: string[]) => void;
  renewPackage: (studentId: string) => void;
  reset: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage may be full or blocked */
    }
  }, [data]);

  const markAttendance = useCallback(
    (classId: string, date: string, studentId: string, status: AttendanceStatus) =>
      dispatch({ type: "mark", classId, date, studentId, status }),
    [],
  );
  const markMany = useCallback(
    (classId: string, date: string, studentIds: string[], status: AttendanceStatus) =>
      dispatch({ type: "markMany", classId, date, studentIds, status }),
    [],
  );
  const clearClass = useCallback(
    (classId: string, date: string, studentIds: string[]) =>
      dispatch({ type: "clearClass", classId, date, studentIds }),
    [],
  );
  const renewPackage = useCallback((studentId: string) => dispatch({ type: "renew", studentId }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo<StudioContextValue>(
    () => ({ data, markAttendance, markMany, clearClass, renewPackage, reset }),
    [data, markAttendance, markMany, clearClass, renewPackage, reset],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

export function useLookup() {
  const { data } = useStudio();
  return useMemo(
    () => ({
      teacherById: (id: string) => data.teachers.find((t) => t.id === id),
      roomById: (id: string) => data.rooms.find((r) => r.id === id),
      classById: (id: string) => data.classes.find((c) => c.id === id),
      studentById: (id: string) => data.students.find((s) => s.id === id),
    }),
    [data],
  );
}
