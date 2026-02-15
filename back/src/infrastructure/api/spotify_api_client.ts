/**
 * Spotify API client
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";
import { SPOTIFY_CACHE_KEYS } from "@/domain/spotify/cache_constants.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";
import { TokenRepository } from "@/domain/spotify/token_repository.ts";
import { TrackRepository } from "@/domain/spotify/track_repository.ts";
import { SerializableTrack, Track } from "@/domain/spotify/track.ts";

import { SPOTIFY_API_ENDPOINTS } from "./spotify_constants.ts";

/**
 * Spotify image
 */
interface SpotifyImage {
  /** Album image URL */
  url: string;
}

/**
 * Spotify artist
 */
interface SpotifyArtist {
  /** Artist URL */
  external_urls: {
    /** Spotify artist URL */
    spotify: string;
  };
  /** Artist name */
  name: string;
}

/**
 * Spotify album
 */
interface SpotifyAlbum {
  /** Album URL */
  external_urls: {
    /** Spotify album URL */
    spotify: string;
  };
  /** Album images */
  images: SpotifyImage[];
  /** Album name */
  name: string;
}

/**
 * Spotify track
 */
interface SpotifyTrack {
  /** Spotify album */
  album: SpotifyAlbum;
  /** Spotify artists */
  artists: SpotifyArtist[];
  external_urls: {
    /** Spotify track URL */
    spotify: string;
  };
  /** Track name */
  name: string;
}

/**
 * Spotify currently playing information
 */
interface SpotifyCurrentlyPlaying {
  /** Spotify track item */
  item: SpotifyTrack;
}

/**
 * Spotify recently played track
 */
interface SpotifyRecentlyPlayedTrack {
  /** Spotify track */
  track: SpotifyTrack;
  /** Played at timestamp (ISO 8601 format) */
  played_at: string;
}

/**
 * Spotify recently played information
 */
interface SpotifyRecentlyPlayed {
  /** List of recently played tracks */
  items: SpotifyRecentlyPlayedTrack[];
}

/**
 * Spotify API client implementation
 */
