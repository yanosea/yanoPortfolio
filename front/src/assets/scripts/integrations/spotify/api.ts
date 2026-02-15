/**
 * Spotify API Communication
 */

// types
import type { Track } from "@/types/spotify.ts";
import { Result } from "@/types/result.ts";
import { AppError, NetworkError, ValidationError } from "@/types/error.ts";
// utils
import { getSpotifyEndpoint } from "@/assets/scripts/core/config.ts";

/**
 * Track information with playing status
 */
export interface TrackInfo {
  /** Whether the track is currently playing */
  isNowPlaying: boolean;
  /** Track information */
  track: Track;
}

/**
 * Get track information from API
 * @returns Result containing TrackInfo or error
 */
export async function getTrackInfo(): Promise<Result<TrackInfo>> {
  // get API endpoints
  const nowPlayingUrl = getSpotifyEndpoint("nowPlaying");
  const lastPlayedUrl = getSpotifyEndpoint("lastPlayed");
  // fetch both APIs in parallel
  const [nowPlayingResult, lastPlayedResult] = await Promise.allSettled([
    fetchData(nowPlayingUrl),
    fetchData(lastPlayedUrl),
  ]);
  // prioritize now-playing if available
  if (nowPlayingResult.status === "fulfilled") {
    const fetchResult = nowPlayingResult.value;
    const nowPlayingTrack = await fetchResult.match({
      ok: async (response) => {
        const trackResult = await extractTrackData(response, true);
        return trackResult;
      },
      fail: (error) => Promise.resolve(Result.fail<Track>(error)),
    });
    const finalResult = nowPlayingTrack.match({
      ok: (track) => Result.ok({ isNowPlaying: true, track }),
      fail: (error) => Result.fail<TrackInfo>(error),
    });
    if (finalResult.isOk()) {
      return finalResult;
    }
  }
  // fallback to last-played if now-playing is not available
  if (lastPlayedResult.status === "fulfilled") {
    const fetchResult = lastPlayedResult.value;
    const lastPlayedTrack = await fetchResult.match({
      ok: async (response) => {
        const trackResult = await extractTrackData(response, false);
        return trackResult;
      },
      fail: (error) => Promise.resolve(Result.fail<Track>(error)),
    });
    return lastPlayedTrack.match({
      ok: (track) => Result.ok({ isNowPlaying: false, track }),
      fail: (error) => Result.fail<TrackInfo>(error),
    });
  }
  // if both fail, return error
  return Result.fail(
    new AppError(
      `Failed to fetch track information from Spotify API: ${
        JSON.stringify({
          nowPlayingStatus: nowPlayingResult.status,
          lastPlayedStatus: lastPlayedResult.status,
        })
      }`,
      "SPOTIFY_API_ERROR",
    ),
  );
}

/**
 * Fetch data from URL
 * @param url - The URL to fetch from
 * @returns Result containing Response or error
 */
async function fetchData(url: string): Promise<Result<Response>> {
  try {
    const response = await fetch(url);
    // check for successful response (not 204 No Content)
    if (response.ok && response.status !== 204) {
      return Result.ok(response);
    }
    // return error for non-success status
    return Result.fail(
      new AppError(
        `API returned non-success status: ${response.status} ${
          JSON.stringify({ url, status: response.status })
        }`,
        "API_STATUS_ERROR",
      ),
    );
  } catch (error) {
    console.error(
      `Spotify API Fetch: ${url}`,
      error instanceof Error ? error.message : String(error),
    );
    return Result.fail(
      new NetworkError(
        `Network request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        url,
      ),
    );
  }
}

/**
 * Extract track data from API response
 * @param response - The fetch Response
 * @param nowPlaying - Whether this is currently playing
 * @returns Result containing Track or error
 */
async function extractTrackData(
  response: Response,
  nowPlaying: boolean,
): Promise<Result<Track>> {
  try {
    // parse JSON response
    const responseData = await response.json();
    // check if track data exists in response
    if (!responseData?.track) {
      return Result.fail(
        new ValidationError(
          `Invalid API response: missing track data ${
            JSON.stringify({ responseData })
          }`,
        ),
      );
    }
    const data = responseData.track;
    // validate required fields
    const requiredFields = [
      "albumName",
      "albumUrl",
      "artistName",
      "artistUrl",
      "imageUrl",
      "trackName",
      "trackUrl",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);
    // return error if any required fields are missing
    if (missingFields.length > 0) {
      return Result.fail(
        new ValidationError(
          `Incomplete track data: ${JSON.stringify({ missingFields, data })}`,
        ),
      );
    }
    // build track object from response data
    const track: Track = {
      albumName: data.albumName,
      albumUrl: data.albumUrl,
      artistName: data.artistName,
      artistUrl: data.artistUrl,
      imageUrl: data.imageUrl,
      trackName: data.trackName,
      trackUrl: data.trackUrl,
      playedAt: !nowPlaying ? data.playedAt : undefined,
    };
    return Result.ok(track);
  } catch (error) {
    console.error(
      "Spotify API Data Extraction:",
      error instanceof Error ? error.message : String(error),
    );
    return Result.fail(
      new AppError(
        `Failed to parse track data: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "PARSE_ERROR",
      ),
    );
  }
}
