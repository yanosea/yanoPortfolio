/**
 * Help Command
 */

// types
import type { Command } from "@/types/terminal.ts";

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
        `<div class="terminal-help-item">` +
        `<span class="terminal-command">${cmd.name}</span>` +
        `<span class="terminal-help-desc">${cmd.description}</span>` +
        `</div>`
      )
      .join("");
    return `<div class="terminal-success">Available commands:</div><div class="terminal-help-list">${commandList}</div>\n<div>Type a command and press Enter to execute.</div>`;
  },
};
