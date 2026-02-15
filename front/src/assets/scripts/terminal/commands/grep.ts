/**
 * Grep Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
// core
import { highlightMatch } from "../core/formatter.ts";
import {
  createSearchPattern,
  parseFlags,
  unquoteArg,
} from "../core/options.ts";
import { getAllPages } from "../core/utils.ts";
import { startStdinMode } from "../core/stdin.ts";

/**
 * Grep error messages
 */
const MESSAGES = {
  USAGE: "usage: grep [options] pattern [file...]",
  NO_PATTERN: "grep: no pattern specified",
  NO_MATCHES: "grep: no matches found",
  NO_FILES: "grep: no matching files found",
} as const;

/**
 * Grep command options
 */
interface GrepOptions {
  /** Case-insensitive matching */
  ignoreCase: boolean;
  /** Show line numbers */
  lineNumbers: boolean;
  /** Invert match (show non-matching lines) */
  invertMatch: boolean;
  /** Show only count of matches */
  count: boolean;
  /** Use extended regular expressions */
  extendedRegexp: boolean;
  /** Treat pattern as fixed string */
  fixedStrings: boolean;
}

/**
 * Grep match result
 */
interface MatchResult {
  /** Path of the matched page */
  pagePath: string;
  /** Line number of the match */
  lineNumber: number;
  /** Full line content */
  line: string;
  /** Index where match starts */
  matchIndex: number;
  /** Length of the match */
  matchLength: number;
}

/**
 * Default grep options
 */
const DEFAULT_OPTIONS: GrepOptions = {
  ignoreCase: false,
  lineNumbers: false,
  invertMatch: false,
  count: false,
  extendedRegexp: false,
  fixedStrings: false,
};

/**
 * Grep flag handlers
 */
const FLAG_HANDLERS: Record<string, (opts: GrepOptions) => void> = {
  i: (opts) => {
    opts.ignoreCase = true;
  },
  n: (opts) => {
    opts.lineNumbers = true;
  },
  v: (opts) => {
    opts.invertMatch = true;
  },
  c: (opts) => {
    opts.count = true;
  },
  E: (opts) => {
    opts.extendedRegexp = true;
  },
  F: (opts) => {
    opts.fixedStrings = true;
  },
};

/**
 * Extract text content from HTML
 * @param html - HTML string to extract text from
 * @returns Plain text content
 */
function extractTextContent(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style").forEach((el) => el.remove());
  return (doc.querySelector("main") || doc.querySelector("body"))
    ?.textContent || "";
}

/**
 * Search for pattern in text
 * @param text - Text to search
 * @param pattern - Pattern to search for
 * @param options - Grep options
 * @returns Array of match results
 */
function searchInText(
  text: string,
  pattern: string,
  options: GrepOptions,
): MatchResult[] {
  const results: MatchResult[] = [];
  const lines = text.split("\n");
  const regex = createSearchPattern(pattern, {
    ignoreCase: options.ignoreCase,
    fixedStrings: options.fixedStrings,
  });
  // reset lastIndex for global regex
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return;
    }
    const matches = options.invertMatch
      ? !regex.test(trimmedLine)
      : regex.test(trimmedLine);

    if (matches) {
      let matchIndex = -1;
      let matchLength = 0;

      if (!options.invertMatch) {
        const match = regex.exec(trimmedLine);
        if (match) {
          matchIndex = match.index;
          matchLength = match[0].length;
        }
        regex.lastIndex = 0;
      }
      results.push({
        pagePath: "",
        lineNumber: index + 1,
        line: trimmedLine,
        matchIndex,
        matchLength,
      });
    }
  });
  return results;
}

/**
 * Format grep output
 * @param results - Map of page paths to match results
 * @param options - Grep options
 * @returns Formatted output string
 */
