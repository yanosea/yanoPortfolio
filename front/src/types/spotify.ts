/**
 * Spotify type definitions
 */

/**
 * Spotify track information
 */
export interface Track {
  /** Album name */
  albumName: string;
  /** Spotify album URL */
  albumUrl: string;
  /** Artist name */
  artistName: string;
  /** Spotify artist URL */
  artistUrl: string;
  /** Album cover image URL */
  imageUrl: string;
  /** Track name */
  trackName: string;
  /** Spotify track URL */
  trackUrl: string;
  /** When the track was played (ISO timestamp) */
  playedAt?: string;
}
