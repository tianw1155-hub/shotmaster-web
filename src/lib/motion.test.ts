import { describe, it, expect } from 'vitest';
import { EASE, variants, spring } from './motion';

describe('motion', () => {
  it('EASE.editorial is a cubic-bezier array', () => {
    expect(EASE.editorial).toEqual([0.22, 1, 0.36, 1]);
  });
  it('routeIn has initial/animate/exit with opacity', () => {
    expect(variants.routeIn.initial).toHaveProperty('opacity', 0);
    expect(variants.routeIn.animate).toHaveProperty('opacity', 1);
    expect(variants.routeIn.exit).toHaveProperty('opacity', 0);
  });
  it('fadeUp.show translates from y:8 to y:0', () => {
    expect(variants.fadeUp.hidden).toHaveProperty('y', 8);
    expect(variants.fadeUp.show).toHaveProperty('y', 0);
  });
  it('stagger scales delay by index', () => {
    // `Variant` is a framer-motion union incl. TargetResolver (no .transition); narrow to the transition shape.
    const show = (i: number) => variants.stagger(i).show as { transition: { delay: number } };
    expect(show(0).transition.delay).toBe(0);
    expect(show(2).transition.delay).toBe(0.08);
  });
  it('spring has stiffness and damping', () => {
    expect(spring).toHaveProperty('stiffness', 320);
    expect(spring).toHaveProperty('damping', 30);
  });
  it('starPop show uses spring transition', () => {
    expect(variants.starPop.show.transition).toHaveProperty('type', 'spring');
  });
  it('heroImage hidden clips bottom', () => {
    expect((variants.heroImage.hidden as any).clipPath).toBe('inset(0 0 100% 0)');
    expect((variants.heroImage.show as any).clipPath).toBe('inset(0 0 0% 0)');
  });
  it('lineDraw hidden has scaleX 0', () => {
    expect((variants.lineDraw.hidden as any).scaleX).toBe(0);
    expect((variants.lineDraw.show as any).scaleX).toBe(1);
  });
  it('reveal show has scale 1', () => {
    expect((variants.reveal.hidden as any).scale).toBeLessThan(1);
    expect((variants.reveal.show as any).scale).toBe(1);
  });
});
