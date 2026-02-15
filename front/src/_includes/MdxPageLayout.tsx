/**
 * MDX page layout
 */

// use base layout
export const layout = "BaseLayout.tsx";

/**
 * Content layout for MDX pages
 * @param children - Page content
 */
export default ({ children }: Lume.Data) => (
  // content card
  <div className="card-content p-8 rounded-lg shadow-xl flex-1 prose dark:prose-invert max-w-none flex flex-col">
    {children}
  </div>
);
