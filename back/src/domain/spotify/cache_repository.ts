/**
 * @fileoverview Cache repository interface
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";

/**
 * Cache Repository Interface
 * @interface CacheRepository
 */
export interface CacheRepository {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @param {boolean} useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @returns {Promise<Result<{ found: boolean; data: unknown }, DomainError>>} - Result containing found status and data
   */
  get(
    key: string,
    maxAge?: number,
    useKV?: boolean,
  ): Promise<Result<{ found: boolean; data: unknown }, DomainError>>;

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {unknown} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @param {boolean} useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @returns {Promise<Result<void, DomainError>>} - Result indicating success or failure
   */
  set(
    key: string,
    data: unknown,
    ttl?: number,
    useKV?: boolean,
  ): Promise<Result<void, DomainError>>;
}
