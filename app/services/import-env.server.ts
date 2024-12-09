import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  path: ['.env'],
  // strict: true,
  overload: true,
  debug: process.env.DEBUG_ENV === 'true',
});
