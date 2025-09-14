/**
 * @fileoverview Track entity
 */

// domain
import { DomainError, ValidationError } from "@/domain/error/error.ts";

/**
 * Track Entity
 * @class Track
 */
export class Track {
  /**
   * Construct a new Track
   * @param {string} _imageUrl - Image URL
   * @param {string} _trackName - Track name
   * @param {string} _trackUrl - Track URL
   * @param {string} _albumName - Album name
   * @param {string} _albumUrl - Album URL
   * @param {string} _artistName - Artist name
   * @param {string} _artistUrl - Artist URL
   * @param {string} _playedAt - Played at timestamp (optional)
   */
  private constructor(
    private readonly _imageUrl: string,
    private readonly _trackName: string,
    private readonly _trackUrl: string,
    private readonly _albumName: string,
    private readonly _albumUrl: string,
    private readonly _artistName: string,
    private readonly _artistUrl: string,
    private readonly _playedAt?: string,
  ) {}

  /**
   * Reconstruct Track from external data (database, API response)
   * @param {string} imageUrl - Image URL
   * @param {string} trackName - Track name
   * @param {string} trackUrl - Track URL
   * @param {string} albumName - Album name
   * @param {string} albumUrl - Album URL
   * @param {string} artistName - Artist name
   * @param {string} artistUrl - Artist URL
   * @param {string} playedAt - Played at timestamp (optional)
   * @returns {Track | DomainError} Track instance or error
   */
  static reconstruct(
    imageUrl: string,
    trackName: string,
    trackUrl: string,
    albumName: string,
    albumUrl: string,
    artistName: string,
    artistUrl: string,
    playedAt?: string,
  ): Track | DomainError {
    return this.newTrack(
      imageUrl,
      trackName,
      trackUrl,
      albumName,
      albumUrl,
      artistName,
      artistUrl,
      playedAt,
    );
  }

  /**
   * Create new Track
   * @param {string} imageUrl - Image URL
   * @param {string} trackName - Track name
   * @param {string} trackUrl - Track URL
   * @param {string} albumName - Album name
   * @param {string} albumUrl - Album URL
   * @param {string} artistName - Artist name
   * @param {string} artistUrl - Artist URL
   * @param {string} playedAt - Played at timestamp (optional)
   * @returns {Track | DomainError} - Track instance or error
   */
  static newTrack(
    imageUrl: string,
    trackName: string,
    trackUrl: string,
    albumName: string,
    albumUrl: string,
    artistName: string,
    artistUrl: string,
    playedAt?: string,
  ): Track | DomainError {
    // validate inputs
    if (!trackName || trackName.trim().length === 0) {
      return new ValidationError("Track name is required");
    }
    if (!artistName || artistName.trim().length === 0) {
      return new ValidationError("Artist name is required");
    }
    if (!albumName || albumName.trim().length === 0) {
      return new ValidationError("Album name is required");
    }
    if (!this.isValidUrl(trackUrl)) {
      return new ValidationError("Track URL format is invalid");
    }
    if (!this.isValidUrl(albumUrl)) {
      return new ValidationError("Album URL format is invalid");
    }
    if (!this.isValidUrl(artistUrl)) {
      return new ValidationError("Artist URL format is invalid");
    }
    if (imageUrl && !this.isValidUrl(imageUrl)) {
      return new ValidationError("Image URL format is invalid");
    }
    if (playedAt && !this.isValidTimestamp(playedAt)) {
      return new ValidationError("Played at timestamp format is invalid");
    }

    return new Track(
      imageUrl,
      trackName.trim(),
      trackUrl,
      albumName.trim(),
      albumUrl,
      artistName.trim(),
      artistUrl,
      playedAt,
    );
  }

  /**
   * Get image URL
   * @returns {string} - Image URL
   */
  imageUrl(): string {
    return this._imageUrl;
  }

  /**
   * Get track name
   * @returns {string} - Track name
   */
  trackName(): string {
    return this._trackName;
  }

  /**
   * Get track URL
   * @returns {string} - Track URL
   */
  trackUrl(): string {
    return this._trackUrl;
  }

  /**
   * Get album name
   * @returns {string} - Album name
   */
  albumName(): string {
    return this._albumName;
  }

  /**
   * Get album URL
   * @returns {string} - Album URL
   */
  albumUrl(): string {
    return this._albumUrl;
  }

  /**
   * Get artist name
   * @returns {string} - Artist name
   */
  artistName(): string {
    return this._artistName;
  }

  /**
   * Get artist URL
   * @returns {string} - Artist URL
   */
  artistUrl(): string {
    return this._artistUrl;
  }

  /**
   * Get played at timestamp
   * @returns {string} - Played at timestamp
   */
  playedAt(): string | undefined {
    return this._playedAt;
  }

  /**
   * Basic URL validation
   * @param {string} url - URL string to validate
   * @returns {boolean} - True if valid URL format
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
   * @param {string} timestamp - Timestamp string to validate
   * @returns {boolean} - True if valid timestamp format
   */
  private static isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }
}
