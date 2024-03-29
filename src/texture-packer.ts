import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { Bin, MaxRectsPacker } from 'maxrects-packer';

import { DEFAULT_SPRITESHEETS_NAME, Directories, Ext } from './constants';
import {
  createOverlayOptions,
  createSpriteFactory,
  createSpritesheetsData,
  createSpritesheetsFrames,
  getChildDirectories,
  makeTextureData,
} from './helpers';
import {
  OutputFileData,
  PreSourceTextureDataHook,
  SpriteData,
  SpriteDataOptions,
  TextureData,
  TexturePackerOptions,
} from './types';
import { createBufferFromData, rotateTexture } from './utils';

export class TexturePacker {
  protected options: TexturePackerOptions;

  public preSourceTextureDataHook?: PreSourceTextureDataHook;

  constructor(
    protected readonly inputPath: string,
    protected readonly outputPath: string,
    options: Partial<TexturePackerOptions> = {},
  ) {
    this.options = {
      spritesheetName: options.spritesheetName ?? DEFAULT_SPRITESHEETS_NAME,
      excludePaths: options.excludePaths,
      subDir: options.subDir,
    };
  }

  public async packTextures(options: SpriteDataOptions): Promise<void> {
    const { excludePaths = [] } = this.options;
    const childDirectories = await getChildDirectories(this.inputPath);
    const series = childDirectories
      .filter((directoryPath) => !excludePaths.includes(directoryPath))
      .map(async (directory) => {
        await this.packOne(directory, options);
      });
    await Promise.all(series);
  }

  public async packOne(directory: string, options: SpriteDataOptions): Promise<void> {
    const { subDir = '' } = this.options;
    const { width, height, scale = 1, category = '' } = options;
    const currentPath = path.join(this.inputPath, directory, category, subDir);
    try {
      await stat(currentPath);
    } catch (error) {
      const message = `в директории ${directory} нет каталога ${category} или доступ к нему запрещен\n${String(error)}\n`;
      process.stdin.write(message);
      return;
    }
    const textureDataList = await this.makeTextureDataList(currentPath, scale);
    const maxRectsPacker = new MaxRectsPacker<TextureData>(width, height, 1, { allowRotation: true });
    maxRectsPacker.addArray(textureDataList);
    const spriteDataList = await this.createSpriteDataList(maxRectsPacker.bins, scale);
    const filesDataList = await this.createFilesDataList(spriteDataList);
    await this.saveFiles(path.join(this.outputPath, directory, category), scale.toFixed(1), filesDataList);
  }

  protected async makeTextureDataList(absoluteDirectoryPath: string, scale: number): Promise<Array<TextureData>> {
    const items = await readdir(absoluteDirectoryPath);

    const dataListPromises = items.map(async (itemPath) => {
      const currentPath = path.join(absoluteDirectoryPath, itemPath);
      try {
        const stats = await stat(currentPath);
        if (stats.isDirectory()) throw `невозможно прочитать файл, ${currentPath} является директорией`;
        return makeTextureData(currentPath, scale, this.preSourceTextureDataHook);
      } catch (error) {
        const message = `${this.makeTextureDataList.name} warn: не удалось получить данные ${currentPath}\n${String(error)}\n\n`;
        process.stdin.write(message);
        return null;
      }
    });
    const dataList = await Promise.all(dataListPromises);
    return dataList.filter((data): data is TextureData => !!data);
  }

  protected async createSpriteDataList(
    textureDataInfo: Array<Bin<TextureData>>,
    scale: number,
  ): Promise<Array<SpriteData>> {
    const spriteDataPromises = textureDataInfo.map(async ({ width, height, rects }) => {
      const textureDataPromises = rects.map(async (textureData) => {
        if (!textureData.rot) return textureData;
        return await rotateTexture(textureData);
      });
      const textureDataList = await Promise.all(textureDataPromises);
      return { width, height, textureDataList, scale } satisfies SpriteData;
    });
    return await Promise.all(spriteDataPromises);
  }

  protected async createFilesDataList(spriteDataList: ReadonlyArray<SpriteData>): Promise<Array<OutputFileData>> {
    const { spritesheetName } = this.options;
    const series = spriteDataList.map(async (spriteData, index, { length }) => {
      const { width, height, scale, textureDataList } = spriteData;

      const key = length > 1 ? `${spritesheetName}-${index}` : spritesheetName;
      const pngFileName = `${key}${Ext.png}`;
      const webpFileName = `${key}${Ext.webp}`;
      const jsonFileName = `${key}${Ext.json}`;

      const frames = createSpritesheetsFrames(textureDataList);
      const factory = createSpriteFactory(width, height).composite(createOverlayOptions(textureDataList));
      const pngSpriteFile = await factory.clone().png({ palette: true, compressionLevel: 9 }).toBuffer();
      const webpSpriteFile = await factory.clone().webp().toBuffer();
      const pngConfigFile = createSpritesheetsData(pngFileName, frames, { width, height, scale });
      const webpConfigFile = createSpritesheetsData(webpFileName, frames, { width, height, scale });

      return {
        pngSprite: { name: pngFileName, buffer: pngSpriteFile },
        webpSprite: { name: webpFileName, buffer: webpSpriteFile },
        pngConfig: { name: jsonFileName, buffer: createBufferFromData(pngConfigFile) },
        webpConfig: { name: jsonFileName, buffer: createBufferFromData(webpConfigFile) },
      } satisfies OutputFileData;
    });
    return await Promise.all(series);
  }

  protected async saveFiles(
    outputPath: string,
    qualityDirectory: string,
    outputFileDataList: ReadonlyArray<OutputFileData>,
  ): Promise<void> {
    const pngDirectory = path.join(outputPath, Directories.png, qualityDirectory);
    const webpDirectory = path.join(outputPath, Directories.webp, qualityDirectory);
    await mkdir(pngDirectory, { recursive: true });
    await mkdir(webpDirectory, { recursive: true });
    const series = outputFileDataList.map(async (outputFileData) => {
      const { pngSprite, webpSprite, pngConfig, webpConfig } = outputFileData;
      await Promise.all([
        writeFile(path.join(pngDirectory, pngSprite.name), pngSprite.buffer),
        writeFile(path.join(webpDirectory, webpSprite.name), webpSprite.buffer),
        writeFile(path.join(pngDirectory, pngConfig.name), pngConfig.buffer),
        writeFile(path.join(webpDirectory, webpConfig.name), webpConfig.buffer),
      ]);
    });
    await Promise.all(series);
  }
}
