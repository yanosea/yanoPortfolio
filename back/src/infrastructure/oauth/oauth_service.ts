/**
 * OAuth service
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";
import { SPOTIFY_CACHE_KEYS } from "@/domain/spotify/cache_constants.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";
import { Token } from "@/domain/spotify/token.ts";
import { TokenRepository } from "@/domain/spotify/token_repository.ts";

import { SPOTIFY_API_ENDPOINTS } from "../api/spotify_constants.ts";
import { EnvironmentUtils } from "../config/env_utils.ts";

/**
 * Spotify token
 */
interface SpotifyToken {
  /** Access token */
  access_token: string;
  /** Token expiration time in seconds */
  expires_in: number;
}

/**
 * OAuth service
 */
export class OAuthService implements TokenRepository {
  /**
   * Construct a new OAuthService
   * @param cacheRepository - Cache repository for token storage
   * @param envUtils - Environment utilities
   */
  constructor(
    private readonly cacheRepository: CacheRepository,
    private readonly envUtils: EnvironmentUtils,
  ) {}

  /**
   * Get valid token (refresh if needed)
   * @returns Result containing valid token
   */
  async getValidToken(): Promise<Result<Token, DomainError>> {
    try {
      // check cache first
      const cacheResult = await this.cacheRepository.get(
        SPOTIFY_CACHE_KEYS.ACCESS_TOKEN,
        undefined,
        true, // use KV
        true, // need decryption
      );
      const cacheData = cacheResult.match({
        ok: (cache) => cache,
        fail: () => ({ found: false, data: null }),
      });
      if (cacheData.found) {
        // if cache data is null, continue to refresh token
        if (cacheData.data === null) {
          // continue to refresh token
        } else {
          const tokenResult = Token.reconstruct(cacheData.data as string);
          if (tokenResult instanceof DomainError) {
            console.warn(
              "Cache data corruption detected:",
              JSON.stringify({ message: tokenResult.message }),
            );
            // continue to refresh token
          } else {
            return Result.ok(tokenResult);
          }
        }
      }
      // if not in cache or expired, refresh token
      return await this.refreshToken();
    } catch (error) {
      // if any unexpected error occurs, return an error
      return Result.fail(
        new ExternalServiceError(
          `Failed to get token: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }

  /**
   * Refresh token using refresh token
   * @returns Result containing new token
   */
  private async refreshToken(): Promise<Result<Token, DomainError>> {
    try {
      // create POST request to Spotify token endpoint
      const response = await fetch(SPOTIFY_API_ENDPOINTS.TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${
            btoa(
              `${this.envUtils.getSpotifyClientId()}:${this.envUtils.getSpotifyClientSecret()}`,
            )
          }`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.envUtils.getSpotifyRefreshToken(),
        }).toString(),
      });
      // handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        return Result.fail(
          new ExternalServiceError(
            `Spotify token refresh failed: ${response.status} - ${errorText}`,
            "Spotify",
          ),
        );
      }
      // parse response
      const spotifyTokenResponse = (await response.json()) as SpotifyToken;
      const tokenResult = this.mapSpotifyTokenToDomain(
        spotifyTokenResponse,
      );
      if (tokenResult.isOk()) {
        const token = tokenResult.unwrap();
        // log success
        console.log(
          "Token refresh success:",
          JSON.stringify({ expiresIn: spotifyTokenResponse.expires_in }),
        );
        // cache the new token with buffer time to prevent expiration issues
        const bufferTimeMs = this.envUtils.getTokenBufferTimeMs();
        const tokenTtl = (spotifyTokenResponse.expires_in * 1000) -
          bufferTimeMs;
        await this.cacheRepository.set(
          SPOTIFY_CACHE_KEYS.ACCESS_TOKEN,
          token.accessToken(),
          tokenTtl,
          true, // use KV
          true, // use encryption
        );
        return Result.ok(token);
      } else {
        return Result.fail(tokenResult.unwrapError());
      }
    } catch (error) {
      // if any unexpected error occurs, return an error
      return Result.fail(
        new ExternalServiceError(
          `Token refresh request failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }

  /**
   * Map Spotify API token response to domain Token entity
   * @param spotifyToken - Spotify token data
   * @returns Result containing the mapped Token or an error
   */
  private mapSpotifyTokenToDomain(
    spotifyToken: SpotifyToken,
  ): Result<Token, DomainError> {
    try {
      const tokenResult = Token.reconstruct(spotifyToken.access_token);
      // handle potential reconstruction errors
      if (tokenResult instanceof DomainError) {
        return Result.fail(tokenResult);
      }
      // return the successfully mapped token
      return Result.ok(tokenResult);
    } catch (error) {
      // if any unexpected error occurs during mapping, return a generic mapping error
      return Result.fail(
        new ExternalServiceError(
          `Failed to map Spotify token: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }
}
