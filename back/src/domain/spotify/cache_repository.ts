/**
 * @fileoverview Cache repository interface
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { Track } from "@/domain/spotify/track.ts";

/**
 * Cache Repository Interface
 * @interface CacheRepository
 */
export interface CacheRepository {
  /**
   * Get cached track data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {Promise<Result<{ found: boolean; data: Track | null }, DomainError>>} - Result containing found status and track data or null
   */
  getTrack(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: Track | null }, DomainError>>;

  /**
   * Set cached track data
   * @param {string} key - Cache key
   * @param {Track} track - Track data to cache
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  setTrack(
    key: string,
    track: Track | null,
  ): Promise<Result<void, DomainError>>;

  /**
   * Get cached token data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {Promise<Result<{ found: boolean; data: string | null }, DomainError>>} - Result containing found status and token data or null
   */
  getToken(
    key: string,
    maxAge?: number,
  ): Promise<Result<{ found: boolean; data: string | null }, DomainError>>;

  /**
   * Set cached token data
   * @param {string} key - Cache key
   * @param {string} token - Token data to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  setToken(
    key: string,
    token: string | null,
    ttl?: number,
  ): Promise<Result<void, DomainError>>;
}
