/**
 * TOC extraction utilities
 */

// types
import type { TocItem } from "@/types/toc.ts";

/**
 * Options for TOC extraction
 */
interface TocOptions {
  /** Minimum heading level to include */
  minLevel?: number;
  /** Maximum heading level to include */
  maxLevel?: number;
  /** Whether to skip frontmatter */
  skipFrontmatter?: boolean;
}

/**
 * Default TOC extraction options
 */
const DEFAULT_OPTIONS: TocOptions = {
  /** Minimum heading level to include */
  minLevel: 1,
  /** Maximum heading level to include */
  maxLevel: 6,
  /** Whether to skip frontmatter */
  skipFrontmatter: true,
};

/**
 * Generates a URL-safe slug from heading text
 * @param text - The heading text to convert
 * @returns ASCII slug with hyphens
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Removes code blocks from markdown content
 * @param content - The markdown content
 * @returns Content with code blocks removed
 */
function removeCodeBlocks(content: string): string {
  // remove ``` fenced code blocks
  let result = content.replace(/```[\s\S]*?```/g, "");
  // remove ~~~~ fenced code blocks
  result = result.replace(/~~~~[\s\S]*?~~~~/g, "");
  return result;
}

/**
 * Removes YAML frontmatter from markdown content
 * @param content - The markdown content
 * @returns Content after frontmatter, or original if no frontmatter
 */
function removeFrontmatter(content: string): string {
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---/);
  if (frontmatterMatch) {
    return content.slice(frontmatterMatch[0].length);
  }
  return content;
}

/**
 * Extracts TOC entries from markdown content
 * @param content - The raw markdown/MDX content
 * @param options - Extraction options
 * @returns Array of TocItem objects
 */
export function extractToc(
  content: string,
  options: TocOptions = {},
): TocItem[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const headings: TocItem[] = [];
  // remove frontmatter if enabled
  let processedContent = opts.skipFrontmatter
    ? removeFrontmatter(content)
    : content;
  // remove code blocks to avoid matching # inside them
  processedContent = removeCodeBlocks(processedContent);
  // extract headings with regex
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  // iterate over all matches
  while ((match = headingRegex.exec(processedContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // filter by level range
    if (level >= (opts.minLevel ?? 1) && level <= (opts.maxLevel ?? 6)) {
      headings.push({
        text,
        slug: generateSlug(text),
        level,
      });
    }
  }
  return headings;
}

/**
 * Extracts TOC for use as a Lume filter
 * @param content - The raw markdown content
 * @returns Array of TocItem objects
 */
export function extractTocFilter(content: string): TocItem[] {
  return extractToc(content, { minLevel: 2, maxLevel: 3 });
}
