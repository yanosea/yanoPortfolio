/**
 * Terminal Option Parser
 */

/**
 * Result of parsing command options
 */
interface OptionParseResult<T> {
  /** Parsed options object */
  options: T;
  /** Non-option arguments (file names, patterns, etc.) */
  args: string[];
  /** Parse error message if any */
  error?: string;
}

/**
 * Remove surrounding quotes from an argument
 * @param arg - Argument to unquote
 * @returns Unquoted argument
 */
export function unquoteArg(arg: string): string {
  // check if argument is wrapped in matching quotes
  if (
    (arg.startsWith('"') && arg.endsWith('"')) ||
    (arg.startsWith("'") && arg.endsWith("'"))
  ) {
    // remove surrounding quotes
    return arg.slice(1, -1);
  }
  // return argument unchanged if not quoted
  return arg;
}

/**
 * Check if an argument is an option flag
 * @param arg - Argument to check
 * @returns True if argument is an option flag
 */
function isOptionFlag(arg: string): boolean {
  return arg.startsWith("-") && arg.length > 1;
}

/**
 * Split combined short flags (e.g., "-la" → ["l", "a"])
 * @param arg - Argument to split
 * @returns Array of flag characters
 */
function splitShortFlags(arg: string): string[] {
  // long flags or non-flags don't need splitting
  if (!arg.startsWith("-") || arg.startsWith("--")) {
    return [];
  }
  // split short flag characters (e.g., "-la" -> ["l", "a"])
  return arg.slice(1).split("");
}

/**
 * Generic option parser for Unix-like flags
 * @param args - Command arguments
 * @param defaults - Default option values
 * @param flagHandlers - Map of flag characters to handler functions
 * @param valueFlags - Flags that expect a value
 * @returns Parsed options and remaining arguments
 */
export function parseFlags<T extends Record<string, unknown>>(
  args: string[],
  defaults: T,
  flagHandlers: Record<string, (opts: T, value?: string) => void>,
  valueFlags: string[] = [],
): OptionParseResult<T> {
  // initialize options with defaults
  const options = { ...defaults };
  const remainingArgs: string[] = [];
  // iterate through all arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    // check if current argument is an option flag
    if (isOptionFlag(arg)) {
      // split combined short flags (e.g., -la -> [l, a])
      const flags = splitShortFlags(arg);
      // process each flag in the combined flags
      for (let j = 0; j < flags.length; j++) {
        const flag = flags[j];
        const handler = flagHandlers[flag];
        // handle known flags
        if (handler) {
          // check if this flag expects a value argument
          if (valueFlags.includes(flag)) {
            // value is either next character in combined flags or next argument
            let value: string | undefined;
            if (j + 1 < flags.length) {
              // rest of combined flags is the value (e.g., -L2)
              value = flags.slice(j + 1).join("");
              j = flags.length;
            } else if (i + 1 < args.length) {
              // next argument is the value
              value = args[++i];
            }
            handler(options, value);
          } else {
            // boolean flag: call handler without value
            handler(options);
          }
        }
        // unknown flags are silently ignored (Unix-like behavior)
      }
    } else {
      // non-option argument: unquote and collect for command processing
      remainingArgs.push(unquoteArg(arg));
    }
  }
  return { options, args: remainingArgs };
}

/**
 * Create a regex pattern from a search pattern string
 * Handles both literal and regex patterns
 * @param pattern - Pattern string
 * @param options - Search options
 * @returns Compiled RegExp
 */
export function createSearchPattern(
  pattern: string,
  options: { ignoreCase?: boolean; fixedStrings?: boolean },
): RegExp {
  // determine regex flags based on options
  const flags = options.ignoreCase ? "gi" : "g";
  // for fixed strings mode, escape all regex special characters
  if (options.fixedStrings) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, flags);
  }
  // try to compile as regex pattern
  try {
    return new RegExp(pattern, flags);
  } catch {
    // if regex is invalid, fall back to literal matching
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, flags);
  }
}
