/**
 * Index layout
 */

// use base layout
export const layout = "BaseLayout.tsx";

/**
 * Terminal-style layout for the index page
 * @param children - Page content
 */
export default ({ children }: Lume.Data) => (
  // terminal card
  <div className="terminal-card rounded-lg shadow-xl flex-1 flex flex-col overflow-hidden">
    {children}
  </div>
);
