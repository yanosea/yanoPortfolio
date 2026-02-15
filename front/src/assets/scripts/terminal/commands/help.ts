/**
 * Help Command
 */

// types
import type { Command } from "@/types/terminal.ts";
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";

export const help: Command = {
  name: "help",
  description: "Show available commands",
  execute: (_args: string[], allCommands?: Command[]) => {
    if (!allCommands) {
      return "No commands available.";
    }
    // filter out egrep and fgrep (aliases of grep)
    const excludedCommands = ["egrep", "fgrep"];
    const filteredCommands = allCommands.filter(
      (cmd) => !excludedCommands.includes(cmd.name),
    );
    const commandList = filteredCommands
      .map((cmd) =>
        `<div class="${CSS_CLASSES.HELP_ITEM}">` +
        `<span class="${CSS_CLASSES.COMMAND}">${cmd.name}</span>` +
        `<span class="${CSS_CLASSES.HELP_DESC}">${cmd.description}</span>` +
        `</div>`
      )
      .join("");
    return `<div class="${CSS_CLASSES.SUCCESS}">Available commands:</div><div class="${CSS_CLASSES.HELP_LIST}">${commandList}</div>\n<div>Type a command and press Enter to execute.</div>`;
  },
};
