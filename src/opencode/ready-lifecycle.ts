import { logger } from "../utils/logger.js";

export type OpencodeReadyHandler = (reason: string) => Promise<void> | void;

class OpencodeReadyLifecycle {
  private ready = false;
  private handlers = new Set<OpencodeReadyHandler>();

  onReady(handler: OpencodeReadyHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  isReady(): boolean {
    return this.ready;
  }

  async notifyReady(reason: string): Promise<boolean> {
    if (this.ready) {
      logger.debug(`[MiMoCodeReady] Ready notification ignored: reason=${reason}`);
      return false;
    }

    this.ready = true;
    logger.info(`[MiMoCodeReady] MiMoCode server is ready: reason=${reason}`);

    for (const handler of this.handlers) {
      try {
        await handler(reason);
      } catch (error) {
        logger.warn(`[MiMoCodeReady] Ready handler failed: reason=${reason}`, error);
      }
    }

    return true;
  }

  notifyUnavailable(reason: string): boolean {
    if (!this.ready) {
      logger.debug(`[MiMoCodeReady] Unavailable notification ignored: reason=${reason}`);
      return false;
    }

    this.ready = false;
    logger.warn(`[MiMoCodeReady] MiMoCode server became unavailable: reason=${reason}`);
    return true;
  }

  __resetForTests(): void {
    this.ready = false;
    this.handlers.clear();
  }
}

export const opencodeReadyLifecycle = new OpencodeReadyLifecycle();
