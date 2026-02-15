/**
 * Base layout
 */

/**
 * Root HTML layout for all pages
 * @param title - Page title
 * @param children - Page content
 * @param comp - Lume component helper
 * @param site - Site configuration
 * @param social - Social links
 */
export default (
  { title, children, comp, site, social }: Lume.Data,
) => (
  <>
    {{ __html: "<!DOCTYPE html>" }}
    <html lang={site.lang}>
      <head>
        {/* meta */}
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-visual"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="theme-color"
          content="#fdf6e3"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#2d353b"
          media="(prefers-color-scheme: dark)"
        />
        {/* title */}
        <title>{title ? `${title} | ${site.name}` : site.name}</title>
        {/* FOUC prevention: hide page until CSS loads */}
        <style
          dangerouslySetInnerHTML={{
            __html: "html{visibility:hidden;opacity:0;}",
          }}
        >
        </style>
        {/* critical theme init: must be inline to avoid flash during view transitions */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        >
        </script>
        {/* styles */}
        <link rel="stylesheet" href="/assets/styles/main.css" />
        {/* RSS feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
        {/* deferred scripts */}
        <script src="/assets/scripts/router/index.js" defer></script>
        <script src="/assets/scripts/core/version.js" defer></script>
        <script src="/assets/scripts/theme/index.js" defer></script>
        <script src="/assets/scripts/navigation/index.js" defer></script>
        <script src="/assets/scripts/integrations/utterances/index.js" defer>
        </script>
        <script src="/assets/scripts/modal/index.js" defer></script>
        <script src="/assets/scripts/integrations/spotify/index.js" defer>
        </script>
        <script src="/assets/scripts/terminal/index.js" defer></script>
      </head>
      <body
        className="flex min-h-screen flex-col bg-primary text-primary"
        data-site-name={site.name}
        data-username={site.ownerName}
        data-github-repo={site.repo}
        data-spotify-url={social.spotify}
      >
        {/* skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:m-4 focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:skip-link"
        >
          Skip to main content
        </a>
        {/* header */}
        <comp.layouts.Header />
        {/* main content */}
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12"
        >
          {children}
        </main>
        {/* footer */}
        <comp.layouts.Footer />
        {/* spotify status widget */}
        <comp.layouts.SpotifyStatus
          spotifyUrl={social.spotify}
          ownerName={site.ownerName}
        />
        {/* image modal */}
        <comp.layouts.ImageModal />
      </body>
    </html>
  </>
);
