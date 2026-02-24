/**
 * Cd Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { ROUTING_CONFIG } from "@/assets/scripts/core/config.ts";
// core
import {
  escapeHtml,
  getAllPages,
  redirectWithCountdown,
} from "../core/utils.ts";

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
        return `<span class="${CSS_CLASSES.ERROR}">cd: ${
          escapeHtml(normalizedArg)
        }: ${MESSAGES.NO_SUCH_DIR}</span>`;
      }
      targetUrl = normalizedInputPath;
    } else {
      // empty path means home
      targetUrl = "/";
    }
    const pageName = normalizedArg === "" || normalizedArg === "~" ||
        normalizedArg === "index" || normalizedArg === "/index"
      ? "home"
      : normalizedArg;
    return redirectWithCountdown(pageName, targetUrl);
  },
};
