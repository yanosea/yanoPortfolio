/**
 * Tag component
 */

/**
 * Single tag badge with link
 * @param tag - Tag text (without #)
 * @param isActive - Whether this tag is currently active
 * @param baseUrl - Base URL for tag pages (default: "/blog/tag/")
 * @param className - Additional CSS classes
 */
export default function Tag({
  tag,
  isActive = false,
  baseUrl = "/blog/tag/",
  className = "",
}: {
  tag: string;
  isActive?: boolean;
  baseUrl?: string;
  className?: string;
}) {
  const href = `${baseUrl}${tag}`;

  return (
    // tag
    <a
      href={href}
      className={`${
        isActive
          ? "tag-active px-2 py-1 rounded border font-medium"
          : "tag px-2 py-1 rounded border"
      } ${className}`}
      aria-current={isActive ? "page" : undefined}
    >
      #{tag}
    </a>
  );
}
