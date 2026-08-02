# design-sync notes — Dewasa Ayu

This repo is a **CSS/token design system**, not a React component library. The
standard component-centric converter (`package-build.mjs`) does not apply, so the
upload layout is produced **off-script** by `.design-sync/build-bundle.mjs`.

## How it's built

- `node .design-sync/build-bundle.mjs` reads `apps/web/app/globals.css`, splits it
  into `tokens/tokens.css` (the `:root` custom-property blocks) + `_ds_bundle.css`
  (component/layout styles), and emits `styles.css`, an empty-but-valid
  `_ds_bundle.js`, 6 showcase cards, `README.md` (conventions header + index), and
  the `_ds_sync.json` anchor.
- The showcase cards are composed **only from the real class vocabulary** — never
  reimplemented components.
- Validate: `node .ds-sync/package-validate.mjs ./ds-bundle` (stage scripts first:
  `cp -r <skill>/package-validate.mjs <skill>/lib <skill>/storybook .ds-sync/` and
  `npm i playwright` in `.ds-sync/`).
- Render check uses the locally cached chromium via
  `DS_CHROMIUM_PATH=…/ms-playwright/chromium-1223/chrome-win64/chrome.exe`.

## Known render warns (triaged — not new on re-sync)

- `[FONT_REMOTE] "DM Sans", "Cormorant Garamond"` — **expected and intended**. The
  two brand families load via a remote Google Fonts `@import` in `styles.css`
  (identical families to the live app's `next/font`). Non-blocking.

## Re-sync risks (watch-list)

- **Fonts load remotely** from `fonts.googleapis.com`. The Claude Design renderer is
  online so they render correctly, but the bundle is not self-contained. If offline
  fidelity is ever needed, self-host the woff2 files and swap the `@import` for
  `@font-face` (the `next/font` cache under `apps/web/.next/static/media/` has the
  files, but with opaque hashed names — re-fetching from Google Fonts is simpler).
- **The split point** in `build-bundle.mjs` is the literal `* {\n  box-sizing` reset
  in `globals.css`. If that rule is edited away, the tokens/styles split breaks
  (the script exits with an error — fix the marker, don't ignore it).
- **The two font `var()` rewrites** (`--font-cormorant`/`--font-dmsans` → real family
  names) depend on those exact `--serif`/`--sans` definitions in `globals.css`. If
  the font setup in `layout.tsx`/`globals.css` changes, update the rewrites.
- Cards use authentic but **illustrative** Wariga content (dates, scores, wewaran) —
  not engine output. They're design references, not computed results.
