import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { spring } from '../../lib/motion';
import { clamp } from '../../lib/filters';

export type CaptionLevel = 'under' | 'ok' | 'over';
export interface ConceptConfig {
  key: string;
  title: string;
  kicker: string;
  image: { src: string; alt: string };
  param: { name: string; min: number; max: number; step: number; unit: string; default: number };
  filter: (v: number) => CSSProperties;
  readout: (v: number) => { value: string; label: string };
  target: number;
  hitTolerance: number;
  captions: { range: [number, number]; text: string; level: CaptionLevel }[];
  hitToast: string;
  nextConcepts: string[];
}

export function isHit(value: number, c: ConceptConfig): boolean {
  return Math.abs(value - c.target) <= c.hitTolerance;
}

export function captionFor(value: number, c: ConceptConfig): { text: string; level: CaptionLevel } {
  const found = c.captions.find((cap) => value >= cap.range[0] && value < cap.range[1] + 0.0001);
  return { text: found?.text ?? c.captions[0].text, level: found?.level ?? 'ok' };
}

const LEVEL_COLOR: Record<CaptionLevel, string> = {
  under: 'bg-sky',
  ok: 'bg-success',
  over: 'bg-warning',
};

interface Props {
  concept: ConceptConfig;
  onComplete: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function InteractiveLesson({ concept, onComplete }: Props) {
  const [value, setValue] = useState(concept.param.default);
  const [showToast, setShowToast] = useState(false);
  const [comparing, setComparing] = useState(false);

  const hit = isHit(value, concept);
  const cap = captionFor(value, concept);
  const readout = concept.readout(value);
  const targetPct = ((concept.target - concept.param.min) / (concept.param.max - concept.param.min)) * 100;

  const handleChange = useCallback((v: number[]) => {
    const next = v[0];
    setValue(next);
    if (isHit(next, concept)) {
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 2200);
    }
  }, [concept]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onComplete} aria-label="返回" className="w-9 h-9 rounded-full bg-surface-card border border-line flex items-center justify-center text-ink">‹</button>
        <div className="flex-1">
          <div className="text-[10px] tracking-widest uppercase text-accent font-semibold">{concept.kicker}</div>
          <h1 className="font-display text-2xl font-semibold leading-none mt-1">{concept.title}</h1>
        </div>
      </div>

      <div className="relative rounded-md overflow-hidden border border-line mb-4">
        <img src={concept.image.src} alt={concept.image.alt} className="w-full h-72 object-cover transition-[filter] duration-75" style={comparing ? {} : concept.filter(value)} />
        <div className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider text-white bg-black/55 backdrop-blur px-2 py-1 rounded-sm">实时预览</div>
        <div className="absolute bottom-2 right-2 text-right text-white drop-shadow">
          <div className="font-mono text-3xl font-semibold leading-none">{readout.value}</div>
          <div className="text-[10px] tracking-widest uppercase opacity-80">{readout.label}</div>
        </div>
        <button
          onPointerDown={() => setComparing(true)}
          onPointerUp={() => setComparing(false)}
          onPointerLeave={() => setComparing(false)}
          className="absolute bottom-2 left-2 text-[11px] font-semibold bg-surface-card/90 text-ink px-3 py-1.5 rounded-full"
        >
          长按对比原图
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm text-ink-muted">{concept.param.name}</span>
        <span className="text-xs text-accent font-semibold">目标 <span className="font-mono">+{concept.target.toFixed(1)}</span></span>
      </div>

      <Slider.Root
        className="relative flex items-center select-none touch-none h-11"
        value={[value]}
        min={concept.param.min}
        max={concept.param.max}
        step={concept.param.step}
        onValueChange={handleChange}
        aria-label={concept.param.name}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-surface-muted">
          <Slider.Range className={`absolute h-full rounded-full ${hit ? 'bg-accent' : 'bg-ink'}`} />
        </Slider.Track>
        <div className="absolute top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent rounded-sm" style={{ left: `${targetPct}%` }} />
        <Slider.Thumb className={`block w-7 h-7 rounded-full border-4 border-surface-card shadow-elevated focus-visible:outline-none focus-visible:shadow-focus ${hit ? 'bg-accent' : 'bg-ink'}`} />
      </Slider.Root>

      <div className="mt-4 flex items-start gap-2 min-h-[36px]">
        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${LEVEL_COLOR[cap.level]}`}>i</span>
        <span className="text-sm text-ink-secondary leading-snug">{cap.text}</span>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={spring}
            className="mt-3 flex items-center gap-2 bg-ink text-surface rounded-md px-4 py-3 text-sm"
          >
            <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center"><Check className="w-3 h-3" /></span>
            {concept.hitToast}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onComplete} disabled={!hit} className="mt-6 w-full py-3.5 rounded-md bg-ink text-surface font-semibold disabled:opacity-40">
        完成练习
      </button>
    </div>
  );
}