/**
 * Cache constants
 */

/**
 * Cache keys for Spotify-related data
 * These match the actual keys used in SpotifyApiClient and OAuthService
 */
export const SPOTIFY_CACHE_KEYS = {
  /** Key for Spotify access token */
  ACCESS_TOKEN: "access-token",
  /** Key for last played track data */
  LAST_PLAYED: "last-played",
  /** Key for currently playing track data */
  NOW_PLAYING: "now-playing",
} as const;
