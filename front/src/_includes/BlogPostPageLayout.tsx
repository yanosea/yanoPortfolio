/**
 * Blog post page layout
 */

// use base layout
export const layout = "BaseLayout.tsx";

/**
 * Layout for individual blog posts
 * @param title - Post title
 * @param date - Publication date
 * @param description - Post description
 * @param tags - Post tags
 * @param children - Post content
 * @param readingInfo - Reading time information
 * @param emoji - Post emoji
 * @param toc - Table of contents
 * @param comp - Lume component helper
 * @param site - Site configuration
 */
export default (
  {
    title,
    date,
    description,
    tags,
    children,
    readingInfo,
    emoji,
    toc,
    comp,
    site,
  }: Lume.Data,
) => (
  <div className="card-content p-8 rounded-lg shadow-xl flex-1 prose dark:prose-invert max-w-none">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* article */}
      <div className="flex-1 lg:min-w-0">
        <article>
          {/* header */}
          <div className="mb-8">
            {/* title */}
            <h1 className="mb-4 flex items-center gap-3">
              {emoji && (
                <span
                  role="img"
                  aria-label=""
                  aria-hidden="true"
                >
                  {emoji}
                </span>
              )}
              {title}
            </h1>
            {/* meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {date && <comp.ui.LocalizedDate date={date} />}
              {readingInfo && (
                <span className="text-muted text-sm">
                  {readingInfo.words} words · {readingInfo.minutes} min read
                </span>
              )}
            </div>
            {/* description */}
            {description && <p className="text-secondary mt-3">{description}
            </p>}
            {/* tags */}
            {tags && tags.length > 0 && (
              <nav aria-label="Article tags" className="mt-4">
                <comp.ui.TagList tags={tags} />
              </nav>
            )}
          </div>
          {/* TOC for mobile */}
          {toc && toc.length > 0 && (
            <nav className="lg:hidden mb-8" aria-label="Table of Contents">
              <comp.layouts.TableOfContents toc={toc} />
            </nav>
          )}
          {/* content */}
          <div>
            {children}
          </div>
        </article>
      </div>
      {/* TOC for desktop */}
      {toc && toc.length > 0 && (
        <aside
          className="hidden lg:block lg:w-80 lg:flex-shrink-0"
          role="complementary"
          aria-label="Table of Contents"
        >
          <comp.layouts.TableOfContents toc={toc} />
        </aside>
      )}
    </div>
    {/* comments section */}
    <comp.layouts.UtterancesComments repo={site.utterancesRepo} />
  </div>
);
