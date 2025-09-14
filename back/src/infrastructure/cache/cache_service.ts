/**
 * @fileoverview Cache repository implementation
 */

// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";
import { Track } from "@/domain/spotify/track.ts";

import { EnvironmentUtils, getEnvironmentUtils } from "../config/env_utils.ts";

/**
 * Track Cache entry
 * @interface TrackCacheEntry
 */
interface TrackCacheEntry {
  data: TrackData | null;
  timestamp: number;
  ttl: number;
}

/**
 * Token cache entry
 * @interface TokenCacheEntry
 */
interface TokenCacheEntry {
  data: string | null;
  timestamp: number;
  ttl: number;
}

/**
 * Serializable track data for cache storage
 * @interface TrackData
 */
interface TrackData {
  imageUrl: string;
  trackName: string;
  trackUrl: string;
  albumName: string;
  albumUrl: string;
  artistName: string;
  artistUrl: string;
  playedAt?: string;
}

/**
 * Cache Service
 * @class CacheService
 */
export class CacheService implements CacheRepository {
  private static memoryCache = new Map<string, TrackCacheEntry>();
  private static tokenMemoryCache = new Map<string, TokenCacheEntry>();
  private readonly ttl: number;
  private readonly env: EnvironmentConfig;
  private readonly envUtils: EnvironmentUtils;

  /**
   * Construct a new CacheService
   * @param {EnvironmentConfig} env - Environment configuration
   */
  constructor(env: EnvironmentConfig) {
    this.env = env;
    this.envUtils = getEnvironmentUtils();
    this.ttl = this.envUtils.getCacheTtlSeconds() * 1000;
  }

