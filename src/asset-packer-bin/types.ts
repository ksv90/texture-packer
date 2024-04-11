import * as v from 'valibot';

import { ConfigSchema } from './schemas';

export type Config = v.Output<typeof ConfigSchema>;