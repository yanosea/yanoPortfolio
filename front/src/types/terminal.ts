/**
 * Terminal type definitions
 */

/**
 * Terminal command definition
 */
export interface Command {
  /** Command name */
  name: string;
  /** Command description for help text */
  description: string;
  /** Command execution function */
  execute: (
    args: string[],
    allCommands?: Command[],
    stdin?: string,
  ) => string | Promise<string>;
}
