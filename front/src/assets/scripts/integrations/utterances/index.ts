/**
 * Utterances comments integration with theme support
 */

// core
import { THEME_CONFIG } from "@/assets/scripts/core/config.ts";

/**
 * Utterances theme mapping based on current site theme
 */
const UTTERANCES_THEMES = {
  /** Light theme name */
  light: "github-light",
  /** Dark theme name */
  dark: "github-dark",
} as const;

/**
 * Get current theme for utterances
 * @returns Utterances theme name
 */
function getUtterancesTheme(): string {
  const currentTheme = document.documentElement.classList.contains("dark")
    ? THEME_CONFIG.DARK
    : THEME_CONFIG.LIGHT;
  return UTTERANCES_THEMES[currentTheme];
}

/**
 * Initialize utterances comments widget
 */
function initializeUtterances(): void {
  // get the utterances container element
  const container = document.getElementById("utterances-container");
  // exit early if container not found
  if (!container) {
    return;
  }
  // check if already initialized to avoid duplicate widgets
  const existingFrame = container.querySelector("iframe.utterances-frame");
  if (existingFrame) {
    return;
  }
  // get configuration from data attributes
  const repo = container.getAttribute("data-repo");
  const issueTerm = container.getAttribute("data-issue-term");
  const label = container.getAttribute("data-label");
  // repo is required for utterances to work
  if (!repo) {
    console.error("Utterances: repo attribute is required");
    return;
  }
  // remove existing script if any to allow re-initialization
  const existingScript = container.querySelector("script");
  if (existingScript) {
    existingScript.remove();
  }
  // create and configure utterances script element
  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.setAttribute("repo", repo);
  script.setAttribute("issue-term", issueTerm || "pathname");
  script.setAttribute("label", label || "comment");
  script.setAttribute("theme", getUtterancesTheme());
  script.setAttribute("crossorigin", "anonymous");
  script.setAttribute("async", "true");
  // append script to container to load utterances
  container.appendChild(script);
}

/**
 * Change utterances theme dynamically
 * @param theme - Theme name to apply
 */
function changeUtterancesTheme(theme: string): void {
  // find the utterances iframe element
  const iframe = document.querySelector(
    ".utterances-wrapper iframe.utterances-frame",
  ) as HTMLIFrameElement;
  // exit early if iframe not found or not accessible
  if (!iframe || !iframe.contentWindow) {
    return;
  }
  // create theme change message for utterances
  const message = {
    type: "set-theme",
    theme: theme,
  };
  // send message to utterances iframe to change theme
  iframe.contentWindow.postMessage(message, "https://utteranc.es");
}

// initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // initialize utterances widget
  initializeUtterances();
  // listen for utterances ready message
  globalThis.addEventListener("message", (event) => {
    // only respond to messages from utteranc.es
    if (event.origin === "https://utteranc.es") {
      const currentTheme = getUtterancesTheme();
      changeUtterancesTheme(currentTheme);
    }
  });
  // listen for theme changes on document element
  const observer = new MutationObserver((mutations) => {
    // check each mutation for class changes
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        // apply new theme to utterances
        const newTheme = getUtterancesTheme();
        changeUtterancesTheme(newTheme);
      }
    });
  });
  // start observing document element for class changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});
