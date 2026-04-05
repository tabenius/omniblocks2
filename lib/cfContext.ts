let cfContextLoader: null | unknown | undefined;

async function loadContextLoader() {
  if (cfContextLoader !== undefined) return cfContextLoader;
  try {
    const mod = await import("@opennextjs/cloudflare");
    const fn =
      typeof mod.getCloudflareContext === "function" ? mod.getCloudflareContext : null;
    cfContextLoader = fn;
    return fn;
  } catch {
    cfContextLoader = null;
    return null;
  }
}

export async function getCloudflareEnv(): Promise<Record<string, unknown> | null> {
  const loader = await loadContextLoader();
  if (typeof loader !== "function") return null;
  const context = (await (
    loader as (options: { async: true }) => Promise<unknown>
  )({ async: true })) as { env?: Record<string, unknown> };
  return context.env ?? null;
}
