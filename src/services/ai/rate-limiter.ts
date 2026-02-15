/**
 * Simple rate limiter with queue and configurable delay.
 * Per gemini-api.md rate limiting strategy.
 */
export class RateLimiter {
  private queue: (() => Promise<void>)[] = [];
  private running = false;
  private delayMs: number;
  private paused = false;

  constructor(delayMs = 4000) {
    this.delayMs = delayMs;
  }

  /**
   * Enqueue a function to be executed respecting the rate limit.
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      void this.processQueue();
    });
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    void this.processQueue();
  }

  clear(): void {
    this.queue = [];
    this.paused = false;
    this.running = false;
  }

  get queueLength(): number {
    return this.queue.length;
  }

  private async processQueue(): Promise<void> {
    if (this.running || this.paused) return;
    this.running = true;

    while (this.queue.length > 0 && !this.paused) {
      const fn = this.queue.shift();
      if (fn) {
        await fn();
        if (this.queue.length > 0 && !this.paused) {
          await this.delay();
        }
      }
    }

    this.running = false;
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
