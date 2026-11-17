import { and, eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, studioState, users } from "../drizzle/schema";
import type { StudioData } from "../client/src/lib/types";
import { createSeedData } from "../client/src/data/seed";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(users).orderBy(users.createdAt);
}

export async function countOtherAdmins(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select({ id: users.id }).from(users)
    .where(and(eq(users.role, "admin"), ne(users.openId, openId)));
  return result.length;
}

export async function updateUserAccess(
  id: number,
  access: { role: "user" | "teacher" | "admin"; teacherId: string | null },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set(access).where(eq(users.id, id));
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getStudioState() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(studioState).where(eq(studioState.id, 1)).limit(1);
  return result[0] ?? null;
}

export async function ensureStudioState() {
  const existing = await getStudioState();
  if (existing) return existing;

  const seed = createSeedData();
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  try {
    await db.insert(studioState).values({ id: 1, version: seed.version, data: seed });
  } catch (error) {
    const afterRace = await getStudioState();
    if (afterRace) return afterRace;
    throw error;
  }
  return getStudioState();
}

export async function saveStudioState(data: StudioData) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(studioState).set({ version: data.version, data }).where(eq(studioState.id, 1));
  return getStudioState();
}
