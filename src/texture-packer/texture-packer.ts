import { DEFAULT_SPRITESHEETS_NAME } from './constants';
import { TexturePackerOptions } from './types';

export class TexturePacker {
  protected options: TexturePackerOptions;

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
}
