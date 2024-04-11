import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { toJSONSchema } from '@gcornut/valibot-json-schema';

import { ConfigSchema } from '../src/asset-packer-bin/schemas.js';

const SCHEMAS_DIRECTORY = 'schemas';
const FILE_NAME = 'config-schema.json';

const json = toJSONSchema({ schema: ConfigSchema });
const jsonFile = globalThis.JSON.stringify(json);
await mkdir(SCHEMAS_DIRECTORY, { recursive: true });
await writeFile(path.join(SCHEMAS_DIRECTORY, FILE_NAME), jsonFile);
