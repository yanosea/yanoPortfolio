/**
 * @fileoverview OAuth Service
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { SPOTIFY_CACHE_KEYS } from "@/domain/spotify/cache_constants.ts";
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
  // Spotify token API endpoint URL
  private static readonly TOKEN_URL = "https://accounts.spotify.com/api/token";
  private readonly envUtils: EnvironmentUtils;

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
      if (cacheData.found && cacheData.data) {
        // if in cache and not expired, return
        return Result.ok(cacheData.data as string);
      }
      // if not in cache or expired, refresh token
      const refreshResult = await this.refreshAccessToken();
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
   * Refresh access token using refresh token
   * @returns {Promise<Result<TokenData, DomainError>>} - Result containing new access token data
   */
  private async refreshAccessToken(): Promise<
    Result<TokenData, DomainError>
  > {
    try {
      // create POST request to Spotify token endpoint
      const response = await fetch(OAuthService.TOKEN_URL, {
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
      const tokenResponse = (await response.json()) as SpotifyTokenResponse;
      const now = Date.now();
      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in,
        expiresAt: now + tokenResponse.expires_in * 1000,
        refreshToken: tokenResponse.refresh_token ||
          getEnvironmentUtils().getSpotifyRefreshToken(),
        scope: tokenResponse.scope,
      };
      // log success
      console.log("Token refresh success:", {
        expiresIn: tokenResponse.expires_in,
      });
      // cache the new token with buffer time to prevent expiration issues
      const bufferTimeMs = this.envUtils.getTokenBufferTimeMs();
      const tokenTtl = tokenData.expiresIn
        ? (tokenData.expiresIn * 1000) - bufferTimeMs
        : undefined;
      await this.cacheRepository.set(
        SPOTIFY_CACHE_KEYS.ACCESS_TOKEN,
        tokenData.accessToken,
        tokenTtl,
        true, // use KV
        true, // use encryption
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
