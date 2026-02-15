/**
 * Blog card component
 */

/**
 * Blog post preview card
 * @param url - Post URL
 * @param title - Post title
 * @param date - Publication date
 * @param description - Post description/excerpt
 * @param tags - Post tags
 * @param activeTag - Currently active tag (for highlighting)
 * @param emoji - Post emoji
 * @param comp - Lume component helper
 */
export default function BlogCard(
  { url, title, date, description, tags, activeTag, emoji, comp }: {
    url: string;
    title: string;
    date?: Date;
    description?: string;
    tags?: string[];
    activeTag?: string;
    emoji?: string;
    comp: Lume.Data["comp"];
  },
) {
  return (
    <article
      className="not-prose card-article p-6 border rounded-lg hover:shadow-md"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <a
        href={url}
        className="stretched-link block no-underline"
        itemProp="url"
      >
        {/* title */}
        <div
          className="mb-2 flex items-center gap-2 font-semibold text-xl"
          itemProp="headline"
          role="heading"
          aria-level="2"
        >
          {emoji && (
            <span
              role="img"
              aria-label=""
              aria-hidden="true"
            >
              {emoji}
            </span>
          )}
          <span className="text-[var(--color-accent-blue)] no-underline">
            {title}
          </span>
        </div>
        {/* date */}
        {date && (
          <comp.ui.LocalizedDate
            date={date}
            className="block"
            itemProp="datePublished"
          />
        )}
        {/* description */}
        {description && (
          <p className="text-secondary mt-3" itemProp="description">
            {description}
          </p>
        )}
      </a>
      {/* tags */}
      {tags && tags.length > 0 && (
        <div className="card-article-tags">
          <comp.ui.TagList tags={tags} activeTag={activeTag} />
        </div>
      )}
    </article>
  );
}
