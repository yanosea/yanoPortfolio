/**
 * Spotify Integration Entry Point
 */

// api
import { getTrackInfo } from "./api.ts";
// ui
import { initImageModal } from "./modal.ts";
import { initToggleButton } from "./toggle.ts";
import { showError, updateUI } from "./ui.ts";
// config
import { API_CONFIG } from "@/assets/scripts/core/config.ts";

/**
 * Fetch and update Spotify status
 */
async function updateSpotifyStatus(): Promise<void> {
  const result = await getTrackInfo();
  if (result.isOk()) {
    const { isNowPlaying, track } = result.unwrap();
    updateUI(isNowPlaying, track);
  } else {
    const error = result.unwrapError();
    console.error(
      "Spotify Widget Update:",
      error instanceof Error ? error.message : String(error),
    );
    showError();
  }
}

// initialize on page load
initToggleButton();
initImageModal();
updateSpotifyStatus();
// update every 60 seconds
setInterval(updateSpotifyStatus, API_CONFIG.spotify.updateInterval);
