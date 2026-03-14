/**
 * Spotify UI Updates
 */

// types
import type { Track } from "@/types/spotify.ts";
// utils
import { getElement, getElements } from "@/assets/scripts/core/dom.ts";
import {
  getUsername,
  LYRICS_ELEMENT_IDS,
  SPOTIFY_ELEMENT_IDS,
} from "@/assets/scripts/core/config.ts";
import {
  LYRICS_ICONS,
  SPOTIFY_FIELD_ICONS,
} from "@/assets/scripts/core/constants.ts";
import { updateCurrentTrack } from "./modal.ts";
import { fetchLyrics } from "../lrclib/lyrics.ts";

/** Duration for fade animation (matches CSS --duration-normal) */
const FADE_DURATION = 300;

/**
 * Escape HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text safe for innerHTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Convert ISO 8601 UTC timestamp to JST and format for display
 * @param isoTimestamp - ISO 8601 UTC timestamp (e.g., "2024-12-08T12:00:00.000Z")
 * @returns Human-readable JST string (e.g., "2024/12/08 21:00:00 (JST)")
 */
function toJstDisplayFormat(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getUTCDate()).padStart(2, "0");
  const hours = String(jstDate.getUTCHours()).padStart(2, "0");
  const minutes = String(jstDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(jstDate.getUTCSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} (JST)`;
}

/** Store previous track for change detection */
let previousTrack: Track | null = null;
let previousIsNowPlaying: boolean | null = null;

/**
 * Check if the page was reloaded (not navigated)
 * @returns True if page was reloaded
 */
function isPageReload(): boolean {
  const navigation = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming;
  return navigation?.type === "reload";
}

/**
 * Check if track content has changed
 * @param newTrack - New track to compare
 * @param newIsNowPlaying - New playing status
 * @returns True if track has changed
 */
function hasTrackChanged(newTrack: Track, newIsNowPlaying: boolean): boolean {
  // no previous track means content has changed
  if (!previousTrack) return true;
  // compare track URL, played time, and playing status
  return (
    previousTrack.trackUrl !== newTrack.trackUrl ||
    previousTrack.playedAt !== newTrack.playedAt ||
    previousIsNowPlaying !== newIsNowPlaying
  );
}

/**
 * Get fadeable elements for animation
 * @returns Array of fadeable elements
 */
function getFadeableElements(): HTMLElement[] {
  // element IDs that should fade during transitions
  const ids = [
    SPOTIFY_ELEMENT_IDS.albumImage,
    SPOTIFY_ELEMENT_IDS.statusText,
    SPOTIFY_ELEMENT_IDS.playedAt,
    SPOTIFY_ELEMENT_IDS.trackLink,
    SPOTIFY_ELEMENT_IDS.albumLink,
    SPOTIFY_ELEMENT_IDS.artistLink,
  ];
  // get elements and filter out nulls
  return ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
}

/**
 * Apply fade-out to elements
 * @param elements - Elements to fade out
 */
function fadeOut(elements: HTMLElement[]): void {
  elements.forEach((el) => el.classList.add("spotify-fade-out"));
}

/**
 * Remove fade-out from elements (fade-in)
 * @param elements - Elements to fade in
 */
function fadeIn(elements: HTMLElement[]): void {
  elements.forEach((el) => el.classList.remove("spotify-fade-out"));
}

/**
 * Elements needed for content updates
 */
interface ContentElements {
  /** Status text element */
  statusText?: HTMLSpanElement;
  /** Played at timestamp element */
  playedAtText?: HTMLSpanElement;
  /** Album cover image element */
  albumImage?: HTMLImageElement;
  /** Track name link element */
  trackLink?: HTMLAnchorElement;
  /** Album name link element */
  albumLink?: HTMLAnchorElement;
  /** Artist name link element */
  artistLink?: HTMLAnchorElement;
  /** Icon element (required) */
  iconEl: HTMLSpanElement | null;
}

/**
 * Apply content updates to DOM elements
 * @param isNowPlaying - Whether track is currently playing
 * @param track - Track information
 * @param elements - DOM elements to update
 */
function applyContentUpdates(
  isNowPlaying: boolean,
  track: Track,
  elements: ContentElements,
): void {
  const {
    statusText,
    playedAtText,
    albumImage,
    trackLink,
    albumLink,
    artistLink,
    iconEl,
  } = elements;
  // update status text and icon
  if (statusText) {
    const username = getUsername();
    statusText.textContent = isNowPlaying
      ? `${username} Now Playing!`
      : `${username} Last Played...`;
  }
  if (iconEl && statusText) {
    if (isNowPlaying) {
      iconEl.classList.remove("text-red");
      iconEl.classList.add("text-accent");
      statusText.classList.remove("text-red");
      statusText.classList.add("text-accent");
      iconEl.classList.add("animate-pulse");
    } else {
      iconEl.classList.remove("text-accent");
      iconEl.classList.add("text-red");
      statusText.classList.remove("text-accent");
      statusText.classList.add("text-red");
      iconEl.classList.remove("animate-pulse");
    }
  }
  // update played at time
  if (playedAtText) {
    playedAtText.innerHTML = track.playedAt
      ? `${SPOTIFY_FIELD_ICONS.PLAYED} ${toJstDisplayFormat(track.playedAt)}`
      : "";
  }
  // update album image
  if (albumImage) {
    albumImage.src = track.imageUrl;
    albumImage.alt = `${track.albumName} artwork`;
  }
  // update track link (escapeHtml sanitizes user input before innerHTML)
  if (trackLink) {
    trackLink.href = track.trackUrl;
    trackLink.innerHTML =
      `${SPOTIFY_FIELD_ICONS.TRACK}<span class="spotify-text-wrapper"><span class="spotify-text-content">${
        escapeHtml(track.trackName)
      }</span></span>`;
  }
  // update album link (escapeHtml sanitizes user input before innerHTML)
  if (albumLink) {
    albumLink.href = track.albumUrl;
    albumLink.innerHTML =
      `${SPOTIFY_FIELD_ICONS.ALBUM}<span class="spotify-text-wrapper"><span class="spotify-text-content">${
        escapeHtml(track.albumName)
      }</span></span>`;
  }
  // update artist link (escapeHtml sanitizes user input before innerHTML)
  if (artistLink) {
    artistLink.href = track.artistUrl;
    artistLink.innerHTML =
      `${SPOTIFY_FIELD_ICONS.ARTIST}<span class="spotify-text-wrapper"><span class="spotify-text-content">${
        escapeHtml(track.artistName)
      }</span></span>`;
  }
}

/** Scroll speed for marquee animation (pixels per second) */
const MARQUEE_SPEED = 30;

/**
 * Set up marquee scrolling for overflowing text elements
 * @param elements - Text wrapper elements to check for overflow
 */
function setupMarquees(elements: HTMLElement[]): void {
  requestAnimationFrame(() => {
    for (const wrapper of elements) {
      const content = wrapper.querySelector(
        ".spotify-text-content",
      ) as HTMLElement | null;
      if (!content) continue;
      // reset marquee state
      wrapper.classList.remove("marquee");
      // restore original single-span structure if previously marqueed
      const existingTrack = wrapper.querySelector(".spotify-marquee-track");
      if (existingTrack) {
        wrapper.textContent = "";
        wrapper.appendChild(content.cloneNode(true));
      }
      // check if text overflows
      if (wrapper.scrollWidth <= wrapper.clientWidth) continue;
      // build marquee track with duplicated text
      const track = document.createElement("span");
      track.className = "spotify-marquee-track";
      const original = content.cloneNode(true) as HTMLElement;
      const duplicate = content.cloneNode(true) as HTMLElement;
      duplicate.setAttribute("aria-hidden", "true");
      track.appendChild(original);
      track.appendChild(duplicate);
      // set scroll speed based on content width
      const duration = wrapper.scrollWidth / MARQUEE_SPEED;
      track.style.setProperty("--marquee-duration", `${duration}s`);
      // replace wrapper content with marquee track
      wrapper.textContent = "";
      wrapper.appendChild(track);
      wrapper.classList.add("marquee");
    }
  });
}

/**
 * Get text wrapper elements for marquee setup
 * @returns Array of spotify-text-wrapper elements
 */
function getTextWrappers(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "#spotify-content .spotify-text-wrapper",
    ),
  );
}

/**
 * Set up lyrics ticker display
 * @param artistName - Artist name for lyrics lookup
 * @param trackName - Track name for lyrics lookup
 */
async function setupLyricsTicker(
  artistName: string,
  trackName: string,
): Promise<void> {
  const lyricsEl = document.getElementById(LYRICS_ELEMENT_IDS.ticker);
  if (!lyricsEl) return;

  // fetch lyrics
  const lyrics = await fetchLyrics(artistName, trackName);
  if (!lyrics) {
    lyricsEl.classList.add("hidden");
    lyricsEl.textContent = "";
    return;
  }

  // join all lyrics into single line
  const lyricsText = lyrics.join(" ");

  // build ticker with duplicated content for seamless loop
  const ticker = document.createElement("span");
  ticker.className = "lyrics-ticker-track";
  const original = document.createElement("span");
  original.textContent = lyricsText;
  const duplicate = document.createElement("span");
  duplicate.textContent = lyricsText;
  duplicate.setAttribute("aria-hidden", "true");
  ticker.appendChild(original);
  ticker.appendChild(duplicate);

  // build icon element
  const iconEl = document.createElement("span");
  iconEl.className = "lyrics-ticker-icon";
  iconEl.innerHTML = LYRICS_ICONS.LYRICS;

  // wrap ticker in a scroll container for fixed mask
  const scrollWrapper = document.createElement("span");
  scrollWrapper.className = "lyrics-ticker-scroll";
  scrollWrapper.appendChild(ticker);

  // replace content
  lyricsEl.replaceChildren();
  lyricsEl.appendChild(iconEl);
  lyricsEl.appendChild(scrollWrapper);
  lyricsEl.classList.remove("hidden");

  // calculate duration based on text width
  requestAnimationFrame(() => {
    const textWidth = original.offsetWidth;
    if (textWidth > 0) {
      const duration = textWidth / MARQUEE_SPEED;
      ticker.style.setProperty("--lyrics-duration", `${duration}s`);
    }
  });
}

/**
 * Update UI with track information
 * @param isNowPlaying - Whether track is currently playing
 * @param track - Track information to display
 */
export function updateUI(isNowPlaying: boolean, track: Track): void {
  // get all required DOM elements
  const elements = getElements({
    [SPOTIFY_ELEMENT_IDS.container]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.content]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.albumImage]: HTMLImageElement,
    [SPOTIFY_ELEMENT_IDS.statusText]: HTMLSpanElement,
    [SPOTIFY_ELEMENT_IDS.playedAt]: HTMLSpanElement,
    [SPOTIFY_ELEMENT_IDS.trackLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.albumLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.artistLink]: HTMLAnchorElement,
    [SPOTIFY_ELEMENT_IDS.loading]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.error]: HTMLDivElement,
  });
  // extract specific elements for convenience
  const iconEl = getElement(SPOTIFY_ELEMENT_IDS.icon, HTMLSpanElement);
  const container = elements[SPOTIFY_ELEMENT_IDS.container];
  const content = elements[SPOTIFY_ELEMENT_IDS.content];
  // exit early if required elements not found
  if (!container || !content) {
    console.warn("Spotify widget: required elements not found");
    return;
  }
  // extract remaining elements
  const albumImage = elements[SPOTIFY_ELEMENT_IDS.albumImage];
  const statusText = elements[SPOTIFY_ELEMENT_IDS.statusText];
  const playedAtText = elements[SPOTIFY_ELEMENT_IDS.playedAt];
  const trackLink = elements[SPOTIFY_ELEMENT_IDS.trackLink];
  const albumLink = elements[SPOTIFY_ELEMENT_IDS.albumLink];
  const artistLink = elements[SPOTIFY_ELEMENT_IDS.artistLink];
  const loadingEl = elements[SPOTIFY_ELEMENT_IDS.loading];
  const errorEl = elements[SPOTIFY_ELEMENT_IDS.error];
  // build content elements for applyContentUpdates
  const contentElements: ContentElements = {
    statusText,
    playedAtText,
    albumImage,
    trackLink,
    albumLink,
    artistLink,
    iconEl,
  };
  // check if this is initial load or content has changed
  const isInitialLoad = previousTrack === null;
  const contentChanged = hasTrackChanged(track, isNowPlaying);
  // store current track for future comparison
  previousTrack = { ...track };
  // update track info for lyrics fetching
  updateCurrentTrack(track.artistName, track.trackName, track.trackUrl);
  previousIsNowPlaying = isNowPlaying;
  // skip animation if content unchanged
  if (!contentChanged) {
    return;
  }
  // initial load: use slide-in animation
  if (isInitialLoad) {
    const shouldSlideIn = isPageReload();
    // apply content and set up marquees
    applyContentUpdates(isNowPlaying, track, contentElements);
    setupMarquees(getTextWrappers());
    // fetch lyrics before showing widget
    const lyricsReady = setupLyricsTicker(track.artistName, track.trackName);
    // show widget after both image and lyrics are ready
    const showWidget = () => {
      loadingEl?.classList.add("hidden");
      errorEl?.classList.add("hidden");
      if (shouldSlideIn) {
        void container?.offsetHeight;
        requestAnimationFrame(() => {
          container?.classList.remove("loading");
        });
      } else {
        container?.classList.remove("loading");
      }
    };
    if (albumImage && container) {
      let imageLoaded = false;
      let lyricsLoaded = false;
      albumImage.onload = () => {
        imageLoaded = true;
        if (lyricsLoaded) showWidget();
      };
      lyricsReady.then(() => {
        lyricsLoaded = true;
        if (imageLoaded) showWidget();
      });
    }
    return;
  }
  // subsequent updates: use fade animation
  const fadeableElements = getFadeableElements();
  const oldImageSrc = albumImage?.src;
  // fade out current content
  fadeOut(fadeableElements);
  // after fade out completes, update content and fade in
  setTimeout(() => {
    applyContentUpdates(isNowPlaying, track, contentElements);
    // fetch and display lyrics ticker
    setupLyricsTicker(track.artistName, track.trackName);
    // wait for new image to load before fading in (if image changed)
    if (albumImage && oldImageSrc !== track.imageUrl) {
      albumImage.onload = () => {
        fadeIn(fadeableElements);
        setupMarquees(getTextWrappers());
      };
    } else {
      // same image or no image element, fade in immediately
      requestAnimationFrame(() => {
        fadeIn(fadeableElements);
        setupMarquees(getTextWrappers());
      });
    }
  }, FADE_DURATION);
}

/**
 * Show error state
 */
export function showError(): void {
  // get required DOM elements
  const elements = getElements({
    [SPOTIFY_ELEMENT_IDS.loading]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.error]: HTMLDivElement,
    [SPOTIFY_ELEMENT_IDS.container]: HTMLDivElement,
  });
  // extract elements for convenience
  const loadingEl = elements[SPOTIFY_ELEMENT_IDS.loading];
  const errorEl = elements[SPOTIFY_ELEMENT_IDS.error];
  const container = elements[SPOTIFY_ELEMENT_IDS.container];
  // hide loading and show error
  loadingEl?.classList.add("hidden");
  errorEl?.classList.remove("hidden");
  // show with slide-in animation (same as successful load)
  if (container) {
    const shouldAnimate = isPageReload();
    // animate slide-in if page was reloaded
    if (shouldAnimate) {
      void container.offsetHeight;
      requestAnimationFrame(() => {
        container.classList.remove("loading");
      });
    } else {
      // no animation for navigation
      container.classList.remove("loading");
    }
  }
}
