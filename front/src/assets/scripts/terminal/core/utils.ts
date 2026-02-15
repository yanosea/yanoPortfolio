/**
 * Terminal Utilities
 */

// config
import { getSiteName } from "@/assets/scripts/core/config.ts";

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
      // remove .html extension for display
      const pathWithoutExt = path.replace(/\.html$/, "");
      // extract name from path
      const pathParts = pathWithoutExt.split("/").filter((p) => p);
      const name = pathParts[pathParts.length - 1] || "index";
      // use path without .html as key
      if (!pagesMap.has(pathWithoutExt)) {
        pagesMap.set(pathWithoutExt, {
          name: name,
          path: pathWithoutExt,
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
  return `<span class="terminal-user">you</span> <span class="terminal-at">@</span> <span class="terminal-host">${hostname}</span> <span class="terminal-colon">:</span> <span class="terminal-path">~</span> <span class="terminal-dollar">$</span> `;
}
