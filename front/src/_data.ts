/**
 * Site-wide data and configurations for the Lume static site generator
 */

// use MDX page layout by default
export const layout = "MdxPageLayout.tsx";

// site metadata
export const site = {
  /** Description of the site */
  description: "yanosea portfolio",
  /** Default image for the site */
  image: "/assets/images/about/flower.png",
  /** Language of the site */
  lang: "ja",
  /** Name of the site */
  name: "yanosea.org",
  /** Owner's name */
  ownerName: "yanosea",
  /** GitHub repository in owner/repo format */
  repo: "yanosea/yanoPortfolio",
  /** Title of the site */
  title: "yanosea.org",
  /** Blog comments repository powered by Utterances */
  utterancesRepo: "yanosea/yanoPortfolioBlogComments",
};
// social links
export const social = {
  /** GitHub profile URL */
  github: "https://github.com/yanosea",
  /** X (Twitter) profile URL */
  x: "https://x.com/no_sea_",
  /** Spotify profile URL */
  spotify: "https://open.spotify.com/user/314sfaf6ikzxgxpur7hwflapmc4m",
  /** SoundCloud profile URL */
  soundcloud: "https://soundcloud.com/yanosea",
  /** Twitch profile URL */
  twitch: "https://www.twitch.tv/yanosea",
  /** Email address */
  email: "mailto:contact@yanosea.org",
};
// credits
export const credits = {
  /** Everforest theme URL */
  everforest: "https://github.com/sainnhe/everforest",
};
// default page metadata
export const metas = {
  /** Meta site tag */
  site: "=site.title",
  /** Meta title tag */
  title: "=title",
  /** Meta description tag */
  description: "=description || =site.description",
  /** Meta image tag */
  image: "=image || =site.image",
  /** Meta locale tag */
  lang: "=site.lang",
  /** Meta twitter tag */
  twitter: "@no_sea_",
  /** Meta robots tag */
  robots: "index, follow",
};

/**
 * Generate URL for a page
 * @param page - Lume page
 * @returns URL string
 */
export function url(page: Lume.Page) {
  const path = page.src.path.replace(/^\//, "");
  if (path === "index") {
    return "/";
  }
  // 404 page must be output as /404.html for static hosting
  if (path === "404") {
    return "/404.html";
  }
  return page.src.path + "/";
}
