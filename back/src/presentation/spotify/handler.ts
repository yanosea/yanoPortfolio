/**
 * @fileoverview Spotify Handler
 */

// application
import { GetNowPlayingUseCase } from "@/application/spotify/get_now_playing_use_case.ts";
import { GetLastPlayedUseCase } from "@/application/spotify/get_last_played_use_case.ts";

import {
  createErrorResponse,
  createNoContentResponse,
  createSuccessResponse,
} from "../settings/common.ts";
import { GetLastPlayedResponse, GetNowPlayingResponse } from "./response.ts";

/**
 * Spotify Handler
 * @class SpotifyHandler
 */
export class SpotifyHandler {
  /**
   * Construct a new SpotifyHandler
   */
  constructor(
    private readonly getNowPlayingUseCase: GetNowPlayingUseCase,
    private readonly getLastPlayedUseCase: GetLastPlayedUseCase,
  ) {}

  /**
   * Handle GET /spotify/now-playing request
   * @returns {Promise<Response>} - HTTP response
   */
  async handleGetNowPlaying(): Promise<Response> {
    try {
      // execute use case
      const result = await this.getNowPlayingUseCase.execute();
      return result.match({
        ok: (outputDto) => {
          // if no track is playing, return 204 No Content
          if (!outputDto) {
            return createNoContentResponse();
          }
          // map output DTO to response DTO
          const response: GetNowPlayingResponse = {
            track: {
              imageUrl: outputDto.imageUrl,
              trackName: outputDto.trackName,
              trackUrl: outputDto.trackUrl,
              albumName: outputDto.albumName,
              albumUrl: outputDto.albumUrl,
              artistName: outputDto.artistName,
              artistUrl: outputDto.artistUrl,
            },
          };
          return createSuccessResponse(response);
        },
        fail: () => {
          // internal error
          return createErrorResponse("Failed to get now playing track");
        },
      });
    } catch (error) {
      // if any unexpected error occurs, log it and return 500
      console.error(
        "SpotifyHandler.handleGetNowPlaying error:",
        error instanceof Error ? error.message : String(error),
      );
      return createErrorResponse("Internal server error");
    }
  }

  /**
   * Handle GET /spotify/last-played request
   * @returns {Promise<Response>} - HTTP response
   */
  async handleGetLastPlayed(): Promise<Response> {
    try {
      // execute use case
      const result = await this.getLastPlayedUseCase.execute();
      return result.match({
        ok: (outputDto) => {
          // if no track is playing, return 204 No Content
          if (!outputDto) {
            return createNoContentResponse();
          }
          // map output DTO to response DTO
          const response: GetLastPlayedResponse = {
            track: {
              imageUrl: outputDto.imageUrl,
              trackName: outputDto.trackName,
              trackUrl: outputDto.trackUrl,
              albumName: outputDto.albumName,
              albumUrl: outputDto.albumUrl,
              artistName: outputDto.artistName,
              artistUrl: outputDto.artistUrl,
              playedAt: outputDto.playedAt!,
            },
          };
          return createSuccessResponse(response);
        },
        fail: () => {
          // internal error
          return createErrorResponse("Failed to get last played track");
        },
      });
    } catch (error) {
      // if any unexpected error occurs, log it and return 500
      console.error(
        "SpotifyHandler.handleGetLastPlayed error:",
        error instanceof Error ? error.message : String(error),
      );
      return createErrorResponse("Internal server error");
    }
  }
}
