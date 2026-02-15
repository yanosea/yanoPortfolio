/**
 * Ls Command
 */

// types
import type { Command } from "@/types/terminal.ts";

// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import {
  FILESYSTEM_CONFIG,
  getUsername,
} from "@/assets/scripts/core/config.ts";
import { parseFlags } from "../core/options.ts";
import { getAllPages } from "../core/utils.ts";

/**
 * Display separator for short format
 */
const DISPLAY_SEPARATOR = "  ";

/**
 * Separator for long format fields
 */
const LONG_FORMAT_SEPARATOR = " ";

/**
 * Ls error messages
 */
const MESSAGES = {
  CANNOT_ACCESS: "cannot access",
  NO_SUCH_FILE: "No such file or directory",
} as const;

/**
 * Ls item representation
 */
interface LsItem {
  /** Item name */
  name: string;
  /** Full path */
  path: string;
  /** Whether item is a directory */
  isDirectory: boolean;
  /** Whether item has a navigable link */
  hasLink: boolean;
}

/**
 * Ls command options
 */
interface LsOptions {
  /** Use long listing format */
  longFormat: boolean;
  /** Show hidden files */
  showAll: boolean;
  /** Human-readable sizes */
  humanReadable: boolean;
}

/**
 * Default ls options
 */
const DEFAULT_OPTIONS: LsOptions = {
  longFormat: false,
  showAll: false,
  humanReadable: false,
};

/**
 * Ls flag handlers
 */
const FLAG_HANDLERS: Record<string, (opts: LsOptions) => void> = {
  l: (opts) => {
    opts.longFormat = true;
  },
  a: (opts) => {
    opts.showAll = true;
  },
  h: (opts) => {
    opts.humanReadable = true;
  },
};

/**
 * Format size in human-readable format
 * @param bytes - Size in bytes
 * @returns Human-readable size string
 */
function formatSize(bytes: number): string {
  const units = ["B", "K", "M", "G", "T"];
  let size = bytes;
  let unitIndex = 0;
  while (
    size >= FILESYSTEM_CONFIG.unitConversion && unitIndex < units.length - 1
  ) {
    size /= FILESYSTEM_CONFIG.unitConversion;
    unitIndex++;
  }
  return `${Math.round(size)}${units[unitIndex]}`;
}

/**
 * Get current date in ls long format style
 * @returns Formatted date string
 */
