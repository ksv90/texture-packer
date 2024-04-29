export type TextureData = {
  readonly filepath: string;
  readonly name: string;
  readonly type: string;
  readonly buffer: globalThis.Buffer;
  readonly hash: string;
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
  readonly textureDataList: readonly TextureData[];
};
