import { COOKIE_NAME } from "@shared/const";
import { createSeedData } from "../client/src/data/seed";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applyStudioAction } from "./studio";
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

async function updateStudio(action: Parameters<typeof applyStudioAction>[1]) {
  const current = await currentStudioData();
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

  studio: router({
    bootstrap: protectedProcedure.query(() => currentStudioData()),
    markAttendance: protectedProcedure
      .input(attendanceInput)
      .mutation(({ input }) => updateStudio({ type: "mark", ...input })),
    markMany: protectedProcedure
      .input(
        z.object({
          classId: z.string().min(1),
          date: z.string().min(8),
          studentIds: z.array(z.string().min(1)),
          status: attendanceStatus,
        }),
      )
      .mutation(({ input }) => updateStudio({ type: "markMany", ...input })),
    clearClass: protectedProcedure
      .input(
        z.object({
          classId: z.string().min(1),
          date: z.string().min(8),
          studentIds: z.array(z.string().min(1)),
        }),
      )
      .mutation(({ input }) => updateStudio({ type: "clearClass", ...input })),
    renewPackage: protectedProcedure
      .input(z.object({ studentId: z.string().min(1) }))
      .mutation(({ input }) => updateStudio({ type: "renew", ...input })),
    reset: adminProcedure.mutation(() => updateStudio({ type: "reset" })),
  }),
});

export type AppRouter = typeof appRouter;
