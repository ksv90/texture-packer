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
  allowRotation: optional(boolean()),
  output: array(OutputOptionsSchema),
});

export const ConfigSchema = object({
  settings: array(SettingsOptionsSchema),
});

export const AssetCacheSchema = record(string(), optional(array(string())));
