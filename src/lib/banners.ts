// Section banners are generated into public/banners/ by scripts/generate-section-banners.mjs, one per
// section code. The home banner is banner-mesh-wide-dark.webp from the bitsocialnet/assets repository:
// bitsocial.net's polygon mesh on black. Paths are relative so they resolve under any deploy base.
export const HOME_BANNER_SRC = './banners/home.webp';

export function getSectionBannerSrc(code: string): string {
  return `./banners/${code}.svg`;
}
