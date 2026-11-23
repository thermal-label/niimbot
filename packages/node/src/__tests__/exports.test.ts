import { describe, expect, it } from 'vitest';
import * as pkg from '../index.js';

describe('package exports', () => {
  it('re-exports the core registry and media catalog', () => {
    expect(pkg.REGISTRY_NIIMBOT.driver).toBe('niimbot');
    expect(pkg.DEFAULT_MEDIA.key).toBe('B_LABEL_40X30_GAP');
  });
});
