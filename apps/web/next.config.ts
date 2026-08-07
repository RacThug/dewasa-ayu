import type { NextConfig } from 'next';

const CEREMONY = '(?<ceremony>pawiwahan|manusa_yadnya|dewa_yadnya|pitra_yadnya|pembangunan|usaha)';
const DATE = '(?<date>\\d{4}-\\d{2}-\\d{2})';

const nextConfig: NextConfig = {
  // Internal workspace packages export raw TypeScript — let Next transpile them.
  transpilePackages: [
    '@dewasa-ayu/types',
    '@dewasa-ayu/constants',
    '@dewasa-ayu/wariga-engine',
    '@dewasa-ayu/ceremony-rules',
  ],

  /**
   * Links from before the path-based rework (#74). These live here rather than in
   * a page because config redirects are resolved in the routing layer: no function
   * runs and no body is sent. Doing the same work with `redirect()` inside a page
   * costs a serverless invocation *and* ships a 13 KB HTML document alongside the
   * 307 — on `/`, which takes most of this site's traffic, that was the single
   * most expensive thing the app did.
   */
  async redirects() {
    return [
      {
        source: '/',
        has: [
          { type: 'query', key: 'ceremony', value: CEREMONY },
          { type: 'query', key: 'date', value: DATE },
        ],
        destination: '/:ceremony/:date',
        permanent: false,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'date', value: DATE }],
        destination: '/pawiwahan/:date',
        permanent: false,
      },
      // No date to honour, so fall through to the ceremony's "today" page.
      {
        source: '/',
        has: [{ type: 'query', key: 'ceremony', value: CEREMONY }],
        destination: '/:ceremony',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
