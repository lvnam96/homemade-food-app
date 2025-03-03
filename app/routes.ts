import { index, route } from '@remix-run/route-config';
import type { RouteConfig } from '@remix-run/route-config';

export default [
  // route('/admin', 'pages/admin/index.tsx'),

  index('pages/home/index.tsx'),

  // APIs
  route('/api/auth', '.server/api/auth/index.ts'),
] satisfies RouteConfig;
