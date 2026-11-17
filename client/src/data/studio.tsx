import { useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { createContext } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n/LanguageProvider";
import { createSeedData } from "./seed";
import type { AttendanceStatus, StudioData } from "@/lib/types";

type Action =
  | { type: "mark"; classId: string; date: string; studentId: string; status: AttendanceStatus }
  | { type: "markMany"; classId: string; date: string; studentIds: string[]; status: AttendanceStatus }
  | { type: "clearClass"; classId: string; date: string; studentIds: string[] }
  | { type: "renew"; studentId: string }
  | { type: "reset" };

type LocalAction = Action | { type: "clearOptimistic" };

interface StudioContextValue {
  data: StudioData;
  loading: boolean;
  saving: boolean;
  error: unknown;
  markAttendance: (classId: string, date: string, studentId: string, status: AttendanceStatus) => void;
  markMany: (classId: string, date: string, studentIds: string[], status: AttendanceStatus) => void;
  clearClass: (classId: string, date: string, studentIds: string[]) => void;
  renewPackage: (studentId: string) => void;
  reset: () => void;
  retry: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function applyLocalAction(state: StudioData | null, action: LocalAction): StudioData | null {
  if (action.type === "clearOptimistic") return null;
  if (!state) return state;
  if (action.type === "reset") return createSeedData();
  if (action.type === "renew") {
    return {
      ...state,
      students: state.students.map((student) =>
        student.id === action.studentId
          ? { ...student, purchased: student.purchased + 20, renewals: [...student.renewals, { date: new Date().toISOString().slice(0, 10), lessons: 20, price: 400 }] }
          : student,
      ),
    };
  }
  const next = structuredClone(state);
  const counts = (status?: AttendanceStatus) => status === "present" || status === "late";
  const adjust = (studentId: string, delta: number) => {
    next.students = next.students.map((student) => student.id === studentId ? { ...student, used: Math.min(student.purchased, Math.max(0, student.used + delta)) } : student);
  };
  const markOne = (classId: string, date: string, studentId: string, status: AttendanceStatus) => {
    const key = `${classId}|${date}|${studentId}`;
    const previous = next.attendance[key];
    if (previous?.status === status) return;
    next.attendance[key] = { classId, date, studentId, status, markedAt: Date.now() };
    adjust(studentId, (counts(status) ? 1 : 0) - (previous && counts(previous.status) ? 1 : 0));
  };
  if (action.type === "mark") markOne(action.classId, action.date, action.studentId, action.status);
  if (action.type === "markMany") action.studentIds.forEach((studentId) => markOne(action.classId, action.date, studentId, action.status));
  if (action.type === "clearClass") {
    action.studentIds.forEach((studentId) => {
      const key = `${action.classId}|${action.date}|${studentId}`;
      const previous = next.attendance[key];
      if (previous && counts(previous.status)) adjust(studentId, -1);
      delete next.attendance[key];
    });
  }
  return next;
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const studioQuery = trpc.studio.bootstrap.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const [optimistic, dispatch] = useReducer(applyLocalAction, null);
  const sync = (data: StudioData) => { utils.studio.bootstrap.setData(undefined, data); dispatch({ type: "clearOptimistic" }); };
  const mutation = trpc.studio.markAttendance.useMutation({ onSuccess: sync });
  const markManyMutation = trpc.studio.markMany.useMutation({ onSuccess: sync });
  const clearMutation = trpc.studio.clearClass.useMutation({ onSuccess: sync });
  const renewMutation = trpc.studio.renewPackage.useMutation({ onSuccess: (data) => { sync(data); toast.success(t("common.saved")); } });
  const resetMutation = trpc.studio.reset.useMutation({ onSuccess: (data) => { sync(data); toast.success(t("common.resetDone")); } });

  const base = studioQuery.data ?? createSeedData();
  const data = optimistic ?? base;
  const markAttendance = useCallback((classId: string, date: string, studentId: string, status: AttendanceStatus) => {
    dispatch({ type: "mark", classId, date, studentId, status });
    mutation.mutate({ classId, date, studentId, status });
  }, [mutation]);
  const markMany = useCallback((classId: string, date: string, studentIds: string[], status: AttendanceStatus) => {
    dispatch({ type: "markMany", classId, date, studentIds, status });
    markManyMutation.mutate({ classId, date, studentIds, status });
  }, [markManyMutation]);
  const clearClass = useCallback((classId: string, date: string, studentIds: string[]) => {
    dispatch({ type: "clearClass", classId, date, studentIds });
    clearMutation.mutate({ classId, date, studentIds });
  }, [clearMutation]);
  const renewPackage = useCallback((studentId: string) => {
    dispatch({ type: "renew", studentId });
    renewMutation.mutate({ studentId });
  }, [renewMutation]);
  const reset = useCallback(() => resetMutation.mutate(), [resetMutation]);
  const retry = useCallback(() => { void studioQuery.refetch(); }, [studioQuery]);
  const saving = mutation.isPending || markManyMutation.isPending || clearMutation.isPending || renewMutation.isPending || resetMutation.isPending;
  return (
    <StudioContext.Provider value={{ data, loading: studioQuery.isLoading, saving, error: studioQuery.error, markAttendance, markMany, clearClass, renewPackage, reset, retry }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

export function useLookup() {
  const { data } = useStudio();
  return useMemo(() => ({
    teacherById: (id: string) => data.teachers.find((t) => t.id === id),
    roomById: (id: string) => data.rooms.find((r) => r.id === id),
    classById: (id: string) => data.classes.find((c) => c.id === id),
    studentById: (id: string) => data.students.find((s) => s.id === id),
  }), [data]);
}
