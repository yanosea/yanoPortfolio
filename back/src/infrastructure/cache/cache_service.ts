/**
 * @fileoverview Cache repository implementation
 */

// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";
import { EncryptionRepository } from "@/domain/security/encryption_repository.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";

import { EnvironmentUtils, getEnvironmentUtils } from "../config/env_utils.ts";

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
  private readonly encryptionService: EncryptionRepository;

  /**
   * Construct a new CacheService
   * @param {EnvironmentConfig} env - Environment configuration
   * @param {EncryptionRepository} encryptionService - Encryption service for secure data handling
   */
  constructor(
    env: EnvironmentConfig,
    encryptionService: EncryptionRepository,
  ) {
    this.env = env;
    this.envUtils = getEnvironmentUtils();
    this.defaultTtl = this.envUtils.getCacheTtlSeconds() * 1000;
    this.encryptionService = encryptionService;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @param {boolean} useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @param {boolean} needDecryption - Whether the cached data needs to be decrypted (optional, defaults to false)
   * @returns {Promise<Result<{ found: boolean; data: unknown }, DomainError>>} - Result with cache hit status and data
   */
  async get(
    key: string,
    maxAge?: number,
    useKV = false,
    needDecryption = false,
  ): Promise<Result<{ found: boolean; data: unknown }, DomainError>> {
    try {
      console.log("Getting cache:", { key, maxAge, useKV, needDecryption });
      // always check memory first (all environments)
      const memoryResult = this.getFromMemory(key, maxAge);
      if (memoryResult.found) {
        // memory hit
        console.log("Cache: Memory hit");
        if (needDecryption) {
          // if decryption is needed, ensure encryption service is available
          if (!this.encryptionService.isAvailable()) {
            return Result.fail(
              new DomainError(
                "Decryption requested but encryption service is not available",
                "ENCRYPTION_UNAVAILABLE",
              ),
            );
          }
          // decrypt sensitive data directly
          const decryptResult = await this.encryptionService.decrypt(
            memoryResult.data as string,
          );
          if (decryptResult.isFail()) {
            // if decryption fails, pass through the error
            const error = decryptResult.match({
              ok: () => null,
              fail: (err) => err,
            });
            console.error("Cache: Failed to decrypt memory data:", error);
            return Result.fail(error!);
          }
          // successfully decrypted
          const decryptedString = decryptResult.unwrap();
          memoryResult.data = JSON.parse(decryptedString);
          console.log("Cache: Memory hit, data decrypted");
        }
        // return decrypted data from memory
        console.log("Cache:", {
          key,
          hit: true,
          hasData: memoryResult.data !== null,
        });
        return Result.ok(memoryResult);
      }
      // if not in memory and not local development, check KV (only if useKV is true)
      if (!this.envUtils.isLocalDevelopment() && useKV) {
        // attempt to get from KV
        const kvResult = await this.getFromKV(key, maxAge);
        if (kvResult.found) {
          // KV hit
          console.log("Cache: KV hit");
          if (needDecryption) {
            // if decryption is needed, ensure encryption service is available
            if (!this.encryptionService.isAvailable()) {
              return Result.fail(
                new DomainError(
                  "Decryption requested but encryption service is not available",
                  "ENCRYPTION_UNAVAILABLE",
                ),
              );
            }
            // decrypt sensitive data directly
            const decryptResult = await this.encryptionService.decrypt(
              kvResult.data as string,
            );
            if (decryptResult.isFail()) {
              // if decryption fails, pass through the error
              const error = decryptResult.match({
                ok: () => null,
                fail: (err) => err,
              });
              console.error("Cache: Failed to decrypt KV data:", error);
              return Result.fail(error!);
            }
            // successfully decrypted
            const decryptedString = decryptResult.unwrap();
            kvResult.data = JSON.parse(decryptedString);
            console.log("Cache: KV hit, data decrypted");
          }
          // save decrypted data to memory for faster subsequent access
          console.log("Cache: Saving KV data to memory");
          this.setToMemory(key, kvResult.data, this.defaultTtl);
          console.log("Cache: Saved KV data to memory");
          // return decrypted data from KV
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
      // if any unexpected error occurs, pass through the error
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
   * @param {boolean} useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @param {boolean} useEncryption - Whether the data should be encrypted before storage (optional, defaults to false)
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  async set(
    key: string,
    data: unknown,
    ttl?: number,
    useKV = false,
    useEncryption = false,
  ): Promise<Result<void, DomainError>> {
    console.log("Setting cache:", {
      key,
      hasData: data !== null,
      useKV,
      useEncryption,
    });
    try {
      const effectiveTtl = ttl || this.defaultTtl;
      if (useEncryption) {
        // if encryption is needed, ensure encryption service is available
        if (!this.encryptionService.isAvailable()) {
          return Result.fail(
            new DomainError(
              "Encryption requested but encryption service is not available",
              "ENCRYPTION_UNAVAILABLE",
            ),
          );
        }
        // encrypt sensitive data before storing
        const encryptResult = await this.encryptionService.encrypt(
          JSON.stringify(data),
        );
        if (encryptResult.isFail()) {
          // if encryption fails, pass through the error
          const error = encryptResult.match({
            ok: () => null,
            fail: (err) => err,
          });
          console.error("Failed to encrypt sensitive data:", error);
          return Result.fail(error!);
        }
        // use encrypted string for storage
        data = encryptResult.unwrap();
        console.log("Cache: Sensitive data encrypted");
      }
      // always set to memory cache first (all environments)
      this.setToMemory(key, data, effectiveTtl);
      console.log("Cache set to memory");
      // additionally set to KV in production (only if useKV is true)
      if (!this.envUtils.isLocalDevelopment() && useKV) {
        // attempt to set to KV
        const kvResult = await this.setToKV(
          key,
          data,
          effectiveTtl,
        );
        if (kvResult) {
          // succeeded to set to KV
          console.log("Cache also set to KV");
        } else {
          // failed to set to KV, but memory succeeded
          console.warn(
            "Failed to set cache to KV, but memory succeeded:",
            key,
          );
        }
      } else if (!useKV) {
        // skipping KV as per request
        console.log("Cache: Skipping KV (memory-only mode)");
      }
      return Result.ok(undefined);
    } catch (error: unknown) {
      // if any unexpected error occurs, pass through the error
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
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {{ found: boolean; data: unknown }} - Cache hit status and data
   */
  private getFromMemory(
    key: string,
    maxAge?: number,
  ): { found: boolean; data: unknown } {
    // attempt to get from memory
    const entry = CacheService.memoryCache.get(key);
    if (!entry) {
      // cache miss
      return { found: false, data: null };
    }
    // validate TTL
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // expired
      CacheService.memoryCache.delete(key);
      return { found: false, data: null };
    }
    // cache hit
    return { found: true, data: entry.data };
  }

  /**
   * Get data from KV cache
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {Promise<{ found: boolean; data: unknown }>} - Cache hit status and data
   */
  private async getFromKV(
    key: string,
    maxAge?: number,
  ): Promise<{ found: boolean; data: unknown }> {
    // check if KV is available
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      // KV unavailable
      return { found: false, data: null };
    }
    // attempt to get from KV
    const cached = await kvNamespace.get(key, { type: "json" });
    if (!cached) {
      // cache miss
      return { found: false, data: null };
    }
    // validate TTL
    const entry = cached as CacheEntry;
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // expired
      await kvNamespace.delete(key);
      return { found: false, data: null };
    }
    // cache hit
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
    // set to memory cache
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    CacheService.memoryCache.set(key, entry);
    console.log("Set to memory cache:", { key, ttl });
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
    // check if KV is available
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      // KV unavailable
      console.log("KV unavailable, fallback to memory only");
      return false;
    }
    // attempt to set to KV
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      // KV requires minimum 60 seconds TTL
      const kvTtlSeconds = Math.max(60, Math.floor(ttl / 1000));
      // set to KV
      await kvNamespace.put(key, JSON.stringify(entry), {
        expirationTtl: kvTtlSeconds,
      });
      console.log("Set to KV cache:", { key, ttl: kvTtlSeconds });
      // succeeded to set to KV
      return true;
    } catch {
      // failed to set to KV
      return false;
    }
  }
}