function getLsDateFormat(): string {
  const now = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[now.getMonth()];
  const day = now.getDate().toString().padStart(2, " ");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${month} ${day} ${hours}:${minutes}`;
}

/**
 * Format a single item for long format output
 * @param item - Ls item to format
 * @param humanReadable - Whether to use human-readable sizes
 * @returns Formatted output string
 */
function formatLongItem(item: LsItem, humanReadable: boolean): string {
  const permissions = item.isDirectory ? "drwxr-xr-x" : "-rw-r--r--";
  const size = item.isDirectory
    ? FILESYSTEM_CONFIG.directorySize
    : FILESYSTEM_CONFIG.fileSize;
  const sizeStr = humanReadable
    ? formatSize(size).padStart(5)
    : size.toString().padStart(6);
  const date = getLsDateFormat();

  let displayName: string;
  if (item.isDirectory) {
    const name = item.name + "/";
    displayName = item.hasLink
      ? `<a href="${item.path}" class="${CSS_CLASSES.LINK}">${name}</a>`
      : `<span class="${CSS_CLASSES.INFO}">${name}</span>`;
  } else {
    displayName =
      `<a href="${item.path}" class="${CSS_CLASSES.LINK}">${item.name}</a>`;
  }

  return `${permissions}${LONG_FORMAT_SEPARATOR}1${LONG_FORMAT_SEPARATOR}${getUsername()}${LONG_FORMAT_SEPARATOR}users${LONG_FORMAT_SEPARATOR}${sizeStr}${LONG_FORMAT_SEPARATOR}${date}${LONG_FORMAT_SEPARATOR}${displayName}`;
}

/**
 * Format a single item for short format output
 * @param item - Ls item to format
 * @returns Formatted output string
 */
function formatShortItem(item: LsItem): string {
  if (item.isDirectory) {
    const displayName = item.name + "/";
    return item.hasLink
      ? `<a href="${item.path}" class="${CSS_CLASSES.LINK}">${displayName}</a>`
      : `<span class="${CSS_CLASSES.INFO}">${displayName}</span>`;
  }
  return `<a href="${item.path}" class="${CSS_CLASSES.LINK}">${item.name}</a>`;
}

export const ls: Command = {
  name: "ls",
  description: "List pages and content",
  execute: async (args: string[] = []) => {
    const { options, args: pathArgs } = parseFlags(
      args,
      { ...DEFAULT_OPTIONS },
      FLAG_HANDLERS,
    );
    const pages = await getAllPages();
    const targetPath = pathArgs[0] || "";

    // normalize the target path
    let normalizedTargetPath = "";
    if (targetPath) {
      if (targetPath === "index" || targetPath === "/index") {
        normalizedTargetPath = "/";
      } else {
        normalizedTargetPath = "/" +
          targetPath.replace(/^\/+/, "").replace(/\/+$/, "");
      }
    }

    // if a specific path is requested, check if it exists
    if (normalizedTargetPath !== "") {
      const targetPage = pages.find((page) => {
        const pagePath = page.path.startsWith("/")
          ? page.path
          : "/" + page.path;
        return pagePath === normalizedTargetPath;
      });

      const isDirectory = pages.some((page) => {
        const pagePath = page.path.startsWith("/")
          ? page.path
          : "/" + page.path;
        return pagePath.startsWith(normalizedTargetPath + "/");
      });

      if (!targetPage && !isDirectory) {
        return `<span class="${CSS_CLASSES.ERROR}">ls: ${MESSAGES.CANNOT_ACCESS} '${targetPath}': ${MESSAGES.NO_SUCH_FILE}</span>`;
      }

      // if it's a file (not a directory), display the file itself
      if (targetPage && !isDirectory) {
        if (options.longFormat) {
          const item: LsItem = {
            name: targetPage.name,
            path: targetPage.path,
            isDirectory: false,
            hasLink: true,
          };
          return `<pre>${formatLongItem(item, options.humanReadable)}</pre>`;
        }
        return `<a href="${targetPage.path}" class="${CSS_CLASSES.LINK}">${targetPage.name}</a>`;
      }
    }

    // build items based on target path
    const itemsMap = new Map<string, LsItem>();

    if (normalizedTargetPath === "") {
      // root directory listing
      pages.forEach((page) => {
        const pathParts = page.path.split("/").filter((p) => p);

        if (pathParts.length === 0 || pathParts.length === 1) {
          const itemName = page.name;
          const existing = itemsMap.get(itemName);
          if (existing && existing.isDirectory) {
            existing.hasLink = true;
          } else if (!existing) {
            itemsMap.set(itemName, {
              name: itemName,
              path: page.path,
              isDirectory: false,
              hasLink: true,
            });
          }
        } else {
          const dirName = pathParts[0];
          const existing = itemsMap.get(dirName);
          if (!existing) {
            itemsMap.set(dirName, {
              name: dirName,
              path: "/" + dirName,
              isDirectory: true,
              hasLink: false,
            });
          } else if (!existing.isDirectory) {
            existing.isDirectory = true;
            existing.hasLink = true;
          }
        }
      });
    } else {
      // subdirectory listing
      const targetDepth = normalizedTargetPath.split("/").filter((p) =>
        p
      ).length;

      pages.forEach((page) => {
        const pagePath = page.path.startsWith("/")
          ? page.path
          : "/" + page.path;

        if (
          pagePath === normalizedTargetPath ||
          pagePath.startsWith(normalizedTargetPath + "/")
        ) {
          const pathParts = pagePath.split("/").filter((p) => p);
          if (pagePath === normalizedTargetPath) {
            return;
          }
          if (pathParts.length === targetDepth + 1) {
            const itemName = pathParts[targetDepth];
            const existing = itemsMap.get(itemName);
            if (existing && existing.isDirectory) {
              existing.hasLink = true;
            } else if (!existing) {
              itemsMap.set(itemName, {
                name: itemName,
                path: pagePath,
                isDirectory: false,
                hasLink: true,
              });
            }
          } else if (pathParts.length > targetDepth + 1) {
            const dirName = pathParts[targetDepth];
            const existing = itemsMap.get(dirName);
            if (!existing) {
              itemsMap.set(dirName, {
                name: dirName,
                path: normalizedTargetPath + "/" + dirName,
                isDirectory: true,
                hasLink: false,
              });
            } else if (!existing.isDirectory) {
              existing.isDirectory = true;
              existing.hasLink = true;
            }
          }
        }
      });
    }

    // sort items: directories first, then files
    const items = Array.from(itemsMap.values()).sort((a, b) => {
      if (a.name === "index") return -1;
      if (b.name === "index") return 1;
      if (a.isDirectory && !b.isDirectory) return 1;
      if (!a.isDirectory && b.isDirectory) return -1;
      return a.name.localeCompare(b.name);
    });

    // format output
    if (options.longFormat) {
      const output = items.map((item) =>
        formatLongItem(item, options.humanReadable)
      );
      return `<pre>${output.join("\n")}</pre>`;
    }

    return items.map(formatShortItem).join(DISPLAY_SEPARATOR);
  },
};
