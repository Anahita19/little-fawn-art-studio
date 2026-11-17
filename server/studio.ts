import type { AttendanceRecord, AttendanceStatus, StudioData } from "../client/src/lib/types";
import { attendanceKey, PACKAGE_PRICE, PACKAGE_SIZE } from "../client/src/lib/types";
import { dateKey } from "../client/src/lib/time";

export type StudioAction =
  | { type: "mark"; classId: string; date: string; studentId: string; status: AttendanceStatus }
  | { type: "markMany"; classId: string; date: string; studentIds: string[]; status: AttendanceStatus }
  | { type: "clearClass"; classId: string; date: string; studentIds: string[] }
  | { type: "renew"; studentId: string }
  | { type: "reset" };

function counts(record: AttendanceRecord | undefined): boolean {
  return !!record && (record.status === "present" || record.status === "late");
}

function applyLessonDelta(state: StudioData, deltas: Map<string, number>): StudioData {
  if (deltas.size === 0) return state;
  const students = state.students.map((student) => {
    const delta = deltas.get(student.id);
    if (!delta) return student;
    const used = Math.min(student.purchased, Math.max(0, student.used + delta));
    return used === student.used ? student : { ...student, used };
  });
  return { ...state, students };
}

export function applyStudioAction(state: StudioData, action: StudioAction, resetState: StudioData): StudioData {
  switch (action.type) {
    case "mark": {
      const key = attendanceKey(action.classId, action.date, action.studentId);
      const previous = state.attendance[key];
      if (previous && previous.status === action.status) return state;
      const nextCounts = action.status === "present" || action.status === "late";
      const attendance = {
        ...state.attendance,
        [key]: {
          classId: action.classId,
          date: action.date,
          studentId: action.studentId,
          status: action.status,
          markedAt: Date.now(),
        },
      } satisfies Record<string, AttendanceRecord>;
      return applyLessonDelta({ ...state, attendance }, new Map([[action.studentId, (nextCounts ? 1 : 0) - (counts(previous) ? 1 : 0)]]));
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
        attendance[key] = { classId: action.classId, date: action.date, studentId, status: action.status, markedAt: Date.now() };
      });
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
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === action.studentId
            ? { ...student, purchased: student.purchased + PACKAGE_SIZE, renewals: [...student.renewals, { date: dateKey(new Date()), lessons: PACKAGE_SIZE, price: PACKAGE_PRICE }] }
            : student,
        ),
      };
    }
    case "reset":
      return resetState;
  }
}
