import { array, boolean, literal, number, object, optional, record, string, union } from 'valibot';

export const TextureOptionsSchema = object({
  scale: optional(number()),
});

export const OutputOptionsSchema = object({
  format: union([literal('png'), literal('webp'), literal('avif')]),
  width: number(),
  height: number(),
  subdirectory: optional(string()),
  scale: optional(number()),
  suffix: optional(string()),
  name: optional(string()),
});

export const ConfigOptionsSchema = object({
  sourceDir: string(),
  targetDir: string(),
  pathList: array(string()),
  subDir: optional(string()),
  textures: optional(record(string(), TextureOptionsSchema)),
  allowRotation: optional(boolean()),
  output: array(OutputOptionsSchema),
});

export const ConfigSchema = object({
  configs: array(ConfigOptionsSchema),
});
