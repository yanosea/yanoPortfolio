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
        {/* hint browser to use system-preferred canvas color before any CSS */}
        <meta name="color-scheme" content="dark light" />
        {/* title */}
        <title>{title ? `${title} | ${site.name}` : site.name}</title>
        {/* critical theme init: must run BEFORE styles to set class and color-scheme */}
        {/* data-cfasync=false excludes this from Cloudflare Rocket Loader */}
        <script
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html:
              `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme")}catch(e){var t=null}if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";if(t==="dark"){d.classList.add("dark");d.style.colorScheme="dark"}else{d.style.colorScheme="light"}})()`,
          }}
        >
        </script>
        {/* FOUC prevention: html bg paints the canvas, body hides content */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html{background-color:#fdf6e3}html.dark{background-color:#2d353b}body{visibility:hidden}",
          }}
        >
        </style>
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
