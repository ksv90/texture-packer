import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import textureSizeOf from 'buffer-image-size';
import { MaxRectsPacker } from 'maxrects-packer';
import type { SpritesheetData, SpritesheetFrameData } from 'pixi.js';
import sharp, { Create, OverlayOptions, Sharp } from 'sharp';

import {
  DEFAULT_SPRITE_BG_OPTIONS,
  DEFAULT_SPRITESHEETS_FORMAT,
  SPRITE_ALPHA_CHANNELS,
  TEXTURE_EXTENSIONS,
} from './constants';
import { SpriteData, SpriteDataOptions, TextureData } from './types';

export async function makeInvertedTexture(textureData: TextureData): Promise<TextureData> {
  const { buffer } = textureData;
  const newBuffer = await sharp(buffer).rotate(90).toBuffer();
  return { ...textureData, buffer: newBuffer, rot: true };
}

export async function createSpriteDataList(
  textureData: ReadonlyArray<TextureData>,
  options: Required<SpriteDataOptions>,
): Promise<SpriteData[]> {
  const maxRectsPacker = new MaxRectsPacker<TextureData>(options.width, options.height, 1, { allowRotation: true });
  maxRectsPacker.addArray(textureData as Array<TextureData>);
  const spriteDataPromise = maxRectsPacker.bins.map(async (data) => {
    const { width, height, rects } = data;
    const dataPromise = rects.map(async (textureData) => {
      if (!textureData.rot) return textureData;
      return await makeInvertedTexture(textureData);
    });
    const textureDataList = await Promise.all(dataPromise);
    return { width, height, textureDataList, scale: options.scale } satisfies SpriteData;
  });
  return await Promise.all(spriteDataPromise);
}

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
  const background = options?.background ?? DEFAULT_SPRITE_BG_OPTIONS;
  return sharp({ create: { width, height, background, channels: SPRITE_ALPHA_CHANNELS } });
}

export function createSpritesheetsFrames(textureDataList: readonly TextureData[]): SpritesheetData['frames'] {
  return textureDataList.reduce<Record<string, SpritesheetFrameData>>((acc, textureData) => {
    const { name, width, height, x, y, rot } = textureData;
    const size = { w: width, h: height };
    acc[name] = {
      frame: { ...size, x, y },
      spriteSourceSize: { x: 0, y: 0, ...size },
      sourceSize: size,
      rotated: rot,
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

export async function makeTextureDataList(directoryPath: string): Promise<Array<TextureData>> {
  const items = await readdir(directoryPath);
  return items.reduce<Promise<Array<TextureData>>>(async (textureDataListPromise, src) => {
    const extname = path.extname(src);
    const textureDataList = await textureDataListPromise;
    if (!extname || !TEXTURE_EXTENSIONS.includes(extname.toLocaleLowerCase())) return textureDataList;
    const buffer = await readFile(path.join(directoryPath, src));
    const { width, height } = textureSizeOf(buffer);
    const name = path.basename(src);
    const textureData = { name, buffer, width, height, x: 0, y: 0, rot: false } satisfies TextureData;
    return [...textureDataList, textureData];
  }, Promise.resolve([]));
}

export async function getChildDirectories(parentDirectoryPath: string): Promise<Array<string>> {
  const items = await readdir(parentDirectoryPath);
  return items.reduce<Promise<Array<string>>>(async (directoriesPromise, src) => {
    const currentSrc = path.join(parentDirectoryPath, src);
    const stats = await stat(currentSrc);
    const directories = await directoriesPromise;
    return stats.isDirectory() ? directories.concat(src) : directories;
  }, Promise.resolve([]));
}

export async function resizeTextures(scale: number, textureData: TextureData): Promise<TextureData> {
  const width = Math.round(textureData.width * scale);
  const height = Math.round(textureData.height * scale);
  const buffer = await sharp(textureData.buffer).resize(width, height).toBuffer();
  return { ...textureData, width, height, buffer } satisfies TextureData;
}
