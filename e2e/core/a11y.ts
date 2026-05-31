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
