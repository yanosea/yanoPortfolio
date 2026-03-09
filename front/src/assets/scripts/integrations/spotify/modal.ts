/**
 * Spotify Album Image Modal Integration
 */

// utils
import { getElement } from "@/assets/scripts/core/dom.ts";
import { openImageModal } from "../../modal/modal-functions.ts";
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
  // get album image and link elements
  const albumImage = getElement("spotify-album-image", HTMLImageElement);
  const albumLink = getElement("spotify-album-link", HTMLAnchorElement);
  // exit early if elements not found
  if (!albumImage || !albumLink) {
    return;
  }
  // add click handler to open modal with album artwork
  albumImage.addEventListener("click", async () => {
    openImageModal(
      albumImage.src,
      albumImage.alt,
      albumLink.textContent ?? "",
    );
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
