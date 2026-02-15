/**
 * Terminal component
 */

/**
 * Interactive terminal UI
 * @param username - Username to display in prompt
 * @param hostname - Hostname to display in prompt
 */
export default function Terminal({
  username,
  hostname,
}: {
  username?: string;
  hostname?: string;
}) {
  return (
    <div
      className="terminal-container custom-scrollbar flex-1 overflow-y-auto flex flex-col p-2 sm:p-8"
      id="terminal-container"
    >
      {/* command history will be inserted here */}
      <div id="terminal-history"></div>
      {/* input form */}
      <form
        id="terminal-form"
        className="terminal-form flex items-center gap-2"
      >
        <label htmlFor="terminal-input" className="terminal-prompt">
          <span className="terminal-user">{username}</span>{" "}
          <span className="terminal-at">@</span>{" "}
          <span className="terminal-host">{hostname}</span>{" "}
          <span className="terminal-colon">:</span>{" "}
          <span className="terminal-path">~</span>{" "}
          <span className="terminal-dollar">$</span>
        </label>
        <div className="terminal-input-wrapper flex-1 flex items-center">
          <input
            type="text"
            id="terminal-input"
            className="terminal-input"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal input"
            size={1}
          />
          <span className="terminal-cursor" aria-hidden="true"></span>
        </div>
      </form>
      {/* hints for autocomplete will be inserted here */}
      <div
        id="terminal-hints"
        className="terminal-hints flex flex-wrap gap-2 "
      >
      </div>
    </div>
  );
}
