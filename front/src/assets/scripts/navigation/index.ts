/**
 * Mobile menu toggle functionality
 */

// config
import { TIMING_CONFIG } from "@/assets/scripts/core/config.ts";

// setup mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  // get menu elements
  const menuButton = document.getElementById("menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIconOpen = document.getElementById("menu-icon-open");
  const menuIconClose = document.getElementById("menu-icon-close");
  // exit early if elements not found
  if (!menuButton || !mobileMenu || !menuIconOpen || !menuIconClose) {
    return;
  }
  // update menu state based on expanded flag
  const updateMenuState = (isExpanded: boolean) => {
    // update aria attributes
    menuButton.setAttribute("aria-expanded", String(isExpanded));
    menuButton.setAttribute(
      "aria-label",
      isExpanded ? "close menu" : "open menu",
    );
    // update menu height
    mobileMenu.style.gridTemplateRows = isExpanded ? "1fr" : "0fr";
    // fade out icons
    menuIconOpen.style.opacity = "0";
    menuIconClose.style.opacity = "0";
    // swap icons after fade
    setTimeout(() => {
      if (isExpanded) {
        menuIconOpen.classList.add("hidden");
        menuIconClose.classList.remove("hidden");
      } else {
        menuIconOpen.classList.remove("hidden");
        menuIconClose.classList.add("hidden");
      }
      // fade in new icon
      menuIconOpen.style.opacity = isExpanded ? "0" : "1";
      menuIconClose.style.opacity = isExpanded ? "1" : "0";
    }, TIMING_CONFIG.iconFadeDelay);
  };
  // initialize state
  const initialExpanded = menuButton.getAttribute("aria-expanded") === "true";
  updateMenuState(initialExpanded);
  // handle clicks
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    updateMenuState(!isExpanded);
  });
});
