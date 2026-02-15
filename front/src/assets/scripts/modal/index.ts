/**
 * Image Modal Initialization
 */

// utils
import { closeImageModal } from "./modal-functions.ts";
// blog image delegation (registers a single document-level listener)
import "./blog-images.ts";

// re-export functions for backward compatibility (though direct import is preferred)
export { closeImageModal, openImageModal } from "./modal-functions.ts";

/**
 * Initialize image modal event listeners
 */
function initImageModal(): void {
  const imageModal = document.getElementById(
    "image-modal",
  ) as HTMLDialogElement | null;
  const modalCloseButton = document.getElementById(
    "image-modal-close",
  ) as HTMLButtonElement | null;
  if (!imageModal || !modalCloseButton) {
    return;
  }
  // close modal on close button click
  modalCloseButton.addEventListener("click", closeImageModal);
  // close modal on backdrop click (anywhere except the image)
  imageModal.addEventListener("click", (e) => {
    // close if clicking on the modal background, not the image
    if (e.target === imageModal || e.target === imageModal.firstElementChild) {
      closeImageModal();
    }
  });
  // close modal on Escape key
  imageModal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeImageModal();
    }
  });
}

// initialize modal event listeners
initImageModal();
