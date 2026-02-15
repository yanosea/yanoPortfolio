/**
 * Spotify Command
 */

// types
import type { Command } from "@/types/terminal.ts";
import type { Track } from "@/types/spotify.ts";

// utils
import {
  CSS_CLASSES,
  SPOTIFY_FIELD_ICONS,
} from "@/assets/scripts/core/constants.ts";
import { getElements } from "@/assets/scripts/core/dom.ts";
import {
  getUsername,
  SPOTIFY_DISPLAY_CONFIG,
  SPOTIFY_ELEMENT_IDS,
} from "@/assets/scripts/core/config.ts";

/**
 * Spotify command messages
 */
const MESSAGES = {
  NO_TRACK: "No track is currently playing or recently played",
  API_ERROR: "Failed to fetch Spotify status",
  LOADING: "Loading Spotify status...",
} as const;

/**
 * Fetch album artwork as base64 data URL
 * @param imageUrl - Album artwork URL
 * @returns Base64 encoded data URL
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    return "";
  }
}

/**
 * Create neofetch/fastfetch-style display with album artwork
 * @param track - Track information
 * @param isPlaying - Whether the track is currently playing
 * @param spotifyProfileUrl - Spotify user profile URL
 * @returns HTML string for terminal display
 */
async function createSpotifyDisplay(
  track: Track,
  isPlaying: boolean,
  spotifyProfileUrl: string,
): Promise<string> {
  // fetch image as base64
  const imageBase64 = await fetchImageAsBase64(track.imageUrl);

  // status line (Playing/Last played)
  const statusIcon = SPOTIFY_FIELD_ICONS.SPOTIFY;
  const statusText = isPlaying ? "Now Playing" : "Last Played";

  // build info lines with proper padding for neofetch-style alignment
  const lines: string[] = [];

  // header line with user@spotify format (like fastfetch's user@host)
  lines.push(
    `<a href="${spotifyProfileUrl}" target="_blank" rel="noopener noreferrer" class="terminal-link" style="font-weight: 600;">${getUsername()}@spotify</a>`,
  );
  lines.push(
    `<span style="color: var(--color-fg-secondary);">-----------------</span>`,
  );
  lines.push(
    `<span class="${
      isPlaying ? "text-accent" : "text-red"
    }" style="font-size: 1.1em;">${statusIcon}</span> <span class="${
      isPlaying ? "text-accent" : "text-red"
    }">${statusText}</span>`,
  );

  if (track.playedAt) {
    lines.push(
      `<span class="${CSS_CLASSES.SPOTIFY_KEY}">${SPOTIFY_FIELD_ICONS.PLAYED} Played</span>: <span class="${CSS_CLASSES.SPOTIFY_VALUE}">${track.playedAt}</span>`,
    );
  }

  lines.push(
    `<span class="${CSS_CLASSES.SPOTIFY_KEY}">${SPOTIFY_FIELD_ICONS.TRACK} Track</span>:  <a href="${track.trackUrl}" target="_blank" rel="noopener noreferrer" class="terminal-link">${track.trackName}</a>`,
  );
  lines.push(
    `<span class="${CSS_CLASSES.SPOTIFY_KEY}">${SPOTIFY_FIELD_ICONS.ALBUM} Album</span>:  <a href="${track.albumUrl}" target="_blank" rel="noopener noreferrer" class="terminal-link">${track.albumName}</a>`,
  );
  lines.push(
    `<span class="${CSS_CLASSES.SPOTIFY_KEY}">${SPOTIFY_FIELD_ICONS.ARTIST} Artist</span>: <a href="${track.artistUrl}" target="_blank" rel="noopener noreferrer" class="terminal-link">${track.artistName}</a>`,
  );
  // calculate image size based on number of lines
  const { lineHeight, fontFamily, imageMargin } = SPOTIFY_DISPLAY_CONFIG;
  const imageSize = `${lines.length * lineHeight}em`;

  // use table layout for better alignment (neofetch-style)
  return `<pre style="font-family: '${fontFamily}', monospace; line-height: ${lineHeight}; margin: 0.5rem 0;"><span style="display: inline-block; vertical-align: top; margin-right: ${imageMargin};">${
    imageBase64
      ? `<img src="${imageBase64}" alt="${track.albumName} artwork" class="spotify-album-image" style="width: ${imageSize}; height: ${imageSize}; object-fit: cover; border-radius: 4px; display: block; cursor: pointer;" data-album-name="${track.albumName}">`
      : `<span style="display: block; width: ${imageSize}; height: ${imageSize}; background-color: var(--color-bg-elevated); border-radius: 4px; text-align: center; line-height: ${imageSize}; color: var(--color-fg-secondary); font-size: 3em;">${SPOTIFY_FIELD_ICONS.SPOTIFY}</span>`
  }</span><span style="display: inline-block; vertical-align: top;">${
    lines.join("\n")
  }</span></pre>`;
}

