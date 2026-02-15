/**
 * Hamburger button component
 */

/**
 * Mobile menu toggle button
 * @param className - Additional CSS classes
 * @param filters - Lume filters including icon
 */
export default function HamburgerButton(
  { className = "" }: { className?: string },
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  return (
    <button
      type="button"
      id="menu-button"
      className={`flex items-center justify-center w-8 h-8 leading-none hover-fade ${className}`}
      aria-expanded="false"
      aria-controls="mobile-menu"
      aria-label="open menu"
    >
      {/* open icon */}
      <span
        id="menu-icon-open"
        className="hamburger-icon leading-none"
        aria-hidden="true"
      >
        <img
          src={icon("menu", "lucide")}
          className="w-5 h-5"
          alt=""
          inline
        />
      </span>
      {/* close icon */}
      <span
        id="menu-icon-close"
        className="hamburger-icon leading-none hidden"
        aria-hidden="true"
      >
        <img
          src={icon("x", "lucide")}
          className="w-5 h-5"
          alt=""
          inline
        />
      </span>
    </button>
  );
}
