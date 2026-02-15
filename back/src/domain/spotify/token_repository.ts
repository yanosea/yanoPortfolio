/**
 * Token repository interface
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { Token } from "@/domain/spotify/token.ts";

/**
 * Token repository interface for Spotify access tokens
 */
export interface TokenRepository {
  /**
   * Get valid token or refresh if expired
   * @returns Result containing valid token
   */
  getValidToken(): Promise<Result<Token, DomainError>>;
}
