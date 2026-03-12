/**
 * Spotify Album Image Modal Integration
 */

// utils
import { getElement } from "@/assets/scripts/core/dom.ts";
import { openImageModal } from "../../modal/modal-functions.ts";
import { SPOTIFY_FIELD_ICONS } from "@/assets/scripts/core/constants.ts";
import { fetchLyrics } from "../lrclib/lyrics.ts";
import { startLyrics, stopLyrics } from "../../modal/lyrics-renderer.ts";

/** Current track info for lyrics fetching */
let currentArtist = "";
let currentTrack = "";

/**
 * Update current track info for lyrics
 * @param artistName - Current artist name
 * @param trackName - Current track name
 */
export function updateCurrentTrack(
  artistName: string,
  trackName: string,
): void {
  currentArtist = artistName;
  currentTrack = trackName;
}

/**
 * Initialize Spotify album image modal
 */
export function initImageModal(): void {
  // get album image element
  const albumImage = getElement("spotify-album-image", HTMLImageElement);
  // exit early if element not found
  if (!albumImage) {
    return;
  }
  // add click handler to open modal with album artwork
  albumImage.addEventListener("click", async () => {
    openImageModal(albumImage.src, albumImage.alt);
    // set track name with icon as caption
    const captionEl = getElement("modal-image-caption", HTMLElement);
    if (captionEl) {
      captionEl.replaceChildren();
      if (currentTrack) {
        const item = document.createElement("span");
        item.className = "inline-flex items-center gap-1";
        // icon is a trusted SVG constant from SPOTIFY_FIELD_ICONS, not user input
        const iconSpan = document.createElement("span");
        iconSpan.className = "flex items-center";
        iconSpan.innerHTML = SPOTIFY_FIELD_ICONS.TRACK;
        const textSpan = document.createElement("span");
        textSpan.textContent = currentTrack;
        item.appendChild(iconSpan);
        item.appendChild(textSpan);
        captionEl.appendChild(item);
      }
    }
    // fetch and render lyrics
    if (currentArtist && currentTrack) {
      const lyricsData = await fetchLyrics(currentArtist, currentTrack);
      if (lyricsData) {
        const overlay = getElement("modal-lyrics-overlay", HTMLDivElement);
        if (overlay) {
          startLyrics(lyricsData, overlay);
        }
      }
    }
  });
  // stop lyrics when modal closes
  const imageModal = getElement("image-modal", HTMLDialogElement);
  if (imageModal) {
    imageModal.addEventListener("close", () => {
      stopLyrics();
    });
  }
}
