/**
 * Page title component with icon
 */

/**
 * Page title with SVG icon
 * @param title - Page title text
 * @param iconName - Icon name in format "library/name"
 * @param filters - Lume filters including icon
 */
export default function PageTitle(
  { title, iconName }: { title: string; iconName: string },
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  const [library, name] = iconName.split("/");

  return (
    <h1 className="flex items-center gap-3">
      {/* icon */}
      <img
        src={icon(name, library)}
        className="w-8 h-8"
        alt=""
        aria-hidden="true"
        inline
      />
      {/* title */}
      {title}
    </h1>
  );
}
