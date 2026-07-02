import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LevelDetailPage } from './LevelDetail';
import { useGameStore } from '../stores/useGameStore';

vi.mock('../stores/useGameStore');

beforeEach(() => {
  vi.mocked(useGameStore).mockReturnValue({
    user: {
      isLoggedIn: true,
      hasCompletedOnboarding: true,
      completedLevels: [],
      levelStars: {},
      level: 1,
    },
    maxUnlockedLevel: 1,
    shootingPlan: {
      scene: { type: '自然风光', description: '拍摄户外自然风景' },
      lighting: { direction: '侧光', quality: '柔和', colorTemp: '暖色', suggestion: '利用黄金时刻' },
      composition: { rule: '三分法', details: '将主体放在交点处' },
      params: { iso: '100', aperture: 'f/8', shutter: '1/125' },
      postProcessing: { style: '自然风格', steps: ['调整曝光', '增强对比度'] },
      equipment: { camera: '全画幅', lens: '24-70mm', accessories: ['三脚架', '偏振镜'] },
    },
    isAnalyzing: false,
    generateShootingPlan: vi.fn(),
    loadLevel: vi.fn(),
    currentLevel: null,
    lastScore: null,
    lastScoreLevelId: null,
    lastCapturedImage: null,
    clearLastScore: vi.fn(),
    toggleLikeDimension: vi.fn(),
    toggleDislikeDimension: vi.fn(),
    getDimensionFeedback: vi.fn().mockReturnValue({ liked: false, disliked: false }),
  });
});

describe('LevelDetailPage', () => {
  it('renders level detail with practice entry', () => {
    render(
      <MemoryRouter initialEntries={['/level/1']}>
        <Routes>
          <Route path="/level/:id" element={<LevelDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('练习曝光')).toBeInTheDocument();
  });
});