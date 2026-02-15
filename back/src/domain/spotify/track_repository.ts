/**
 * Track repository interface
 */

// track
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { Track } from "@/domain/spotify/track.ts";

/**
 * Track repository interface for Spotify tracks
 */
export interface TrackRepository {
  /**
   * Get last played track
   * @returns Result containing last played track or null if none found
   */
  getLastPlayedTrack(): Promise<Result<Track | null, DomainError>>;

  /**
   * Get now playing track
   * @returns Result containing current track or null if nothing is playing
   */
  getNowPlayingTrack(): Promise<Result<Track | null, DomainError>>;
}
