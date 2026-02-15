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
    description: "Display a list of all available commands with descriptions.",
  },
  about: {
    synopsis: "about",
    description:
      "Navigate to the about page. Redirects after a 2-second countdown.",
  },
  blog: {
    synopsis: "blog",
    description:
      "Navigate to the blog page. Redirects after a 2-second countdown.",
  },
  links: {
    synopsis: "links",
    description:
      "Navigate to the links page. Redirects after a 2-second countdown.",
  },
  clear: {
    synopsis: "clear",
    description: "Clear the terminal history and output.",
  },
  cd: {
    synopsis: "cd [DIRECTORY]",
    description:
      "Change the current directory. Navigate to different pages on the site. If no directory is specified, navigate to the home page.",
    options: `    DIRECTORY    Directory to change to
                 Available directories:
                 ~           Navigate to home page
                 about       Navigate to about page
                 blog        Navigate to blog page
                 links       Navigate to links page`,
  },
  echo: {
    synopsis: "echo [OPTION]... [STRING]...",
    description: "Print the given string(s) to the terminal output.",
    options: `    -n     Do not output the trailing newline
    -e     Enable interpretation of backslash escapes
    -E     Disable interpretation of backslash escapes (default)

    Escape sequences (with -e):
    \\n     Newline
    \\t     Horizontal tab
    \\r     Carriage return
    \\b     Backspace
    \\\\     Backslash`,
  },
  whoami: {
    synopsis: "whoami",
    description: "Display the current user name.",
  },
  pwd: {
    synopsis: "pwd",
    description:
      "Print the current working directory in the format: /home/you/page",
  },
  date: {
    synopsis: "date [OPTION]... [+FORMAT]",
    description:
      "Display the current date and time in the format: Day Mon DD HH:MM:SS TZ YYYY",
    options:
      `    -u, --utc          Display date in UTC (Coordinated Universal Time)
    -I, --iso-8601     Output date in ISO 8601 format (YYYY-MM-DD)
    +FORMAT            Output date in custom format

    FORMAT sequences:
    %Y     Year (4 digits)
    %m     Month (01-12)
    %d     Day (01-31)
    %H     Hour (00-23)
    %M     Minute (00-59)
    %S     Second (00-59)
    %a     Weekday (short: Sun, Mon, etc.)
    %A     Weekday (full: Sunday, Monday, etc.)
    %b     Month name (short: Jan, Feb, etc.)
    %B     Month name (full: January, February, etc.)
    %T     Time (HH:MM:SS)
    %F     Date (YYYY-MM-DD)
    %%     Literal %`,
  },
  welcome: {
    synopsis: "welcome",
    description: "Display the welcome message with ASCII art.",
  },
  ls: {
    synopsis: "ls [OPTION]...",
    description:
      "List pages and content based on the current location. Shows main pages (about, blog, links).",
    options: `    -l     Use long listing format (permissions, size, date)
    -a     Show all entries (including hidden files)
    -h     Human-readable sizes (K, M, G) when used with -l`,
  },
  history: {
    synopsis: "history [OPTION] [N]",
    description:
      "Display the command history with line numbers. Shows all previously executed commands in chronological order.",
    options: `    -c     Clear the history list
    N      Display only the last N history entries`,
  },
  tree: {
    synopsis: "tree [OPTION]...",
    description:
      "Display the site structure in a tree format with ASCII art visualization.",
    options: `    -L level   Descend only level directories deep
    -d         List directories only
    -a         Show all files (including hidden files)`,
  },
  man: {
    synopsis: "man [OPTION]... [SECTION] COMMAND",
    description:
      "Display manual pages for commands. Shows detailed information about command usage, synopsis, description, and options.",
    options: `    SECTION    Section number to search (1-9)
    -k keyword Search for keyword in all manual pages (apropos)
    -f name    Display short description for command (whatis)
    -a         Display all matching manual pages`,
  },
  keybindings: {
    synopsis: "keybindings",
    description:
      "Terminal keyboard shortcuts and keybindings reference. Supports standard readline (Emacs mode) keybindings for efficient command-line editing.",
    options: `    NAVIGATION:
    Ctrl+A         Move cursor to beginning of line
    Ctrl+E         Move cursor to end of line
    Ctrl+B         Move cursor backward one character (browser default)
    Ctrl+F         Move cursor forward one character (browser default)
    Arrow Left     Move cursor backward one character
    Arrow Right    Move cursor forward one character

    EDITING:
    Ctrl+K         Kill (cut) text from cursor to end of line
    Ctrl+U         Kill (cut) text from beginning of line to cursor
    Ctrl+W         Delete word before cursor
    Ctrl+D         Delete character at cursor
    Backspace      Delete character before cursor

    HISTORY:
    Arrow Up       Previous command in history
    Arrow Down     Next command in history
    Ctrl+P         Previous command (if not browser-intercepted)
    Ctrl+N         Next command (if not browser-intercepted)

    COMPLETION:
    Tab            Auto-complete command
    Ctrl+I         Auto-complete command (alternative to Tab)

    TERMINAL CONTROL:
    Ctrl+L         Clear screen
    Ctrl+C         (Browser default - copy)
    Ctrl+V         (Browser default - paste)

    Note: Some keybindings may be intercepted by the browser.
    Clipboard operations (Ctrl+K, Ctrl+U, Ctrl+W) will copy text when possible.`,
  },
  grep: {
    synopsis: "grep [OPTION]... PATTERN [FILE]...",
    description:
      "Search for PATTERN in each FILE or all pages. By default, grep prints the matching lines with highlighted matches.",
    options: `    -i     Ignore case distinctions in patterns and data
    -n     Prefix each line of output with line number
    -v     Invert match: select non-matching lines
    -c     Print count of matching lines per file
    -E     Interpret PATTERN as extended regular expression
    -F     Interpret PATTERN as fixed string (not regex)

    PATTERN    Regular expression or fixed string to search for
    FILE       Page name or path to search in (searches all pages if omitted)

    Examples:
    grep "react" blog           Search for "react" in blog pages
    grep -i "typescript"        Case-insensitive search in all pages
    grep -n "function"          Show line numbers for matches
    grep -c "error"             Count matching lines per page`,
  },
  egrep: {
    synopsis: "egrep [OPTION]... PATTERN [FILE]...",
    description:
      "Extended grep - equivalent to grep -E. Interprets PATTERN as an extended regular expression (ERE). Supports additional regex features like +, ?, |, and grouping.",
    options: `    -i     Ignore case distinctions
    -n     Prefix each line with line number
    -v     Invert match: select non-matching lines
    -c     Print count of matching lines per file

    Extended regex features:
    +      Match one or more occurrences
    ?      Match zero or one occurrence
    |      Alternation (OR)
    ()     Grouping
    {n,m}  Match between n and m occurrences

    Examples:
    egrep "react|vue|angular"   Search for any framework name
    egrep "\\w+@\\w+\\.\\w+"      Search for email-like patterns`,
  },
  fgrep: {
    synopsis: "fgrep [OPTION]... STRING [FILE]...",
    description:
      "Fixed string grep - equivalent to grep -F. Interprets PATTERN as a fixed string, not a regular expression. Useful for searching literal strings that contain regex special characters.",
    options: `    -i     Ignore case distinctions
    -n     Prefix each line with line number
    -v     Invert match: select non-matching lines
    -c     Print count of matching lines per file

    Examples:
    fgrep "foo.bar"            Search for literal "foo.bar" (not regex)
    fgrep "a+b*c"              Search for literal "a+b*c" (not regex pattern)
    fgrep -i "hello world"     Case-insensitive literal string search`,
  },
  spotify: {
    synopsis: "spotify",
    description:
      "Display the site owner's current or last played Spotify track in neofetch/fastfetch style. Shows album artwork (if available), track information, album, artist, and playback status. Fetches data from the Spotify API endpoint.",
  },
};
