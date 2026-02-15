/**
 * Terminal Command Executor
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { addToHistory } from "./history.ts";
import { escapeHtml, getPromptHtml, scrollToBottom } from "./utils.ts";

/**
 * Parse command line into pipe segments
 * @param commandLine - Raw command line string
 * @returns Array of pipe segments
 */
function parsePipes(commandLine: string): string[] {
  // initialize parsing state for pipe-separated segments
  const segments: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  // iterate through each character in the command line
  for (let i = 0; i < commandLine.length; i++) {
    const char = commandLine[i];
    // handle quote characters (toggle quote state)
    if ((char === '"' || char === "'") && commandLine[i - 1] !== "\\") {
      if (!inQuote) {
        // entering a quoted section
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        // exiting a quoted section
        inQuote = false;
        quoteChar = "";
      }
      current += char;
    } else if (char === "|" && !inQuote) {
      // pipe character outside quotes: save current segment and start new one
      if (current.trim()) {
        segments.push(current.trim());
      }
      current = "";
    } else {
      // regular character: add to current segment
      current += char;
    }
  }
  // add final segment if not empty
  if (current.trim()) {
    segments.push(current.trim());
  }
  return segments;
}

/**
 * Execute a chain of piped commands
 * @param segments - Pipe segments to execute
 * @param commands - Available commands
 */
async function executePipeChain(
  segments: string[],
  commands: Command[],
): Promise<void> {
  // get terminal history element
  const historyEl = document.getElementById("terminal-history");
  // exit early if history element not found
  if (!historyEl) {
    return;
  }
  // create history item container
  const historyItem = document.createElement("div");
  historyItem.className = "terminal-history-item";
  // create command display element with prompt
  const commandEl = document.createElement("div");
  commandEl.className = "terminal-history-command flex items-center gap-2";
  // build prompt span with styled components
  const promptSpan = document.createElement("span");
  promptSpan.className = "terminal-prompt";
  promptSpan.innerHTML = getPromptHtml();
  // create span to display the full piped command
  const commandSpan = document.createElement("span");
  commandSpan.textContent = segments.join(" | ");
  // assemble and append command display to history
  commandEl.appendChild(promptSpan);
  commandEl.appendChild(commandSpan);
  historyItem.appendChild(commandEl);
  historyEl.appendChild(historyItem);
  // execute pipe chain with input/output passing
  let input: string | undefined = undefined;
  // iterate through each command in the pipe chain
  for (let i = 0; i < segments.length; i++) {
    // parse command name and arguments from segment
    const segment = segments[i];
    const parts = segment.trim().split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);
    // find command handler
    const command = commands.find((cmd) => cmd.name === cmdName);
    // if command not found, show error and exit
    if (!command) {
      const outputEl = document.createElement("div");
      outputEl.className = "terminal-history-output";
      outputEl.innerHTML = `<span class="terminal-error">command not found: ${
        escapeHtml(cmdName)
      }</span>`;
      historyItem.appendChild(outputEl);
      return;
    }
    try {
      // execute command with previous output as input
      const result = command.execute(args, commands, input);
      const output = result instanceof Promise ? await result : result;
      // check if this is the last command in chain
      if (i === segments.length - 1) {
        // last command in chain: display output to user
        if (output !== undefined && output !== null) {
          const outputEl = document.createElement("div");
          outputEl.className = "terminal-history-output";
          outputEl.innerHTML = output;
          historyItem.appendChild(outputEl);
        }
      } else {
        // intermediate command: pass output as input to next command
        input = output;
      }
    } catch (error) {
      // handle command execution error
      const outputEl = document.createElement("div");
      outputEl.className = "terminal-history-output";
      outputEl.innerHTML = `<span class="terminal-error">error: ${
        escapeHtml(error instanceof Error ? error.message : String(error))
      }</span>`;
      historyItem.appendChild(outputEl);
      return;
    }
  }
}

/**
 * Execute a command from the command line
 * @param commandLine - Raw command line string
 * @param commands - Available commands
 */
export async function executeCommand(
  commandLine: string,
  commands: Command[],
): Promise<void> {
  // parse command line for pipe segments
  const pipeSegments = parsePipes(commandLine);
  // check if command contains pipes
  if (pipeSegments.length > 1) {
    // multiple segments: execute as pipe chain
    await executePipeChain(pipeSegments, commands);
  } else {
    // single command: parse and execute normally
    const parts = commandLine.trim().split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);
    // find the command handler
    const command = commands.find((cmd) => cmd.name === cmdName);
    // special handling for clear command - execute without adding to history
    if (cmdName === "clear") {
      if (command) {
        command.execute(args, commands);
      }
    } else {
      // normal command: add to history and execute
      await addToHistory(commandLine, command, args, commands);
    }
  }
  // ensure terminal scrolls to show latest output
  scrollToBottom();
}
