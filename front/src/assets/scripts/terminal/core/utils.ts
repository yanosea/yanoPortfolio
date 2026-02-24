/**
 * Terminal Utilities
 */

// config
import {
  getSiteName,
  getUsername,
  TIMING_CONFIG,
} from "@/assets/scripts/core/config.ts";
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";

/**
 * Virtual filesystem home directory prefix
 */
export const HOME_PREFIX = "/home/you";

/**
 * Convert URL pathname to virtual filesystem path
 * @param pathname - URL pathname (e.g., "/about")
 * @returns Virtual path (e.g., "/home/you/about")
 */
export function urlToVirtualPath(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, "") || "/";
  if (cleaned === "/") return HOME_PREFIX;
  return HOME_PREFIX + cleaned;
}

/**
 * Convert virtual filesystem path to URL pathname
 * @param virtualPath - Virtual path (e.g., "/home/you/about")
 * @returns URL pathname (e.g., "/about") or null if outside home
 */
export function virtualPathToUrl(virtualPath: string): string | null {
  if (virtualPath === HOME_PREFIX) return "/";
  if (virtualPath.startsWith(HOME_PREFIX + "/")) {
    return virtualPath.slice(HOME_PREFIX.length);
  }
  return null;
}

/**
 * Get the current page's virtual filesystem path
 * @returns Current virtual path (e.g., "/home/you" or "/home/you/about")
 */
export function getCurrentVirtualPath(): string {
  return urlToVirtualPath(globalThis.location.pathname);
}

/**
 * Get shell environment variables
 * @returns Record of variable names to their values
 */
export function getShellVariables(): Record<string, string> {
  return {
    HOME: HOME_PREFIX,
    USER: getUsername() || "you",
    PWD: getCurrentVirtualPath(),
    HOSTNAME: getSiteName(),
    SHELL: "/bin/bash",
  };
}

/**
 * Resolve a user-input path to an absolute virtual path
 * Supports: .., ., relative paths, absolute paths
 * Shell variable expansion (~, $HOME) is handled by the executor layer.
 * @param arg - User input path argument
 * @param cwd - Current working directory (virtual path)
 * @returns Resolved absolute virtual path
 */
export function resolveVirtualPath(arg: string, cwd: string): string {
  let target: string;

  if (arg.startsWith("/")) {
    target = arg;
  } else {
    // relative path
    target = cwd + "/" + arg;
  }

  // normalize: resolve . and .. segments
  const parts = target.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return "/" + resolved.join("/") || "/";
}

/**
 * Page information structure
 */
export interface PageInfo {
  name: string;
  path: string;
}

/**
 * Get page information from navigation links dynamically
 * @returns Array of page information
 */
export function getPages(): PageInfo[] {
  const nav = document.querySelector("nav");
  if (!nav) return [];
  const links = nav.querySelectorAll("a");
  const pagesMap = new Map<string, PageInfo>();
  links.forEach((link) => {
    const href = link.getAttribute("href");
    const text = link.textContent?.trim();
    // skip RSS feed and other non-page links
    if (
      href &&
      text &&
      !href.includes("feed") &&
      !href.startsWith("http") &&
      href !== "/"
    ) {
      // use path as key to avoid duplicates
      if (!pagesMap.has(href)) {
        pagesMap.set(href, {
          name: text,
          path: href,
        });
      }
    }
  });
  return Array.from(pagesMap.values());
}

/**
 * Get all pages from sitemap.xml dynamically
 * @returns Array of page information
 */
