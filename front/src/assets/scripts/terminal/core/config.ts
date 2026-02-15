/**
 * Terminal Configuration
 */

/**
 * Tree display characters
 */
export const TREE_CHARS = {
  /** Branch character */
  BRANCH: "├──",
  /** Last branch character */
  LAST_BRANCH: "└──",
  /** Vertical character */
  VERTICAL: "│",
  /** Indentation space */
  SPACE: "   ",
} as const;

/**
 * History display configuration
 */
export const HISTORY_CONFIG = {
  /** 0-based index padding for line numbers */
  LINE_NUMBER_PADDING: 4,
  /** Character used for padding line numbers */
  PADDING_CHAR: " ",
} as const;

/**
 * Man page section names
 */
export const MAN_SECTIONS = {
  /** Name section */
  NAME: "NAME",
  /** Synopsis section */
  SYNOPSIS: "SYNOPSIS",
  /** Description section */
  DESCRIPTION: "DESCRIPTION",
  /** Options section */
  OPTIONS: "OPTIONS",
} as const;

/**
 * Restricted Unix commands that should show "permission denied"
 * instead of "command not found"
 */
export const RESTRICTED_UNIX_COMMANDS = [
  // system administration
  "sudo",
  "su",
  "shutdown",
  "reboot",
  "systemctl",
  "service",
  // file operations
  "rm",
  "mv",
  "cp",
  "cat",
  "touch",
  "mkdir",
  "rmdir",
  "ln",
  "dd",
  // permissions
  "chmod",
  "chown",
  "chgrp",
  "umask",
  // process management
  "kill",
  "killall",
  "ps",
  "top",
  "htop",
  "bg",
  "fg",
  "jobs",
  "nohup",
  // network
  "ping",
  "curl",
  "wget",
  "ssh",
  "scp",
  "nc",
  "netcat",
  "telnet",
  "ftp",
  "sftp",
  // text processing
  "sed",
  "awk",
  "sort",
  "uniq",
  "cut",
  "paste",
  "tr",
  "wc",
  "head",
  "tail",
  "less",
  "more",
  // file search
  "find",
  "locate",
  "which",
  "whereis",
  // archive
  "tar",
  "gzip",
  "gunzip",
  "bzip2",
  "bunzip2",
  "zip",
  "unzip",
  "xz",
  // editors
  "vi",
  "vim",
  "nano",
  "emacs",
  "ed",
  // build tools
  "make",
  "cmake",
  "gcc",
  "g++",
  "clang",
  "cc",
  // version control
  "git",
  "svn",
  "hg",
  "cvs",
  // disk usage
  "df",
  "du",
  "mount",
  "umount",
  // user management
  "useradd",
  "userdel",
  "usermod",
  "passwd",
  "groupadd",
  "groupdel",
  // shell
  "exit",
  "logout",
  // misc
  "diff",
  "patch",
  "alias",
  "unalias",
  "export",
  "env",
  "printenv",
  "source",
  "exec",
  "eval",
  "xargs",
  "basename",
  "dirname",
  "readlink",
  "stat",
  "file",
  "strings",
  "hexdump",
  "od",
] as const;
