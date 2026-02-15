/**
 * Track entity
 */

// domain
import { DomainError, ValidationError } from "@/domain/error/error.ts";

/**
 * Track entity
 */
export class Track {
  /**
   * Construct a new Track
   * @param _albumName - Album name
   * @param _albumUrl - Album URL
   * @param _artistName - Artist name
   * @param _artistUrl - Artist URL
   * @param _imageUrl - Album image URL
   * @param _trackName - Track name
   * @param _trackUrl - Track URL
   * @param _playedAt - Played at timestamp (ISO 8601 format, optional)
   */
  private constructor(
    private readonly _albumName: string,
    private readonly _albumUrl: string,
    private readonly _artistName: string,
    private readonly _artistUrl: string,
    private readonly _imageUrl: string,
    private readonly _trackName: string,
    private readonly _trackUrl: string,
    private readonly _playedAt?: string,
  ) {}

  /**
   * Reconstruct Track from external data (database, API response)
   * @param albumName - Album name
   * @param albumUrl - Album URL
   * @param artistName - Artist name
   * @param artistUrl - Artist URL
   * @param imageUrl - Album image URL
   * @param trackName - Track name
   * @param trackUrl - Track URL
   * @param playedAt - Played at timestamp (ISO 8601 format, optional)
   * @returns Track instance or error
   */
  static reconstruct(
    albumName: string,
    albumUrl: string,
    artistName: string,
    artistUrl: string,
    imageUrl: string,
    trackName: string,
    trackUrl: string,
    playedAt?: string,
  ): Track | DomainError {
    return this.newTrack(
      albumName,
      albumUrl,
      artistName,
      artistUrl,
      imageUrl,
      trackName,
      trackUrl,
      playedAt,
    );
  }

  /**
   * Create new Track
   * @param albumName - Album name
   * @param albumUrl - Album URL
   * @param artistName - Artist name
   * @param artistUrl - Artist URL
   * @param imageUrl - Album image URL
   * @param trackName - Track name
   * @param trackUrl - Track URL
   * @param playedAt - Played at timestamp (ISO 8601 format, optional)
   * @returns Track instance or error
   */
  static newTrack(
    albumName: string,
    albumUrl: string,
    artistName: string,
    artistUrl: string,
    imageUrl: string,
    trackName: string,
    trackUrl: string,
    playedAt?: string,
  ): Track | DomainError {
    // validate inputs
    if (!albumName || albumName.trim().length === 0) {
      return new ValidationError("Album name is required");
    }
    if (!this.isValidUrl(albumUrl)) {
      return new ValidationError("Album URL format is invalid");
    }
    if (!artistName || artistName.trim().length === 0) {
      return new ValidationError("Artist name is required");
    }
    if (!this.isValidUrl(artistUrl)) {
      return new ValidationError("Artist URL format is invalid");
    }
    if (imageUrl && !this.isValidUrl(imageUrl)) {
      return new ValidationError("Image URL format is invalid");
    }
    if (!trackName || trackName.trim().length === 0) {
      return new ValidationError("Track name is required");
    }
    if (!this.isValidUrl(trackUrl)) {
      return new ValidationError("Track URL format is invalid");
    }
    if (playedAt && !this.isValidTimestamp(playedAt)) {
      return new ValidationError("Played at timestamp format is invalid");
    }
    // create and return Track instance
    return new Track(
      albumName.trim(),
      albumUrl,
      artistName.trim(),
      artistUrl,
      imageUrl,
      trackName.trim(),
      trackUrl,
      playedAt,
    );
  }

  /**
   * Get album name
   * @returns Album name
   */
  albumName(): string {
    return this._albumName;
  }

  /**
   * Get album URL
   * @returns Album URL
   */
  albumUrl(): string {
    return this._albumUrl;
  }

  /**
   * Get artist name
   * @returns Artist name
   */
  artistName(): string {
    return this._artistName;
  }

  /**
   * Get artist URL
   * @returns Artist URL
   */
  artistUrl(): string {
    return this._artistUrl;
  }

  /**
   * Get image URL
   * @returns Image URL
   */
  imageUrl(): string {
    return this._imageUrl;
  }

  /**
   * Get track name
   * @returns Track name
   */
  trackName(): string {
    return this._trackName;
  }

  /**
   * Get track URL
   * @returns Track URL
   */
  trackUrl(): string {
    return this._trackUrl;
  }

  /**
   * Get played at timestamp
   * @returns Played at timestamp or undefined
   */
  playedAt(): string | undefined {
    return this._playedAt;
  }

  /**
   * Basic URL validation
   * @param url - URL string to validate
   * @returns True if valid URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Basic timestamp validation
   * @param timestamp - Timestamp string to validate
   * @returns True if valid timestamp format
   */
  private static isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  /**
   * Convert Track to serializable format for caching
   * @returns Serializable track data
   */
  toSerializable(): SerializableTrack {
    return {
      albumName: this._albumName,
      albumUrl: this._albumUrl,
      artistName: this._artistName,
      artistUrl: this._artistUrl,
      imageUrl: this._imageUrl,
      trackName: this._trackName,
      trackUrl: this._trackUrl,
      playedAt: this._playedAt,
    };
  }

  /**
   * Create Track from serializable format
   * @param data - Serializable track data
   * @returns Track instance or error
   */
  static fromSerializable(data: SerializableTrack): Track | DomainError {
    return this.reconstruct(
      data.albumName,
      data.albumUrl,
      data.artistName,
      data.artistUrl,
      data.imageUrl,
      data.trackName,
      data.trackUrl,
      data.playedAt,
    );
  }
}

/**
 * Serializable track data for cache storage
 */
export interface SerializableTrack {
  /** Album name */
  albumName: string;
  /** Album URL */
  albumUrl: string;
  /** Artist name */
  artistName: string;
  /** Artist URL */
  artistUrl: string;
  /** Album image URL */
  imageUrl: string;
  /** Track name */
  trackName: string;
  /** Track URL */
  trackUrl: string;
  /** Played at timestamp (ISO 8601 format, optional) */
  playedAt?: string;
}
