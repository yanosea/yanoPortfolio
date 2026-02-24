/**
 * SPA Router
 * Client-side routing with View Transitions API support
 *
 * Intercepts link clicks, fetches pages via fetch(), swaps #main-content,
 * and uses document.startViewTransition() for smooth animations.
 */

/** Maximum number of cached pages */
const MAX_CACHE_SIZE = 20;

/** Page cache with LRU eviction */
const pageCache = new Map<string, string>();

/** Navigation lock to prevent overlapping navigations */
let isNavigating = false;

/**
 * Remove trailing slash from a URL (except for root "/")
 * @param url - URL string (full or pathname)
 * @returns URL with trailing slash removed
 */
function stripTrailingSlash(url: string): string {
  if (url === "/" || !url.endsWith("/")) return url;
  return url.replace(/\/+$/, "");
}

/**
 * Check if a link click should be intercepted for SPA navigation
 * @param event - The click event
 * @param anchor - The anchor element
 * @returns true if the click should be intercepted
 */
function shouldIntercept(
  event: MouseEvent,
  anchor: HTMLAnchorElement,
): boolean {
  // already handled by another handler
  if (event.defaultPrevented) {
    return false;
  }
  // modifier keys — let browser handle (new tab, etc.)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  // not a left click
  if (event.button !== 0) {
    return false;
  }
  // target="_blank" or other targets
  if (anchor.target && anchor.target !== "_self") {
    return false;
  }
  // download attribute
  if (anchor.hasAttribute("download")) {
    return false;
  }
  // external link (different origin)
  if (anchor.origin !== globalThis.location.origin) {
    return false;
  }
  // hash-only link (same page scroll)
  const anchorPath = anchor.pathname.replace(/\/+$/, "") || "/";
  const currentPath = globalThis.location.pathname.replace(/\/+$/, "") || "/";
  if (anchorPath === currentPath && anchor.hash) {
    return false;
  }
  // non-HTML resources (.xml, .pdf, .json, etc.)
  const ext = anchor.pathname.split(".").pop()?.toLowerCase();
  if (
    ext && !["html", "htm", ""].includes(ext) && anchor.pathname.includes(".")
  ) {
    return false;
  }
  // same URL — skip (normalize trailing slashes for comparison)
  if (
    stripTrailingSlash(anchor.href) ===
      stripTrailingSlash(globalThis.location.href)
  ) {
    return false;
  }
  return true;
}

/**
 * Fetch and cache a page's HTML
 * @param url - URL to fetch
 * @returns The HTML string of the fetched page
 */
async function fetchPage(url: string): Promise<string> {
  // check cache first
  const cached = pageCache.get(url);
  if (cached) {
    // move to end for LRU
    pageCache.delete(url);
    pageCache.set(url, cached);
    return cached;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const html = await response.text();
  // evict oldest entry if cache is full
  if (pageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = pageCache.keys().next().value;
    if (firstKey !== undefined) {
      pageCache.delete(firstKey);
    }
  }
  pageCache.set(url, html);
  return html;
}

/**
 * Perform the DOM swap: replace #main-content innerHTML with new content
 * @param html - Full HTML string of the new page
 */
function swapContent(html: string): void {
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, "text/html");
  const newMain = newDoc.getElementById("main-content");
  const currentMain = document.getElementById("main-content");
  if (!newMain || !currentMain) {
    // fallback: no main-content found
    throw new Error("main-content not found");
  }
  // swap the inner HTML
  currentMain.innerHTML = newMain.innerHTML;
  // update <title>
  const newTitle = newDoc.querySelector("title");
  if (newTitle) {
    document.title = newTitle.textContent || "";
  }
}

/**
 * Navigate to a URL using SPA routing
 * @param url - Target URL
 * @param pushState - Whether to push to history (false for popstate)
 * @param scrollY - Scroll position to restore (used by popstate)
 */
async function navigateTo(
  url: string,
  pushState = true,
  scrollY = 0,
): Promise<void> {
  if (isNavigating) return;
  isNavigating = true;
  try {
    const html = await fetchPage(url);
    const doSwap = () => {
      swapContent(html);
      if (pushState) {
        // save current scroll position before pushing new state
        globalThis.history.replaceState(
          { scrollY: globalThis.scrollY },
          "",
        );
        globalThis.history.pushState(
          { scrollY: 0 },
          "",
          stripTrailingSlash(url),
        );
      }
      // restore scroll position (0 for forward nav, saved for back/forward)
      globalThis.scrollTo(0, scrollY);
      // dispatch navigation event for scripts to reinitialize
      document.dispatchEvent(
        new CustomEvent("app:navigate", { detail: { url } }),
      );
    };
    // use View Transitions API if available
    if (document.startViewTransition) {
      document.documentElement.classList.add("spa-navigating");
      const transition = document.startViewTransition(doSwap);
      transition.finished.then(() => {
        document.documentElement.classList.remove("spa-navigating");
      });
    } else {
      doSwap();
    }
  } catch {
    // fallback to full page navigation on any error
    globalThis.location.href = url;
  } finally {
    isNavigating = false;
  }
}

/**
 * Initialize the SPA router
 */
function initRouter(): void {
  // intercept link clicks
  document.addEventListener("click", (event) => {
    // find the closest anchor element
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    if (!shouldIntercept(event, anchor as HTMLAnchorElement)) return;
    event.preventDefault();
    navigateTo(anchor.href);
  });

  // handle browser back/forward with scroll restoration
  globalThis.addEventListener("popstate", (event) => {
    const scrollY = (event.state as { scrollY?: number })?.scrollY ?? 0;
    navigateTo(globalThis.location.href, false, scrollY);
  });

  // handle SPA navigation requests from terminal commands
  document.addEventListener(
    "app:requestNavigate",
    ((
      event: CustomEvent<{ url: string }>,
    ) => {
      navigateTo(event.detail.url);
    }) as EventListener,
  );
}

// initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouter);
} else {
  initRouter();
}
