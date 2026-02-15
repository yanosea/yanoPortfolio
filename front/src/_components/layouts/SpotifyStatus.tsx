/**
 * Spotify status component
 */

/**
 * Spotify now playing widget displaying currently playing or last played track
 * @param ownerName - Owner's name
 * @param ownersSpotifyProfileURL - Owner's Spotify profile URL
 * @param filters - Lume filters including icon
 */
export default function SpotifyStatus(
  { ownerName, ownersSpotifyProfileURL }: {
    ownerName: string;
    ownersSpotifyProfileURL: string;
  },
  filters: Lume.Helpers,
) {
  const icon = (name: string, library: string) =>
    filters.icon.call(undefined, name, library);
  return (
    <div
      id="spotify-status-container"
      className="loading fixed bottom-[calc(var(--header-footer-height)+1.5rem)] right-[2vw] z-10 max-w-[90vw] sm:max-w-[450px] md:max-w-[400px] lg:max-w-[380px] transition-transform duration-300"
    >
      {/* toggle button */}
      <button
        type="button"
        id="spotify-toggle-button"
        className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-elevated border border-r-0 border-primary rounded-l-lg flex items-center justify-center"
        aria-label="Toggle Spotify widget"
      >
        <span className="text-accent">›</span>
      </button>
      {/* main widget */}
      <div className="rounded-xl shadow-2xl overflow-hidden bg-elevated border border-l-0 border-primary">
        <div className="relative p-4">
          <div
            id="spotify-content"
            className="grid grid-cols-[1fr_2fr] items-center gap-4"
          >
            {/* album artwork */}
            <div className="flex">
              <img
                id="spotify-album-image"
                src=""
                alt="Album artwork"
                className="w-full h-full rounded-lg aspect-square object-cover cursor-pointer spotify-album-image spotify-fadeable"
              />
            </div>
            {/* track information */}
            <div className="flex flex-col gap-1 min-w-0">
              {/* owner's Spotify status with spotify profile link */}
              <a
                id="spotify-status-link"
                href={ownersSpotifyProfileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 spotify-status-link whitespace-nowrap spotify-status"
              >
                <span
                  id="spotify-icon"
                  className="text-accent"
                >
                  <img
                    src={icon("spotify", "simpleicons")}
                    className="w-4 h-4"
                    alt=""
                    aria-hidden="true"
                    inline
                  />
                </span>
                <span
                  id="spotify-status-text"
                  className="font-semibold text-accent spotify-fadeable"
                >
                  {ownerName}
                </span>
              </a>
              {/* played at time */}
              <span
                id="spotify-played-at"
                className="inline-flex items-center gap-2 text-secondary/70 whitespace-nowrap spotify-time spotify-fadeable"
              >
              </span>
              {/* track name */}
              <a
                id="spotify-track-link"
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 link-text spotify-track-link spotify-track spotify-fadeable min-w-0"
              >
              </a>
              {/* album name with album link */}
              <a
                id="spotify-album-link"
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 link-text spotify-metadata-link spotify-metadata spotify-fadeable min-w-0"
              >
              </a>
              {/* artist name with artist link */}
              <a
                id="spotify-artist-link"
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 link-text spotify-metadata-link spotify-metadata spotify-fadeable min-w-0"
              >
              </a>
            </div>
          </div>
        </div>
        {/* skeleton loading state */}
        <div
          id="spotify-loading"
          className="absolute inset-0 bg-elevated rounded-xl overflow-hidden"
          role="status"
          aria-label="Loading Spotify status"
        >
          <div className="p-4">
            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
              {/* skeleton album artwork */}
              <div className="skeleton-box w-full aspect-square rounded-lg" />
              {/* skeleton track information */}
              <div className="flex flex-col gap-2">
                <div className="skeleton-box h-5 w-32 rounded" />
                <div className="skeleton-box h-3 w-24 rounded" />
                <div className="skeleton-box h-4 w-full rounded" />
                <div className="skeleton-box h-3 w-3/4 rounded" />
                <div className="skeleton-box h-3 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
        {/* error state */}
        <div
          id="spotify-error"
          className="hidden absolute inset-0 bg-elevated rounded-xl overflow-hidden"
          role="alert"
          aria-live="polite"
        >
          <div className="p-4">
            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
              {/* error icon placeholder */}
              <div className="flex">
                <div className="w-full aspect-square rounded-lg bg-elevated border border-primary flex items-center justify-center">
                  <div className="text-red" aria-hidden="true">
                    <img
                      src={icon("spotify", "simpleicons")}
                      className="w-8 h-8"
                      alt=""
                      inline
                    />
                  </div>
                </div>
              </div>
              {/* error message */}
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-red">
                  Unable to load status...
                </p>
                <p className="text-secondary">
                  Please visit again later...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
