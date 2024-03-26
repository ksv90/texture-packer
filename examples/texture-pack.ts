import { resizeTextures, TexturePacker } from '../src';

export const INPUT_DIR_NAME = 'examples/public';
export const OUTPUT_DIR_NAME = 'examples/packed-textures';

void (await (async function main() {
  const texturePacker = new TexturePacker(INPUT_DIR_NAME, OUTPUT_DIR_NAME, { addSrcPath: true });
  texturePacker.prePackTextureDataHook = async (textureData) => resizeTextures(0.5, textureData);
  await texturePacker.packTextures('desktop', { width: 2048, height: 2048 });
  await texturePacker.packTextures('desktop', { width: 4096, height: 4096, scale: 2 });
  await texturePacker.packTextures('mobile', { width: 1024, height: 2048, scale: 2 });
})());
