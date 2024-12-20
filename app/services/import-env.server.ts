import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  quiet: process.env.DEBUG_ENV !== 'true',
  path: ['.env'],
  strict: process.env.NODE_ENV === 'development',
  ignore: process.env.NODE_ENV === 'development' ? undefined : ['MISSING_ENV_FILE'],
  overload: true,
  debug: process.env.DEBUG_ENV === 'true',
});
