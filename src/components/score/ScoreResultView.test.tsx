import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ScoreResultView } from './ScoreResultView';

const score = { overall: 80, stars: 2 as const, composition: 80, lighting: 70, color: 75, similarity: 60, feedback: ['加强构图'] };

describe('ScoreResultView', () => {
  it('renders stars, total, feedback', () => {
    render(
      <MemoryRouter>
        <ScoreResultView score={score} capturedImage="data:," referenceImage={{ url: 'ref', title: 'r' }} onRetake={() => {}} onNext={() => {}} onHome={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/总分/)).toBeInTheDocument();
    expect(screen.getByText('加强构图')).toBeInTheDocument();
  });
});