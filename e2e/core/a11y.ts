/**
 * PORTABLE E2E CORE — accessibility gate.
 * Runs axe-core filtered to WCAG 2.0/2.1 A & AA, fails the test on any
 * serious/critical violation, and prints a readable summary.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING = new Set(['serious', 'critical']);

export async function checkA11y(page: Page, opts?: { disableRules?: string[] }): Promise<void> {
  // Let the page settle so axe reads its final, fully-styled state — not a
  // frame mid-render or mid entrance-animation. Under heavy parallel load this
  // is what prevents false color-contrast positives. We: (1) disable CSS
  // animations/transitions so elements sit at their resting (end) state,
  // (2) wait for network idle, (3) fast-forward script-driven animations, and
  // (4) wait for web fonts + a painted frame.
  await page.addStyleTag({
    content:
      '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }',
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    // The CSS override above only reaches animations the stylesheet owns.
    // Script-driven ones (Framer Motion, GSAP, anything on the Web Animations
    // API) ignore it entirely, so axe can sample an element mid-fade and report
    // the blended color as a contrast failure — a false positive that moves with
    // machine load. Jumping each finite animation to its end state is both
    // faster and more deterministic than waiting one out.
    const finite = document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity);
    for (const a of finite) {
      try {
        a.finish();
      } catch {
        // Unresolved/zero-duration effects throw; they have no midpoint to catch.
      }
    }
    await Promise.allSettled(finite.map((a) => a.finished));

    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });

  let builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS);
  if (opts?.disableRules?.length) builder = builder.disableRules(opts.disableRules);
  const { violations } = await builder.analyze();
  const blocking = violations.filter((v) => BLOCKING.has(v.impact ?? ''));
  const summary = blocking
    .map(
      (v) => `  • [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.helpUrl}`,
    )
    .join('\n');
  expect(blocking, `A11y violations (serious/critical):\n${summary}`).toEqual([]);
}
