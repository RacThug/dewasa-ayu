/**
 * The site's public origin — used for canonical URLs, the sitemap, robots.txt
 * and social share tags.
 *
 * Resolution order:
 *  1. `NEXT_PUBLIC_SITE_URL` — set explicitly once a custom domain is live.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's production domain, injected
 *     automatically on every deployment and available at build *and* runtime.
 *     It follows the custom domain once one is attached.
 *  3. `localhost` — local development only.
 *
 * Step 2 exists so a forgotten env var can never again ship a production
 * sitemap full of `localhost` links (which is exactly what happened on the
 * first deploy). Only local development can reach the localhost fallback.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  // Vercel supplies the bare host, with no protocol scheme.
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
