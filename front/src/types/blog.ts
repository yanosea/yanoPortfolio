/**
 * Blog type definitions
 */

/**
 * Blog post data structure
 */
export interface BlogPost {
  /** Post URL path */
  url: string;
  /** Post title */
  title: string;
  /** Publication date */
  date: Date;
  /** Post description/excerpt */
  description?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Emoji icon for the post */
  emoji?: string;
}
