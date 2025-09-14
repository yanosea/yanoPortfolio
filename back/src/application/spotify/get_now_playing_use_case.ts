/**
 * @fileoverview Get Now Playing Use Case
 */

// domain
import { DomainError } from "@/domain/error/error.ts";
import { Result } from "@/domain/common/result.ts";
import { TrackRepository } from "@/domain/spotify/track_repository.ts";

/**
 * Get Now Playing Use Case Output DTO
 * @interface GetNowPlayingUseCaseOutputDto
 */
export interface GetNowPlayingUseCaseOutputDto {
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
 * Get Now Playing Use Case
 * @class GetNowPlayingUseCase
 */
export class GetNowPlayingUseCase {
  /**
   * Construct a new GetNowPlayingUseCase
   * @param {TrackRepository} trackRepository - Track repository
   */
  constructor(
    private readonly trackRepository: TrackRepository,
  ) {}

  /**
   * Execute the use case
   * @returns {Promise<Result<GetNowPlayingUseCaseOutputDto | null, DomainError>>} - Result containing the output DTO or an error
   */
  async execute(): Promise<
    Result<GetNowPlayingUseCaseOutputDto | null, DomainError>
  > {
    try {
      // get now playing track from repository
      const result = await this.trackRepository.getNowPlayingTrack();
      // handle result
      return result.match({
        ok: (
          track,
        ): Result<GetNowPlayingUseCaseOutputDto | null, DomainError> => {
          if (!track) {
            // if no track is playing, return result with null
            return Result.ok(null);
          }
          // convert domain entity to output DTO
          const outputDto: GetNowPlayingUseCaseOutputDto = {
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
        ): Result<GetNowPlayingUseCaseOutputDto | null, DomainError> => {
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
          `GetNowPlayingUseCase execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "USE_CASE_ERROR",
        ),
      );
    }
  }
}
