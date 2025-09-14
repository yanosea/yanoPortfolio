/**
 * @fileoverview Track repository interface
 */

// track
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { Track } from "@/domain/spotify/track.ts";

/**
 * Track Repository Interface
 * @interface TrackRepository
 */
export interface TrackRepository {
  /**
   * Get now playing track
   * @returns {Promise<Result<Track | null, DomainError>>} - Result containing current track or null if nothing is playing
   */
  getNowPlayingTrack(): Promise<Result<Track | null, DomainError>>;

  /**
   * Get last played track
   * @returns {Promise<Result<Track | null, DomainError>>} - Result containing last played track or null if none found
   */
  getLastPlayedTrack(): Promise<Result<Track | null, DomainError>>;
}
