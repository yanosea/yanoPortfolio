/**
 * Cd Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
// core
import {
  escapeHtml,
  getAllPages,
  getCurrentVirtualPath,
  redirectWithCountdown,
  resolveVirtualPath,
  virtualPathToUrl,
} from "../core/utils.ts";

/**
 * Error messages
 */
const MESSAGES = {
  NO_SUCH_DIR: "No such file or directory",
  PERMISSION_DENIED: "Permission denied",
  OLDPWD_NOT_SET: "OLDPWD not set",
} as const;

/**
 * Change directory command
 */
export const cd: Command = {
  name: "cd",
  description: "Change directory",
  execute: async (args: string[] = []) => {
    const arg = args[0];

    // cd - → OLDPWD not set (not tracked in this terminal)
    if (arg === "-") {
      return `<span class="${CSS_CLASSES.ERROR}">cd: ${MESSAGES.OLDPWD_NOT_SET}</span>`;
    }

    const cwd = getCurrentVirtualPath();

    // no argument → go home
    if (!arg) {
      return redirectWithCountdown("index", "/");
    }

    // resolve user input to absolute virtual path
    const resolved = resolveVirtualPath(arg, cwd);

    // cd . → stay in place (only for literal ".")
    if (arg === ".") return "";

    // check if path is within /home/you
    const url = virtualPathToUrl(resolved);
    if (url === null) {
      return `<span class="${CSS_CLASSES.ERROR}">cd: ${
        escapeHtml(arg)
      }: ${MESSAGES.PERMISSION_DENIED}</span>`;
    }

    // going home
    if (url === "/") {
      return redirectWithCountdown("index", "/");
    }

    // validate that the target page exists in sitemap
    const pages = await getAllPages();
    const pathExists = pages.some((page) => {
      const pagePath = page.path.startsWith("/") ? page.path : `/${page.path}`;
      return pagePath === url || pagePath.startsWith(url + "/");
    });

    if (!pathExists) {
      // special case: "index" should go home
      const name = url.replace(/^\//, "");
      if (name === "index") {
        return redirectWithCountdown("index", "/");
      }
      return `<span class="${CSS_CLASSES.ERROR}">cd: ${
        escapeHtml(arg)
      }: ${MESSAGES.NO_SUCH_DIR}</span>`;
    }

    const pageName = url.replace(/^\//, "") || "index";
    return redirectWithCountdown(pageName, url);
  },
};
