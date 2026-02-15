/**
 * Nav link component
 */

/**
 * Navigation link item
 * @param href - Link URL
 * @param children - Link text
 * @param className - Additional CSS classes
 * @param iconName - Icon name in format "library/name"
 * @param filters - Lume filters including icon
 */
export default function NavLink(
  { href, children, className = "", iconName }: {
    href: string;
    children: string;
    className?: string;
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
        className="w-4 h-4"
        alt=""
        aria-hidden="true"
        inline
      />
    );
  };

  return (
    <a
      href={href}
      className={`link-text flex items-center gap-1.5 ${className}`}
    >
      {/* icon */}
      {renderIcon()}
      {/* text */}
      {children}
    </a>
  );
}
