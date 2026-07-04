import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhotoScene, type SceneVariant } from './PhotoScene';

const VARIANTS: SceneVariant[] = ['landscape', 'neutral', 'lowlight', 'portrait', 'street'];

describe('PhotoScene', () => {
  it.each(VARIANTS)('renders variant %s as svg role=img with aria-label', (variant) => {
    render(<PhotoScene variant={variant} alt="测试场景" />);
    const img = screen.getByRole('img');
    expect(img.tagName.toLowerCase()).toBe('svg');
    expect(img).toHaveAttribute('aria-label', '测试场景');
  });

  it('passes className + style to the wrapper div', () => {
    const { container } = render(
      <PhotoScene variant="landscape" alt="x" className="w-full h-full" style={{ filter: 'brightness(1.2)' }} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('w-full');
    expect(wrapper.style.filter).toBe('brightness(1.2)');
  });

  it('hides decorative instance when ariaHidden', () => {
    const { container } = render(<PhotoScene variant="portrait" alt="装饰" ariaHidden />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    const svg = wrapper.querySelector('svg');
    expect(svg?.getAttribute('role')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBeNull();
  });
});
