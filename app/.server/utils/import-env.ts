import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

// NOTE: `@dotenvx/dotenvx` was too heavy

expand(
  config({
    path: ['.env'],
    debug: process.env.DEBUG_ENV === 'true',
  }),
);
