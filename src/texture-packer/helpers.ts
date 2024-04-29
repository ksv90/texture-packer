import type { SpritesheetData, SpritesheetFrameData } from 'pixi.js';
import sharp, { Create, OverlayOptions, Sharp } from 'sharp';

import { DEFAULT_SPRITE_BG_OPTIONS, DEFAULT_SPRITESHEETS_FORMAT, SPRITE_ALPHA_CHANNELS } from './constants';
import { TextureData } from './types';

export function createOverlayOptions(textureDataList: readonly TextureData[]): OverlayOptions[] {
  return textureDataList.map(({ buffer, x, y }) => {
    return {
      input: buffer,
      left: x,
      top: y,
    } satisfies OverlayOptions;
  });
}

export function createSpriteFactory(
  width: number,
  height: number,
  options?: Omit<Create, 'width' | 'height' | 'channels'>,
): Sharp {
  const background = options?.background || DEFAULT_SPRITE_BG_OPTIONS;
  return sharp({ create: { width, height, background, channels: SPRITE_ALPHA_CHANNELS } });
}

export function createSpritesheetsFrames(textureDataList: readonly TextureData[]): SpritesheetData['frames'] {
  return textureDataList.reduce<Record<string, SpritesheetFrameData>>((acc, textureData) => {
    const { name, sourceWidth, sourceHeight, x, y, rot, trimmed, width, height, offsetTop, offsetLeft } = textureData;
    const size = { w: width, h: height };
    acc[name] = {
      frame: { x, y, ...size },
      spriteSourceSize: { x: offsetLeft, y: offsetTop, ...size },
      sourceSize: { w: sourceWidth, h: sourceHeight },
      rotated: rot,
      trimmed,
    };
    return acc;
  }, {});
}

export function createSpritesheetsData(
  imageFilePath: string,
  frames: SpritesheetData['frames'],
  options: { width: number; height: number; scale?: number; format?: string },
): SpritesheetData {
  const { width, height, scale = 1, format = DEFAULT_SPRITESHEETS_FORMAT } = options;
  return {
    frames,
    meta: {
      image: imageFilePath,
      format,
      size: { w: width, h: height },
      scale,
    },
  };
}
