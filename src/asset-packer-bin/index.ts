import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { MaxRectsPacker } from 'maxrects-packer';

import { Assets } from '../Assets';
import {
  createBufferFromData,
  Ext,
  resizeTexture,
  rotateTexture,
  SpriteData,
  TextureData,
  trimTexture,
} from '../texture-packer';
import {
  createOverlayOptions,
  createSpriteFactory,
  createSpritesheetsData,
  createSpritesheetsFrames,
} from '../texture-packer/helpers';
import { ConfigSchema } from './schemas';
import { getJsonFile } from './utils';

const SPRITE_DEFAULT_NAME = 'sprite';

void (await (async function main() {
  const [, , configSrc] = process.argv;

  if (!configSrc) throw new Error('не указан путь до файла конфигурации');

  const assets = new Assets();

  const cwd = process.cwd();
  const { configs } = await getJsonFile(path.resolve(cwd, configSrc), ConfigSchema);

  const getTextureData = async (src: string): Promise<TextureData | null> => {
    try {
      const stats = await stat(src);
      if (stats.isDirectory()) return null;
      return await assets.getTextureData(src);
    } catch {
      // TODO: добавить обработку ошибок в случае текстуры
      return null;
    }
  };

  for (const config of configs) {
    const rectPackerOptions = { allowRotation: !!config.allowRotation };
    for (const sourceSrc of config.sourceList) {
      const detailsOptions = config.details?.[sourceSrc];
      const sourceDirPath = path.resolve(cwd, config.sourceDir, sourceSrc, config.subDir ?? '');
      const items = await readdir(sourceDirPath);
      const textureDataList = await items.reduce<Promise<Array<TextureData>>>(async (acc, src) => {
        const currentSrc = path.join(sourceDirPath, src);
        const textureData = await getTextureData(currentSrc);
        if (!textureData) return acc;
        const dataList = await acc;
        return dataList.concat(textureData);
      }, Promise.resolve([]));

      for (const options of config.output) {
        const { format, scale = 1, suffix = '', name = SPRITE_DEFAULT_NAME } = options;
        const maxRectsPacker = new MaxRectsPacker<TextureData>(options.width, options.height, 1, rectPackerOptions);
        const currentTextureData = textureDataList.map(async (textureData) => {
          const textureOptions = detailsOptions?.[textureData.name];
          let td = textureData;
          td = await resizeTexture(td, scale * (textureOptions?.scale ?? 1));
          td = await trimTexture(td);
          return td;
        });
        maxRectsPacker.addArray(await Promise.all(currentTextureData));

        const spriteDataPromises = maxRectsPacker.bins.map(async ({ width, height, rects }) => {
          const textureDataPromises = rects.map(async (textureData) => {
            if (!textureData.rot) return textureData;
            return await rotateTexture(textureData);
          });
          const textureDataList = await Promise.all(textureDataPromises);
          return { width, height, textureDataList, scale } satisfies SpriteData;
        });
        const spriteDataList = await Promise.all(spriteDataPromises);

        const series = spriteDataList.map(async (spriteData, index, { length }) => {
          const { width, height, scale, textureDataList } = spriteData;

          const key = index && length > 1 ? `${name}-${index}` : name;
          const spriteFileName = `${key}${suffix}.${format}`;
          const configFileName = `${key}${suffix}${Ext.json}`;

          const frames = createSpritesheetsFrames(textureDataList);
          const factory = createSpriteFactory(width, height).composite(createOverlayOptions(textureDataList));
          let spriteFile = factory.clone();
          switch (options.format) {
            case 'png': {
              spriteFile = spriteFile.png();
              break;
            }
            case 'webp': {
              spriteFile = spriteFile.webp();
              break;
            }
            case 'avif': {
              spriteFile = spriteFile.avif();
              break;
            }
            case 'jpg': {
              spriteFile = spriteFile.jpeg();
              break;
            }
          }
          const configFile = createSpritesheetsData(spriteFileName, frames, { width, height, scale });

          const targetPath = path.resolve(cwd, config.targetDir, sourceSrc, options.subDir ?? '');
          await mkdir(targetPath, { recursive: true });

          await writeFile(path.join(targetPath, spriteFileName), await spriteFile.toBuffer());
          await writeFile(path.join(targetPath, configFileName), createBufferFromData(configFile));
        });
        await Promise.all(series);
      }
    }
  }
})());
