/**
 * Echo Command
 */

// types
import type { Command } from "@/types/terminal.ts";
// utils
import { escapeHtml } from "../core/utils.ts";

/**
 * Echo command options
 */
interface EchoOptions {
  /** Suppress trailing newline */
  noNewline: boolean;
  /** Interpret escape sequences */
  interpretEscapes: boolean;
}

/**
 * Parse command line options and extract message
 * @param args - Command line arguments
 * @returns Parsed options and message
 */
function parseEchoArgs(
  args: string[],
): { options: EchoOptions; message: string[] } {
  const options: EchoOptions = {
    noNewline: false,
    interpretEscapes: false,
  };
  const message: string[] = [];
  for (const arg of args) {
    if (arg.startsWith("-") && !message.length) {
      const flags = arg.slice(1).split("");
      flags.forEach((flag) => {
        switch (flag) {
          case "n":
            options.noNewline = true;
            break;
          case "e":
            options.interpretEscapes = true;
            break;
          case "E":
            options.interpretEscapes = false;
            break;
        }
      });
    } else {
      message.push(arg);
    }
  }
  return { options, message };
}

/**
 * Interpret escape sequences in string
 * @param text - String to interpret
 * @returns String with escape sequences interpreted
 */
function interpretEscapes(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && i + 1 < text.length) {
      const next = text[i + 1];
      switch (next) {
        case "\\":
          result += "\\";
          break;
        case "n":
          result += "\n";
          break;
        case "t":
          result += "\t";
          break;
        case "r":
          result += "\r";
          break;
        case "b":
          result += "\b";
          break;
        case "f":
          result += "\f";
          break;
        case "v":
          result += "\v";
          break;
        case "0":
          result += "\0";
          break;
        case "a":
          result += "\x07";
          break;
        default:
          result += text[i] + next;
          break;
      }
      i++;
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Echo Command
 */
export const echo: Command = {
  name: "echo",
  description: "Print message",
  execute: (args: string[]) => {
    if (args.length === 0) {
      return "\n";
    }
    const { options, message } = parseEchoArgs(args);
    let text = message.join(" ");
    if (options.interpretEscapes) {
      text = interpretEscapes(text);
    }
    if (options.noNewline) {
      return escapeHtml(text);
    } else {
      return text ? escapeHtml(text) : "\n";
    }
  },
};
