/**
 * Index page
 */

// use index layout
export const layout = "IndexLayout.tsx";

/**
 * Index page
 * @param comp - Lume components
 * @param site - Site configuration
 * @returns Rendered index page
 */
export default function ({ comp, site }: Lume.Data) {
  return (
    // terminal
    <comp.layouts.Terminal
      username="you"
      hostname={site.name}
    />
  );
}
