import type { Track } from "@/libs/types/track";

export async function getTrackInfo(): Promise<[Boolean, Track]> {
  let isNowPlaying: Boolean = null;
  let track: Track = null;
  try {
    const nowPlayingResponse = await fetch(process.env.NOWPLAYING_URL);
    if (nowPlayingResponse.ok && nowPlayingResponse.status !== 204) {
      const nowPlayingData = await nowPlayingResponse.json();
      isNowPlaying = true;
      track = {
        imageUrl: nowPlayingData.imageUrl,
        trackName: nowPlayingData.trackName,
        trackUrl: nowPlayingData.trackUrl,
        albumName: nowPlayingData.albumName,
        albumUrl: nowPlayingData.albumUrl,
        artistName: nowPlayingData.artistName,
        artistUrl: nowPlayingData.artistUrl,
      };
    }
  } catch (error) {
    console.error(error);
  }

  if (isNowPlaying == null) {
    try {
      const lastPlayedResponse = await fetch(process.env.LASTPLAYED_URL);
      if (lastPlayedResponse.ok && lastPlayedResponse.status !== 204) {
        const lastPlayedData = await lastPlayedResponse.json();
        isNowPlaying = false;
        track = {
          imageUrl: lastPlayedData.imageUrl,
          playedAt: lastPlayedData.playedAt,
          trackName: lastPlayedData.trackName,
          trackUrl: lastPlayedData.trackUrl,
          albumName: lastPlayedData.albumName,
          albumUrl: lastPlayedData.albumUrl,
          artistName: lastPlayedData.artistName,
          artistUrl: lastPlayedData.artistUrl,
        };
      }
    } catch (error) {
      console.error(error);
    }
  }

  return [isNowPlaying, track];
}
