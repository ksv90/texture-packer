import * as v from 'valibot';

import { AssetCacheSchema, ConfigSchema, OutputOptionsSchema } from './schemas';

export type OutputOptions = v.Output<typeof OutputOptionsSchema>;

export type Config = v.Output<typeof ConfigSchema>;

export type AssetCache = v.Output<typeof AssetCacheSchema>;
