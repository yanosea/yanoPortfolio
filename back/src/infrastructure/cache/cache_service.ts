/**
 * @fileoverview Cache repository implementation
 */

// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";

import { EnvironmentUtils, getEnvironmentUtils } from "../config/env_utils.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";

/**
 * Generic cache entry
 * @interface CacheEntry
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

/**
 * Cache Service
 * @class CacheService
 */
export class CacheService implements CacheRepository {
  private static memoryCache = new Map<string, CacheEntry>();
  private readonly defaultTtl: number;
  private readonly env: EnvironmentConfig;
  private readonly envUtils: EnvironmentUtils;

  /**
   * Construct a new CacheService
   * @param {EnvironmentConfig} env - Environment configuration
   */
  constructor(env: EnvironmentConfig) {
    this.env = env;
    this.envUtils = getEnvironmentUtils();
    this.defaultTtl = this.envUtils.getCacheTtlSeconds() * 1000;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {Promise<Result<{ found: boolean; data: unknown }, DomainError>>} - Result with cache hit status and data
   */
  async get(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: unknown }, DomainError>> {
    try {
      console.log("Getting cache:", { key, maxAge });

      // always check memory first (all environments)
      const memoryResult = this.getFromMemory(key, maxAge);
      if (memoryResult.found) {
        console.log("Cache: Memory hit");
        console.log("Cache:", {
          key,
          hit: true,
          hasData: memoryResult.data !== null,
        });
        return Result.ok(memoryResult);
      }

      // if not in memory and not local development, check KV
      if (!this.envUtils.isLocalDevelopment()) {
        const kvResult = await this.getFromKV(key, maxAge);
        if (kvResult.found) {
          // save to memory for faster subsequent access
          this.setToMemory(key, kvResult.data, this.defaultTtl);
          console.log("Cache: KV hit, saved to memory");
          console.log("Cache:", {
            key,
            hit: true,
            hasData: kvResult.data !== null,
          });
          return Result.ok(kvResult);
        }
      }

      // cache miss
      console.log("Cache: Complete miss");
      console.log("Cache:", {
        key,
        hit: false,
        hasData: false,
      });
      return Result.ok({ found: false, data: null });
    } catch (error: unknown) {
      const errorMessage = `Cache get failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      return Result.fail(
        this.envUtils.isLocalDevelopment()
          ? new DomainError(errorMessage, "CACHE_ERROR")
          : new ExternalServiceError(errorMessage, "Cloudflare KV"),
      );
    }
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {unknown} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  async set(
    key: string,
    data: unknown,
    ttl?: number,
  ): Promise<Result<void, DomainError>> {
    console.log("Setting cache:", { key, hasData: data !== null });
    try {
      const effectiveTtl = ttl || this.defaultTtl;

      // always set to memory cache first (all environments)
      this.setToMemory(key, data, effectiveTtl);
      console.log("Cache set to memory");

      // additionally set to KV in production
      if (!this.envUtils.isLocalDevelopment()) {
        const kvResult = await this.setToKV(key, data, effectiveTtl);
        if (kvResult) {
          console.log("Cache also set to KV");
        } else {
          console.warn(
            "Failed to set cache to KV, but memory succeeded:",
            key,
          );
        }
      }

      return Result.ok(undefined);
    } catch (error: unknown) {
      console.error("Cache set failed:", error);
      const errorMessage = `Cache set failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      return Result.fail(
        this.envUtils.isLocalDevelopment()
          ? new DomainError(errorMessage, "CACHE_ERROR")
          : new ExternalServiceError(errorMessage, "Cloudflare KV"),
      );
    }
  }

  /**
   * Get data from memory cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {{ found: boolean; data: unknown }} - Cache hit status and data
   */
  private getFromMemory(
    key: string,
    maxAge?: number,
  ): { found: boolean; data: unknown } {
    const entry = CacheService.memoryCache.get(key);
    if (!entry) {
      return { found: false, data: null };
    }

    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      CacheService.memoryCache.delete(key);
      return { found: false, data: null };
    }

    return { found: true, data: entry.data };
  }

  /**
   * Get data from KV cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Promise<{ found: boolean; data: unknown }>} - Cache hit status and data
   */
  private async getFromKV(
    key: string,
    maxAge?: number,
  ): Promise<{ found: boolean; data: unknown }> {
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      return { found: false, data: null };
    }

    const cached = await kvNamespace.get(key, { type: "json" });
    if (!cached) {
      return { found: false, data: null };
    }

    const entry = cached as CacheEntry;
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      await kvNamespace.delete(key);
      return { found: false, data: null };
    }

    return { found: true, data: entry.data };
  }

  /**
   * Set data to memory cache
   * @param {string} key - Cache key
   * @param {unknown} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  private setToMemory(
    key: string,
    data: unknown,
    ttl: number,
  ): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    CacheService.memoryCache.set(key, entry);
    console.log("Set to memory cache:", { key });
  }

  /**
   * Set data to KV cache
   * @param {string} key - Cache key
   * @param {unknown} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<boolean>} - Success status
   */
  private async setToKV(
    key: string,
    data: unknown,
    ttl: number,
  ): Promise<boolean> {
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      console.log("KV unavailable, fallback to memory only");
      return false;
    }

    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      // KV requires minimum 60 seconds TTL
      const kvTtlSeconds = Math.max(60, Math.floor(ttl / 1000));
      await kvNamespace.put(key, JSON.stringify(entry), {
        expirationTtl: kvTtlSeconds,
      });
      console.log("Set to KV cache:", { key, ttl: kvTtlSeconds });
      return true;
    } catch {
      return false;
    }
  }
}