export async function getAllPages(): Promise<PageInfo[]> {
  try {
    const response = await fetch("/sitemap.xml");
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const urls = xmlDoc.querySelectorAll("url loc");
    const pagesMap = new Map<string, PageInfo>();
    urls.forEach((loc) => {
      const urlText = loc.textContent;
      if (!urlText) {
        return;
      }
      // parse URL and extract pathname
      let path: string;
      try {
        const urlObj = new URL(urlText);
        path = urlObj.pathname;
      } catch {
        // if URL parsing fails, try to extract path manually
        const match = urlText.match(/https?:\/\/[^\/]+(\/.*)/);
        path = match ? match[1] : urlText;
      }
      // ensure path starts with /
      if (!path.startsWith("/")) {
        path = "/" + path;
      }
      // remove trailing slash for display
      const pathWithoutSlash = path.replace(/\/+$/, "") || "/";
      // extract name from path
      const pathParts = pathWithoutSlash.split("/").filter((p) => p);
      const name = pathParts[pathParts.length - 1] || "index";
      // use path without trailing slash as key
      if (!pagesMap.has(pathWithoutSlash)) {
        pagesMap.set(pathWithoutSlash, {
          name: name,
          path: pathWithoutSlash,
        });
      }
    });
    return Array.from(pagesMap.values());
  } catch (error) {
    console.error("Failed to fetch sitemap:", error);
    return [];
  }
}

/**
 * Detect if device is desktop using modern media query approach
 * @returns True if device has fine pointer and hover capability
 */
export function isDesktop(): boolean {
  if (globalThis.matchMedia) {
    return globalThis.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
  // fallback for older browsers (assume desktop)
  return true;
}

/**
 * Scroll to the bottom of the terminal container
 */
export function scrollToBottom(): void {
  const content = document.getElementById("terminal-container");
  if (content) {
    setTimeout(() => {
      content.scrollTop = content.scrollHeight;
    }, 10);
  }
}

/**
 * Escape HTML special characters to prevent injection
 * @param text - Raw text to escape
 * @returns HTML-safe string
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate terminal prompt HTML
 * @returns Terminal prompt HTML string
 */
export function getPromptHtml(): string {
  const hostname = getSiteName();
  const virtualPath = getCurrentVirtualPath();
  // display path relative to home: /home/you → ~, /home/you/about → ~/about
  const displayPath = virtualPath === HOME_PREFIX
    ? "~"
    : "~" + virtualPath.slice(HOME_PREFIX.length);
  return `<span class="${CSS_CLASSES.USER}">you</span> <span class="${CSS_CLASSES.AT}">@</span> <span class="${CSS_CLASSES.HOST}">${hostname}</span> <span class="${CSS_CLASSES.COLON}">:</span> <span class="${CSS_CLASSES.PATH}">${displayPath}</span> <span class="${CSS_CLASSES.DOLLAR}">$</span> `;
}

/** Active countdown interval ID for cleanup */
let countdownIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Clear any active redirect countdown
 */
export function clearRedirectCountdown(): void {
  if (countdownIntervalId !== null) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
}

/**
 * Start a countdown and navigate via SPA router
 * Hides the terminal form, shows countdown, then dispatches app:requestNavigate.
 * @param pageName - Display name for the countdown message
 * @param targetUrl - URL to navigate to
 * @returns Initial countdown HTML
 */
export function redirectWithCountdown(
  pageName: string,
  targetUrl: string,
): string {
  // clear any existing countdown
  clearRedirectCountdown();
  const form = document.getElementById("terminal-form") as HTMLFormElement;
  if (form) {
    form.style.display = "none";
  }
  let countdown = TIMING_CONFIG.redirectCountdownSeconds;
  const formatMsg = (n: number) =>
    `<span class="${CSS_CLASSES.SUCCESS}">Redirecting to ${
      escapeHtml(pageName)
    } page in ${n} second${n !== 1 ? "s" : ""}...</span>`;
  countdownIntervalId = setInterval(() => {
    countdown--;
    if (!document.getElementById("terminal-form")) {
      clearRedirectCountdown();
      return;
    }
    if (countdown > 0) {
      const outputEl = document.querySelector(
        ".terminal-history-item:last-child .terminal-history-output",
      );
      if (outputEl) {
        outputEl.innerHTML = formatMsg(countdown);
      }
    } else {
      clearRedirectCountdown();
      document.dispatchEvent(
        new CustomEvent("app:requestNavigate", {
          detail: { url: targetUrl },
        }),
      );
    }
  }, TIMING_CONFIG.countdownInterval);
  return formatMsg(countdown);
}
