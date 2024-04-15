import * as v from 'valibot';

import { ConfigSchema, OutputOptionsSchema } from './schemas';

export type OutputOptions = v.Output<typeof OutputOptionsSchema>;

export type Config = v.Output<typeof ConfigSchema>;
