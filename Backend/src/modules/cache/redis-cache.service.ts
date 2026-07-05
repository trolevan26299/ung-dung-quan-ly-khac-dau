import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheNamespace } from './cache-keys';

const KEY_PREFIX = 'khacdau:cache:v1:';

/**
 * Redis cache-aside service. FAIL-OPEN theo thiết kế:
 * mọi lỗi Redis (mất kết nối, timeout, parse) đều bị nuốt và request rơi
 * thẳng xuống DB — không bao giờ ném lỗi ra tầng HTTP.
 */
@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis | null = null;
  private errorLogged = false;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(url, {
        // Fail-open: khi Redis chưa/không kết nối, lệnh reject ngay thay vì
        // xếp hàng chờ, để request không bị treo.
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy: (times) => Math.min(times * 300, 3000),
      });

      this.client.on('error', (err) => {
        if (!this.errorLogged) {
          this.logger.warn(
            `Redis khong san sang, cache tam tat den khi ket noi lai: ${err?.message || err}`,
          );
          this.errorLogged = true;
        }
      });

      this.client.on('connect', () => {
        this.errorLogged = false;
        this.logger.log('Redis da ket noi — cache dang hoat dong');
      });
    } catch (err: any) {
      this.client = null;
      this.logger.warn(`Khoi tao Redis that bai, cache bi tat: ${err?.message || err}`);
    }
  }

  onModuleDestroy() {
    this.client?.quit().catch(() => undefined);
  }

  /**
   * Cache-aside: trả cache nếu hit; nếu miss thì chạy fn(), chỉ cache khi
   * fn() thành công (lỗi/NotFound để propagate, KHÔNG cache).
   */
  async wrap<T>(
    namespace: CacheNamespace,
    params: unknown,
    ttlSeconds: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.client) return fn();

    const key = this.buildKey(namespace, params);

    // GET — hit thì trả luôn
    try {
      const cached = await this.client.get(key);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch (err: any) {
      // Fail-open: lỗi đọc cache -> chạy thẳng DB
      return fn();
    }

    // MISS — chạy DB (lỗi để propagate, không cache)
    const result = await fn();

    // SET — best effort, lỗi ghi cache không ảnh hưởng response
    try {
      await this.client.set(key, JSON.stringify(result), 'EX', ttlSeconds);
    } catch (err: any) {
      // nuốt lỗi ghi cache
    }

    return result;
  }

  /** Xóa toàn bộ key của các namespace bị ảnh hưởng bởi một lần ghi. */
  async invalidate(namespaces: CacheNamespace[]): Promise<void> {
    if (!this.client || !namespaces?.length) return;
    // Loại trùng để không quét cùng một namespace 2 lần
    const unique = Array.from(new Set(namespaces));
    await Promise.all(unique.map((ns) => this.flushNamespace(ns)));
  }

  private buildKey(namespace: CacheNamespace, params: unknown): string {
    return `${KEY_PREFIX}${namespace}:${this.hash(params)}`;
  }

  /** Hash ổn định (không phụ thuộc thứ tự key) để cùng query -> cùng key. */
  private hash(params: unknown): string {
    const s = this.stableStringify(params ?? {});
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return (h >>> 0).toString(36) + s.length.toString(36);
  }

  private stableStringify(value: any): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value) ?? 'null';
    }
    // Date phải serialize theo ISO — nếu không, Object.keys(date) === [] khiến
    // MỌI Date băm ra cùng một key (đụng cache giữa các khoảng ngày khác nhau).
    if (value instanceof Date) {
      return JSON.stringify(value.toISOString());
    }
    if (Array.isArray(value)) {
      return '[' + value.map((v) => this.stableStringify(v)).join(',') + ']';
    }
    const keys = Object.keys(value).sort();
    return (
      '{' +
      keys.map((k) => JSON.stringify(k) + ':' + this.stableStringify(value[k])).join(',') +
      '}'
    );
  }

  private async flushNamespace(namespace: CacheNamespace): Promise<void> {
    if (!this.client) return;
    const match = `${KEY_PREFIX}${namespace}:*`;
    try {
      const stream = this.client.scanStream({ match, count: 200 });
      const pending: Promise<unknown>[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            pending.push(this.client!.unlink(...keys));
          }
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      await Promise.all(pending);
    } catch (err: any) {
      // Fail-open: không xóa được cache thì thôi, TTL sẽ dọn sau
      if (!this.errorLogged) {
        this.logger.warn(`Xoa cache namespace ${namespace} that bai: ${err?.message || err}`);
      }
    }
  }
}
