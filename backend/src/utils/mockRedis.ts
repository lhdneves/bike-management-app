/**
 * Mock Redis implementation for development/testing when Redis is not available
 * This is a simple in-memory implementation for basic functionality
 */

export class MockRedis {
  private data: Map<string, any> = new Map();
  private listData: Map<string, any[]> = new Map();

  // Basic Redis commands
  async set(key: string, value: string): Promise<string> {
    this.data.set(key, value);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async del(key: string): Promise<number> {
    return this.data.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) ? 1 : 0;
  }

  // List operations for Bull queue
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.listData.has(key)) {
      this.listData.set(key, []);
    }
    const list = this.listData.get(key)!;
    list.unshift(...values);
    return list.length;
  }

  async rpop(key: string): Promise<string | null> {
    const list = this.listData.get(key);
    if (!list || list.length === 0) {
      return null;
    }
    return list.pop() || null;
  }

  async llen(key: string): Promise<number> {
    const list = this.listData.get(key);
    return list ? list.length : 0;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.listData.get(key);
    if (!list) return [];
    
    let startIdx = start < 0 ? list.length + start : start;
    let stopIdx = stop < 0 ? list.length + stop : stop;
    
    startIdx = Math.max(0, startIdx);
    stopIdx = Math.min(list.length - 1, stopIdx);
    
    return list.slice(startIdx, stopIdx + 1);
  }

  // Hash operations
  private hashData: Map<string, Map<string, string>> = new Map();

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.hashData.has(key)) {
      this.hashData.set(key, new Map());
    }
    const hash = this.hashData.get(key)!;
    const isNew = !hash.has(field);
    hash.set(field, value);
    return isNew ? 1 : 0;
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashData.get(key);
    return hash ? hash.get(field) || null : null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.hashData.get(key);
    if (!hash) return {};
    
    const result: Record<string, string> = {};
    for (const [field, value] of hash) {
      result[field] = value;
    }
    return result;
  }

  // Expiration
  private expiry: Map<string, NodeJS.Timeout> = new Map();

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.data.has(key) && !this.listData.has(key) && !this.hashData.has(key)) {
      return 0;
    }

    // Clear existing expiry
    if (this.expiry.has(key)) {
      clearTimeout(this.expiry.get(key)!);
    }

    // Set new expiry
    const timeout = setTimeout(() => {
      this.data.delete(key);
      this.listData.delete(key);
      this.hashData.delete(key);
      this.expiry.delete(key);
    }, seconds * 1000);

    this.expiry.set(key, timeout);
    return 1;
  }

  // Connection simulation
  async ping(): Promise<string> {
    return 'PONG';
  }

  async quit(): Promise<string> {
    // Clear all timers
    for (const timeout of this.expiry.values()) {
      clearTimeout(timeout);
    }
    this.expiry.clear();
    return 'OK';
  }

  // For Bull compatibility
  duplicate() {
    return new MockRedis();
  }

  disconnect() {
    return this.quit();
  }

  status = 'ready';
}

// Create singleton instance
export const mockRedis = new MockRedis();

console.log('🔧 Using MockRedis for development (Redis not available)');