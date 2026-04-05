let cfContextLoader: null | unknown | undefined;
let warnedOnce = false;

async function loadContextLoader() {
  if (cfContextLoader !== undefined) return cfContextLoader;
  try {
    const mod = await import("@opennextjs/cloudflare");
    const fn = typeof mod.getCloudflareContext === "function"
      ? mod.getCloudflareContext
      : null;
    cfContextLoader = fn;
    return fn;
  } catch {
    cfContextLoader = null;
    return null;
  }
}

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
    const loader = await loadContextLoader();
    if (typeof loader !== "function") return null;
    const context = (await (
      loader as (options: { async: true }) => Promise<unknown>
    )({ async: true })) as {
      env?: { DB?: unknown };
    };
    const db = context.env?.DB;
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
