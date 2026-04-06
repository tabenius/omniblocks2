import { getCloudflareEnv } from "./cfContext";

let warnedOnce = false;

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
  delete?: (key: string) => Promise<unknown>;
};

export async function getR2Bucket(): Promise<R2BucketLike | null> {
  try {
    const env = await getCloudflareEnv();
    const bucket = env?.R2_BUCKET;
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
