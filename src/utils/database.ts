export interface DatabaseConfig {
  type: "sqlite" | "mysql" | "postgres";
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  filename?: string; // for SQLite
}

export const dbConfig: DatabaseConfig = {
  type: (process.env.DB_TYPE as any) || "sqlite",
  filename: process.env.DB_FILENAME || "./cek-ign.db",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME || "cek_ign",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
};

// Simple in-memory cache for frequent requests
export class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const cache = new SimpleCache();
