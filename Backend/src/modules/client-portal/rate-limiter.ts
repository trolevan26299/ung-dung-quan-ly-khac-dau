// Giới hạn số lần gọi theo key trong một khoảng thời gian (lưu trong RAM).
// Đủ dùng vì backend chạy 1 container; khởi động lại thì bộ đếm reset.
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  private recent(key: string, now: number) {
    const list = (this.hits.get(key) || []).filter(t => now - t < this.windowMs);
    if (list.length) this.hits.set(key, list);
    else this.hits.delete(key);
    return list;
  }

  isBlocked(key: string): boolean {
    return this.recent(key, Date.now()).length >= this.limit;
  }

  hit(key: string) {
    const now = Date.now();
    const list = this.recent(key, now);
    list.push(now);
    this.hits.set(key, list);
  }

  reset(key: string) {
    this.hits.delete(key);
  }
}
