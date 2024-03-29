import path from 'node:path';

import { HIGH_SIZES, LOW_SIZES, MEDIUM_SIZES, resizeTexture, TexturePacker } from '../src';

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
  await texturePacker.packTextures({ ...MEDIUM_SIZES, category: 'desktop' });
  await texturePacker.packTextures({ ...HIGH_SIZES, scale: 2, category: 'desktop' });
  await texturePacker.packTextures({ ...MEDIUM_SIZES, scale: 2, category: 'mobile' });
  await texturePacker.packOne('symbols', { ...LOW_SIZES });
  await texturePacker.packOne('symbols', { ...MEDIUM_SIZES, scale: 2 });
})());
