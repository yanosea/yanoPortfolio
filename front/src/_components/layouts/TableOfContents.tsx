/**
 * Table of contents component
 */

// types
import type { TocItem } from "@/types/toc.ts";

/**
 * Article table of contents sidebar
 * @param toc - TOC items from markdown processor
 */
export default function TableOfContents({ toc }: { toc: TocItem[] }) {
  // return null if no TOC items
  if (!toc || toc.length === 0) {
    return null;
  }
  // calculate relative indentation based on minimum level
  const minLevel = Math.min(...toc.map((item) => item.level));
  // manage counters for each hierarchy level
  const counters: { [key: number]: number } = {};
  return (
    <div
      className="card-toc custom-scrollbar px-6 py-4 border rounded-lg mb-8 lg:mb-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
      role="navigation"
      aria-labelledby="toc-heading"
    >
      {/* heading */}
      <div
        id="toc-heading"
        className="font-bold text-primary toc-heading"
        role="heading"
        aria-level="2"
      >
        Table of Contents
      </div>
      {/* TOC list */}
      <ol className="space-y-1 list-none">
        {toc.map((item) => {
          const relativeLevel = item.level - minLevel;
          // increment counter for current level
          counters[relativeLevel] = (counters[relativeLevel] || 0) + 1;
          // reset counters for deeper levels
          Object.keys(counters).forEach((key) => {
            const level = parseInt(key);
            if (level > relativeLevel) {
              counters[level] = 0;
            }
          });
          // generate numbering
          const number = Array.from(
            { length: relativeLevel + 1 },
            (_, i) => counters[i] || 0,
          ).join(".");

          return (
            <li
              key={item.slug}
              className="flex items-start"
            >
              <span className="text-muted select-none mr-2" aria-hidden="true">
                {number}.
              </span>
              <a
                href={`#${item.slug}`}
                className="link-text"
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
