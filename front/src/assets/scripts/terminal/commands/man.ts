/**
 * Man Command
 */

// types
import type { Command } from "@/types/terminal.ts";

// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { MAN_PAGES } from "../core/man-pages.ts";
import { MAN_SECTIONS } from "../core/config.ts";

/**
 * Man error messages
 */
const MESSAGES = {
  /** No arguments error message */
  NO_ARGS: "What manual page do you want?",
  /** Example prefix text */
  EXAMPLE_PREFIX: "For example: ",
  /** No entry found error message */
  NO_ENTRY: "No manual entry for",
  /** Default command description */
  DEFAULT_COMMAND_DESC: "terminal command",
  /** Invalid section error message */
  INVALID_SECTION: "Invalid section number",
} as const;

/**
 * Default manual section number
 */
const DEFAULT_SECTION = 1;

/**
 * Format error message for missing arguments
 * @returns Error message HTML
 */
function formatNoArgsMessage(): string {
  return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_ARGS}</span>\n<div>${MESSAGES.EXAMPLE_PREFIX}<span class="${CSS_CLASSES.COMMAND}">man ls</span></div>`;
}

/**
 * Format error message for non-existent command
 * @param commandName - Command name not found
 * @returns Error message HTML
 */
function formatNoEntryMessage(commandName: string): string {
  return `<span class="${CSS_CLASSES.ERROR}">${MESSAGES.NO_ENTRY} ${commandName}</span>`;
}

/**
 * Man command options
 */
interface ManOptions {
  /** Manual section number */
  section: number;
  /** Command name to look up */
  commandName: string | null;
  /** Search descriptions (apropos mode) */
  apropos: boolean;
  /** Show one-line description (whatis mode) */
  whatis: boolean;
  /** Show all matching pages */
  all: boolean;
}

/**
 * Parse arguments to extract options, section number, and command name
 * @param args - Command arguments
 * @returns Parsed man options
 */
function parseManArgs(args: string[]): ManOptions {
  const options: ManOptions = {
    section: DEFAULT_SECTION,
    commandName: null,
    apropos: false,
    whatis: false,
    all: false,
  };

  if (args.length === 0) {
    return options;
  }

  let i = 0;
  // parse options
  while (i < args.length && args[i].startsWith("-")) {
    const arg = args[i];
    if (arg === "-k") {
      options.apropos = true;
      i++;
      break; // next args are search keywords
    } else if (arg === "-f") {
      options.whatis = true;
      i++;
      break; // next args are command names
    } else if (arg === "-a") {
      options.all = true;
      i++;
    } else {
      i++;
    }
  }

  // if apropos or whatis, join remaining args as search term
  if (options.apropos || options.whatis) {
    if (i < args.length) {
      options.commandName = args.slice(i).join(" ");
    }
    return options;
  }

  // check if next argument is a section number
  if (i < args.length) {
    const sectionNum = parseInt(args[i], 10);
    if (!isNaN(sectionNum) && i + 1 < args.length) {
      // format: man [options] <section> <command>
      options.section = sectionNum;
      options.commandName = args[i + 1];
    } else {
      // format: man [options] <command>
      options.commandName = args[i];
    }
  }

  return options;
}

/**
 * Search for commands matching keyword (apropos)
 * @param keyword - Search keyword
 * @param allCommands - All available commands
 * @returns Search results HTML
 */
function searchByKeyword(keyword: string, allCommands?: Command[]): string {
  const normalizedKeyword = keyword.toLowerCase();
  const matches: Array<{ name: string; description: string }> = [];

  // search in command descriptions
  Object.entries(MAN_PAGES).forEach(([cmdName, manPage]) => {
    const cmdDesc = allCommands?.find((cmd) => cmd.name === cmdName)
      ?.description || "";
    const fullText =
      `${cmdName} ${manPage.synopsis} ${manPage.description} ${cmdDesc}`
        .toLowerCase();

    if (fullText.includes(normalizedKeyword)) {
      matches.push({
        name: cmdName,
        description: cmdDesc || manPage.description,
      });
    }
  });

  if (matches.length === 0) {
    return `<span class="${CSS_CLASSES.ERROR}">Nothing appropriate for "${keyword}"</span>`;
  }

  const output = matches
    .map((match) => `${match.name} (1) - ${match.description}`)
    .join("\n");

  return `<pre>${output}</pre>`;
}

/**
 * Display short description (whatis)
 * @param commandName - Command name to look up
 * @param allCommands - All available commands
 * @returns Whatis output HTML
 */
function showWhatis(commandName: string, allCommands?: Command[]): string {
  const manPage = MAN_PAGES[commandName];
  if (!manPage) {
    return formatNoEntryMessage(commandName);
  }

  const cmdDesc = allCommands?.find((cmd) => cmd.name === commandName)
    ?.description || manPage.description;

  return `<pre>${commandName} (1) - ${cmdDesc}</pre>`;
}

/**
 * Build manual page content
 * @param commandName - Command name
 * @param section - Manual section number
 * @param allCommands - All available commands
 * @returns Manual page HTML
 */
function buildManPage(
  commandName: string,
  section: number,
  allCommands?: Command[],
): string {
  const manPage = MAN_PAGES[commandName];
  if (!manPage) {
    return formatNoEntryMessage(commandName);
  }

  const commandDesc = allCommands?.find((cmd) => cmd.name === commandName)
    ?.description || MESSAGES.DEFAULT_COMMAND_DESC;

  let output = `<div class="man-page">`;
  output += `<strong>${commandName.toUpperCase()}(${section})</strong>`;

  // NAME section
  output += `<div class="man-section"><strong>${MAN_SECTIONS.NAME}</strong>`;
  output += `<div class="man-body">${commandName} - ${commandDesc}</div></div>`;

  // SYNOPSIS section
  output +=
    `<div class="man-section"><strong>${MAN_SECTIONS.SYNOPSIS}</strong>`;
  output +=
    `<div class="man-body"><strong>${manPage.synopsis}</strong></div></div>`;

  // DESCRIPTION section
  output +=
    `<div class="man-section"><strong>${MAN_SECTIONS.DESCRIPTION}</strong>`;
  output += `<div class="man-body">${manPage.description}</div></div>`;

  // OPTIONS section (if exists)
  if (manPage.options) {
    output +=
      `<div class="man-section"><strong>${MAN_SECTIONS.OPTIONS}</strong>`;
    output += `<pre class="man-options">${manPage.options}</pre></div>`;
  }

  output += `</div>`;
  return output;
}

export const man: Command = {
  name: "man",
  description: "Display manual pages",
  execute: (args: string[], allCommands?: Command[]) => {
    const options = parseManArgs(args);

    if (!options.commandName) {
      return formatNoArgsMessage();
    }

    // handle apropos (-k)
    if (options.apropos) {
      return searchByKeyword(options.commandName, allCommands);
    }

    // handle whatis (-f)
    if (options.whatis) {
      return showWhatis(options.commandName, allCommands);
    }

    // normal man page display
    return buildManPage(options.commandName, options.section, allCommands);
  },
};
