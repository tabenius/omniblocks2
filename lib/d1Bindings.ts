import { getCloudflareEnv } from "./cfContext";

let warnedOnce = false;

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  run: () => Promise<unknown>;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<{ results: T[] }>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatement;
};

export async function getD1Database(): Promise<D1DatabaseLike | null> {
  try {
    const env = await getCloudflareEnv();
    const db = env?.DB;
    if (!db || typeof db !== "object") return null;
    if (!("prepare" in db) || typeof (db as { prepare?: unknown }).prepare !== "function") {
      return null;
    }
    return db as D1DatabaseLike;
  } catch (error) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn("[d1Bindings] D1 binding unavailable:", error);
    }
    return null;
  }
}
