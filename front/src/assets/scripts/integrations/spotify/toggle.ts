/**
 * Spotify Widget Toggle
 */

// utils
import { getElement } from "@/assets/scripts/core/dom.ts";

/**
 * Toggle widget collapse state
 * @param container - Container element to toggle
 */
export function toggleCollapse(container: HTMLElement): void {
  // toggle the collapsed class on the container
  container.classList.toggle("collapsed");
  // save state to localStorage for persistence
  const isCollapsed = container.classList.contains("collapsed");
  localStorage.setItem("spotify-widget-collapsed", isCollapsed.toString());
}

/**
 * Initialize toggle button
 */
export function initToggleButton(): void {
  // get required DOM elements
  const toggleButton = getElement("spotify-toggle-button", HTMLButtonElement);
  const container = getElement("spotify-status-container", HTMLDivElement);
  // exit early if elements not found
  if (!toggleButton || !container) {
    return;
  }
  // add click event listener for toggle functionality
  toggleButton.addEventListener("click", () => toggleCollapse(container));
  // restore saved state from localStorage on initialization
  const savedState = localStorage.getItem("spotify-widget-collapsed");
  if (savedState === "true") {
    container.classList.add("collapsed");
  }
}
