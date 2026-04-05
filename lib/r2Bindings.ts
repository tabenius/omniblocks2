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

export type R2ObjectLike = {
  key: string;
  size: number;
  uploaded: Date;
};

export type R2ListResultLike = {
  objects: R2ObjectLike[];
};

export type R2BodyLike = {
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type R2GetResultLike = {
  body: R2BodyLike;
  httpMetadata?: {
    contentType?: string;
  };
};

export type R2BucketLike = {
  get: (key: string) => Promise<R2GetResultLike | null>;
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    },
  ) => Promise<unknown>;
  list: (options?: { prefix?: string; limit?: number }) => Promise<R2ListResultLike>;
};

export async function getR2Bucket(): Promise<R2BucketLike | null> {
  try {
    const loader = await loadContextLoader();
    if (typeof loader !== "function") return null;
    const context = (await (
      loader as (options: { async: true }) => Promise<unknown>
    )({ async: true })) as {
      env?: { R2_BUCKET?: unknown };
    };
    const bucket = context.env?.R2_BUCKET;
    if (!bucket || typeof bucket !== "object") return null;
    if (!("get" in bucket) || !("put" in bucket) || !("list" in bucket)) return null;
    return bucket as R2BucketLike;
  } catch (error) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn("[r2Bindings] R2 binding unavailable:", error);
    }
    return null;
  }
}
