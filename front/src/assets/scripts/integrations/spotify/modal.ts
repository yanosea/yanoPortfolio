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
  // get album image and link elements
  const albumImage = getElement("spotify-album-image", HTMLImageElement);
  const albumLink = getElement("spotify-album-link", HTMLAnchorElement);
  // exit early if elements not found
  if (!albumImage || !albumLink) {
    return;
  }
  // add click handler to open modal with album artwork
  albumImage.addEventListener("click", async () => {
    const albumName = albumLink.textContent ?? "";
    openImageModal(albumImage.src, albumImage.alt);
    // build icon-styled caption (track, album, artist) matching widget layout
    const captionEl = getElement("modal-image-caption", HTMLElement);
    if (captionEl) {
      captionEl.replaceChildren();
      if (currentTrack && currentArtist) {
        // single row with all track info
        const row = document.createElement("div");
        row.className = "flex items-center gap-4 flex-wrap justify-center";
        const items: { icon: string; text: string }[] = [
          { icon: SPOTIFY_FIELD_ICONS.TRACK, text: currentTrack },
          { icon: SPOTIFY_FIELD_ICONS.ALBUM, text: albumName },
          { icon: SPOTIFY_FIELD_ICONS.ARTIST, text: currentArtist },
        ];
        for (const { icon, text } of items) {
          const item = document.createElement("span");
          item.className = "inline-flex items-center gap-1";
          // icon is a trusted SVG constant from SPOTIFY_FIELD_ICONS, not user input
          const iconSpan = document.createElement("span");
          iconSpan.className = "flex items-center";
          iconSpan.innerHTML = icon;
          const textSpan = document.createElement("span");
          textSpan.textContent = text;
          item.appendChild(iconSpan);
          item.appendChild(textSpan);
          row.appendChild(item);
        }
        captionEl.appendChild(row);
      } else {
        captionEl.textContent = albumName;
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
