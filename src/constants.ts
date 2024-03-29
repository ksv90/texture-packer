export const enum Ext {
  json = '.json',
  png = '.png',
  webp = '.webp',
  jpg = '.jpg',
  jpeg = '.jpeg',
}

export const enum Directories {
  src = 'src',
  png = 'png',
  webp = 'webp',
}

export const DEFAULT_SPRITESHEETS_FORMAT = 'RGBA8888';

export const DEFAULT_SPRITE_BG_OPTIONS = { alpha: 0, r: 0, g: 0, b: 0 };

export const SPRITE_ALPHA_CHANNELS = 4;

export const DEFAULT_SPRITESHEETS_NAME = 'sprite';

export const LOW_QUALITY_SIZE = 1024;
export const MEDIUM_QUALITY_SIZE = 2048;
export const HIGH_QUALITY_SIZE = 4096;

export const LOW_SIZE = { width: LOW_QUALITY_SIZE, height: LOW_QUALITY_SIZE };
export const MEDIUM_SIZE = { width: MEDIUM_QUALITY_SIZE, height: MEDIUM_QUALITY_SIZE };
export const HIGH_SIZE = { width: HIGH_QUALITY_SIZE, height: HIGH_QUALITY_SIZE };

export const DESKTOP_CATEGORY = 'desktop';
export const MOBILE_CATEGORY = 'mobile';
