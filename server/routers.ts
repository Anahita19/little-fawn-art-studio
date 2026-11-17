import { COOKIE_NAME } from "@shared/const";
import { createSeedData } from "../client/src/data/seed";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applyStudioAction } from "./studio";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const attendanceStatus = z.enum(["present", "late", "absent"]);
const attendanceInput = z.object({
  classId: z.string().min(1),
  date: z.string().min(8),
  studentId: z.string().min(1),
  status: attendanceStatus,
});

async function currentStudioData() {
  const snapshot = await db.ensureStudioState();
  if (!snapshot) throw new Error("Studio state could not be initialized");
  return snapshot.data;
}

async function updateStudio(user: { role: "user" | "teacher" | "admin"; teacherId: string | null }, action: Parameters<typeof applyStudioAction>[1]) {
  const current = await currentStudioData();
  const isAttendanceAction = action.type === "mark" || action.type === "markMany" || action.type === "clearClass";
  if (isAttendanceAction && user.role === "teacher") {
    const studioClass = current.classes.find((item) => item.id === action.classId);
    if (!studioClass || !user.teacherId || studioClass.teacherId !== user.teacherId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Teachers may only manage attendance for their own classes." });
    }
  } else if (user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "This action requires studio administrator access." });
  }
  const next = applyStudioAction(current, action, createSeedData());
  const saved = await db.saveStudioState(next);
  if (!saved) throw new Error("Studio state could not be saved");
  return saved.data;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  users: router({
    list: adminProcedure.query(async () => {
      const rows = await db.listUsers();
      return rows.map(({ openId: _openId, ...user }) => user);
    }),
    updateAccess: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        role: z.enum(["user", "teacher", "admin"]),
        teacherId: z.string().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.role === "teacher" && !input.teacherId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "A teacher account must be linked to a teacher profile." });
        }
        if (ctx.user.id === input.id && input.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot remove your own administrator access." });
        }
        const requestedTeacherId = input.role === "teacher" ? input.teacherId : null;
        if (requestedTeacherId) {
          const studio = await currentStudioData();
          if (!studio.teachers.some((teacher) => teacher.id === requestedTeacherId)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "That teacher profile does not exist." });
          }
        }
        const target = (await db.listUsers()).find((user) => user.id === input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
        if (target.role === "admin" && input.role !== "admin" && (await db.countOtherAdmins(target.openId)) === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The studio must keep at least one administrator." });
        }
        const updated = await db.updateUserAccess(input.id, { role: input.role, teacherId: requestedTeacherId });
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
        const { openId: _openId, ...safeUser } = updated;
        return safeUser;
      }),
  }),

  studio: router({
    bootstrap: protectedProcedure.query(() => currentStudioData()),
    markAttendance: protectedProcedure
      .input(attendanceInput)
      .mutation(({ ctx, input }) => updateStudio(ctx.user, { type: "mark", ...input })),
    markMany: protectedProcedure
      .input(
        z.object({
          classId: z.string().min(1),
          date: z.string().min(8),
          studentIds: z.array(z.string().min(1)),
          status: attendanceStatus,
        }),
      )
      .mutation(({ ctx, input }) => updateStudio(ctx.user, { type: "markMany", ...input })),
    clearClass: protectedProcedure
      .input(
        z.object({
          classId: z.string().min(1),
          date: z.string().min(8),
          studentIds: z.array(z.string().min(1)),
        }),
      )
      .mutation(({ ctx, input }) => updateStudio(ctx.user, { type: "clearClass", ...input })),
    renewPackage: protectedProcedure
      .input(z.object({ studentId: z.string().min(1) }))
      .mutation(({ ctx, input }) => updateStudio(ctx.user, { type: "renew", ...input })),
    reset: adminProcedure.mutation(({ ctx }) => updateStudio(ctx.user, { type: "reset" })),
  }),
});

export type AppRouter = typeof appRouter;
