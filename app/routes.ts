import { index, route } from '@remix-run/route-config';
import type { RouteConfig } from '@remix-run/route-config';

export default [
  // route('/admin', 'pages/admin/index.tsx'),

  index('pages/home/index.tsx'),

  // APIs
  route('/api/auth', 'api/auth/index.ts'),
  route('/api/auth/tokens', 'api/auth/refresh-tokens.ts'),
] satisfies RouteConfig;
