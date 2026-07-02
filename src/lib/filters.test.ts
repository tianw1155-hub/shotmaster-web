import { describe, it, expect } from 'vitest';
import { exposureFilter, clamp } from './filters';

describe('filters', () => {
  it('exposure at 0 is neutral', () => {
    expect(exposureFilter(0)).toBe('brightness(1) saturate(1)');
  });
  it('exposure +1 brightens to 1.3', () => {
    expect(exposureFilter(1)).toContain('brightness(1.3)');
  });
  it('exposure -2 darkens to 0.4', () => {
    expect(exposureFilter(-2)).toContain('brightness(0.4)');
  });
  it('exposure reduces saturation at extremes', () => {
    expect(exposureFilter(2)).toContain('saturate(0.88)');
    expect(exposureFilter(0)).toContain('saturate(1)');
  });
  it('clamp bounds a value', () => {
    expect(clamp(5, -2, 2)).toBe(2);
    expect(clamp(-5, -2, 2)).toBe(-2);
    expect(clamp(0.7, -2, 2)).toBe(0.7);
  });
});
