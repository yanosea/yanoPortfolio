/**
 * Spotify API constants
 */

/**
 * Spotify API endpoints
 */
export const SPOTIFY_API_ENDPOINTS = {
  /** Currently playing track endpoint */
  CURRENTLY_PLAYING: "https://api.spotify.com/v1/me/player/currently-playing",
  /** Recently played tracks endpoint */
  RECENTLY_PLAYED: "https://api.spotify.com/v1/me/player/recently-played",
  /** OAuth token endpoint */
  TOKEN: "https://accounts.spotify.com/api/token",
} as const;
