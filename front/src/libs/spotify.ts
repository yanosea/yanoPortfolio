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
  // fetch both APIs in parallel
  const [nowPlayingResult, lastPlayedResult] = await Promise.allSettled([
    fetchData(nowPlayingUrl || "")
      .then((response) => {
        console.log("fetched nowplaying!");
        return response;
      })
      .catch((_) => {
        console.error("failed fetching nowplaying...");
        return null;
      }),
    fetchData(lastPlayedUrl || "")
      .then((response) => {
        console.log("fetched lastplayed!");
        return response;
      })
      .catch((_) => {
        console.error("failed fetching lastplayed...");
        return null;
      }),
  ]);
  // prioritize now-playing if available
  if (nowPlayingResult.status === "fulfilled" && nowPlayingResult.value) {
    try {
      return [true, await extractTrackData(nowPlayingResult.value, true)];
    } catch (error) {
      console.error("failed extracting nowplaying data...");
    }
  }
  // fallback to last-played if now-playing is not available
  if (lastPlayedResult.status === "fulfilled" && lastPlayedResult.value) {
    try {
      return [false, await extractTrackData(lastPlayedResult.value, false)];
    } catch (error) {
      console.error("failed extracting lastplayed data...");
    }
  }
  // if both fail, return false and undefined
  return [false, undefined];
}

function defineFetchUrl(): [string, string] {
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const baseUrl = isDevelopment
    ? "http://localhost:8080"
    : "https://api.yanosea.org";

  const nowPlayingUrl = `${baseUrl}/spotify/now-playing`;
  const lastplayedUrl = `${baseUrl}/spotify/last-played`;
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

async function extractTrackData(
  response: Response,
  nowPlaying: boolean,
): Promise<Track> {
  const responseData = await response.json();
  const data = responseData.track;
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
  (
    spotifyStatusElement.querySelector("#nowPlaying") as HTMLElement
  ).style.display = "flex";
  (
    spotifyStatusElement.querySelector("#lastPlayed") as HTMLElement
  ).style.display = "none";

  const nowPlayingElement = spotifyStatusElement.querySelector(
    "#nowPlaying",
  ) as HTMLElement;

  (
    nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement
  ).href = track.imageUrl;
  (
    nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement
  ).setAttribute("data-lightbox", track.trackName);
  (
    nowPlayingElement.querySelector("#nowPlayingImgLink") as HTMLAnchorElement
  ).setAttribute("data-title", track.trackName);
  (
    nowPlayingElement.querySelector("#nowPlayingImgSrc") as HTMLImageElement
  ).src = track.imageUrl;
  (
    nowPlayingElement.querySelector("#nowPlayingTrackLink") as HTMLAnchorElement
  ).href = track.trackUrl;
  nowPlayingElement.querySelector("#nowPlayingTrackName").textContent =
    `track : ${track.trackName}`;
  (
    nowPlayingElement.querySelector("#nowPlayingAlbumLink") as HTMLAnchorElement
  ).href = track.albumUrl;
  nowPlayingElement.querySelector("#nowPlayingAlbumName").textContent =
    `album : ${track.albumName}`;
  (
    nowPlayingElement.querySelector(
      "#nowPlayingArtistLink",
    ) as HTMLAnchorElement
  ).href = track.artistUrl;
  nowPlayingElement.querySelector("#nowPlayingArtistName").textContent =
    `artist : ${track.artistName}`;
}

function showLastPlayed(spotifyStatusElement: HTMLElement, track: Track) {
  (
    spotifyStatusElement.querySelector("#nowPlaying") as HTMLElement
  ).style.display = "none";
  (
    spotifyStatusElement.querySelector("#lastPlayed") as HTMLElement
  ).style.display = "flex";

  const lastPlayedElement = spotifyStatusElement.querySelector("#lastPlayed");

  (
    lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement
  ).href = track.imageUrl;
  (
    lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement
  ).setAttribute("data-lightbox", track.trackName);
  (
    lastPlayedElement.querySelector("#lastPlayedImgLink") as HTMLAnchorElement
  ).setAttribute("data-title", track.trackName);
  (
    lastPlayedElement.querySelector("#lastPlayedImgSrc") as HTMLImageElement
  ).src = track.imageUrl;
  lastPlayedElement.querySelector("#lastPlayedPlayedAt").textContent =
    `played at : ${track.playedAt}`;
  (
    lastPlayedElement.querySelector("#lastPlayedTrackLink") as HTMLAnchorElement
  ).href = track.trackUrl;
  lastPlayedElement.querySelector("#lastPlayedTrackName").textContent =
    `track : ${track.trackName}`;
  (
    lastPlayedElement.querySelector("#lastPlayedAlbumLink") as HTMLAnchorElement
  ).href = track.albumUrl;
  lastPlayedElement.querySelector("#lastPlayedAlbumName").textContent =
    `album : ${track.albumName}`;
  (
    lastPlayedElement.querySelector(
      "#lastPlayedArtistLink",
    ) as HTMLAnchorElement
  ).href = track.artistUrl;
  lastPlayedElement.querySelector("#lastPlayedArtistName").textContent =
    `artist : ${track.artistName}`;
}
