import { readFile } from "node:fs/promises";

import { BaseSchema, parse } from "valibot";

export async function getJsonFile<TData>(filePath: string, schema: BaseSchema<TData>): Promise<TData> {
  const configFile = await readFile(filePath, {encoding: 'utf-8'})
  const data: unknown = globalThis.JSON.parse(configFile)
  return parse(schema, data)
}