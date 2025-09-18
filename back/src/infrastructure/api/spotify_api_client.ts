/**
 * @fileoverview Spotify API Client
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError, ExternalServiceError } from "@/domain/error/error.ts";
import { SPOTIFY_CACHE_KEYS } from "@/domain/spotify/cache_constants.ts";
import { CacheRepository } from "@/domain/spotify/cache_repository.ts";
import { TokenRepository } from "@/domain/spotify/token_repository.ts";
import { TrackRepository } from "@/domain/spotify/track_repository.ts";
import { SerializableTrack, Track } from "@/domain/spotify/track.ts";

/**
 * Spotify image
 * @interface SpotifyImage
 */
interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

/**
 * Spotify track
 * @interface SpotifyTrack
 */
interface SpotifyTrack {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
}

/**
 * Spotify album
 * @interface SpotifyAlbum
 */
interface SpotifyAlbum {
  album_type: string;
  artists: SpotifyArtist[];
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

/**
 * Spotify artist
 * @interface SpotifyArtist
 */
interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

/**
 * Spotify device information
 * @interface SpotifyDevice
 */
interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

/**
 * Spotify context information
 * @interface SpotifyContext
 */
interface SpotifyContext {
  type: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

/**
 * Spotify currently playing information
 * @interface SpotifyCurrentlyPlaying
 */
interface SpotifyCurrentlyPlaying {
  device: SpotifyDevice | null;
  repeat_state: string;
  shuffle_state: boolean;
  context: SpotifyContext | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack;
  currently_playing_type: string;
}

/**
 * Spotify recently played track
 * @interface SpotifyRecentlyPlayedTrack
 */
interface SpotifyRecentlyPlayedTrack {
  track: SpotifyTrack;
  played_at: string;
  context: SpotifyContext | null;
}

/**
 * Spotify recently played information
 * @interface SpotifyRecentlyPlayed
 */
interface SpotifyRecentlyPlayed {
  items: SpotifyRecentlyPlayedTrack[];
  next: string;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

/**
 * Spotify API Client Implementation
 * @class SpotifyApiClient
 */
export class SpotifyApiClient implements TrackRepository {
  // Spotify currently playing API endpoint URL
  private static readonly CURRENTLY_PLAYING_URL =
    "https://api.spotify.com/v1/me/player/currently-playing";
  // Spotify recently played API endpoint URL
  private static readonly RECENTLY_PLAYED_URL =
    "https://api.spotify.com/v1/me/player/recently-played";

  /**
   * Construct a new Spotify API Client
   * @param {TokenRepository} tokenRepository - Token repository
   * @param {CacheRepository} cacheRepository - Cache repository
   */
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly cacheRepository: CacheRepository,
  ) {}

  /**
   * Get now playing track
   * @returns {Promise<Result<Track | null, DomainError>>} - Result containing now playing track or null if none
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
          console.warn("Cache data corruption detected:", trackResult.message);
          // continue to fetch from API
        } else {
          return Result.ok(trackResult);
        }
      }
      // if not in cache, fetch from API
      const tokenResult = await this.tokenRepository.getValidAccessToken();
      if (tokenResult.isOk()) {
        const token = tokenResult.unwrap();
        const response = await fetch(SpotifyApiClient.CURRENTLY_PLAYING_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
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
        const data = (await response.json()) as SpotifyCurrentlyPlaying;
        const trackResult = this.mapSpotifyTrackToDomain(data.item);
        if (trackResult.isOk()) {
          // if mapping succeeded, cache and return the track
          const track = trackResult.unwrap();
          console.log("Spotify now-playing success:", { track });
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
   * Get last played track
   * @returns {Promise<Result<Track | null, DomainError>>} - Result containing last played track or null if none
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
          console.warn("Cache data corruption detected:", trackResult.message);
          // continue to fetch from API
        } else {
          return Result.ok(trackResult);
        }
      }
      // if not in cache, fetch from API
      const tokenResult = await this.tokenRepository.getValidAccessToken();
      if (tokenResult.isOk()) {
        const token = tokenResult.unwrap();
        const response = await fetch(
          `${SpotifyApiClient.RECENTLY_PLAYED_URL}?limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
        const data = (await response.json()) as SpotifyRecentlyPlayed;
        if (!data.items || data.items.length === 0) {
          await this.cacheRepository.set(
            SPOTIFY_CACHE_KEYS.LAST_PLAYED,
            null,
          );
          return Result.ok(null);
        }
        const lastPlayedItem = data.items[0];
        const trackResult = this.mapSpotifyTrackToDomain(
          lastPlayedItem.track,
          lastPlayedItem.played_at,
        );
        // handle potential mapping errors
        if (trackResult.isOk()) {
          // if mapping succeeded, cache and return the track
          const track = trackResult.unwrap();
          console.log("Spotify last-played success:", { track });
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
   * Map Spotify API track data to domain Track entity
   * @param {SpotifyTrack} spotifyTrack - Spotify track data
   * @param {string} playedAt - Optional played at timestamp
   * @returns {Result<Track, DomainError>} - Result containing the mapped Track or an error
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
      // format playedAt to yyyy/MM/dd HH:mm:ss format in JST if available
      let formattedPlayedAt: string | undefined;
      if (playedAt) {
        const datePlayedAt = new Date(playedAt);
        // convert to JST (UTC+9)
        const jstDatePlayedAt = new Date(
          datePlayedAt.getTime() + 9 * 60 * 60 * 1000,
        );
        // format to yyyy/MM/dd HH:mm:ss
        const year = jstDatePlayedAt.getUTCFullYear();
        const month = String(jstDatePlayedAt.getUTCMonth() + 1).padStart(
          2,
          "0",
        );
        const day = String(jstDatePlayedAt.getUTCDate()).padStart(2, "0");
        const hours = String(jstDatePlayedAt.getUTCHours()).padStart(2, "0");
        const minutes = String(jstDatePlayedAt.getUTCMinutes()).padStart(
          2,
          "0",
        );
        const seconds = String(jstDatePlayedAt.getUTCSeconds()).padStart(
          2,
          "0",
        );
        formattedPlayedAt =
          `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
      }
      // reconstruct domain track entity
      const trackResult = Track.reconstruct(
        imageUrl,
        spotifyTrack.name,
        spotifyTrack.external_urls.spotify,
        spotifyTrack.album.name,
        spotifyTrack.album.external_urls.spotify,
        primaryArtist.name,
        primaryArtist.external_urls.spotify,
        formattedPlayedAt,
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