function formatOutput(
  results: Map<string, MatchResult[]>,
  options: GrepOptions,
): string {
  if (results.size === 0) return "";

  const output: string[] = [];

  results.forEach((matches, pagePath) => {
    if (options.count) {
      output.push(
        `<span class="${CSS_CLASSES.INFO}">${pagePath}</span>:${matches.length}`,
      );
    } else {
      matches.forEach((match) => {
        const parts: string[] = [];
        if (results.size > 1) {
          parts.push(`<span class="${CSS_CLASSES.INFO}">${pagePath}</span>`);
        }
        if (options.lineNumbers) {
          parts.push(
            `<span class="text-muted">${match.lineNumber}</span>`,
          );
        }
        const highlighted = highlightMatch(
          match.line,
          match.matchIndex,
          match.matchLength,
          CSS_CLASSES.ERROR,
        );
        parts.push(highlighted);
        output.push(parts.join(":"));
      });
    }
  });

  return output.join("\n");
}

/**
 * Highlight matched text in HTML nodes recursively
 * @param node - Node to search
 * @param pattern - Pattern to highlight
 * @param options - Grep options
 */
function highlightTextNodes(
  node: Node,
  pattern: string,
  options: GrepOptions,
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    const regex = createSearchPattern(pattern, {
      ignoreCase: options.ignoreCase,
      fixedStrings: options.fixedStrings,
    });
    regex.lastIndex = 0;
    const match = regex.exec(text);

    if (match) {
      const before = text.substring(0, match.index);
      const matchText = match[0];
      const after = text.substring(match.index + matchText.length);
      const fragment = document.createDocumentFragment();

      if (before) fragment.appendChild(document.createTextNode(before));
      const highlightSpan = document.createElement("span");
      highlightSpan.className = CSS_CLASSES.ERROR;
      highlightSpan.textContent = matchText;
      fragment.appendChild(highlightSpan);
      if (after) fragment.appendChild(document.createTextNode(after));

      node.parentNode?.replaceChild(fragment, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if ((node as Element).classList?.contains(CSS_CLASSES.ERROR)) {
      return;
    }
    const children = Array.from(node.childNodes);
    children.forEach((child) => highlightTextNodes(child, pattern, options));
  }
}

/**
 * Process HTML stdin and return matching lines
 * @param stdin - HTML stdin content
 * @param pattern - Pattern to search for
 * @param options - Grep options
 * @returns Filtered HTML output
 */
function processHtmlStdin(
  stdin: string,
  pattern: string,
  options: GrepOptions,
): string {
  const htmlLines: string[] = [];
  const textLines: string[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = stdin;

  const allElements = tempDiv.querySelectorAll("div, p, li");
  if (allElements.length > 0) {
    allElements.forEach((el) => {
      const hasBlockChildren = el.querySelector("div, p, li") !== null;
      if (!hasBlockChildren) {
        const htmlLine = el.outerHTML;
        const textLine = el.textContent?.trim() || "";
        if (textLine) {
          htmlLines.push(htmlLine);
          textLines.push(textLine);
        }
      }
    });
  } else {
    const preElement = tempDiv.querySelector("pre");
    if (preElement) {
      const innerHTML = preElement.innerHTML;
      const lines = innerHTML.split("\n");
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const lineDiv = document.createElement("div");
          lineDiv.innerHTML = trimmedLine;
          const textContent = lineDiv.textContent?.trim() || "";
          if (textContent) {
            htmlLines.push(trimmedLine);
            textLines.push(textContent);
          }
        }
      });
    } else {
      htmlLines.push(stdin);
      textLines.push(tempDiv.textContent?.trim() || "");
    }
  }

  const matchedHtmlLines: string[] = [];
  const regex = createSearchPattern(pattern, {
    ignoreCase: options.ignoreCase,
    fixedStrings: options.fixedStrings,
  });

  textLines.forEach((textLine, index) => {
    const matches = options.invertMatch
      ? !regex.test(textLine)
      : regex.test(textLine);

    if (matches) {
      let highlightedHtml = htmlLines[index];
      if (!options.invertMatch) {
        const tempEl = document.createElement("div");
        tempEl.innerHTML = highlightedHtml;
        highlightTextNodes(tempEl, pattern, options);
        highlightedHtml = tempEl.innerHTML;
      }
      matchedHtmlLines.push(highlightedHtml);
      regex.lastIndex = 0;
    }
  });

  if (matchedHtmlLines.length === 0) {
    return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_MATCHES}</span>`;
  }

  if (options.count) return `${matchedHtmlLines.length}`;

  const tempDiv2 = document.createElement("div");
  tempDiv2.innerHTML = stdin;
  const wasInPre = tempDiv2.querySelector("pre") !== null;

  return wasInPre
    ? `<pre>${matchedHtmlLines.join("\n")}</pre>`
    : matchedHtmlLines.join("");
}

/**
 * Process plain text stdin and return matching lines
 * @param stdin - Plain text stdin content
 * @param pattern - Pattern to search for
 * @param options - Grep options
 * @returns Filtered text output
 */
function processPlainTextStdin(
  stdin: string,
  pattern: string,
  options: GrepOptions,
): string {
  const matches = searchInText(stdin, pattern, options);

  if (matches.length === 0) {
    return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_MATCHES}</span>`;
  }

  if (options.count) return `${matches.length}`;

  const output: string[] = [];
  matches.forEach((match) => {
    const parts: string[] = [];
    if (options.lineNumbers) {
      parts.push(
        `<span class="text-muted">${match.lineNumber}</span>`,
      );
    }
    const highlighted = highlightMatch(
      match.line,
      match.matchIndex,
      match.matchLength,
      CSS_CLASSES.ERROR,
    );
    parts.push(highlighted);
    output.push(parts.join(":"));
  });

  return `<pre>${output.join("\n")}</pre>`;
}

