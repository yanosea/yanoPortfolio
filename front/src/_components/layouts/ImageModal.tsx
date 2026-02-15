/**
 * Image modal component
 */

/**
 * Modal for displaying images
 */
export default function ImageModal() {
  return (
    <dialog
      id="image-modal"
      className="max-w-none max-h-none w-screen h-screen m-0 p-0 image-modal-dialog"
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
        {/* image */}
        <div className="relative">
          <img
            id="modal-image"
            src=""
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
        {/* caption */}
        <div
          id="modal-image-caption"
          className="font-semibold text-center image-modal-caption"
        >
        </div>
        {/* close button */}
        <button
          type="button"
          id="image-modal-close"
          className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center bg-elevated/90 hover:bg-elevated rounded-full text-primary cursor-pointer transition-colors"
          aria-label="Close fullscreen image"
        >
          ×
        </button>
      </div>
    </dialog>
  );
}
