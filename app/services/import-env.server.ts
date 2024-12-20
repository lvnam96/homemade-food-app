import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  quiet: process.env.DEBUG_ENV !== 'true',
  path: ['.env'],
  strict: true,
  overload: true,
  debug: process.env.DEBUG_ENV === 'true',
});
