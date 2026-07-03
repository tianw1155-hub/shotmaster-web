import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell';
import { useGameStore } from '../../stores/useGameStore';

vi.mock('../../stores/useGameStore');

beforeEach(() => {
  vi.mocked(useGameStore).mockReturnValue({ user: { isLoggedIn: true, hasCompletedOnboarding: true, avatar: '📷', level: 1, xp: 0, xpToNext: 100, streak: 3 } });
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="/shoot/1" element={<div>shoot</div>} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('shows TopBar and BottomNav on app routes', () => {
    renderAt('/');
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByLabelText('个人中心')).toBeInTheDocument();
    expect(screen.getAllByRole('navigation')).toHaveLength(2);
  });
  it('hides nav on immersive /shoot route', () => {
    renderAt('/shoot/1');
    expect(screen.getByText('shoot')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});