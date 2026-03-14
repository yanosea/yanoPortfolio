/**
 * Spotify Album Image Modal Integration
 */

// utils
import { getElement } from "@/assets/scripts/core/dom.ts";
import { openImageModal } from "../../modal/modal-functions.ts";
import {
  CSS_CLASSES,
  SPOTIFY_FIELD_ICONS,
} from "@/assets/scripts/core/constants.ts";
import { fetchLyrics } from "../lrclib/lyrics.ts";
import { startLyrics, stopLyrics } from "../../modal/lyrics-renderer.ts";

/** Current track info for modal display */
let currentArtist = "";
let currentTrack = "";
let currentTrackUrl = "";

/**
 * Update current track info for modal display
 * @param artistName - Current artist name
 * @param trackName - Current track name
 * @param trackUrl - Current track URL
 */
export function updateCurrentTrack(
  artistName: string,
  trackName: string,
  trackUrl: string,
): void {
  currentArtist = artistName;
  currentTrack = trackName;
  currentTrackUrl = trackUrl;
}

/**
 * Initialize Spotify album image modal
 */
export function initImageModal(): void {
  // get album image element
  const albumImage = getElement(
    CSS_CLASSES.SPOTIFY_ALBUM_IMAGE,
    HTMLImageElement,
  );
  // exit early if element not found
  if (!albumImage) {
    return;
  }
  // add click handler to open modal with album artwork
  albumImage.addEventListener("click", async () => {
    openImageModal(albumImage.src, albumImage.alt);
    // apply Spotify styles and track link to modal image
    const modalImage = getElement("modal-image", HTMLImageElement);
    if (modalImage) {
      modalImage.classList.add(
        "cursor-pointer",
        CSS_CLASSES.SPOTIFY_ALBUM_IMAGE,
      );
      if (currentTrackUrl) {
        modalImage.onclick = () => {
          globalThis.open(currentTrackUrl, "_blank", "noopener,noreferrer");
        };
      }
    }
    // set track name with icon as caption link
    const captionEl = getElement("modal-image-caption", HTMLElement);
    if (captionEl) {
      captionEl.replaceChildren();
      if (currentTrack) {
        const link = document.createElement("a");
        link.href = currentTrackUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "inline-flex items-center gap-2 link-text";
        // SPOTIFY_FIELD_ICONS.TRACK is a trusted SVG constant, not user input
        const iconContainer = document.createElement("span");
        iconContainer.className = "flex items-center";
        const iconTemplate = document.createElement("template");
        iconTemplate.innerHTML = SPOTIFY_FIELD_ICONS.TRACK;
        iconContainer.appendChild(iconTemplate.content);
        const textSpan = document.createElement("span");
        textSpan.textContent = currentTrack;
        link.appendChild(iconContainer);
        link.appendChild(textSpan);
        captionEl.appendChild(link);
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
      // remove Spotify-specific styles and handler from modal image
      const modalImage = getElement("modal-image", HTMLImageElement);
      if (modalImage) {
        modalImage.classList.remove(
          "cursor-pointer",
          CSS_CLASSES.SPOTIFY_ALBUM_IMAGE,
        );
        modalImage.onclick = null;
      }
    });
  }
}
