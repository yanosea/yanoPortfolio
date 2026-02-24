/**
 * Tag page
 */

// types
import type { BlogPost } from "@/types/blog.ts";
// use blog page layout
export const layout = "BlogPageLayout.tsx";

/**
 * Tag filtered blog listing page with pagination
 * @param search - Lume search helper
 * @param paginate - Lume pagination helper
 * @param comp - Lume components
 * @param filters - Lume filters including icon
 */
export default function* (
  { search, paginate, comp }: Lume.Data,
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  // get all blog posts and sort by date
  const posts = search?.pages ? search.pages() : [];
  const blogPosts = posts
    .filter((page) => {
      return page?.url?.toString().startsWith("/blog/") &&
        page?.url !== "/blog/" &&
        !!page.title &&
        !!page.date;
    })
    .sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    }) as unknown as BlogPost[];
  // get all unique tags
  const allTags = new Set<string>();
  blogPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => allTags.add(tag));
    }
  });
  // generate pages for each tag
  for (const tag of allTags) {
    // filter posts by tag
    const tagPosts = blogPosts
      .filter((post) => post.tags && post.tags.includes(tag));
    // pagination options
    const options = {
      url: (n: number) =>
        n === 1 ? `/blog/tag/${tag}/` : `/blog/tag/${tag}/page/${n}/`,
      size: 5,
    };
    // yield paginated tag pages
    for (const page of paginate(tagPosts, options)) {
      yield {
        url: page.url,
        title: `${tag} - blog`,
        content: (
          <div className="flex-1 flex flex-col">
            {/* title */}
            <h1 className="flex items-center gap-3">
              <img
                src={icon("notebook-pen", "lucide")}
                className="w-8 h-8"
                alt=""
                aria-hidden="true"
                inline
              />
              blog tagged #{tag}
            </h1>
            {/* posts */}
            {page.results.length === 0
              ? (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-muted">
                    No posts found...
                  </p>
                </div>
              )
              : (
                <div className="mt-8 space-y-6">
                  {page.results.map((post) => (
                    <comp.ui.BlogCard
                      date={post.date}
                      description={post.description}
                      emoji={post.emoji}
                      tags={post.tags}
                      title={post.title}
                      url={post.url}
                    />
                  ))}
                </div>
              )}
            {/* pagination */}
            {page.pagination.totalPages > 1 && (
              <comp.ui.Pagination
                className="mt-auto"
                nextUrl={page.pagination.next}
                previousUrl={page.pagination.previous}
              />
            )}
          </div>
        ),
      };
    }
  }
}
