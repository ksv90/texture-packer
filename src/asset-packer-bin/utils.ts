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

export function createBufferFromData(data: unknown, format?: boolean): globalThis.Buffer {
  const stringData = globalThis.JSON.stringify(data, null, format ? 4 : 0)
  return globalThis.Buffer.from(stringData);
}

export function getProcessFlagValue(flagName: string, argsList: ReadonlyArray <string>): [presence: boolean, value?: string] {
  const flagIndex = argsList.findIndex((argName) => argName === flagName)
  if(flagIndex === -1) return [false]
  const value = argsList[flagIndex + 1]
  if(! value || value.startsWith('-')) return [true]
  return [true, value]
}
