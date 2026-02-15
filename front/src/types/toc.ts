/**
 * TOC types
 */

/**
 * TOC item structure
 */
export type TocItem = {
  /** Heading text */
  text: string;
  /** URL slug for anchor link */
  slug: string;
  /** Heading level (1-6) */
  level: number;
};
