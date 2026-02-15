/**
 * Blog Image Modal Integration
 * Uses event delegation so no re-initialization is needed after SPA navigation.
 */

// utils
import { openImageModal } from "./modal-functions.ts";

// single delegated listener — survives SPA content swaps
document.addEventListener("click", (e) => {
  const image = (e.target as HTMLElement).closest<HTMLImageElement>(
    "img.blog-image",
  );
  if (!image || !image.src) return;
  openImageModal(image.src, image.alt || "", image.alt);
});
