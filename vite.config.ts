/// <reference types="vitest/config" />
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { codecovRemixVitePlugin } from '@codecov/remix-vite-plugin';

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true;
  }
}

const isTest = process.env.NODE_ENV === 'test';
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    test: {
      include: ['./app/**/*.test.{ts,tsx}'],
      setupFiles: ['./tests/setup/setup-test-env.ts'],
      // globalSetup: ['./tests/setup/global-setup.ts'],
      restoreMocks: true,
      coverage: {
        include: ['app/**/*.{ts,tsx}'],
        all: true,
      },
    },
    plugins: [
      isTest
        ? null
        : remix({
            future: {
              v3_fetcherPersist: true,
              v3_relativeSplatPath: true,
              v3_throwAbortReason: true,
              v3_singleFetch: true,
              v3_lazyRouteDiscovery: true,
              v3_routeConfig: true,
            },
          }),
      tsconfigPaths(),
      isTest
        ? null
        : sentryVitePlugin({
            org: 'gary-le',
            project: 'homemade-food-app',
            telemetry: false,
          }),
      codecovRemixVitePlugin({
        enableBundleAnalysis: true,
        bundleName: 'homemadefood-remix-bundle',
        uploadToken: env.CODECOV_TOKEN,
      }),
    ],
    build: {
      sourcemap: true,
    },
    envPrefix: 'PUBLIC_',
  };
});
