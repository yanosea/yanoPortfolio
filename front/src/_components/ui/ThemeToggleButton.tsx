/**
 * Theme toggle button component
 */

/**
 * Dark/light theme toggle
 * @param className - Additional CSS classes
 * @param filters - Lume filters including icon
 */
export default function ThemeToggleButton(
  { className = "" }: { className?: string },
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  return (
    <button
      type="button"
      id="theme-toggle"
      aria-label="Toggle theme"
      aria-live="polite"
      className={`flex items-center justify-center w-8 h-8 leading-none rounded-lg cursor-pointer hover-fade ${className}`}
    >
      {/* light mode icon */}
      <span
        className="dark:hidden leading-none theme-icon-light"
        aria-hidden="true"
      >
        <img
          src={icon("sun", "lucide")}
          className="w-5 h-5"
          alt=""
          inline
        />
      </span>
      {/* dark mode icon */}
      <span
        className="hidden dark:inline leading-none theme-icon-dark"
        aria-hidden="true"
      >
        <img
          src={icon("moon", "lucide")}
          className="w-5 h-5"
          alt=""
          inline
        />
      </span>
    </button>
  );
}
