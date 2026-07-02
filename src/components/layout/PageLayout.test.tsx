import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
  it('renders children', () => {
    render(<PageLayout><div>content</div></PageLayout>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
  it('applies immersive full-screen class', () => {
    render(<PageLayout immersive><div>x</div></PageLayout>);
    expect(document.querySelector('main').className).toContain('bg-ink');
  });
});
