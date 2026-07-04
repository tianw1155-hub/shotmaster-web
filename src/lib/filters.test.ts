import { describe, it, expect } from 'vitest';
import { exposureFilter, wbFilter, isoFilter, isoOverlay, apertureFilter, apertureMask, focalFilter, clamp } from './filters';

describe('filters', () => {
  it('exposure returns CSSProperties with filter', () => {
    expect(exposureFilter(0)).toEqual({ filter: 'brightness(1) saturate(1)' });
    expect(exposureFilter(1).filter).toContain('brightness(1.3)');
  });
  it('wb warm at low K, cool at high K', () => {
    expect(wbFilter(3000).filter).toContain('sepia(');
    expect(wbFilter(3000).filter).toContain('hue-rotate(-'); // negative (warm)
    expect(wbFilter(9000).filter).toContain('hue-rotate(');
    expect(wbFilter(9000).filter).not.toContain('sepia(0.'); // no sepia at cool
  });
  it('iso brighter at high ISO', () => {
    expect(isoFilter(100).filter).toContain('brightness(1)');
    expect(isoFilter(6400).filter).toContain('brightness(1.35)');
  });
  it('isoOverlay scales with ISO', () => {
    expect(isoOverlay(100)).toBe(0);
    expect(isoOverlay(6400)).toBeCloseTo(0.45, 2);
  });
  it('aperture blur + mask', () => {
    expect(apertureFilter(1.4).filter).toContain('blur(8');
    expect(apertureFilter(16).filter).toContain('blur(0px)');
    expect(apertureMask(1.4)).toBe(30); // small sharp center
    expect(apertureMask(16)).toBe(100); // all sharp
  });
  it('focal scale', () => {
    expect(focalFilter(24).transform).toBe('scale(1)');
    expect(focalFilter(200).transform).toContain('scale(1.8)');
  });
  it('clamp', () => {
    expect(clamp(5, -2, 2)).toBe(2);
    expect(clamp(0.7, -2, 2)).toBe(0.7);
  });
});
