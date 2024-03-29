export type SourceTextureData = {
  readonly name: string;
  readonly type: string;
  readonly buffer: globalThis.Buffer;
  readonly width: number;
  readonly height: number;
};

export type TextureData = {
  readonly name: string;
  readonly buffer: globalThis.Buffer;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly x: number;
  readonly y: number;
  readonly rot: boolean;
  readonly trimmed: boolean;
  readonly width: number;
  readonly height: number;
  readonly offsetTop: number;
  readonly offsetLeft: number;
};

export type SpriteData = {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly textureDataList: readonly TextureData[];
};

export type TexturePackerOptions = {
  readonly spritesheetName: string;
  readonly excludePaths?: ReadonlyArray<string>;
  readonly subDir?: string;
};

export type SpriteDataOptions = {
  readonly width?: number;
  readonly height?: number;
  readonly scale?: number;
  readonly category?: string;
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

export type PreSourceTextureDataHook = (
  sourceTextureData: SourceTextureData,
) => SourceTextureData | Promise<SourceTextureData>;
