import { describe, expect, it } from 'vitest';

import { ENGINE_VERSION, ping } from './index';

describe('wariga-engine package wiring', () => {
  it('exposes a liveness ping', () => {
    expect(ping()).toBe('wariga-engine ok');
  });

  it('declares a semver engine version', () => {
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