  /**
   * Get cached track data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {Promise<Result<{ found: boolean; data: Track | null }, DomainError>>} - Result with cache hit status and track data
   */
  async getTrack(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: Track | null }, DomainError>> {
    try {
      // use in-memory cache for local development, hybrid (memory + KV) for others
      const result = this.envUtils.isLocalDevelopment()
        ? this.getTrackFromMemory(key, maxAge)
        : await this.getTrackFromHybrid(key, maxAge);
      if (result.isOk()) {
        // log cache hit/miss with cache type
        const { found, data } = result.unwrap();
        const cacheType = this.envUtils.isLocalDevelopment()
          ? "memory"
          : "hybrid";
        console.log("Cache:", {
          key,
          hit: found,
          hasData: !!data,
          type: cacheType,
        });
      }
      // if cache hit, return data
      return result;
    } catch (error) {
      // if any unexpected error occurs, return an error
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
   * Set cached track data
   * @param {string} key - Cache key
   * @param {Track} track - Track data to cache
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  async setTrack(
    key: string,
    track: Track | null,
  ): Promise<Result<void, DomainError>> {
    try {
      console.log("Setting track cache:", { key, hasTrack: !!track });
      // create cache entry
      const entry: TrackCacheEntry = {
        data: track ? this.trackToData(track) : null,
        timestamp: Date.now(),
        ttl: this.ttl,
      };
      // use in-memory cache for local development, KV for others
      if (this.envUtils.isLocalDevelopment()) {
        CacheService.memoryCache.set(key, entry);
        console.log("Track cache set to memory:", { key });
      } else {
        const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
        if (kvNamespace) {
          // KV requires minimum 60 seconds TTL
          const kvTtlSeconds = Math.max(60, Math.floor(this.ttl / 1000));
          await kvNamespace.put(key, JSON.stringify(entry), {
            expirationTtl: kvTtlSeconds,
          });
          console.log("Track cache set to KV:", { key, ttl: kvTtlSeconds });

          // Also set to memory for immediate access (using configured TTL)
          CacheService.memoryCache.set(key, {
            ...entry,
            ttl: this.ttl,
          });
          console.log("Track cache also set to memory:", {
            key,
            ttl: this.ttl / 1000,
          });
        } else {
          // fallback to memory if KV not available
          CacheService.memoryCache.set(key, entry);
          console.log("Track cache fallback to memory:", { key });
        }
      }
      // if cache set successfully, return success
      return Result.ok(undefined);
    } catch (error) {
      // if any unexpected error occurs, return an error
      console.error("Track cache set failed:", error);
      const errorMessage = `Cache set failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      // use DomainError for local memory cache, ExternalServiceError for KV
      return Result.fail(
        this.envUtils.isLocalDevelopment()
          ? new DomainError(errorMessage, "CACHE_ERROR")
          : new ExternalServiceError(errorMessage, "Cloudflare KV"),
      );
    }
  }

  /**
   * Get track from memory cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Result<{ found: boolean; data: Track | null }, DomainError>} - Result with cache hit status and track data
   */
  private getTrackFromMemory(
    key: string,
    maxAge?: number,
  ): Result<{ found: boolean; data: Track | null }, DomainError> {
    // check memory cache
    const entry = CacheService.memoryCache.get(key);
    if (!entry) {
      // if not found, return miss
      return Result.ok({ found: false, data: null });
    }
    // check if entry is expired
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // if expired, delete and return miss
      CacheService.memoryCache.delete(key);
      return Result.ok({ found: false, data: null });
    }
    // if found and valid, return hit with data
    const track = entry.data ? this.dataToTrack(entry.data) : null;
    return Result.ok({ found: true, data: track });
  }

  /**
   * Get track from KV cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Promise<Result<{ found: boolean; data: Track | null }, DomainError>>} - Result with cache hit status and track data
   */
  private async getTrackFromKV(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: Track | null }, DomainError>> {
    // check KV cache
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      // fallback to memory
      console.log("KV unavailable, falling back to memory cache");
      return this.getTrackFromMemory(key, maxAge);
    }
    // if KV is available, get entry
    const cached = await kvNamespace.get(key, { type: "json" });
    if (!cached) {
      // if not found, return miss
      return Result.ok({ found: false, data: null });
    }
    // check if entry is expired
    const entry = cached as TrackCacheEntry;
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // if expired, delete and return miss
      await kvNamespace.delete(key);
      return Result.ok({ found: false, data: null });
    }
    // if found and valid, return hit with data
    const track = entry.data ? this.dataToTrack(entry.data) : null;
    return Result.ok({ found: true, data: track });
  }

  /**
   * Get track from hybrid cache (Memory + KV with SWR)
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Promise<Result<{ found: boolean; data: Track | null }, DomainError>>} - Result with cache hit status and track data
   */
  private async getTrackFromHybrid(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: Track | null }, DomainError>> {
    // check memory cache first (fast, using configured TTL)
    const memoryResult = this.getTrackFromMemory(key, this.ttl);
    if (memoryResult.isOk() && memoryResult.unwrap().found) {
      console.log("Hybrid cache: Memory hit");
      return memoryResult;
    }
    // check KV cache (slower, 60 second TTL minimum)
    const kvResult = await this.getTrackFromKV(key, maxAge);
    if (kvResult.isOk() && kvResult.unwrap().found) {
      const { data } = kvResult.unwrap();
      // save to memory cache for faster subsequent access
      if (data) {
        const entry: TrackCacheEntry = {
          data: this.trackToData(data),
          timestamp: Date.now(),
          ttl: this.ttl,
        };
        CacheService.memoryCache.set(key, entry);
        console.log("Hybrid cache: KV hit, saved to memory");
      }
      return kvResult;
    }
    // cache miss - return not found
    console.log("Hybrid cache: Complete miss");
    return Result.ok({ found: false, data: null });
  }

  /**
   * Convert Track domain object to serializable data
   * @param {Track} track - Track domain object
   * @returns {TrackData} - Serializable data
   */
  private trackToData(track: Track): TrackData {
    return {
      imageUrl: track.imageUrl(),
      trackName: track.trackName(),
      trackUrl: track.trackUrl(),
      albumName: track.albumName(),
      albumUrl: track.albumUrl(),
      artistName: track.artistName(),
      artistUrl: track.artistUrl(),
      playedAt: track.playedAt(),
    };
  }

  /**
   * Convert serializable data to Track domain object
   * @param {TrackData} data - Serializable data
   * @returns {Track | null} - Track domain object or null
   */
  private dataToTrack(data: TrackData): Track | null {
    const trackResult = Track.reconstruct(
      data.imageUrl,
      data.trackName,
      data.trackUrl,
      data.albumName,
      data.albumUrl,
      data.artistName,
      data.artistUrl,
      data.playedAt,
    );
    if (trackResult instanceof DomainError) {
      // log error but return null - cache corruption scenario
      console.warn("Cache data corruption detected:", trackResult.message);
      return null;
    }
    // otherwise return reconstructed track
    return trackResult;
  }

  /**
   * Get cached token data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {Promise<Result<{ found: boolean; data: string | null }, DomainError>>} - Result with cache hit status and token data
   */
  async getToken(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: string | null }, DomainError>> {
    try {
      // use in-memory cache for local development, KV for others
      const result = this.envUtils.isLocalDevelopment()
        ? this.getTokenFromMemory(key, maxAge)
        : await this.getTokenFromKV(key, maxAge);
      if (result.isOk()) {
        // log cache hit/miss with cache type
        const { found, data } = result.unwrap();
        const cacheType = this.envUtils.isLocalDevelopment() ? "memory" : "KV";
        console.log("Token Cache:", {
          key,
          hit: found,
          hasData: !!data,
          type: cacheType,
        });
      }
      // if cache hit, return data
      return result;
    } catch (error) {
      // if any unexpected error occurs, return an error
      const errorMessage = `Token cache get failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      // use DomainError for local memory cache, ExternalServiceError for KV
      return Result.fail(
        this.envUtils.isLocalDevelopment()
          ? new DomainError(errorMessage, "CACHE_ERROR")
          : new ExternalServiceError(errorMessage, "Cloudflare KV"),
      );
    }
  }

  /**
   * Set cached token data
   * @param {string} key - Cache key
   * @param {string} token - Token data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  async setToken(
    key: string,
    token: string | null,
    ttl?: number,
  ): Promise<Result<void, DomainError>> {
    try {
      // create token cache entry
      const entry: TokenCacheEntry = {
        data: token,
        timestamp: Date.now(),
        ttl: ttl || this.ttl,
      };
      // use in-memory cache for local development, KV for others
      if (this.envUtils.isLocalDevelopment()) {
        CacheService.tokenMemoryCache.set(key, entry);
      } else {
        const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
        if (kvNamespace) {
          // if KV is available, set entry with key
          await kvNamespace.put(key, JSON.stringify(entry), {
            expirationTtl: Math.floor((ttl || this.ttl) / 1000),
          });
        } else {
          // fallback to memory if KV not available
          CacheService.tokenMemoryCache.set(key, entry);
        }
      }
      // if cache set successfully, return success
      return Result.ok(undefined);
    } catch (error) {
      // if any unexpected error occurs, return an error
      const errorMessage = `Token cache set failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      // use DomainError for local memory cache, ExternalServiceError for KV
      return Result.fail(
        this.envUtils.isLocalDevelopment()
          ? new DomainError(errorMessage, "CACHE_ERROR")
          : new ExternalServiceError(errorMessage, "Cloudflare KV"),
      );
    }
  }

  /**
   * Get token from memory cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Result<{ found: boolean; data: string | null }, DomainError>} - Result with cache hit status and token data
   */
  private getTokenFromMemory(
    key: string,
    maxAge?: number,
  ): Result<{ found: boolean; data: string | null }, DomainError> {
    // check memory cache
    const entry = CacheService.tokenMemoryCache.get(key);
    if (!entry) {
      // if not found, return miss
      return Result.ok({ found: false, data: null });
    }
    // check if entry is expired
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // if expired, delete and return miss
      CacheService.tokenMemoryCache.delete(key);
      return Result.ok({ found: false, data: null });
    }
    // if found and valid, return hit with data
    return Result.ok({ found: true, data: entry.data });
  }

  /**
   * Get token from KV cache
   * @param {string} key - Cache key
   * @param {number} [maxAge] - Maximum age in milliseconds
   * @returns {Promise<Result<{ found: boolean; data: string | null }, DomainError>>} - Result with cache hit status and token data
   */
  private async getTokenFromKV(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: string | null }, DomainError>> {
    // check KV cache
    const kvNamespace = this.env.YANOPORTFOLIO_BACK_CACHE;
    if (!kvNamespace) {
      // fallback to memory
      console.log("KV unavailable for token, falling back to memory cache");
      return this.getTokenFromMemory(key, maxAge);
    }
    // if KV is available, get entry with key
    const cached = await kvNamespace.get(key, { type: "json" });
    if (!cached) {
      // if not found, return miss
      return Result.ok({ found: false, data: null });
    }
    // check if entry is expired
    const entry = cached as TokenCacheEntry;
    const now = Date.now();
    const effectiveTtl = maxAge || entry.ttl;
    if (now - entry.timestamp > effectiveTtl) {
      // if expired, delete and return miss
      await kvNamespace.delete(key);
      return Result.ok({ found: false, data: null });
    }
    // if found and valid, return hit with data
    return Result.ok({ found: true, data: entry.data });
  }
}
