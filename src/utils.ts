import path from 'node:path';

import textureSizeOf from 'buffer-image-size';
import sharp from 'sharp';

import { SourceTextureData, TextureData } from './types';

export function createBufferFromData(data: unknown): globalThis.Buffer {
  return globalThis.Buffer.from(globalThis.JSON.stringify(data));
}

export function createSourceTextureData(filePath: string, buffer: globalThis.Buffer): SourceTextureData {
  const name = path.basename(filePath);
  const { width, height, type } = textureSizeOf(buffer);
  return { buffer, name, width, height, type };
}

export function createTextureData(sourceData: SourceTextureData): TextureData {
  return {
    name: sourceData.name,
    buffer: sourceData.buffer,
    sourceWidth: sourceData.width,
    sourceHeight: sourceData.height,
    x: 0,
    y: 0,
    rot: false,
    width: sourceData.width,
    height: sourceData.height,
    offsetTop: 0,
    offsetLeft: 0,
    trimmed: false,
  };
}

export async function resizeTexture(sourceTextureData: SourceTextureData, scale = 1): Promise<SourceTextureData> {
  const width = Math.round(sourceTextureData.width * scale);
  const height = Math.round(sourceTextureData.height * scale);
  const buffer = await sharp(sourceTextureData.buffer).resize(width, height).toBuffer();
  return { ...sourceTextureData, width, height, buffer } satisfies SourceTextureData;
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
