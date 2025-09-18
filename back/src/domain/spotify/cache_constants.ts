/**
 * @fileoverview Cache constants
 */

/**
 * Cache keys for Spotify-related data
 * These match the actual keys used in SpotifyApiClient and OAuthService
 * @constant {object} SPOTIFY_CACHE_KEYS - Cache keys
 */
export const SPOTIFY_CACHE_KEYS = {
  NOW_PLAYING: "now-playing",
  LAST_PLAYED: "last-played",
  ACCESS_TOKEN: "access-token",
} as const;

/**
 * Type alias for cache key values
 * @type {(typeof SPOTIFY_CACHE_KEYS)[keyof typeof SPOTIFY_CACHE_KEYS]} - SpotifyCacheKey
 */
export type SpotifyCacheKey =
  (typeof SPOTIFY_CACHE_KEYS)[keyof typeof SPOTIFY_CACHE_KEYS];
