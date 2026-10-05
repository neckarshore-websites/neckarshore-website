import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const LOCAL_FILE = join(process.cwd(), "analytics-local.json");

/**
 * How long a day of analytics is kept (planning#2877, accepted by the DPO
 * 2026-10-05). 90 because the read endpoint cannot look further back anyway
 * (GET /api/track caps `days` at 90). The privacy page states this number;
 * tests/unit/analytics-retention.test.ts fails if the two drift apart.
 */
export const RETENTION_DAYS = 90;
export const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

/**
 * Lifetime of the daily salt. A salt is created with the first event of a UTC
 * day and is needed until that day ends, so at most 24 h; one hour of slack.
 * After that the store deletes it, and the visitor ids of that day can no
 * longer be recomputed from an IP address and a user agent — by anyone,
 * including us.
 */
export const SALT_TTL_SECONDS = 25 * 60 * 60;

export interface AnalyticsStore {
  push(key: string, value: string): Promise<void>;
  list(key: string): Promise<string[]>;
  /** Add a value to a set (for unique-visitor counting). */
  addToSet(key: string, value: string): Promise<void>;
  /** Get the size of a set. */
  setSize(key: string): Promise<number>;
  /** The random salt of a UTC day; created on first use, never extended. */
  dailySalt(day: string): Promise<string>;
}

/** The slice of the Upstash client this store uses — narrow so a test can fake it. */
export interface RedisLike {
  /** MULTI/EXEC: the queued commands run as one transaction, all or none. */
  multi(): RedisTx;
  lrange(key: string, start: number, stop: number): Promise<unknown[]>;
  scard(key: string): Promise<number>;
  set(key: string, value: string, opts: { nx: true; ex: number }): Promise<unknown>;
  get(key: string): Promise<unknown>;
}

export interface RedisTx {
  lpush(key: string, value: string): RedisTx;
  sadd(key: string, value: string): RedisTx;
  expire(key: string, seconds: number, option: "NX"): RedisTx;
  exec(): Promise<unknown>;
}

export function createRedisStore(redis: RedisLike): AnalyticsStore {
  // The expiry lives INSIDE the two write methods, not at their call site, so a
  // future writer cannot store a key without one. NX = only when the key has no
  // expiry yet: the clock starts with the first event of a day and a later
  // write cannot push it out.
  //
  // Write and expiry go in ONE transaction. As two separate calls, a failure
  // between them (timeout, rate limit) would leave a key with data and no
  // expiry — the exact state this change exists to end — and nothing would
  // report it.
  return {
    async push(key, value) {
      await redis.multi().lpush(key, value).expire(key, RETENTION_SECONDS, "NX").exec();
    },
    async list(key) {
      const raw = await redis.lrange(key, 0, -1);
      return raw.map((r) => (typeof r === "string" ? r : JSON.stringify(r)));
    },
    async addToSet(key, value) {
      await redis.multi().sadd(key, value).expire(key, RETENTION_SECONDS, "NX").exec();
    },
    async setSize(key) {
      return await redis.scard(key);
    },
    async dailySalt(day) {
      const key = `salt:${day}`;
      // SET NX: the first request of the day wins, every later one (and every
      // concurrent one) reads the same value back. The "s:" prefix keeps the
      // client from parsing an all-digit hex string as a number.
      await redis.set(key, `s:${randomBytes(32).toString("hex")}`, {
        nx: true,
        ex: SALT_TTL_SECONDS,
      });
      const salt = await redis.get(key);
      if (typeof salt !== "string" || salt.length === 0) {
        // Fail closed: without a salt the id would be recomputable.
        throw new Error("daily salt unavailable");
      }
      return salt;
    },
  };
}

/**
 * Local development store (a JSON file, gitignored). It has no expiry: it never
 * holds visitor data from the live site.
 */
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
    async addToSet(key, value) {
      const data = read();
      const setKey = `set:${key}`;
      if (!data[setKey]) data[setKey] = [];
      if (!data[setKey].includes(value)) {
        data[setKey].push(value);
        write(data);
      }
    },
    async setSize(key) {
      const data = read();
      return (data[`set:${key}`] || []).length;
    },
    async dailySalt(day) {
      const data = read();
      const key = `salt:${day}`;
      if (!data[key]?.[0]) {
        for (const k of Object.keys(data)) if (k.startsWith("salt:")) delete data[k];
        data[key] = [`s:${randomBytes(32).toString("hex")}`];
        write(data);
      }
      return data[key][0];
    },
  };
}

const hasRedis = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const store: AnalyticsStore = hasRedis
  ? createRedisStore(Redis.fromEnv() as unknown as RedisLike)
  : createLocalStore();
