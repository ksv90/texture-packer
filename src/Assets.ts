import { readFile } from 'node:fs/promises';
import path from 'node:path';

import textureSizeOf from 'buffer-image-size';

import { TextureData } from './texture-packer';

export class Assets {
  protected bufferCache = new Map<string, globalThis.Buffer>();

  protected textureDataCache = new Map<globalThis.Buffer, TextureData>();

  public async readFile(filePath: string): Promise<globalThis.Buffer> {
    const cachedBuffer = this.bufferCache.get(filePath);
    if (cachedBuffer) return cachedBuffer;
    const buffer = await readFile(filePath);
    this.bufferCache.set(filePath, buffer);
    return buffer;
  }

  public async getTextureData(filepath: string): Promise<TextureData> {
    const buffer = await this.readFile(filepath);
    const cachedTextureData = this.textureDataCache.get(buffer);
    if (cachedTextureData) return cachedTextureData;
    const { width, height, type } = textureSizeOf(buffer);
    const name = path.basename(filepath);
    const textureData = {
      filepath,
      name,
      type,
      buffer,
      sourceWidth: width,
      sourceHeight: height,
      x: 0,
      y: 0,
      rot: false,
      width: width,
      height: height,
      offsetTop: 0,
      offsetLeft: 0,
      trimmed: false,
    };

    this.textureDataCache.set(buffer, textureData);
    return textureData;
  }
}
