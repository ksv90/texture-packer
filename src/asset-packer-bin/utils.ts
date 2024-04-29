import { readFile } from 'node:fs/promises';

import { Sharp } from 'sharp';
import { BaseSchema, parse } from 'valibot';

import { OutputOptions } from './types';

export async function getJsonFile<TData>(filePath: string, schema: BaseSchema<TData>): Promise<TData> {
  const configFile = await readFile(filePath, { encoding: 'utf-8' });
  const data: unknown = globalThis.JSON.parse(configFile);
  return parse(schema, data);
}

export function makeTextureFormat(format: OutputOptions['format'], factory: Sharp): Sharp {
  switch (format) {
    case 'png': {
      return factory.png();
    }
    case 'webp': {
      return factory.webp();
    }
    case 'avif': {
      return factory.avif();
    }
    case 'jpg': {
      return factory.jpeg();
    }
  }
}

export function createBufferFromData(data: unknown): globalThis.Buffer {
  return globalThis.Buffer.from(globalThis.JSON.stringify(data));
}
