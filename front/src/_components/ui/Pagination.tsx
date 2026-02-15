/**
 * Pagination component
 */

/**
 * Page navigation controls
 * @param previousUrl - Previous page URL
 * @param nextUrl - Next page URL
 * @param className - Additional CSS classes for the nav element
 */
export default function Pagination({
  previousUrl,
  nextUrl,
  className,
}: {
  previousUrl?: string;
  nextUrl?: string;
  className?: string;
}) {
  // don't render navigation if there are no pages to navigate to
  if (!previousUrl && !nextUrl) {
    return null;
  }
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex justify-between list-none p-0 mb-0">
        {/* previous page link */}
        {previousUrl
          ? (
            <li>
              <a
                href={previousUrl}
                className="link-text font-medium"
                rel="prev"
                aria-label="Go to previous page"
              >
                <span aria-hidden="true">←</span> Previous
              </a>
            </li>
          )
          : <li aria-hidden="true"></li>}
        {/* next page link */}
        {nextUrl
          ? (
            <li>
              <a
                href={nextUrl}
                className="link-text font-medium"
                rel="next"
                aria-label="Go to next page"
              >
                Next <span aria-hidden="true">→</span>
              </a>
            </li>
          )
          : <li aria-hidden="true"></li>}
      </ul>
    </nav>
  );
}
