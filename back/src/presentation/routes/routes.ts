/**
 * @fileoverview Routes configuration with manual DI
 */

// application
import { GetNowPlayingUseCase } from "@/application/spotify/get_now_playing_use_case.ts";
import { GetLastPlayedUseCase } from "@/application/spotify/get_last_played_use_case.ts";
// domain
import { EnvironmentConfig } from "@/domain/common/environments.ts";
// infrastructure
import { SpotifyApiClient } from "@/infrastructure/api/spotify_api_client.ts";
import { CacheService } from "@/infrastructure/cache/cache_service.ts";
import { getEnvironmentUtils } from "@/infrastructure/config/env_utils.ts";
import { OAuthService } from "@/infrastructure/oauth/oauth_service.ts";
import { EncryptionService } from "@/infrastructure/security/encryption_service.ts";

import { createNotFoundResponse } from "../settings/common.ts";
import { CorsMiddleware } from "../settings/middleware.ts";
import { SpotifyHandler } from "../spotify/handler.ts";

/**
 * Application routes with manual dependency injection
 * @class Routes
 */
export class Routes {
  private readonly corsMiddleware: CorsMiddleware;
  private readonly env: EnvironmentConfig;

  /**
   * Construct a new Routes
   * @param {EnvironmentConfig} env - Environment configuration
   */
  constructor(env: EnvironmentConfig) {
    this.env = env;
    const envUtils = getEnvironmentUtils();
    envUtils.validateAllEnvironment();
    this.corsMiddleware = new CorsMiddleware();
  }

  /**
   * Handle incoming HTTP request
   * @param {Request} request - HTTP request
   * @returns {Promise<Response>} - HTTP response
   */
  async handle(request: Request): Promise<Response> {
    // performance measurement
    const startTime = performance.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    console.log("Request:", JSON.stringify({ method, path }));
    // handle CORS preflight
    if (method === "OPTIONS") {
      return this.corsMiddleware.handlePreflight(request);
    }
    // route handling
    let response: Response;
    // only GET method is supported
    if (method === "GET") {
      response = await this.handleGetRequest(path);
    } else {
      response = createNotFoundResponse();
    }
    // add CORS headers to response
    const finalResponse = await this.corsMiddleware.addCorsHeaders(
      response,
      request,
    );
    // performance log
    const duration = Math.round(performance.now() - startTime);
    console.log(
      "Response:",
      JSON.stringify({
        method,
        path,
        status: finalResponse.status,
        duration,
      }),
    );
    // return final response
    return finalResponse;
  }

  /**
   * Handle GET requests
   * @param {string} path - Request path
   * @returns {Promise<Response>} - HTTP response
   */
  private async handleGetRequest(
    path: string,
  ): Promise<Response> {
    // spotify routes
    if (path === "/spotify/now-playing") {
      return await this.spotifyRoute(path);
    }
    if (path === "/spotify/last-played") {
      return await this.spotifyRoute(path);
    }
    // not found
    return createNotFoundResponse();
  }

  /**
   * Spotify routes with manual DI
   * @param {string} path - Request path
   * @returns {Promise<Response>} - HTTP response
   */
  private async spotifyRoute(
    path: string,
  ): Promise<Response> {
    // manual dependency injection per route
    const encryptionService = new EncryptionService();
    const cacheRepository = new CacheService(this.env, encryptionService);
    const tokenRepository = new OAuthService(cacheRepository);
    const trackRepository = new SpotifyApiClient(
      tokenRepository,
      cacheRepository,
    );
    // application layer
    const getNowPlayingUseCase = new GetNowPlayingUseCase(trackRepository);
    const getLastPlayedUseCase = new GetLastPlayedUseCase(trackRepository);
    // presentation layer
    const spotifyHandler = new SpotifyHandler(
      getNowPlayingUseCase,
      getLastPlayedUseCase,
    );
    // route to appropriate handler method
    if (path === "/spotify/now-playing") {
      return await spotifyHandler.handleGetNowPlaying();
    }
    if (path === "/spotify/last-played") {
      return await spotifyHandler.handleGetLastPlayed();
    }
    // not found
    return createNotFoundResponse();
  }
}
