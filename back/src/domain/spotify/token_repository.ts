/**
 * @fileoverview Token repository interface
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";

/**
 * Token Repository Interface
 * @interface TokenRepository
 */
export interface TokenRepository {
  /**
   * Get valid access token or refresh if expired
   * @returns {Promise<Result<string, DomainError>>} - Result containing valid access token
   */
  getValidAccessToken(): Promise<Result<string, DomainError>>;
}
