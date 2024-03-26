export type TextureData = {
  readonly name: string;
  readonly buffer: globalThis.Buffer;
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly rot: boolean;
};

export type SpriteData = {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly textureDataList: readonly TextureData[];
};

export type TexturePackerOptions = {
  readonly spritesheetName: string;
  readonly excludePaths: ReadonlyArray<string>;
  readonly addSrcPath?: boolean;
};

export type SpriteDataOptions = {
  readonly width: number;
  readonly height: number;
  readonly scale?: number;
};

export type OutputFile = {
  readonly name: string;
  readonly buffer: globalThis.Buffer;
};

export type OutputFileData = {
  readonly pngSprite: OutputFile;
  readonly pngConfig: OutputFile;
  readonly webpSprite: OutputFile;
  readonly webpConfig: OutputFile;
};