/**
 * Search in pages and return results
 * @param pattern - Pattern to search for
 * @param files - Files to search in
 * @param options - Grep options
 * @returns Search results as HTML
 */
async function searchInPages(
  pattern: string,
  files: string[],
  options: GrepOptions,
): Promise<string> {
  const allPages = await getAllPages();

  let targetPages = allPages;
  if (files.length > 0) {
    targetPages = allPages.filter((page) => {
      return files.some((file) => {
        const normalizedFile = file.startsWith("/") ? file : "/" + file;
        return page.path === normalizedFile ||
          page.name.toLowerCase().includes(file.toLowerCase());
      });
    });

    if (targetPages.length === 0) {
      return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_FILES}</span>`;
    }
  }

  const resultsMap = new Map<string, MatchResult[]>();

  for (const page of targetPages) {
    try {
      const fetchPath = page.path === "/" ? "/" : page.path + ".html";
      const response = await fetch(fetchPath);
      if (!response.ok) continue;

      const html = await response.text();
      const textContent = extractTextContent(html);
      const matches = searchInText(textContent, pattern, options);

      if (matches.length > 0) {
        matches.forEach((match) => {
          match.pagePath = page.path;
        });
        resultsMap.set(page.path, matches);
      }
    } catch {
      // skip pages that fail to load
    }
  }

  const output = formatOutput(resultsMap, options);

  if (!output) {
    return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_MATCHES}</span>`;
  }

  return `<pre>${output}</pre>`;
}

export const grep: Command = {
  name: "grep",
  description: "Search for patterns in page contents",
  execute: async (
    args: string[] = [],
    _allCommands?: Command[],
    stdin?: string,
  ) => {
    const { options, args: remainingArgs } = parseFlags(
      args,
      { ...DEFAULT_OPTIONS },
      FLAG_HANDLERS,
    );

    const pattern = remainingArgs[0] ? unquoteArg(remainingArgs[0]) : "";
    const files = remainingArgs.slice(1).map(unquoteArg);

    if (!pattern) {
      return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_PATTERN}</span>\n${MESSAGES.USAGE}`;
    }

    if (stdin !== undefined) {
      return stdin.includes("<")
        ? processHtmlStdin(stdin, pattern, options)
        : processPlainTextStdin(stdin, pattern, options);
    }

    if (files.length === 0) {
      const callback = (input: string) => {
        const result = input.includes("<")
          ? processHtmlStdin(input, pattern, options)
          : processPlainTextStdin(input, pattern, options);

        const historyEl = document.getElementById("terminal-history");
        if (historyEl && result) {
          const outputEl = document.createElement("div");
          outputEl.className = "terminal-history-output";
          outputEl.innerHTML = result;
          historyEl.appendChild(outputEl);
        }
        return Promise.resolve();
      };

      startStdinMode(`grep ${args.join(" ")}`, callback);
      return "";
    }

    return await searchInPages(pattern, files, options);
  },
};
