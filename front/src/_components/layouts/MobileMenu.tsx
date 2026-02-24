/**
 * Mobile menu component
 */

/**
 * Mobile navigation drawer
 * @param comp - Lume component helper
 */
export default function MobileMenu({ comp }: Lume.Data) {
  return (
    <div
      id="mobile-menu"
      className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out md:hidden w-full"
    >
      <div className="min-h-0 overflow-hidden">
        <div className="px-6 pb-4 mobile-menu-links">
          {/* about page */}
          <comp.ui.NavLink
            href="/about"
            className="nav-link"
            iconName="lucide/info"
          >
            about
          </comp.ui.NavLink>
          {/* blog page */}
          <comp.ui.NavLink
            href="/blog"
            className="nav-link"
            iconName="lucide/notebook-pen"
          >
            blog
          </comp.ui.NavLink>
          {/* links page */}
          <comp.ui.NavLink
            href="/links"
            className="nav-link"
            iconName="lucide/link"
          >
            links
          </comp.ui.NavLink>
        </div>
      </div>
    </div>
  );
}
