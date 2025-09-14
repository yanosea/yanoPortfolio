/**
 * @fileoverview Spotify response types
 */

/**
 * Get Now Playing Response
 */
export interface GetNowPlayingResponse {
  track: {
    imageUrl: string;
    trackName: string;
    trackUrl: string;
    albumName: string;
    albumUrl: string;
    artistName: string;
    artistUrl: string;
  } | null;
}

/**
 * Get Last Played Response
 */
export interface GetLastPlayedResponse {
  track: {
    imageUrl: string;
    trackName: string;
    trackUrl: string;
    albumName: string;
    albumUrl: string;
    artistName: string;
    artistUrl: string;
    playedAt: string;
  } | null;
}

/**
 * Error response model
 */
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