export class SpotifyApiClient implements TrackRepository {
  /**
   * Construct a new Spotify API client
   * @param tokenRepository - Token repository
   * @param cacheRepository - Cache repository
   */
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly cacheRepository: CacheRepository,
  ) {}

  /**
   * Get last played track
   * @returns Result containing last played track or null if none
   */
  async getLastPlayedTrack(): Promise<Result<Track | null, DomainError>> {
    try {
      // check cache first
      const cacheResult = await this.cacheRepository.get(
        SPOTIFY_CACHE_KEYS.LAST_PLAYED,
      );
      const cacheData = cacheResult.match({
        ok: (cache) => cache,
        fail: () => ({ found: false, data: null }),
      });
      if (cacheData.found) {
        // deserialize cached track data
        if (cacheData.data === null) {
          return Result.ok(null);
        }
        const trackResult = Track.fromSerializable(
          cacheData.data as SerializableTrack,
        );
        if (trackResult instanceof DomainError) {
          console.warn(
            "Cache data corruption detected:",
            JSON.stringify({ message: trackResult.message }),
          );
          // continue to fetch from API
        } else {
          return Result.ok(trackResult);
        }
      }
      // if not in cache, fetch from API
      const tokenResult = await this.tokenRepository.getValidToken();
      if (tokenResult.isOk()) {
        const token = tokenResult.unwrap();
        const response = await fetch(
          `${SPOTIFY_API_ENDPOINTS.RECENTLY_PLAYED}?limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken()}`,
            },
          },
        );
        // 204 means no content, i.e. nothing is last played
        if (response.status === 204) {
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.LAST_PLAYED,
            null,
          );
          return Result.ok(null);
        }
        // handle other non-200 responses
        if (!response.ok) {
          return Result.fail(
            new ExternalServiceError(
              `Spotify API error: ${response.status}`,
              "Spotify",
            ),
          );
        }
        // parse response
        const spotifyRecentPlayedResponse =
          (await response.json()) as SpotifyRecentlyPlayed;
        if (
          !spotifyRecentPlayedResponse.items ||
          spotifyRecentPlayedResponse.items.length === 0
        ) {
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.LAST_PLAYED,
            null,
          );
          return Result.ok(null);
        }
        const trackResult = this.mapSpotifyTrackToDomain(
          // use the first (most recent) played track
          spotifyRecentPlayedResponse.items[0].track,
          spotifyRecentPlayedResponse.items[0].played_at,
        );
        // handle potential mapping errors
        if (trackResult.isOk()) {
          // if mapping succeeded, cache and return the track
          const track = trackResult.unwrap();
          console.log(
            "Spotify last-played success:",
            JSON.stringify({ track: track.toSerializable() }),
          );
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.LAST_PLAYED,
            track.toSerializable(),
          );
          return Result.ok(track);
        } else {
          // if mapping failed, return the error
          return Result.fail(trackResult.unwrapError());
        }
      } else {
        // if token retrieval failed, return the error
        return Result.fail(tokenResult.unwrapError());
      }
    } catch (error) {
      // if any unexpected error occurs, return a generic domain error
      return Result.fail(
        new ExternalServiceError(
          `Failed to get last played track: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }

  /**
   * Get now playing track
   * @returns Result containing now playing track or null if none
   */
  async getNowPlayingTrack(): Promise<Result<Track | null, DomainError>> {
    try {
      // check cache first
      const cacheResult = await this.cacheRepository.get(
        SPOTIFY_CACHE_KEYS.NOW_PLAYING,
      );
      const cacheData = cacheResult.match({
        ok: (cache) => cache,
        fail: () => ({ found: false, data: null }),
      });
      if (cacheData.found) {
        // deserialize cached track data
        if (cacheData.data === null) {
          return Result.ok(null);
        }
        const trackResult = Track.fromSerializable(
          cacheData.data as SerializableTrack,
        );
        if (trackResult instanceof DomainError) {
          console.warn(
            "Cache data corruption detected:",
            JSON.stringify({ message: trackResult.message }),
          );
          // continue to fetch from API
        } else {
          return Result.ok(trackResult);
        }
      }
      // if not in cache, fetch from API
      const tokenResult = await this.tokenRepository.getValidToken();
      if (tokenResult.isOk()) {
        const token = tokenResult.unwrap();
        const response = await fetch(SPOTIFY_API_ENDPOINTS.CURRENTLY_PLAYING, {
          headers: {
            Authorization: `Bearer ${token.accessToken()}`,
          },
        });
        // 204 means no content, i.e. nothing is currently playing
        if (response.status === 204) {
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.NOW_PLAYING,
            null,
          );
          return Result.ok(null);
        }
        // handle other non-200 responses
        if (!response.ok) {
          return Result.fail(
            new ExternalServiceError(
              `Spotify API error: ${response.status}`,
              "Spotify",
            ),
          );
        }
        // parse response
        const spotifyCurrentlyPlayingResponse =
          (await response.json()) as SpotifyCurrentlyPlaying;
        if (
          !spotifyCurrentlyPlayingResponse.item
        ) {
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.NOW_PLAYING,
            null,
          );
          return Result.ok(null);
        }
        const trackResult = this.mapSpotifyTrackToDomain(
          spotifyCurrentlyPlayingResponse.item,
        );
        if (trackResult.isOk()) {
          // if mapping succeeded, cache and return the track
          const track = trackResult.unwrap();
          console.log(
            "Spotify now-playing success:",
            JSON.stringify({ track: track.toSerializable() }),
          );
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.NOW_PLAYING,
            track.toSerializable(),
          );
          return Result.ok(track);
        } else {
          // if mapping failed, return the error
          return Result.fail(trackResult.unwrapError());
        }
      } else {
        // if token retrieval failed, return the error
        return Result.fail(tokenResult.unwrapError());
      }
    } catch (error) {
      // if any unexpected error occurs, return an error
      return Result.fail(
        new ExternalServiceError(
          `Failed to get current track: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }

  /**
   * Map Spotify API track data to domain Track entity
   * @param spotifyTrack - Spotify track data
   * @param playedAt - Optional played at timestamp
   * @returns Result containing the mapped Track or an error
   */
  private mapSpotifyTrackToDomain(
    spotifyTrack: SpotifyTrack,
    playedAt?: string,
  ): Result<Track, DomainError> {
    try {
      // get the largest available image
      const imageUrl = spotifyTrack.album.images.length > 0
        ? spotifyTrack.album.images[0].url
        : "";
      // get primary artist
      const primaryArtist = spotifyTrack.artists[0];
      // reconstruct domain track entity
      const trackResult = Track.reconstruct(
        spotifyTrack.album.name,
        spotifyTrack.album.external_urls.spotify,
        primaryArtist.name,
        primaryArtist.external_urls.spotify,
        imageUrl,
        spotifyTrack.name,
        spotifyTrack.external_urls.spotify,
        playedAt,
      );
      // handle potential reconstruction errors
      if (trackResult instanceof DomainError) {
        return Result.fail(trackResult);
      }
      // return the successfully mapped track
      return Result.ok(trackResult);
    } catch (error) {
      // if any unexpected error occurs during mapping, return a generic mapping error
      return Result.fail(
        new ExternalServiceError(
          `Failed to map Spotify track: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Spotify",
        ),
      );
    }
  }
}
