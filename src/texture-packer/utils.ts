import sharp from 'sharp';

import { TextureData } from './types';

export async function resizeTexture(textureData: TextureData, scale = 1): Promise<TextureData> {
  const width = Math.round(textureData.width * scale);
  const height = Math.round(textureData.height * scale);
  const buffer = await sharp(textureData.buffer).resize(width, height).toBuffer();
  return { ...textureData, buffer, width, height, sourceWidth: width, sourceHeight: height } satisfies TextureData;
}

export async function trimTexture(textureData: TextureData): Promise<TextureData> {
  const { data, info } = await sharp(textureData.buffer).trim().toBuffer({ resolveWithObject: true });
  if (!info.trimOffsetLeft || !info.trimOffsetTop) return textureData;
  return {
    ...textureData,
    trimmed: true,
    width: info.width,
    height: info.height,
    offsetLeft: -info.trimOffsetLeft,
    offsetTop: -info.trimOffsetTop,
    buffer: data,
  };
}

export async function rotateTexture(textureData: TextureData, rotate = 90): Promise<TextureData> {
  const buffer = await sharp(textureData.buffer).rotate(rotate).toBuffer();
  return { ...textureData, buffer, rot: true };
}
