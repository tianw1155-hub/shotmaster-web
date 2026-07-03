import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useGameStore } from '../../stores/useGameStore';

vi.mock('../../stores/useGameStore');
beforeEach(() => {
  vi.mocked(useGameStore).mockReturnValue({ user: { isLoggedIn: true, hasCompletedOnboarding: true, avatar: '摄', level: 3, xp: 128, xpToNext: 240, streak: 7 } } as any);
});

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Sidebar /></MemoryRouter>);
}
describe('Sidebar', () => {
  it('renders brand and nav', () => {
    renderAt('/');
    expect(screen.getByText('ShotMaster')).toBeInTheDocument();
    expect(screen.getByText('闯关')).toBeInTheDocument();
    expect(screen.getByText('学习')).toBeInTheDocument();
  });
  it('marks active item', () => {
    renderAt('/learn');
    const learn = screen.getByText('学习').closest('a')!;
    expect(learn.className).toContain('on');
  });
});
