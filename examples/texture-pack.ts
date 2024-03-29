import path from 'node:path';

import {
  DESKTOP_CATEGORY,
  HIGH_SIZE,
  LOW_SIZE,
  MEDIUM_SIZE,
  MOBILE_CATEGORY,
  resizeTexture,
  TexturePacker,
} from '../src';

export const INPUT_DIR_NAME = 'examples/public';
export const OUTPUT_DIR_NAME = 'examples/packed-textures';

void (await (async function main() {
  const texturePacker = new TexturePacker(INPUT_DIR_NAME, OUTPUT_DIR_NAME, {
    excludePaths: ['symbols'],
    subDir: 'src',
  });
  texturePacker.preSourceTextureDataHook = async (sourceTextureData) => {
    const ext = path.extname(sourceTextureData.name);
    const basename = path.basename(sourceTextureData.name, ext);
    const scale = basename.endsWith('_blur') ? 0.25 : 0.5;
    return resizeTexture(sourceTextureData, scale);
  };
  await texturePacker.packTextures({ ...MEDIUM_SIZE, category: DESKTOP_CATEGORY });
  await texturePacker.packTextures({ ...HIGH_SIZE, scale: 2, category: DESKTOP_CATEGORY });
  await texturePacker.packTextures({ ...MEDIUM_SIZE, scale: 2, category: MOBILE_CATEGORY });
  await texturePacker.packOne('symbols', { ...LOW_SIZE });
  await texturePacker.packOne('symbols', { ...MEDIUM_SIZE, scale: 2 });
})());
