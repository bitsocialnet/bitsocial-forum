// Banner images are generated into public/banners/ by scripts/generate-section-banners.mjs, one per
// section code plus the home banner. Paths are relative so they resolve under any deploy base.
export const HOME_BANNER_SRC = './banners/home.svg';

export function getSectionBannerSrc(code: string): string {
  return `./banners/${code}.svg`;
}
