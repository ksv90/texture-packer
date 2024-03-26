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

export const TEXTURE_EXTENSIONS: readonly string[] = [Ext.png, Ext.jpg, Ext.jpeg, Ext.webp];

export const DEFAULT_SPRITESHEETS_FORMAT = 'RGBA8888';

export const DEFAULT_SPRITE_BG_OPTIONS = { alpha: 0, r: 0, g: 0, b: 0 };

export const SPRITE_ALPHA_CHANNELS = 4;

export const DEFAULT_SPRITESHEETS_NAME = 'sprite';
