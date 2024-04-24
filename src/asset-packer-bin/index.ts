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
import { AssetCacheSchema, ConfigSchema } from './schemas';
import { getJsonFile, makeTextureFormat } from './utils';

const SPRITE_DEFAULT_NAME = 'sprite';
const ASSET_CACHE_NAME = '.assets-cache';

void (await (async function main() {
  const [, , configSrc] = process.argv;
  const cwd = process.cwd();

  if (!configSrc) throw new Error('не указан путь до файла конфигурации');
  const config = await getJsonFile(path.resolve(cwd, configSrc), ConfigSchema);
  const assetCachePath = path.resolve(cwd, ASSET_CACHE_NAME);
  const assetCache = await (async () => {
    try {
      return await getJsonFile(assetCachePath, AssetCacheSchema);
    } catch {
      return {};
    }
  })();

  const assets = new Assets(cwd);

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

  for (const setting of config.settings) {
    const rectPackerOptions = { allowRotation: !!setting.allowRotation };
    for (const sourceSrc of setting.sourceList) {
      const detailsOptions = setting.details?.[sourceSrc];

      const sourceDirSrc = path.join(setting.sourceDir ?? '', sourceSrc, setting.subDir ?? '');
      const sourceDirPath = path.resolve(cwd, sourceDirSrc);

      const animations = new Map<string, Array<string>>();
      const items = await readdir(sourceDirPath);

      const directoryTextureHashes = assetCache[sourceDirSrc];
      let textureHashes = directoryTextureHashes ? new Set(directoryTextureHashes) : null;
      const textureDataList = await items.reduce<Promise<Array<TextureData>>>(async (acc, src) => {
        const currentSrc = path.join(sourceDirPath, src);
        const textureData = await getTextureData(currentSrc);
        if (!textureData) return acc;
        const dataList = await acc;
        if (!textureHashes) return dataList.concat(textureData);
        if (!textureHashes.has(textureData.hash)) textureHashes = null;
        textureHashes?.delete(textureData.hash);
        return dataList.concat(textureData);
      }, Promise.resolve([]));

      if (textureHashes && !textureHashes.size) continue;

      textureDataList.forEach((textureData) => {
        const chunks = textureData.name.split('_');
        if (chunks[1]) {
          const animationName = chunks.slice(0, -1).join('_');
          const animation = animations.get(animationName) ?? [];
          animation.push(textureData.name);
          animations.set(animationName, animation);
        }
      });

      animations.forEach((list) => list.sort());
      assetCache[sourceDirSrc] = textureDataList.map(({ hash }) => hash);

      for (const options of setting.output) {
        const { metaScale, suffix = '', name = SPRITE_DEFAULT_NAME, subDir = '', background = '' } = options;
        const maxRectsPacker = new MaxRectsPacker<TextureData>(options.width, options.height, 1, rectPackerOptions);
        const currentTextureData = textureDataList.map(async (textureData) => {
          const textureOptions = detailsOptions?.[textureData.name];
          let td = textureData;
          td = await resizeTexture(td, (options.scale ?? 1) * (textureOptions?.scale ?? 1));
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
          return { width, height, textureDataList } satisfies SpriteData;
        });
        const spriteDataList = await Promise.all(spriteDataPromises);
        const multiPacks: string[] = [];
        const { length } = spriteDataList;

        for (let index = length - 1; index >= 0; index -= 1) {
          const { width, height, textureDataList } = spriteDataList[index];
          const key = index && length > 1 ? `${name}-${index}` : name;
          const spriteFileName = `${key}${suffix}.${options.format}`;
          const configFileName = `${key}${suffix}${Ext.json}`;

          const frames = createSpritesheetsFrames(textureDataList);
          const factory = createSpriteFactory(width, height, { background }).composite(
            createOverlayOptions(textureDataList),
          );
          const spriteFactory = makeTextureFormat(options.format, factory);
          const spriteBuffer = await spriteFactory.toBuffer();
          const spriteHash = await assets.getFileHash(spriteBuffer);
          const spriteOptions = { width, height, scale: metaScale };
          const configFile = createSpritesheetsData(`${spriteFileName}?hash=${spriteHash}`, frames, spriteOptions);
          const configFileBuffer = createBufferFromData(configFile);

          if (index) multiPacks.push(configFileName);
          else {
            configFile.meta.related_multi_packs = multiPacks.reverse();
            animations.forEach((animationList, animationName) => {
              if (!configFile.animations) configFile.animations = {};
              configFile.animations[animationName] = animationList;
            });
          }

          const targetPath = path.resolve(cwd, setting.targetDir, sourceSrc, subDir);
          await mkdir(targetPath, { recursive: true });

          await writeFile(path.join(targetPath, spriteFileName), spriteBuffer);
          await writeFile(path.join(targetPath, configFileName), configFileBuffer);
          await writeFile(assetCachePath, createBufferFromData(assetCache));
        }
      }
    }
  }
})());
