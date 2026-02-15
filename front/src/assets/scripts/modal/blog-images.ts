/**
 * Blog Image Modal Integration
 */

// utils
import { openImageModal } from "./modal-functions.ts";

/**
 * Initialize blog image modal handlers
 */
export function initBlogImageModal(): void {
  // find all images with blog-image class
  const blogImages = document.querySelectorAll<HTMLImageElement>(
    "img.blog-image",
  );
  // attach click handlers to each image
  blogImages.forEach((image, index) => {
    const src = image.src;
    const alt = image.alt;
    if (!src) {
      console.warn(`[Image Modal] Image ${index} missing src`);
      return;
    }
    // open modal on image click
    image.addEventListener("click", () => {
      openImageModal(src, alt || "", alt);
    });
  });
}
