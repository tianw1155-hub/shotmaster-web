import { describe, it, expect } from 'vitest';
import { createConfettiData } from './lottie';
describe('createConfettiData', () => {
  it('returns valid Lottie structure', () => {
    const d = createConfettiData(10);
    expect(d.v).toBe('5.7.4');
    expect(d.layers).toHaveLength(10);
    expect(d.layers[0].ty).toBe(4); // shape layer
    expect(d.layers[0].shapes.length).toBeGreaterThanOrEqual(2); // ellipse + fill
  });
  it('default count 30', () => {
    expect(createConfettiData().layers).toHaveLength(30);
  });
});
