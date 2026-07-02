import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>开始</Button>);
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument();
  });
  it('primary variant uses ink background', () => {
    render(<Button variant="primary">x</Button>);
    expect(screen.getByRole('button').className).toContain('bg-ink');
  });
  it('accent variant uses accent background', () => {
    render(<Button variant="accent">x</Button>);
    expect(screen.getByRole('button').className).toContain('bg-accent');
  });
  it('merges custom className', () => {
    render(<Button className="w-full">x</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });
});