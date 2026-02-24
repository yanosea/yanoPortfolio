/**
 * Manual Pages Definitions
 */

/**
 * Manual page
 */
export interface ManPage {
  /** Command synopsis */
  synopsis: string;
  /** Command description */
  description: string;
  /** Command options */
  options?: string;
}

/**
 * Manual page definitions for each command
 */
export const MAN_PAGES: Record<string, ManPage> = {
  help: {
    synopsis: "help",
    description:
      "Display a list of available commands with brief descriptions.",
  },
  about: {
    synopsis: "about",
    description:
      "Display the about page. Redirects to /about after a countdown.",
  },
  blog: {
    synopsis: "blog",
    description: "Display the blog page. Redirects to /blog after a countdown.",
  },
  index: {
    synopsis: "index",
    description: "Display the index page. Redirects to / after a countdown.",
  },
  links: {
    synopsis: "links",
    description:
      "Display the links page. Redirects to /links after a countdown.",
  },
  clear: {
    synopsis: "clear",
    description: "Clear the terminal screen.",
  },
  cd: {
    synopsis: "cd [directory]",
    description:
      "Change the working directory. If directory is not supplied, the value of the HOME variable is used. If directory is -, the previous working directory is used (see OLDPWD). Paths outside /home/you are restricted.",
    options: `       directory  The target directory.
       -          Change to the previous working directory ($OLDPWD).`,
  },
  echo: {
    synopsis: "echo [-neE] [string ...]",
    description:
      "Display a line of text. Echo the STRING(s) to standard output.",
    options: `       -n     Do not output the trailing newline.
       -e     Enable interpretation of backslash escapes.
       -E     Disable interpretation of backslash escapes (default).

       If -e is in effect, the following sequences are recognized:
       \\\\     backslash
       \\n     new line
       \\t     horizontal tab
       \\r     carriage return
       \\b     backspace`,
  },
  env: {
    synopsis: "env",
    description: "Print the current environment.",
  },
  whoami: {
    synopsis: "whoami",
    description: "Print the current user name.",
  },
  pwd: {
    synopsis: "pwd",
    description: "Print the full filename of the current working directory.",
  },
  date: {
    synopsis: "date [OPTION]... [+FORMAT]",
    description: "Display the current date and time.",
    options: `       -u, --utc      Print Coordinated Universal Time (UTC).
       -I, --iso-8601 Output date/time in ISO 8601 format.
       +FORMAT        Output date/time according to FORMAT.

       FORMAT sequences:
       %Y     year (4 digits)           %m     month (01-12)
       %d     day of month (01-31)      %H     hour (00-23)
       %I     hour (01-12)              %M     minute (00-59)
       %S     second (00-59)            %p     locale's AM or PM
       %a     abbreviated weekday       %A     full weekday name
       %b     abbreviated month         %B     full month name
       %T     time (HH:MM:SS)           %F     date (YYYY-MM-DD)
       %%     a literal %`,
  },
  welcome: {
    synopsis: "welcome",
    description: "Display the welcome message and ASCII art banner.",
  },
  ls: {
    synopsis: "ls [-alh]",
    description: "List directory contents.",
    options: `       -a     Do not ignore entries starting with .
       -l     Use a long listing format.
       -h     With -l, print sizes in human readable format.`,
  },
  history: {
    synopsis: "history [-c] [n]",
    description: "Display the command history list with line numbers.",
    options: `       -c     Clear the history list.
       n      List only the last n entries.`,
  },
  tree: {
    synopsis: "tree [-adL level]",
    description: "List contents of directories in a tree-like format.",
    options: `       -a     All files are listed.
       -d     List directories only.
       -L level  Descend only level directories deep.`,
  },
  man: {
    synopsis: "man [-afk] [section] name ...",
    description: "Format and display the on-line manual pages.",
    options: `       section    Section number (1-9).
       -k keyword Equivalent to apropos. Search short descriptions.
       -f name    Equivalent to whatis. Display one-line descriptions.
       -a         Display all matching manual pages.`,
  },
  keybindings: {
    synopsis: "keybindings",
    description:
      "Display terminal keyboard shortcuts reference. Standard readline (Emacs mode) keybindings are supported.",
    options: `       NAVIGATION:
       Ctrl+A         Move cursor to beginning of line.
       Ctrl+E         Move cursor to end of line.
       Arrow Left     Move cursor backward one character.
       Arrow Right    Move cursor forward one character.

       EDITING:
       Ctrl+K         Kill text from cursor to end of line.
       Ctrl+U         Kill text from cursor to beginning of line.
       Ctrl+W         Delete the word behind cursor.
       Ctrl+D         Delete the character at cursor.
       Backspace      Delete the character behind cursor.

       HISTORY:
       Arrow Up       Previous command in history.
       Arrow Down     Next command in history.

       COMPLETION:
       Tab            Attempt command completion.

       TERMINAL CONTROL:
       Ctrl+L         Clear the screen.`,
  },
  grep: {
    synopsis: "grep [-invcEF] PATTERN [FILE]...",
    description:
      "Print lines that match patterns. grep searches for PATTERN in each FILE. If no FILE is given, all pages are searched.",
    options: `       -i     Ignore case distinctions in patterns and data.
       -n     Prefix each line of output with the line number.
       -v     Invert the sense of matching, to select non-matching lines.
       -c     Suppress normal output; print a count of matching lines.
       -E     Interpret PATTERN as an extended regular expression (ERE).
       -F     Interpret PATTERN as a fixed string, not a regex.`,
  },
  egrep: {
    synopsis: "egrep [OPTION]... PATTERN [FILE]...",
    description:
      "Interpret PATTERN as an extended regular expression (ERE). This is equivalent to grep -E.",
    options: `       -i     Ignore case distinctions.
       -n     Prefix each line with the line number.
       -v     Select non-matching lines.
       -c     Print a count of matching lines.`,
  },
  fgrep: {
    synopsis: "fgrep [OPTION]... STRING [FILE]...",
    description:
      "Interpret PATTERN as a list of fixed strings. This is equivalent to grep -F.",
    options: `       -i     Ignore case distinctions.
       -n     Prefix each line with the line number.
       -v     Select non-matching lines.
       -c     Print a count of matching lines.`,
  },
  spotify: {
    synopsis: "spotify",
    description:
      "Display the currently playing or last played Spotify track. Shows album artwork, track metadata, and playback status.",
  },
};
