/**
 * @fileoverview OAuth Service
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { ExternalServiceError } from "@/domain/error/error.ts";
import { TokenRepository } from "@/domain/spotify/token_repository.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";

import { EnvironmentUtils, getEnvironmentUtils } from "../config/env_utils.ts";

/**
 * Spotify token response structure
 * @interface SpotifyTokenResponse
 */
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Token data structure for internal use
 * @interface TokenData
 */
interface TokenData {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  expiresAt?: number;
  refreshToken?: string;
  scope?: string;
}

/**
 * OAuth Service
 * @class OAuthService
 */
export class OAuthService implements TokenRepository {
  private readonly tokenUrl = "https://accounts.spotify.com/api/token";
  private readonly envUtils: EnvironmentUtils;
  private static readonly TOKEN_CACHE_KEY = "spotify-token";

  /**
   * Construct a new OAuthService
   * @param {CacheRepository} cacheRepository - Cache repository for token storage
   */
  constructor(private readonly cacheRepository: CacheRepository) {
    this.envUtils = getEnvironmentUtils();
  }

  /**
   * Get valid access token (refresh if needed)
   * @returns {Promise<Result<string, DomainError>>} - Result containing valid access token
   */
  async getValidAccessToken(): Promise<Result<string, DomainError>> {
    try {
      // check cache first
      const cacheResult = await this.cacheRepository.getToken(
        OAuthService.TOKEN_CACHE_KEY,
      );
      const cacheData = cacheResult.match({
        ok: (cache) => cache,
        fail: () => ({ found: false, data: null }),
      });

      if (cacheData.found && cacheData.data) {
        return Result.ok(cacheData.data);
      }
      // if not in cache or expired, refresh token
      const refreshResult = await this.refreshTokenInternal();
      return refreshResult.match({
        ok: (tokenData) => Result.ok(tokenData.accessToken),
        fail: (error) => Result.fail(error),
      });
    } catch (error) {
      // if any unexpected error occurs, return an error
      return Result.fail(
        new ExternalServiceError(
          `Failed to get access token: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }

  /**
   * Internal method to refresh token
   * @returns {Promise<Result<TokenData, DomainError>>} - Result containing new token data
   */
  private async refreshTokenInternal(): Promise<
    Result<TokenData, DomainError>
  > {
    try {
      // create POST request to Spotify token endpoint
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${
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
      const tokenResponse = (await response.json()) as SpotifyTokenResponse;
      const now = Date.now();
      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in,
        expiresAt: now + (tokenResponse.expires_in * 1000),
        refreshToken: tokenResponse.refresh_token ||
          getEnvironmentUtils().getSpotifyRefreshToken(),
        scope: tokenResponse.scope,
      };
      // log success
      console.log("Token refresh success:", {
        expiresIn: tokenResponse.expires_in,
      });
      // cache the new token
      await this.cacheRepository.setToken(
        OAuthService.TOKEN_CACHE_KEY,
        tokenData.accessToken,
        tokenData.expiresIn ? tokenData.expiresIn * 1000 : undefined,
      );
      // return new token data
      return Result.ok(tokenData);
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
}
