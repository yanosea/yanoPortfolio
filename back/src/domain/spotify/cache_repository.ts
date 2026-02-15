/**
 * Cache repository interface
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";

/**
 * Cache repository interface
 */
export interface CacheRepository {
  /**
   * Get cached data
   * @param key - Cache key
   * @param maxAge - Maximum age in milliseconds (optional)
   * @param useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @param needDecryption - Whether the cached data needs to be decrypted (optional, defaults to false)
   * @returns Result containing found status and data
   */
  get(
    key: string,
    maxAge?: number,
    useKV?: boolean,
    needDecryption?: boolean,
  ): Promise<Result<{ found: boolean; data: unknown }, DomainError>>;

  /**
   * Set cached data
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   * @param useKV - Use KV storage in addition to memory cache (optional, defaults to false)
   * @param useEncryption - Whether the data should be encrypted before storage (optional, defaults to false)
   * @returns Result indicating success or failure
   */
  set(
    key: string,
    data: unknown,
    ttl?: number,
    useKV?: boolean,
    useEncryption?: boolean,
  ): Promise<Result<void, DomainError>>;
}
