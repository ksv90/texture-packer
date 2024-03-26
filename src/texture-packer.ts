import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { DEFAULT_SPRITESHEETS_NAME, Directories, Ext } from './constants';
import {
  createOverlayOptions,
  createSpriteDataList,
  createSpriteFactory,
  createSpritesheetsData,
  createSpritesheetsFrames,
  getChildDirectories,
  makeTextureDataList,
  resizeTextures,
} from './helpers';
import { OutputFileData, SpriteData, SpriteDataOptions, TextureData, TexturePackerOptions } from './types';
import { createBufferFromData } from './utils';

export class TexturePacker {
  protected options: TexturePackerOptions;

  public prePackTextureDataHook?: (textureData: TextureData) => TextureData | Promise<TextureData>;

  constructor(
    protected readonly inputPath: string,
    protected readonly outputPath: string,
    options: Partial<TexturePackerOptions> = {},
  ) {
    this.options = {
      spritesheetName: options.spritesheetName ?? DEFAULT_SPRITESHEETS_NAME,
      excludePaths: options.excludePaths ?? [],
      addSrcPath: options.addSrcPath,
    };
  }

  public async packTextures(deviceCategory: string, options: SpriteDataOptions): Promise<void> {
    const { addSrcPath, excludePaths } = this.options;
    const { width, height, scale = 1 } = options;
    const childDirectories = await getChildDirectories(this.inputPath);

    const series = childDirectories
      .filter((directoryPath) => !excludePaths.includes(directoryPath))
      .map(async (directory) => {
        const currentSrc = path.join(this.inputPath, directory, deviceCategory, addSrcPath ? Directories.src : '');
        try {
          await stat(currentSrc);
        } catch (err) {
          process.stdin.write(`в директории ${directory} нет каталога ${deviceCategory} или доступ к нему запрещен\n`);
          return;
        }

        let textureDataList = await makeTextureDataList(currentSrc);

        if (this.prePackTextureDataHook) {
          textureDataList = await Promise.all(textureDataList.map(this.prePackTextureDataHook));
        }

        if (scale !== 1) {
          textureDataList = await Promise.all(textureDataList.map((textureData) => resizeTextures(scale, textureData)));
        }

        const spriteDataList = await createSpriteDataList(textureDataList, { width, height, scale });
        const filesDataList = await this.createFilesDataList(spriteDataList);
        await this.saveFiles(path.join(this.outputPath, directory, deviceCategory), scale.toFixed(1), filesDataList);
      });
    await Promise.all(series);
  }

  public async packOne(directory: string, options: SpriteDataOptions): Promise<void> {
    const { addSrcPath } = this.options;
    const { width, height, scale = 1 } = options;
    const currentSrc = path.join(this.inputPath, directory, addSrcPath ? Directories.src : '');
    let textureDataList = await makeTextureDataList(currentSrc);

    if (this.prePackTextureDataHook) {
      textureDataList = await Promise.all(textureDataList.map(this.prePackTextureDataHook));
    }

    if (scale !== 1) {
      textureDataList = await Promise.all(textureDataList.map((textureData) => resizeTextures(scale, textureData)));
    }
    const spriteDataList = await createSpriteDataList(textureDataList, { width, height, scale });
    const filesDataList = await this.createFilesDataList(spriteDataList);
    await this.saveFiles(path.join(this.outputPath, directory), scale.toFixed(1), filesDataList);
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
