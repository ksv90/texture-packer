import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import textureSizeOf from 'buffer-image-size';

import { TextureData } from './texture-packer';

export const DEFAULT_HASHING_ALGORITHM = 'sha256';
//algorithm
export class Assets {
  protected bufferCache = new Map<string, globalThis.Buffer>();

  protected textureDataCache = new Map<globalThis.Buffer, TextureData>();

  protected hashDataCache = new Map<globalThis.Buffer, string>();

  constructor(public readonly cwd: string) {}

  public async readFile(filePath: string): Promise<globalThis.Buffer> {
    const currentFilePath = path.resolve(this.cwd, filePath);
    const cachedBuffer = this.bufferCache.get(currentFilePath);
    if (cachedBuffer) return cachedBuffer;
    const buffer = await readFile(currentFilePath);
    this.bufferCache.set(currentFilePath, buffer);
    return buffer;
  }

  public async getTextureData(filepath: string, withoutExtension = false): Promise<TextureData> {
    const buffer = await this.readFile(filepath);
    const cachedTextureData = this.textureDataCache.get(buffer);
    if (cachedTextureData) return cachedTextureData;
    const { width, height, type } = textureSizeOf(buffer);
    const name = withoutExtension ? path.basename(filepath, path.extname(filepath)) : path.basename(filepath);
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
      hash: await this.getFileHash(buffer),
    } satisfies TextureData;

    this.textureDataCache.set(buffer, textureData);
    return textureData;
  }

  public async getFileHash(buffer: globalThis.Buffer, algorithm?: string): Promise<string>;
  public async getFileHash(filepath: string, algorithm?: string): Promise<string>;
  public async getFileHash(data: string | globalThis.Buffer, algorithm = DEFAULT_HASHING_ALGORITHM): Promise<string> {
    const currentBuffer = typeof data === 'string' ? await this.readFile(data) : data;
    const hash = createHash(algorithm);
    const hex = hash.update(currentBuffer).digest('hex');
    this.hashDataCache.set(currentBuffer, hex);
    return hex;
  }
}
