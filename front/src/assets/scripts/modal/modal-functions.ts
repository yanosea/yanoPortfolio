/**
 * Image Modal Functions
 */

/**
 * Open fullscreen image modal
 * @param src - Image source URL
 * @param alt - Image alt text
 * @param caption - Optional caption text to display below the image
 */
export function openImageModal(
  src: string,
  alt: string,
  caption?: string,
): void {
  const imageModal = document.getElementById(
    "image-modal",
  ) as HTMLDialogElement | null;
  const modalImage = document.getElementById(
    "modal-image",
  ) as HTMLImageElement | null;
  const modalCaption = document.getElementById(
    "modal-image-caption",
  ) as HTMLElement | null;
  if (!imageModal || !modalImage) {
    return;
  }
  // set image source and alt text
  modalImage.src = src;
  modalImage.alt = alt;
  // set caption if provided
  if (modalCaption) {
    modalCaption.textContent = caption || "";
  }
  // show modal
  imageModal.showModal();
}

/**
 * Close fullscreen image modal
 */
export function closeImageModal(): void {
  const imageModal = document.getElementById(
    "image-modal",
  ) as HTMLDialogElement | null;
  if (!imageModal) {
    return;
  }
  imageModal.close();
}
