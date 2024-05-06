import { array, boolean, literal, number, object, optional, record, string, union } from 'valibot';

export const TextureOptionsSchema = object({
  scale: optional(number()),
});

export const OutputOptionsSchema = object({
  format: union([literal('png'), literal('webp'), literal('avif'), literal('jpg')]),
  width: number(),
  height: number(),
  subDir: optional(string()),
  scale: optional(number()),
  suffix: optional(string()),
  name: optional(string()),
  metaScale: optional(number()),
  background: optional(string()),
});

export const SettingsOptionsSchema = object({
  sourceDir: optional(string()),
  targetDir: string(),
  sourceList: array(string()),
  subDir: optional(string()),
  details: optional(record(string(), record(string(), TextureOptionsSchema))),
  output: array(OutputOptionsSchema),
  addTextures: optional(record(string(), array(string()))),
});

export const ConfigSchema = object({
  settings: array(SettingsOptionsSchema),
  allowRotation: optional(boolean()),
  cache: optional(boolean()),
  cacheName: optional(string()),
});

export const AssetCacheSchema = record(string(), optional(array(string())));
