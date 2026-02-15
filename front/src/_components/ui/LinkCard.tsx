/**
 * Link card component
 */

/**
 * External link card with icon
 * @param href - Link URL
 * @param title - Link title
 * @param description - Link description
 * @param iconName - Icon name in format "library/name"
 * @param filters - Lume filters including icon
 */
export default function LinkCard(
  { href, title, description, iconName }: {
    href: string;
    title: string;
    description: string;
    iconName?: string;
  },
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  const renderIcon = () => {
    if (!iconName) return null;
    const [library, name] = iconName.split("/");
    return (
      <img
        src={icon(name, library)}
        className="w-8 h-8"
        alt=""
        aria-hidden="true"
        inline
      />
    );
  };

  return (
    <article className="not-prose card-article p-6 border rounded-lg hover:shadow-md">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="stretched-link group block no-underline"
        aria-label={`Visit external link: ${title} (opens in new tab)`}
      >
        <div className="flex items-start gap-4">
          {/* icon */}
          {iconName && (
            <div
              className="flex-shrink-0 link-card-icon"
              role="img"
              aria-label=""
              aria-hidden="true"
            >
              {renderIcon()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {/* title */}
            <div
              className="mb-2 font-semibold link-card-title"
              role="heading"
              aria-level="2"
            >
              <span className="text-[var(--color-accent-blue)]">
                {title}
              </span>
            </div>
            {/* description */}
            <p className="text-secondary">
              {description}
            </p>
          </div>
        </div>
      </a>
    </article>
  );
}