/**
 * Fetch Spotify status from DOM (SpotifyStatus widget)
 * @returns Track info, playing status, and profile URL
 */
function fetchSpotifyStatusFromDOM(): {
  track: Track | null;
  isPlaying: boolean;
  profileUrl: string;
} {
  // get DOM elements using type-safe utility
  const elements = getElements({
    [SPOTIFY_ELEMENT_IDS.albumImage]: HTMLImageElement,
    [SPOTIFY_ELEMENT_IDS.trackLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.albumLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.artistLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.statusText]: HTMLSpanElement,
    [SPOTIFY_ELEMENT_IDS.playedAt]: HTMLSpanElement,
    [SPOTIFY_ELEMENT_IDS.loading]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.error]: HTMLDivElement,
  });

  // get Spotify profile URL from status link
  const statusLink = document.getElementById(
    "spotify-status-link",
  ) as HTMLAnchorElement | null;
  const profileUrl = statusLink?.href || "";

  const albumImage = elements[SPOTIFY_ELEMENT_IDS.albumImage];
  const trackLink = elements[SPOTIFY_ELEMENT_IDS.trackLink];
  const albumLink = elements[SPOTIFY_ELEMENT_IDS.albumLink];
  const artistLink = elements[SPOTIFY_ELEMENT_IDS.artistLink];
  const statusText = elements[SPOTIFY_ELEMENT_IDS.statusText];
  const playedAtElement = elements[SPOTIFY_ELEMENT_IDS.playedAt];
  const loadingElement = elements[SPOTIFY_ELEMENT_IDS.loading];
  const errorElement = elements[SPOTIFY_ELEMENT_IDS.error];

  // check if widget is in error state
  if (errorElement && !errorElement.classList.contains("hidden")) {
    return { track: null, isPlaying: false, profileUrl };
  }

  // check if widget is in loading state
  if (loadingElement && !loadingElement.classList.contains("hidden")) {
    return { track: null, isPlaying: false, profileUrl };
  }

  // validate required elements
  if (!albumImage || !trackLink || !albumLink || !artistLink || !statusText) {
    return { track: null, isPlaying: false, profileUrl };
  }

  // check if data is loaded
  if (!trackLink.textContent || !trackLink.href) {
    return { track: null, isPlaying: false, profileUrl };
  }

  // determine if playing (no playedAt means currently playing)
  const isPlaying = !playedAtElement?.textContent;

  // helper to get text content from element, preferring truncate span if present
  const getTextContent = (element: HTMLElement): string => {
    const truncateSpan = element.querySelector(".truncate");
    if (truncateSpan) {
      return truncateSpan.textContent?.trim() || "";
    }
    // removes everything from start to first space
    return element.textContent?.replace(/^\S+\s+/, "").trim() || "";
  };

  // extract played at time if available
  let playedAt: string | undefined = undefined;
  if (playedAtElement?.textContent) {
    playedAt = getTextContent(playedAtElement);
  }

  const track: Track = {
    trackName: getTextContent(trackLink),
    trackUrl: trackLink.href,
    albumName: getTextContent(albumLink),
    albumUrl: albumLink.href,
    artistName: getTextContent(artistLink),
    artistUrl: artistLink.href,
    imageUrl: albumImage.src,
    playedAt: playedAt,
  };

  return { track, isPlaying, profileUrl };
}

export const spotify: Command = {
  name: "spotify",
  description: "Display current or last played Spotify track",
  execute: async () => {
    try {
      const { track, isPlaying, profileUrl } = fetchSpotifyStatusFromDOM();

      if (!track) {
        return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_TRACK}</span>`;
      }

      return await createSpotifyDisplay(track, isPlaying, profileUrl);
    } catch (error) {
      console.error("Spotify command error:", error);
      return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.API_ERROR}</span>`;
    }
  },
};
