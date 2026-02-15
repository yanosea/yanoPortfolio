/**
 * Get last played use case
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { TrackRepository } from "@/domain/spotify/track_repository.ts";

/**
 * Get last played use case output DTO
 */
interface GetLastPlayedUseCaseOutputDto {
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
  /** Played at timestamp (ISO 8601 format) */
  playedAt: string;
  /** Track name */
  trackName: string;
  /** Track URL */
  trackUrl: string;
}

/**
 * Get last played use case
 */
export class GetLastPlayedUseCase {
  /**
   * Construct a new GetLastPlayedUseCase
   * @param trackRepository - Track repository
   */
  constructor(
    private readonly trackRepository: TrackRepository,
  ) {}

  /**
   * Execute the use case
   * @returns Result containing the output DTO or an error
   */
  async execute(): Promise<
    Result<GetLastPlayedUseCaseOutputDto | null, DomainError>
  > {
    try {
      // get last played track from repository
      const result = await this.trackRepository.getLastPlayedTrack();
      // handle result
      return result.match({
        ok: (
          track,
        ): Result<GetLastPlayedUseCaseOutputDto | null, DomainError> => {
          if (!track) {
            // if no track is found, return result with null
            return Result.ok(null);
          }
          // validate playedAt exists for last played track
          const playedAt = track.playedAt();
          if (!playedAt) {
            return Result.fail(
              new DomainError(
                "Last played track must have playedAt timestamp",
                "USE_CASE_ERROR",
              ),
            );
          }
          // convert domain entity to output DTO
          const outputDto: GetLastPlayedUseCaseOutputDto = {
            imageUrl: track.imageUrl(),
            trackName: track.trackName(),
            trackUrl: track.trackUrl(),
            albumName: track.albumName(),
            albumUrl: track.albumUrl(),
            artistName: track.artistName(),
            artistUrl: track.artistUrl(),
            playedAt,
          };
          // return result with output DTO
          return Result.ok(outputDto);
        },
        fail: (
          error,
        ): Result<GetLastPlayedUseCaseOutputDto | null, DomainError> => {
          // return result with error
          return Result.fail(error);
        },
      });
    } catch (error) {
      // if any unexpected error occurs, pass through the error
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      // for non-domain errors, wrap in a domain error
      return Result.fail(
        new DomainError(
          `GetLastPlayedUseCase execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "USE_CASE_ERROR",
        ),
      );
    }
  }
}
