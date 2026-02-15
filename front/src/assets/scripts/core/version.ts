/**
 * Version display functionality
 */

// config
import { getGithubReleasesUrl, getGithubTagsUrl } from "./config.ts";

// fetch and display version from GitHub tags
document.addEventListener("DOMContentLoaded", async () => {
  const versionElement = document.getElementById("version") as
    | HTMLAnchorElement
    | null;
  const footerContent = document.getElementById("footer-content");
  // if elements not found, abort
  if (!versionElement || !footerContent) {
    return;
  }
  // fetch latest tag from GitHub API
  try {
    const response = await fetch(getGithubTagsUrl());
    if (response.ok) {
      const tags = await response.json();
      if (tags.length > 0) {
        const tagName = tags[0].name;
        versionElement.textContent = tagName;
        versionElement.href = getGithubReleasesUrl(tagName);
        versionElement.target = "_blank";
        versionElement.rel = "noopener noreferrer";
      }
    }
  } catch {
    // silently fail - show footer without version
  } finally {
    // always show footer content with smooth fade-in
    requestAnimationFrame(() => {
      footerContent.classList.add("visible");
    });
  }
});
