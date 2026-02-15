/**
 * Token entity
 */

// domain
import { DomainError, ValidationError } from "@/domain/error/error.ts";

/**
 * Token entity
 */
export class Token {
  /**
   * Construct a new Token
   * @param _accessToken - Access token
   */
  private constructor(
    private readonly _accessToken: string,
  ) {}

  /**
   * Reconstruct Token from external data (database, API response)
   * @param accessToken - Access token
   * @returns Token instance or error
   */
  static reconstruct(
    accessToken: string,
  ): Token | DomainError {
    return this.newToken(accessToken);
  }

  /**
   * Create new Token
   * @param accessToken - Access token
   * @returns Token instance or error
   */
  static newToken(
    accessToken: string,
  ): Token | DomainError {
    // validate inputs
    if (!accessToken || accessToken.trim().length === 0) {
      return new ValidationError("Access token is required");
    }
    // create and return Token instance
    return new Token(accessToken.trim());
  }

  /**
   * Get access token
   * @returns Access token
   */
  accessToken(): string {
    return this._accessToken;
  }
}
