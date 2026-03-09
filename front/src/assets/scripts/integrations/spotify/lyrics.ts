/**
 * Spotify Lyrics Integration via LRCLIB API
 */

/** LRCLIB API base URL */
const LRCLIB_API_URL = "https://lrclib.net/api/get";

/**
 * LRCLIB API response shape
 */
interface LrclibResponse {
  /** Synced lyrics in LRC format (with timestamps) */
  syncedLyrics: string | null;
  /** Plain lyrics text (without timestamps) */
  plainLyrics: string | null;
}

/**
 * Extract plain text lines from synced lyrics (strip timestamps)
 * @param syncedLyrics - Raw synced lyrics in LRC format
 * @returns Array of lyric text lines
 */
function stripTimestamps(syncedLyrics: string): string[] {
  return syncedLyrics
    .split("\n")
    .map((line) => line.replace(/\[\d+:\d+\.\d+\]\s?/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Fetch lyrics from LRCLIB API
 * @param artistName - Artist name
 * @param trackName - Track name
 * @returns Array of lyric text lines, or null if not found
 */
export async function fetchLyrics(
  artistName: string,
  trackName: string,
): Promise<string[] | null> {
  try {
    const params = new URLSearchParams({
      artist_name: artistName,
      track_name: trackName,
    });
    const url = `${LRCLIB_API_URL}?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `LRCLIB API: lyrics not found (${response.status}): ${artistName} - ${trackName}`,
      );
      return null;
    }
    const data = (await response.json()) as LrclibResponse;
    // prefer synced lyrics (strip timestamps), fallback to plain lyrics
    if (data.syncedLyrics) {
      const lines = stripTimestamps(data.syncedLyrics);
      return lines.length > 0 ? lines : null;
    }
    if (data.plainLyrics) {
      const lines = data.plainLyrics
        .split("\n")
        .filter((line) => line.trim().length > 0);
      return lines.length > 0 ? lines : null;
    }
    return null;
  } catch (error) {
    console.error(
      "LRCLIB API Fetch:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
