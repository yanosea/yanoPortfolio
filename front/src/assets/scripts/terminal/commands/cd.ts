/**
 * Cd Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { ROUTING_CONFIG, TIMING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import { getAllPages } from "../core/utils.ts";

/**
 * Map of error messages
 */
const MESSAGES = {
  NO_SUCH_DIR: "no such file or directory",
} as const;

/**
 * Map of directory paths to page URLs
 */
const DIRECTORY_MAP: Record<string, string> = {
  about: ROUTING_CONFIG.pages.about,
  blog: ROUTING_CONFIG.pages.blog,
  links: ROUTING_CONFIG.pages.links,
  "~": ROUTING_CONFIG.pages.home,
  "": ROUTING_CONFIG.pages.home,
};

/**
 * Change directory command
 */
export const cd: Command = {
  name: "cd",
  description: "Change directory",
  execute: async (args: string[] = []) => {
    const path = args[0] || "";
    // remove trailing slash for normalization (Unix-style)
    const normalizedArg = path.replace(/\/+$/, "");
    let targetUrl: string;
    // special case: "index" refers to the root page
    if (normalizedArg === "index" || normalizedArg === "/index") {
      targetUrl = "/";
    } else if (DIRECTORY_MAP[normalizedArg]) {
      // check predefined directory map
      targetUrl = DIRECTORY_MAP[normalizedArg];
    } else if (normalizedArg) {
      // validate if path exists in sitemap
      const pages = await getAllPages();
      const normalizedInputPath = normalizedArg.startsWith("/")
        ? normalizedArg
        : `/${normalizedArg}`;
      // check if the path (or any parent directory) exists in pages
      const pathExists = pages.some((page) => {
        const pagePath = page.path.startsWith("/")
          ? page.path
          : `/${page.path}`;
        return pagePath === normalizedInputPath ||
          pagePath.startsWith(normalizedInputPath + "/");
      });
      // if path doesn't exist, return error message
      if (!pathExists) {
        return `<span class="${CSS_CLASSES.ERROR}">cd: ${normalizedArg}: ${MESSAGES.NO_SUCH_DIR}</span>`;
      }
      // allow validated path - construct URL from the path argument
      const normalizedPath = normalizedInputPath;
      // if path doesn't have .html extension, add it
      if (!normalizedPath.endsWith(".html") && !normalizedPath.endsWith("/")) {
        targetUrl = `${normalizedPath}.html`;
      } else {
        targetUrl = normalizedPath;
      }
    } else {
      // empty path means home
      targetUrl = "/";
    }
    // hide terminal form during redirect
    const form = document.getElementById("terminal-form") as HTMLFormElement;
    if (form) {
      form.style.display = "none";
    }
    let countdown = TIMING_CONFIG.redirectCountdownSeconds;
    const pageName = normalizedArg === "" || normalizedArg === "~" ||
        normalizedArg === "index" || normalizedArg === "/index"
      ? "home"
      : normalizedArg;
    const outputHtml =
      `<span class="${CSS_CLASSES.SUCCESS}">Redirecting to ${pageName} page in ${countdown} second${
        countdown !== 1 ? "s" : ""
      }...</span>`;
    // update countdown every second
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        const outputEl = document.querySelector(
          ".terminal-history-item:last-child .terminal-history-output",
        );
        if (outputEl) {
          outputEl.innerHTML =
            `<span class="${CSS_CLASSES.SUCCESS}">Redirecting to ${pageName} page in ${countdown} second${
              countdown !== 1 ? "s" : ""
            }...</span>`;
        }
      } else {
        clearInterval(countdownInterval);
        globalThis.location.href = targetUrl;
      }
    }, TIMING_CONFIG.countdownInterval);
    return outputHtml;
  },
};
