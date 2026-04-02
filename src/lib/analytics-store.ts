import { Redis } from "@upstash/redis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const LOCAL_FILE = join(process.cwd(), "analytics-local.json");

interface AnalyticsStore {
  push(key: string, value: string): Promise<void>;
  list(key: string): Promise<string[]>;
}

function createRedisStore(): AnalyticsStore {
  const redis = Redis.fromEnv();
  return {
    async push(key, value) {
      await redis.lpush(key, value);
    },
    async list(key) {
      const raw = await redis.lrange(key, 0, -1);
      return raw.map((r) => (typeof r === "string" ? r : JSON.stringify(r)));
    },
  };
}

function createLocalStore(): AnalyticsStore {
  function read(): Record<string, string[]> {
    if (!existsSync(LOCAL_FILE)) return {};
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  }

  function write(data: Record<string, string[]>) {
    writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
  }

  return {
    async push(key, value) {
      const data = read();
      if (!data[key]) data[key] = [];
      data[key].unshift(value);
      write(data);
    },
    async list(key) {
      return read()[key] || [];
    },
  };
}

const hasRedis = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const store: AnalyticsStore = hasRedis
  ? createRedisStore()
  : createLocalStore();
