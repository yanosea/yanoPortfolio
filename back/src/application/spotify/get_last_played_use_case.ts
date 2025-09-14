/**
 * @fileoverview Get Last Played Use Case
 */

// domain
import { Result } from "@/domain/common/result.ts";
import { DomainError } from "@/domain/error/error.ts";
import { TrackRepository } from "@/domain/spotify/track_repository.ts";

/**
 * Get Last Played Use Case Output DTO
 * @interface GetLastPlayedUseCaseOutputDto
 */
export interface GetLastPlayedUseCaseOutputDto {
  imageUrl: string;
  trackName: string;
  trackUrl: string;
  albumName: string;
  albumUrl: string;
  artistName: string;
  artistUrl: string;
  playedAt?: string;
}

/**
 * Get Last Played Use Case
 * @class GetLastPlayedUseCase
 */
export class GetLastPlayedUseCase {
  /**
   * Construct a new GetLastPlayedUseCase
   * @param {TrackRepository} trackRepository - Track repository
   */
  constructor(
    private readonly trackRepository: TrackRepository,
  ) {}

  /**
   * Execute the use case
   * @returns {Promise<Result<GetLastPlayedUseCaseOutputDto | null, DomainError>>} - Result containing the output DTO or an error
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
          // convert domain entity to output DTO
          const outputDto: GetLastPlayedUseCaseOutputDto = {
            imageUrl: track.imageUrl(),
            trackName: track.trackName(),
            trackUrl: track.trackUrl(),
            albumName: track.albumName(),
            albumUrl: track.albumUrl(),
            artistName: track.artistName(),
            artistUrl: track.artistUrl(),
            playedAt: track.playedAt(),
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
