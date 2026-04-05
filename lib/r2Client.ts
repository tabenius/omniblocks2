import { S3Client } from "@aws-sdk/client-s3";

export type R2Config = {
  bucket: string;
  publicUrl: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export const DEFAULT_STARTUP_ASSETS_KEY = "bootstrap/startup-assets.json";

export function getR2Config(): R2Config {
  const accessKeyId =
    process.env.CF_R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || "";
  const secretAccessKey =
    process.env.CF_R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "";
  const bucket = process.env.CF_R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || "";
  const publicUrl = process.env.CF_R2_PUBLIC_URL || process.env.S3_PUBLIC_URL || "";
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const endpoint =
    process.env.CF_R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "") ||
    process.env.S3_ENDPOINT ||
    "";

  if (!accessKeyId || !secretAccessKey || !bucket || !publicUrl || !endpoint) {
    throw new Error(
      "R2 is not configured. Required: CLOUDFLARE_ACCOUNT_ID, S3/CF_R2 credentials, bucket, and public URL.",
    );
  }

  return {
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ""),
    endpoint,
  };
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function bodyToText(body: unknown): Promise<string> {
  if (!body) return "";
  if (typeof body === "string") return body;
  if (
    typeof body === "object" &&
    body !== null &&
    "transformToString" in body &&
    typeof (body as { transformToString?: unknown }).transformToString === "function"
  ) {
    return (body as { transformToString: () => Promise<string> }).transformToString();
  }
  if (body instanceof Uint8Array) {
    return new TextDecoder().decode(body);
  }
  return "";
}
