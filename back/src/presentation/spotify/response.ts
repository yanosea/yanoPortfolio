/**
 * Spotify response types
 */

/**
 * Get now playing response model
 */
export interface GetNowPlayingResponse {
  /** Current track information */
  track: {
    /** Album name */
    albumName: string;
    /** Album URL */
    albumUrl: string;
    /** Artist name */
    artistName: string;
    /** Artist URL */
    artistUrl: string;
    /** Album art image URL */
    imageUrl: string;
    /** Track name */
    trackName: string;
    /** Track URL */
    trackUrl: string;
  } | null;
}

/**
 * Get last played response model
 */
export interface GetLastPlayedResponse {
  /** Last played track information */
  track: {
    /** Album name */
    albumName: string;
    /** Album URL */
    albumUrl: string;
    /** Artist name */
    artistName: string;
    /** Artist URL */
    artistUrl: string;
    /** Album art image URL */
    imageUrl: string;
    /** Time the track was played */
    playedAt: string;
    /** Track name */
    trackName: string;
    /** Track URL */
    trackUrl: string;
  } | null;
}

/**
 * Error response model
 */
export interface ErrorResponse {
  /** Error type */
  error: string;
  /** Error message */
  message: string;
  /** Error timestamp */
  timestamp: string;
}
