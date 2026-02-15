/**
 * Simple rate limiter with queue and configurable delay.
 * Per gemini-api.md rate limiting strategy.
 * Gemini 2.0 Flash-Lite free tier: 30 RPM → 2.5s between requests.
 */
export class RateLimiter {
  private queue: (() => Promise<void>)[] = [];
  private running = false;
  private delayMs: number;
  private paused = false;
  private lastRequestTime = 0;

  constructor(delayMs = 2_500) {
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
      // Ensure minimum delay since last request
      const elapsed = Date.now() - this.lastRequestTime;
      if (elapsed < this.delayMs && this.lastRequestTime > 0) {
        await this.delay(this.delayMs - elapsed);
      }

      const fn = this.queue.shift();
      if (fn) {
        this.lastRequestTime = Date.now();
        await fn();
      }
    }

    this.running = false;
  }

  private delay(ms?: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms ?? this.delayMs));
  }
}
