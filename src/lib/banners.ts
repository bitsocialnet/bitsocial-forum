// Every banner has a dark and a light image. Section banners are generated into public/banners/ by
// scripts/generate-section-banners.mjs. The home banners are banner-mesh-wide-dark and -light from the
// bitsocialnet/assets repository: bitsocial.net's polygon mesh on black and on white. Paths are
// relative so they resolve under any deploy base.
export type BannerSources = { dark: string; light: string };

export const HOME_BANNER: BannerSources = { dark: './banners/home.webp', light: './banners/home-light.webp' };

export function getSectionBanner(code: string): BannerSources {
  return { dark: `./banners/${code}.svg`, light: `./banners/${code}-light.svg` };
}
