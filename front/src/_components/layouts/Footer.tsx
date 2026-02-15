/**
 * Footer component
 */

/**
 * Site footer with copyright and version
 * @param site - Site configuration including owner name
 */
export default function Footer({ site }: Lume.Data) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full" role="contentinfo">
      <div className="mx-auto flex min-h-[var(--header-footer-height)] max-w-7xl items-center justify-center gap-3 border-t border-primary px-6 text-center text-muted">
        <div id="footer-content" className="footer-content">
          {/* current year */}
          <small>© {currentYear}</small>
          {/* site owner name */}
          <small>{site.ownerName}</small>
          {/* version of the repository of this site */}
          <small>
            <a id="version"></a>
          </small>
        </div>
      </div>
    </footer>
  );
}
