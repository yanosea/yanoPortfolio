import type { Track } from "@/libs/types/track";

export async function updateSpotifyStatus() {
  const spotifyStatusElement = document.getElementById("spotifyStatus");
  const [isNowPlaying, track] = await getTrackInfo();
  if (!isNowPlaying && !track) {
    spotifyStatusElement.style.display = "none";
    console.error("failed getting track info...");
    return;
  }

  spotifyStatusElement.style.display = "flex";
  if (isNowPlaying) {
    showNowPlaying(spotifyStatusElement, track);
  } else {
    showLastPlayed(spotifyStatusElement, track);
  }
}

async function getTrackInfo(): Promise<[Boolean, Track | undefined]> {
  const [nowPlayingUrl, lastPlayedUrl] = defineFetchUrl();
  try {
    const nowPlayingResponse = await fetchData(nowPlayingUrl || "");
    console.log("fetched nowplaying!");
    if (nowPlayingResponse) {
      return [true, await extractTrackData(nowPlayingResponse, true)];
    }
  } catch {
    console.error("failed fetching nowplaying...");
  }

  try {
    const lastPlayedResponse = await fetchData(lastPlayedUrl || "");
    console.log("fetched lastplayed!");
    if (lastPlayedResponse) {
      return [false, await extractTrackData(lastPlayedResponse, false)];
    }
  } catch {
    console.error("failed fetching lastplayed...");
  }

  return [false, undefined];
}

function defineFetchUrl(): [string, string] {
  const isDevelopment =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const nowPlayingUrl = isDevelopment
    ? "http://localhost:1323/api/nowplaying"
    : "https://yanosea.org/api/nowplaying";
  const lastplayedUrl = isDevelopment
    ? "http://localhost:1323/api/lastplayed"
    : "https://yanosea.org/api/lastplayed";
  return [nowPlayingUrl, lastplayedUrl];
}

async function fetchData(url: string): Promise<Response | null> {
  try {
    const response = await fetch(url);
    if (response.ok && response.status !== 204) {
      return response;
    }
  } catch (error) {
    console.error(`failed fetching from ${url}`);
    return null;
  }
}

async function extractTrackData(response: Response, nowPlaying: boolean): Promise<Track> {
  const data = await response.json();
  const track: Track = {
    imageUrl: data.imageUrl,
    playedAt: !nowPlaying ? data.playedAt : undefined,
    trackName: data.trackName,
    trackUrl: data.trackUrl,
    albumName: data.albumName,
    albumUrl: data.albumUrl,
    artistName: data.artistName,
    artistUrl: data.artistUrl,
  };
  return track;
}

function showNowPlaying(spotifyStatusElement: HTMLElement, track: Track) {
  (spotifyStatusElement.querySelector("#nowPlaying") as HTMLElement).style.display = "flex";
  (spotifyStatusElement.querySelector("#lastPlayed") as HTMLElement).style.display = "none";

  const nowPlayingElement = spotifyStatusElement.querySelector("#nowPlaying") as HTMLElement;

  (nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement).href =
    track.imageUrl;
  (nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement).setAttribute(
    "data-lightbox",
    track.trackName,
  );
  (nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement).setAttribute(
    "data-title",
    track.trackName,
  );
  (nowPlayingElement.querySelector("#nowPlayingImgSrc") as HTMLImageElement).src = track.imageUrl;
  (nowPlayingElement.querySelector("#nowPlayingTrackLink") as HTMLAnchorElement).href =
    track.trackUrl;
  nowPlayingElement.querySelector("#nowPlayingTrackName").textContent =
    `track : ${track.trackName}`;
  (nowPlayingElement.querySelector("#nowPlayingAlbumLink") as HTMLAnchorElement).href =
    track.albumUrl;
  nowPlayingElement.querySelector("#nowPlayingAlbumName").textContent =
    `album : ${track.albumName}`;
  (nowPlayingElement.querySelector("#nowPlayingArtistLink") as HTMLAnchorElement).href =
    track.artistUrl;
  nowPlayingElement.querySelector("#nowPlayingArtistName").textContent =
    `artist : ${track.artistName}`;
}

function showLastPlayed(spotifyStatusElement: HTMLElement, track: Track) {
  (spotifyStatusElement.querySelector("#nowPlaying") as HTMLElement).style.display = "none";
  (spotifyStatusElement.querySelector("#lastPlayed") as HTMLElement).style.display = "flex";

  const lastPlayedElement = spotifyStatusElement.querySelector("#lastPlayed");

  (lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement).href =
    track.imageUrl;
  (lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement).setAttribute(
    "data-lightbox",
    track.trackName,
  );
  (lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement).setAttribute(
    "data-title",
    track.trackName,
  );
  (lastPlayedElement.querySelector("#lastPlayedImgSrc") as HTMLImageElement).src = track.imageUrl;
  lastPlayedElement.querySelector("#lastPlayedPlayedAt").textContent =
    `played at : ${track.playedAt}`;
  (lastPlayedElement.querySelector("#lastPlayedTrackLink") as HTMLAnchorElement).href =
    track.trackUrl;
  lastPlayedElement.querySelector("#lastPlayedTrackName").textContent =
    `track : ${track.trackName}`;
  (lastPlayedElement.querySelector("#lastPlayedAlbumLink") as HTMLAnchorElement).href =
    track.albumUrl;
  lastPlayedElement.querySelector("#lastPlayedAlbumName").textContent =
    `album : ${track.albumName}`;
  (lastPlayedElement.querySelector("#lastPlayedArtistLink") as HTMLAnchorElement).href =
    track.artistUrl;
  lastPlayedElement.querySelector("#lastPlayedArtistName").textContent =
    `artist : ${track.artistName}`;
}
