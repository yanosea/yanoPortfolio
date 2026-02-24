/**
 * Header component
 */

/**
 * Site header with navigation
 * @param comp - Lume components
 * @param site - Site information
 * @param filters - Lume filters including icon
 */
export default function Header(
  { comp, site }: Lume.Data,
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  return (
    <header className="sticky top-0 z-20 w-full bg-primary">
      <nav
        className="mx-auto flex min-h-[var(--header-footer-height)] max-w-7xl flex-col border-b border-primary"
        aria-label="Main navigation"
      >
        <div className="flex w-full items-baseline justify-between px-6 min-h-[var(--header-footer-height)]">
          {/* site logo and name */}
          <a
            href="/"
            className="flex items-baseline gap-2 font-bold text-3xl transition-opacity hover:opacity-80 py-5"
            aria-label="Go to homepage"
          >
            <img
              src={icon("bow-arrow", "lucide")}
              className="w-7 h-7 self-center"
              alt=""
              aria-hidden="true"
              inline
            />
            {site.name}
          </a>
          {/* navigation links */}
          <div className="hidden items-baseline gap-4 py-5 md:flex">
            {/* about page */}
            <comp.ui.NavLink href="/about" iconName="lucide/info">
              about
            </comp.ui.NavLink>
            {/* blog page */}
            <comp.ui.NavLink href="/blog" iconName="lucide/notebook-pen">
              blog
            </comp.ui.NavLink>
            {/* links page */}
            <comp.ui.NavLink href="/links" iconName="lucide/link">
              links
            </comp.ui.NavLink>
            {/* RSS */}
            <a
              href="/feed.xml"
              aria-label="Subscribe to RSS Feed"
              className="flex items-center justify-center w-8 h-8 leading-none transition-opacity hover:opacity-80 translate-y-[2px]"
              type="application/rss+xml"
              rel="alternate"
            >
              <img
                src={icon("rss", "lucide")}
                className="w-5 h-5"
                alt=""
                aria-hidden="true"
                inline
              />
            </a>
            {/* theme toggle button */}
            <comp.ui.ThemeToggleButton className="translate-y-[2px]" />
          </div>
          {/* mobile controls */}
          <div className="flex items-baseline gap-2 py-5 md:hidden">
            {/* RSS */}
            <a
              href="/feed.xml"
              aria-label="Subscribe to RSS Feed"
              className="flex items-center justify-center w-8 h-8 leading-none transition-opacity hover:opacity-80 translate-y-[2px]"
              type="application/rss+xml"
              rel="alternate"
            >
              <img
                src={icon("rss", "lucide")}
                className="w-5 h-5"
                alt=""
                aria-hidden="true"
                inline
              />
            </a>
            {/* theme toggle button */}
            <comp.ui.ThemeToggleButton className="translate-y-[2px]" />
            {/* mobile menu button */}
            <comp.ui.HamburgerButton className="translate-y-[2px]" />
          </div>
        </div>
        {/* mobile menu */}
        <comp.layouts.MobileMenu />
      </nav>
    </header>
  );
}
