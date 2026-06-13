import { reconcileStoredModelSelection } from "../app/services/model-selection-service.js";
import { warmupSessionDirectoryCache } from "../app/services/session-cache-service.js";
import { logger } from "../utils/logger.js";
import { opencodeClient } from "./client.js";
import { opencodeReadyLifecycle } from "./ready-lifecycle.js";

let readyRefreshRegistered = false;

export async function isOpencodeServerHealthy(): Promise<boolean> {
  try {
    const { data, error } = await opencodeClient.global.health();
    return !error && data?.healthy === true;
  } catch {
    return false;
  }
}

export async function refreshSessionCacheAfterOpencodeReady(reason: string): Promise<void> {
  try {
    await warmupSessionDirectoryCache();
    logger.debug(`[MiMoCodeReady] Session cache refreshed: reason=${reason}`);
  } catch (error) {
    logger.warn(`[MiMoCodeReady] Failed to refresh session cache: reason=${reason}`, error);
  }

  try {
    await reconcileStoredModelSelection({ forceCatalogRefresh: true });
    logger.debug(`[MiMoCodeReady] Model catalog refreshed: reason=${reason}`);
  } catch (error) {
    logger.warn(`[MiMoCodeReady] Failed to refresh model catalog: reason=${reason}`, error);
  }
}

export async function refreshSessionCacheIfOpencodeReady(reason: string): Promise<boolean> {
  if (!(await isOpencodeServerHealthy())) {
    opencodeReadyLifecycle.notifyUnavailable(reason);
    logger.warn(
      `[MiMoCodeReady] MiMoCode server is not running; skipping session cache refresh: reason=${reason}`,
    );
    return false;
  }

  await refreshSessionCacheAfterOpencodeReady(reason);
  return true;
}

export function registerMiMoCodeReadyRefreshHandler(): void {
  if (readyRefreshRegistered) {
    return;
  }

  readyRefreshRegistered = true;
  opencodeReadyLifecycle.onReady((reason) => refreshSessionCacheAfterOpencodeReady(reason));
}

export async function notifyOpencodeReadyIfHealthy(reason: string): Promise<boolean> {
  if (!(await isOpencodeServerHealthy())) {
    opencodeReadyLifecycle.notifyUnavailable(reason);
    logger.warn(`[MiMoCodeReady] MiMoCode server is not running: reason=${reason}`);
    return false;
  }

  return opencodeReadyLifecycle.notifyReady(reason);
}
