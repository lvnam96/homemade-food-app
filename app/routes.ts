import { index } from '@remix-run/route-config';
import type { RouteConfig } from '@remix-run/route-config';

export default [
  index('pages/home/index.tsx'),
  // route('/hello', 'pages/hello/index.tsx')
] satisfies RouteConfig;
