/**
 * Spotify Album Image Modal Integration
 */

// utils
import { getElement } from "@/assets/scripts/core/dom.ts";
import { openImageModal } from "../../modal/modal-functions.ts";

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
  albumImage.addEventListener("click", () => {
    openImageModal(
      albumImage.src,
      albumImage.alt,
      albumLink.textContent ?? "",
    );
  });
}
