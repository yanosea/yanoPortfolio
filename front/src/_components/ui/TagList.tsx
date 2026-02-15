/**
 * Tag list component
 */

/**
 * List of tags
 * @param tags - Array of tag strings
 * @param activeTag - Currently active tag (for highlighting)
 * @param ariaLabel - Aria label for the list
 * @param className - Additional CSS classes
 * @param comp - Lume component helper
 */
export default function TagList(
  { tags, activeTag, ariaLabel = "Article tags", className = "", comp }: {
    tags: string[];
    activeTag?: string;
    ariaLabel?: string;
    className?: string;
    comp: Lume.Data["comp"];
  },
) {
  if (!tags || tags.length === 0) {
    return null;
  }
  return (
    <ul
      className={`not-prose flex flex-wrap gap-2 list-none m-0 p-0 ${className}`}
      aria-label={ariaLabel}
    >
      {/* tag items */}
      {tags.map((tag: string) => (
        <li key={tag}>
          <comp.ui.Tag tag={tag} isActive={activeTag === tag} />
        </li>
      ))}
    </ul>
  );
}
