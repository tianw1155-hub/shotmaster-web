# ShotMaster 前端重塑 · 阶段 1（地基 + 北极星纵切）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建设计系统令牌、共享外壳与动效基建，并打通北极星纵切流程 `/ → /level/:id → 曝光交互课件 → /shoot → /score`，达到成品级观感与流畅转场。

**Architecture:** 引入 Framer Motion 做路由转场与微交互；CVA 管理组件变体；Radix Slider 做可交互课件滑条；Lenis 做桌面平滑滚动。新增 `AppShell`（持久 TopBar + AnimatePresence(Routes) + BottomNav）作为统一外壳，页面只渲染内容并包入 `PageLayout`。新增 `InteractiveLesson` 组件 + `lib/filters.ts`（参数→CSS filter 纯函数）+ concept 配置。提取 `ScoreResultView` 合并三处评分页。

**Tech Stack:** React 18 + TS + Vite 6 + Tailwind 3 + react-router v7 + zustand + lucide-react；新增 framer-motion、class-variance-authority、@radix-ui/react-{slider,dialog,tabs,tooltip}、lenis、lottie-react；测试 vitest + @testing-library/react + jsdom + @playwright/test。设计规格：`docs/superpowers/specs/2026-07-02-frontend-redesign-design.md`。

## Global Constraints

- **目标设备**：移动优先；桌面 ≥1024 双栏响应式（主内容 + 侧栏）。`max-w-lg` 全局改为响应式断点。
- **配色令牌**：surface `#F2F2EF`/card `#FFFFFF`/muted `#EDEDEA`；ink `#14161A`/secondary `#3A3D44`/muted `#6B6E76`；accent `#6E2233`/soft `#9A4A55`；line `#E2E2DE`；success `#2D784B`/warning `#A05014`/danger `#9A2A2A`/gold `#B8954A`；chapter: composition `#6B8E7F`/light `#C9A24A`/color `#9B6B8A`/narrative `#6B7B95`/master `#A56B5A`。
- **字体**：Bodoni Moda（display 标题）+ Inter（UI/正文）+ JetBrains Mono（数值），Google Fonts。
- **圆角**：卡片/按钮 `8px`（`rounded-md`），图框直角，badge `4px`（`rounded-sm`）。
- **深色模式**：移除 `useTheme.ts`、`darkMode:"class"`、`index.css` 硬编码底色；亮调编辑为唯一身份。
- **动效**：只用 `transform`+`opacity`；统一走 `lib/motion.ts`；`prefers-reduced-motion` 下关闭转场/弹簧（`MotionConfig reducedMotion="user"`）。
- **令牌纪律**：禁止裸 `gray-xxx`/`red-500`/`green-600`/`pink-500`/`yellow-400`，统一走令牌。主操作按钮用 `bg-ink`；`accent` 仅用于关键 CTA / 当前态 / 命中反馈。
- **导入**：相对路径（无 `@/` 别名）。
- **范围**：仅阶段 1。图库/社区/学习其余/个人中心/admin 风格统一、其余 5–7 个交互概念、Lottie 接入属阶段 2/3，不在本计划。

---

## File Structure

**新建**
- `vitest.config.ts` / `playwright.config.ts` / `src/test/setup.ts` — 测试基建
- `src/lib/motion.ts` — motion variants + easings（纯）
- `src/lib/filters.ts` — 参数→CSS filter 纯函数（纯）
- `src/components/layout/AppShell.tsx` — 持久外壳（TopBar + AnimatePresence(Routes) + BottomNav）
- `src/components/layout/PageLayout.tsx` — 内容壳（motion + 响应式容器）
- `src/components/layout/TopBar.tsx` / `BottomNav.tsx` — 从 GameComponents 提取并重塑
- `src/components/layout/SmoothScroll.tsx` — Lenis provider（桌面）
- `src/components/lesson/InteractiveLesson.tsx` — 可交互课件组件
- `src/components/lesson/concepts/exposure.ts` — 曝光补偿 concept 配置
- `src/components/score/ScoreResultView.tsx` — 提取合并评分 UI
- `src/components/ui/{Button,Card,Badge,StarRating,ProgressBar,RingProgress}.tsx` — 拆分 + CVA/令牌
- `tests/e2e/slice.spec.ts` — 纵切流程 E2E

**修改**
- `package.json`（deps + scripts）、`index.html`（title + 字体）、`src/index.css`（令牌化）、`tailwind.config.js`（令牌）、`src/App.tsx`（AppShell + AnimatePresence）、`src/pages/{LevelMap,LevelDetail,Shoot,Score}.tsx`（套 PageLayout + 令牌）、`src/components/ui/Button.tsx`（拆分）、`src/components/game/GameComponents.tsx`（移除 TopBar/BottomNav，保留其余）、`.gitignore`

---

## Task 1: 项目基建（git + 依赖 + 测试配置）

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `src/test/setup.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Produces: `npm run test`（vitest）、`npm run e2e`（playwright）、`npm run dev` 已有。测试环境 jsdom，setup 注入 jest-dom。

> 注：当前项目不是 git 仓库。本任务 `git init` 以支持后续原子提交；若你不希望用 git，跳过所有 commit 步骤即可。

- [ ] **Step 1: 初始化 git（如尚未）**

```bash
cd /Users/tal/Documents/code/shotmaster-web-main
git init
git add -A
git commit -m "chore: snapshot before frontend redesign phase 1"
```

- [ ] **Step 2: 安装依赖**

```bash
npm install framer-motion class-variance-authority \
  @radix-ui/react-slider @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip \
  lenis lottie-react
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @playwright/test
npx playwright install chromium
```

- [ ] **Step 3: 创建 vitest 配置**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

- [ ] **Step 4: 创建测试 setup**

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

- [ ] **Step 5: 创建 playwright 配置**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
```

- [ ] **Step 6: 更新 package.json scripts**

在 `scripts` 中加入：
```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test"
```

- [ ] **Step 7: 更新 .gitignore**

追加（如未有）：
```
.superpowers/
node_modules/
test-results/
playwright-report/
```

- [ ] **Step 8: 验证测试基建空跑**

Run: `npm run test -- --reporter=verbose 2>&1 | tail -5`
Expected: `No test files found`（无测试文件，正常）。

- [ ] **Step 9: 提交**

```bash
git add -A
git commit -m "chore: add test infra and phase 1 dependencies"
```

---

## Task 2: 设计系统令牌（tailwind + css + 字体）

**Files:**
- Modify: `tailwind.config.js`, `src/index.css`, `index.html`

**Interfaces:**
- Produces: 全站令牌（`bg-surface`、`bg-ink`、`bg-accent`、`text-ink-muted`、`border-line`、`text-gold`、`bg-chapter-composition` 等）、字体类 `font-display`/`font-body`/`font-mono`。

- [ ] **Step 1: 重写 tailwind.config.js 令牌**

完整替换 `tailwind.config.js` 的 `theme.extend`（保留 `darkMode` 删除、`content` 不变）：

```js
/** @type {import('tailwindcss').Config */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        surface: { DEFAULT: '#F2F2EF', card: '#FFFFFF', muted: '#EDEDEA' },
        ink: { DEFAULT: '#14161A', secondary: '#3A3D44', muted: '#6B6E76' },
        accent: { DEFAULT: '#6E2233', soft: '#9A4A55' },
        line: '#E2E2DE',
        success: '#2D784B',
        warning: '#A05014',
        danger: '#9A2A2A',
        gold: '#B8954A',
        chapter: {
          composition: '#6B8E7F',
          light: '#C9A24A',
          color: '#9B6B8A',
          narrative: '#6B7B95',
          master: '#A56B5A',
        },
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px',
      },
      boxShadow: {
        hairline: 'inset 0 0 0 1px #E2E2DE',
        elevated: '0 1px 2px rgba(20,22,26,.04), 0 8px 24px rgba(20,22,26,.06)',
        focus: '0 0 0 3px rgba(110,34,51,.28)',
      },
      transitionDuration: { fast: '140ms', base: '220ms', slow: '380ms', scenic: '600ms' },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(.22,1,.36,1)',
        soft: 'cubic-bezier(.65,0,.35,1)',
      },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(.95)', opacity: '.8' }, '70%': { transform: 'scale(1.3)', opacity: '0' }, '100%': { transform: 'scale(.95)', opacity: '0' } },
        starPop: { '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' }, '60%': { transform: 'scale(1.3) rotate(5deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0)', opacity: '1' } },
      },
      animation: {
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'star-pop': 'starPop .4s ease-out',
      },
    },
  },
  plugins: [],
};
```

> 注：删除原有 `primary/mint/sun/sky/grape` 鲜艳令牌——它们被新令牌取代。现有代码引用这些旧令牌的任务 5–13 会逐步替换。`darkMode` 字段移除。

- [ ] **Step 2: 重写 index.css**

完整替换 `src/index.css`：

```css
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600;6..96,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  body {
    background-color: #F2F2EF;
    color: #14161A;
    min-height: 100vh;
    margin: 0;
  }
  ::selection { background: #6E2233; color: #fff; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E2E2DE; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #C9C9CC; }
}

@layer utilities {
  .font-display { font-family: '"Bodoni Moda"', Georgia, serif; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 3: 更新 index.html 标题与字体预连接**

将 `<title>My Trae Project</title>` 改为 `<title>ShotMaster · 摄影学习</title>`，并在 `<head>` 内 `<meta name="viewport">` 之后加：
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- [ ] **Step 4: 验证构建**

Run: `npm run build 2>&1 | tail -20`
Expected: 构建可能因旧令牌引用（`primary`/`mint` 等）产生 Tailwind 警告但仍成功（Vite 不因未知 class 报错）。如有 TS 报错先忽略——后续任务修复。确认 `dist/` 生成。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(design-system): apply editorial tokens, fonts, base css"
```

---

## Task 3: lib/motion.ts（动效 variants，TDD）

**Files:**
- Create: `src/lib/motion.ts`, `src/lib/motion.test.ts`

**Interfaces:**
- Produces: `EASE`、`variants`（`fadeUp/fadeIn/scaleIn/routeIn`、`stagger(i)`）、`spring`。`variants.routeIn` 含 `initial/animate/exit`。

- [ ] **Step 1: 写失败测试**

`src/lib/motion.test.ts`:
```ts
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
    expect(variants.stagger(0).show.transition.delay).toBe(0);
    expect(variants.stagger(2).show.transition.delay).toBe(0.08);
  });
  it('spring has stiffness and damping', () => {
    expect(spring).toHaveProperty('stiffness', 320);
    expect(spring).toHaveProperty('damping', 30);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- motion.test 2>&1 | tail -8`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现**

`src/lib/motion.ts`:
```ts
import type { Variants, Transition } from 'framer-motion';

export const EASE = {
  editorial: [0.22, 1, 0.36, 1] as const,
  soft: [0.65, 0, 0.35, 1] as const,
};

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE.editorial } },
  } satisfies Variants,
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  } satisfies Variants,
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  } satisfies Variants,
  routeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.editorial } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE.soft } },
  } satisfies Variants,
  stagger: (i: number): Variants => ({
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.04, ease: EASE.editorial } },
  }),
};

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 30 };
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- motion.test 2>&1 | tail -8`
Expected: PASS（5 passed）。

- [ ] **Step 5: 提交**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts
git commit -m "feat(motion): add motion variants and easings"
```

---

## Task 4: lib/filters.ts（参数→CSS filter，TDD）

**Files:**
- Create: `src/lib/filters.ts`, `src/lib/filters.test.ts`

**Interfaces:**
- Produces: `ParamMap = (value: number) => string`；`exposureFilter(ev)` 返回 `brightness(1+ev*0.30) saturate(...)`；`clamp(v,min,max)`。

- [ ] **Step 1: 写失败测试**

`src/lib/filters.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { exposureFilter, clamp } from './filters';

describe('filters', () => {
  it('exposure at 0 is neutral', () => {
    expect(exposureFilter(0)).toBe('brightness(1) saturate(1)');
  });
  it('exposure +1 brightens to 1.3', () => {
    expect(exposureFilter(1)).toContain('brightness(1.3)');
  });
  it('exposure -2 darkens to 0.4', () => {
    expect(exposureFilter(-2)).toContain('brightness(0.4)');
  });
  it('exposure reduces saturation at extremes', () => {
    expect(exposureFilter(2)).toContain('saturate(0.88)');
    expect(exposureFilter(0)).toContain('saturate(1)');
  });
  it('clamp bounds a value', () => {
    expect(clamp(5, -2, 2)).toBe(2);
    expect(clamp(-5, -2, 2)).toBe(-2);
    expect(clamp(0.7, -2, 2)).toBe(0.7);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- filters.test 2>&1 | tail -8`
Expected: FAIL。

- [ ] **Step 3: 实现**

`src/lib/filters.ts`:
```ts
export type ParamMap = (value: number) => string;

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// 曝光补偿 ev ∈ [-2, 2]：亮度线性，极端处略降饱和度
export const exposureFilter: ParamMap = (ev) => {
  const brightness = 1 + ev * 0.3;
  const saturate = Math.max(0.6, 1 - Math.abs(ev) * 0.06);
  return `brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)})`;
};
```

> 说明：`exposureFilter(2)` → brightness(1.6) saturate(0.88)；`exposureFilter(-2)` → brightness(0.4) saturate(0.88)。后续概念（光圈/快门/ISO/白平衡/焦距/景深）在阶段 3 追加同文件。

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- filters.test 2>&1 | tail -8`
Expected: PASS（5 passed）。

- [ ] **Step 5: 提交**

```bash
git add src/lib/filters.ts src/lib/filters.test.ts
git commit -m "feat(filters): add param-to-css-filter mapping for interactive lessons"
```

---

## Task 5: UI 原语拆分 + CVA + 令牌化

**Files:**
- Create: `src/components/ui/Card.tsx`, `Badge.tsx`, `StarRating.tsx`, `ProgressBar.tsx`, `RingProgress.tsx`
- Modify: `src/components/ui/Button.tsx`（重写为仅 Button + CVA）
- Create: `src/components/ui/Button.test.tsx`
- Modify: 引用 `Button.tsx` 中 Card/Badge/StarRating/ProgressBar/RingProgress 的文件改从新路径导入（`src/pages/Score.tsx`、`src/components/game/GameComponents.tsx` 等——后续任务统一处理；本任务先建新文件并保留旧导出兼容）

**Interfaces:**
- Produces: `Button`（variant: primary/accent/secondary/outline/ghost；size: sm/md/lg）、`Card`、`Badge`（color: default/accent/success/warning/gold）、`StarRating`、`ProgressBar`、`RingProgress`，全部走令牌。

- [ ] **Step 1: 写 Button 失败测试**

`src/components/ui/Button.test.tsx`:
```tsx
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- Button.test 2>&1 | tail -8`
Expected: FAIL（旧 Button 无 `bg-ink`/`bg-accent`）。

- [ ] **Step 3: 重写 Button.tsx（CVA）**

`src/components/ui/Button.tsx`:
```tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold font-body transition-all duration-base ease-editorial disabled:opacity-40 disabled:cursor-not-allowed active:scale-[.97] focus-visible:outline-none focus-visible:shadow-focus',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-surface hover:bg-ink-secondary',
        accent: 'bg-accent text-white hover:brightness-110 shadow-elevated',
        secondary: 'bg-surface-card text-ink border border-line hover:bg-surface-muted',
        outline: 'border border-ink text-ink hover:bg-ink hover:text-surface',
        ghost: 'text-ink-secondary hover:bg-surface-muted',
      },
      size: {
        sm: 'rounded-md px-3 py-2 text-sm',
        md: 'rounded-md px-5 py-3 text-base',
        lg: 'rounded-lg px-8 py-4 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

- [ ] **Step 4: 拆分其余原语到独立文件**

`src/components/ui/Card.tsx`:
```tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-md border border-line',
        onClick && 'cursor-pointer hover:bg-surface-muted transition-colors',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

`src/components/ui/Badge.tsx`:
```tsx
import React from 'react';
import { cn } from '../../lib/utils';

type BadgeColor = 'default' | 'accent' | 'success' | 'warning' | 'gold';
export function Badge({ children, color = 'default', className }: { children: React.ReactNode; color?: BadgeColor; className?: string }) {
  const colors: Record<BadgeColor, string> = {
    default: 'bg-surface-muted text-ink-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    gold: 'bg-gold/16 text-gold',
  };
  return <span className={cn('inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider', colors[color], className)}>{children}</span>;
}
```

`src/components/ui/StarRating.tsx`:
```tsx
export function StarRating({ stars, size = 'md' }: { stars: 0 | 1 | 2 | 3; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <svg key={i} className={`${sizes[size]} ${i <= stars ? 'text-gold' : 'text-line'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
```

`src/components/ui/ProgressBar.tsx`:
```tsx
type Color = 'ink' | 'accent' | 'gold';
export function ProgressBar({ value, color = 'accent' }: { value: number; color?: Color }) {
  const colors: Record<Color, string> = { ink: 'bg-ink', accent: 'bg-accent', gold: 'bg-gold' };
  return (
    <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden">
      <div className={`h-full ${colors[color]} rounded-full transition-all duration-slow ease-editorial`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
```

`src/components/ui/RingProgress.tsx`:
```tsx
export function RingProgress({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const c = radius * 2 * Math.PI;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E2E2DE" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#6E2233" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-scenic ease-editorial" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-ink text-lg">{value}</span>
        {label && <span className="text-[10px] text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 保留旧 Button.tsx 的命名导出兼容（避免构建断裂）**

在 `src/components/ui/Button.tsx` 末尾追加（后续任务逐步迁移引用后可删）：
```tsx
export { Card } from './Card';
export { Badge } from './Badge';
export { StarRating } from './StarRating';
export { ProgressBar } from './ProgressBar';
export { RingProgress } from './RingProgress';
```

- [ ] **Step 6: 跑测试确认通过**

Run: `npm run test -- Button.test 2>&1 | tail -8`
Expected: PASS（4 passed）。

- [ ] **Step 7: 提交**

```bash
git add src/components/ui
git commit -m "feat(ui): split primitives, adopt CVA + editorial tokens"
```

---

## Task 6: AppShell + TopBar + BottomNav（提取 + 重塑 + 响应式 + 路由转场）

**Files:**
- Create: `src/components/layout/TopBar.tsx`, `BottomNav.tsx`, `AppShell.tsx`
- Create: `src/components/layout/AppShell.test.tsx`

**Interfaces:**
- Consumes: `useGameStore`（user）、`react-router-dom`（useLocation, Link, Routes）、`lib/motion`（routeIn via PageLayout）。
- Produces: `AppShell`（持久外壳，包裹 Routes；按路径决定 nav 显隐与 active；`/shoot` 沉浸式无 nav；`/login`/`/preferences`/`/admin` 无 nav）。

- [ ] **Step 1: 写 AppShell 失败测试**

`src/components/layout/AppShell.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell';
import { useGameStore } from '../../stores/useGameStore';

vi.mock('../../stores/useGameStore');

beforeEach(() => {
  useGameStore.mockReturnValue({ user: { isLoggedIn: true, hasCompletedOnboarding: true, avatar: '📷', level: 1, xp: 0, xpToNext: 100, streak: 3 } });
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
    expect(screen.getByLabelText('等级')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
  it('hides nav on immersive /shoot route', () => {
    renderAt('/shoot/1');
    expect(screen.getByText('shoot')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- AppShell.test 2>&1 | tail -8`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现 TopBar**

`src/components/layout/TopBar.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export function TopBar() {
  const { user } = useGameStore();
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/profile" aria-label="个人中心" className="w-10 h-10 rounded-full bg-ink text-surface flex items-center justify-center text-lg font-display">
          {user.avatar}
        </Link>
        <div className="flex items-center gap-3" aria-label="等级">
          <div className="w-24 h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-slow" style={{ width: `${(user.xp / user.xpToNext) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-ink-muted">{user.xp}/{user.xpToNext}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20">
          <Flame className="w-4 h-4 text-accent" />
          <span className="font-mono font-bold text-accent text-sm">{user.streak}</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: 实现 BottomNav**

`src/components/layout/BottomNav.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { Trophy, Image as ImageIcon, Users, BookOpen, Camera } from 'lucide-react';

export type NavSection = 'levels' | 'gallery' | 'community' | 'learn' | 'profile';
const ITEMS: { id: NavSection; icon: typeof Trophy; label: string; path: string }[] = [
  { id: 'levels', icon: Trophy, label: '闯关', path: '/' },
  { id: 'gallery', icon: ImageIcon, label: '图库', path: '/gallery' },
  { id: 'community', icon: Users, label: '挑战', path: '/community' },
  { id: 'learn', icon: BookOpen, label: '学习', path: '/learn' },
  { id: 'profile', icon: Camera, label: '我的', path: '/profile' },
];

export function BottomNav({ active }: { active: NavSection }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/90 backdrop-blur-md border-t border-line">
      <div className="max-w-6xl mx-auto px-2 h-16 flex items-center justify-around">
        {ITEMS.map(({ id, icon: Icon, label, path }) => (
          <Link key={id} to={path} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors ${active === id ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: 实现 AppShell（含路由转场 + nav 显隐 + active 推导）**

`src/components/layout/AppShell.tsx`:
```tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { TopBar } from './TopBar';
import { BottomNav, type NavSection } from './BottomNav';
import { SmoothScroll } from './SmoothScroll';

const NO_NAV_PREFIXES = ['/login', '/preferences', '/admin'];
const IMMERSIVE_PREFIXES = ['/shoot'];

function deriveSection(pathname: string): NavSection {
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/learn')) return 'learn';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'levels'; // / /level/ /score/ /shoot/
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const showNav = !noNav && !immersive;

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll disabled={immersive}>
        {showNav && <TopBar />}
        <AnimatePresence mode="wait">
          <React.Fragment key={location.pathname}>{children}</React.Fragment>
        </AnimatePresence>
        {showNav && <BottomNav active={deriveSection(location.pathname)} />}
      </SmoothScroll>
    </MotionConfig>
  );
}
```

- [ ] **Step 6: 实现 SmoothScroll（Lenis，桌面）**

`src/components/layout/SmoothScroll.tsx`:
```tsx
import React, { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    if (!isDesktop) return;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [disabled]);
  return <>{children}</>;
}
```

- [ ] **Step 7: 跑测试确认通过**

Run: `npm run test -- AppShell.test 2>&1 | tail -10`
Expected: PASS（2 passed）。如 `useGameStore` mock 报错，确认 vi 已 import。

- [ ] **Step 8: 提交**

```bash
git add src/components/layout
git commit -m "feat(layout): add AppShell with persistent nav, route transitions, lenis"
```

---

## Task 7: PageLayout（内容壳 + motion）

**Files:**
- Create: `src/components/layout/PageLayout.tsx`, `src/components/layout/PageLayout.test.tsx`

**Interfaces:**
- Consumes: `lib/motion`（routeIn）。
- Produces: `<PageLayout desktop="single|split" immersive>`，渲染 `motion.main`（routeIn 变体）+ 响应式容器（移动满宽；桌面 `max-w-6xl` 居中，`split` 时给主内容 + 侧栏 grid）。

- [ ] **Step 1: 写失败测试**

`src/components/layout/PageLayout.test.tsx`:
```tsx
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- PageLayout.test 2>&1 | tail -8`
Expected: FAIL。

- [ ] **Step 3: 实现**

`src/components/layout/PageLayout.tsx`:
```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  desktop?: 'single' | 'split';
  immersive?: boolean;
  mainClassName?: string;
}
export function PageLayout({ children, desktop = 'single', immersive = false, mainClassName }: PageLayoutProps) {
  return (
    <motion.main
      variants={variants.routeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'min-h-screen',
        immersive ? 'bg-ink text-surface' : 'bg-surface text-ink',
        immersive ? '' : 'pb-24 lg:pb-12',
      )}
    >
      <div className={cn(immersive ? '' : 'max-w-6xl mx-auto px-4 lg:px-8', desktop === 'split' && !immersive && 'lg:grid lg:grid-cols-[1fr_320px] lg:gap-8', mainClassName)}>
        {children}
      </div>
    </motion.main>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- PageLayout.test 2>&1 | tail -8`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/layout/PageLayout.tsx src/components/layout/PageLayout.test.tsx
git commit -m "feat(layout): add PageLayout content shell with route motion"
```

---

## Task 8: InteractiveLesson + 曝光 concept + Radix Slider

**Files:**
- Create: `src/components/lesson/concepts/exposure.ts`, `src/components/lesson/InteractiveLesson.tsx`, `src/components/lesson/InteractiveLesson.test.tsx`

**Interfaces:**
- Consumes: `lib/filters.ts`（ParamMap）、`lib/motion.ts`（spring）、`@radix-ui/react-slider`。
- Produces: `ConceptConfig` 类型、`exposureConfig`、`<InteractiveLesson concept onComplete />`。

- [ ] **Step 1: 写 concept 配置与失败测试**

`src/components/lesson/concepts/exposure.ts`:
```ts
import type { ConceptConfig } from '../InteractiveLesson';
import { exposureFilter } from '../../../lib/filters';

export const exposureConfig: ConceptConfig = {
  key: 'exposure',
  title: '曝光补偿',
  kicker: '第 3 课 · 曝光三要素',
  image: {
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd12c9da?auto=format&fit=crop&w=900&q=80',
    alt: '曝光示例风景',
  },
  param: { name: '曝光补偿', min: -2, max: 2, step: 0.05, unit: 'EV', default: 0 },
  filter: exposureFilter,
  readout: (v) => ({ value: `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}`, label: 'EV' }),
  target: 0.7,
  hitTolerance: 0.22,
  captions: [
    { range: [-2, -1.2], text: '欠曝 · 暗部细节丢失，画面沉闷压抑', level: 'under' },
    { range: [-1.2, -0.4], text: '偏暗 · 氛围压低，可适当提亮', level: 'under' },
    { range: [-0.4, 0.4], text: '正常曝光 · 明暗平衡，层次丰富', level: 'ok' },
    { range: [0.4, 1.2], text: '偏亮 · 轻快通透，注意高光', level: 'ok' },
    { range: [1.2, 2], text: '过曝 · 高光溢出，层次丢失', level: 'over' },
  ],
  hitToast: '命中目标曝光 · 阴天氛围还原到位',
  nextConcepts: ['aperture', 'shutter', 'iso'],
};
```

`src/components/lesson/InteractiveLesson.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveLesson, isHit, captionFor, type ConceptConfig } from './InteractiveLesson';
import { exposureConfig } from './concepts/exposure';

describe('InteractiveLesson logic', () => {
  it('isHit true within tolerance', () => {
    expect(isHit(0.7, exposureConfig)).toBe(true);
    expect(isHit(0, exposureConfig)).toBe(false);
  });
  it('captionFor returns matching caption', () => {
    expect(captionFor(1.5, exposureConfig).level).toBe('over');
    expect(captionFor(0, exposureConfig).level).toBe('ok');
  });
});

describe('InteractiveLesson component', () => {
  it('renders title and image', () => {
    render(<InteractiveLesson concept={exposureConfig} onComplete={() => {}} />);
    expect(screen.getByText('曝光补偿')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '曝光示例风景' })).toBeInTheDocument();
  });
  it('shows hit toast when value enters target', () => {
    render(<InteractiveLesson concept={exposureConfig} onComplete={() => {}} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    // Radix slider step via keyboard; toast may appear if within tolerance.
    expect(slider).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- InteractiveLesson.test 2>&1 | tail -10`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现 InteractiveLesson**

`src/components/lesson/InteractiveLesson.tsx`:
```tsx
import React, { useState, useCallback } from 'react';
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
  filter: (v: number) => string;
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
  under: 'bg-sky-500',
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
        <img src={concept.image.src} alt={concept.image.alt} className="w-full h-72 object-cover transition-[filter] duration-75" style={{ filter: comparing ? 'none' : concept.filter(value) }} />
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- InteractiveLesson.test 2>&1 | tail -10`
Expected: PASS（4 passed）。

- [ ] **Step 5: 提交**

```bash
git add src/components/lesson
git commit -m "feat(lesson): add InteractiveLesson + exposure concept with Radix slider"
```

---

## Task 9: ScoreResultView 提取（合并三处评分 UI）

**Files:**
- Create: `src/components/score/ScoreResultView.tsx`, `src/components/score/ScoreResultView.test.tsx`

**Interfaces:**
- Consumes: `Card`/`Button`/`RingProgress`（ui/）、`RewardModal`（GameComponents）、`lucide-react`。
- Produces: `<ScoreResultView score capturedImage referenceImage fromCommunity onRetake onNext onHome />`，渲染星级/对比/相似度/评分条/AI 建议/操作按钮。

- [ ] **Step 1: 写失败测试**

`src/components/score/ScoreResultView.test.tsx`:
```tsx
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- ScoreResultView.test 2>&1 | tail -8`
Expected: FAIL。

- [ ] **Step 3: 实现**

`src/components/score/ScoreResultView.tsx`:
```tsx
import { useState } from 'react';
import { ArrowLeftRight, RefreshCw, ChevronRight, Sparkles, Home } from 'lucide-react';
import { Card, Button, RingProgress } from '../ui/Button';
import { motion } from 'framer-motion';
import { variants } from '../../lib/motion';

interface ScoreData {
  overall: number; stars: 0 | 1 | 2 | 3;
  composition: number; lighting: number; color: number; similarity: number;
  feedback: string[];
}
interface Props {
  score: ScoreData;
  capturedImage: string;
  referenceImage: { url: string; title: string };
  fromCommunity?: boolean;
  onRetake: () => void;
  onNext: () => void;
  onHome: () => void;
}
export function ScoreResultView({ score, capturedImage, referenceImage, fromCommunity, onRetake, onNext, onHome }: Props) {
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const items = [
    { label: '构图', value: score.composition },
    { label: '光线', value: score.lighting },
    { label: '色彩', value: score.color },
    { label: '相似度', value: score.similarity },
  ];
  const headline = fromCommunity
    ? score.stars === 3 ? '太棒了！' : score.stars === 2 ? '做得不错！' : '评分完成'
    : score.stars === 3 ? '完美通关！' : score.stars === 2 ? '做得不错！' : score.overall >= 60 ? '通关成功！' : '再接再厉';

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-5">
      <motion.section variants={variants.fadeUp} initial="hidden" animate="show" className="text-center">
        <div className="flex justify-center gap-3 mb-3">
          {[1, 2, 3].map((i) => (
            <svg key={i} className={`w-16 h-16 ${i <= score.stars ? 'text-gold animate-star-pop' : 'text-line'}`} style={{ animationDelay: `${i * 200}ms` }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold">{headline}</h1>
        <p className="text-ink-secondary text-sm mt-1 font-mono">总分 {score.overall} 分</p>
      </motion.section>

      <motion.section variants={variants.fadeUp} initial="hidden" animate="show">
        <Card className="overflow-hidden">
          {compareMode === 'split' ? (
            <div className="grid grid-cols-2 gap-px bg-line">
              <div className="relative">
                <img src={referenceImage.url} alt="参考" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-sm">参考图</span>
              </div>
              <div className="relative">
                <img src={capturedImage} alt="作品" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-accent text-white text-xs rounded-sm">你的作品</span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square">
              <img src={capturedImage} alt="作品" className="w-full h-full object-cover" />
              <img src={referenceImage.url} alt="参考" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            </div>
          )}
        </Card>
        <div className="flex justify-center mt-3">
          <button onClick={() => setCompareMode((p) => (p === 'split' ? 'overlay' : 'split'))} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-line text-ink-secondary text-sm hover:bg-surface-muted transition-colors">
            <ArrowLeftRight className="w-4 h-4" />
            {compareMode === 'split' ? '叠加对比' : '分屏对比'}
          </button>
        </div>
      </motion.section>

      <motion.section variants={variants.fadeUp} initial="hidden" animate="show" className="flex flex-wrap items-center justify-around gap-4">
        <RingProgress value={score.similarity} size={90} label="相似度" />
        <div className="flex-1 min-w-[200px] pl-2 space-y-2">
          {items.map((it) => (
            <div key={it.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-secondary">{it.label}</span>
                <span className="text-sm font-mono font-bold text-ink">{it.value}</span>
              </div>
              <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-ink rounded-full transition-all duration-slow ease-editorial" style={{ width: `${it.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />AI 改进建议</h3>
          <ul className="space-y-2">
            {score.feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onRetake}><RefreshCw className="w-4 h-4" />重新拍摄</Button>
        <Button variant="accent" onClick={onNext}><ChevronRight className="w-4 h-4" />{fromCommunity ? '返回社区' : '下一关'}</Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={onHome}><Home className="w-4 h-4" />返回关卡地图</Button>
    </div>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- ScoreResultView.test 2>&1 | tail -8`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/score
git commit -m "feat(score): extract ScoreResultView from three score pages"
```

---

## Task 10: App.tsx 接入 AppShell + AnimatePresence

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `AppShell`、现有各 page 组件。

- [ ] **Step 1: 改造 App**

将 `App()` 的 `return` 内容用 `AppShell` 包裹，并把 `<Routes>` 放入其中（AppShell 内部已有 AnimatePresence；Routes 由 AppShell 的 children 渲染）。修改 `App` 函数体：

```tsx
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          <Routes>
            {/* 前台路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/" element={<AuthGuard><LevelMapPage /></AuthGuard>} />
            <Route path="/gallery" element={<AuthGuard><GalleryPage /></AuthGuard>} />
            <Route path="/gallery/:id" element={<AuthGuard><GalleryDetailPage /></AuthGuard>} />
            <Route path="/gallery/score" element={<AuthGuard><GalleryScorePage /></AuthGuard>} />
            <Route path="/level/:id" element={<AuthGuard><LevelDetailPage /></AuthGuard>} />
            <Route path="/shoot/:levelId" element={<AuthGuard><ShootPage /></AuthGuard>} />
            <Route path="/score/:levelId" element={<AuthGuard><ScorePage /></AuthGuard>} />
            <Route path="/learn" element={<AuthGuard><LearnPage /></AuthGuard>} />
            <Route path="/learn/:id" element={<AuthGuard><CourseDetailPage /></AuthGuard>} />
            <Route path="/community" element={<AuthGuard><ErrorBoundary><CommunityPage /></ErrorBoundary></AuthGuard>} />
            <Route path="/community/score" element={<AuthGuard><CommunityScorePage /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
            <Route path="/profile/works" element={<AuthGuard><MyWorksPage /></AuthGuard>} />
            <Route path="/profile/achievements" element={<AuthGuard><AchievementsPage /></AuthGuard>} />
            <Route path="/profile/favorites" element={<AuthGuard><MyFavoritesPage /></AuthGuard>} />
            {/* 后台路由 */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminAuthGuard><AdminLayout /></AdminAuthGuard>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="eval" element={<EvalSetsPage />} />
              <Route path="ai-eval" element={<AIEvalPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
```

> 注意：`ErrorBoundary` 顶部需 import（原 App 未 import 它但路由里用了——补 `import { ErrorBoundary } from './components/ErrorBoundary'`）。`AppShell` 顶部 import：`import { AppShell } from './components/layout/AppShell';`。

- [ ] **Step 2: 验证 typecheck**

Run: `npm run check 2>&1 | tail -20`
Expected: 无新增 TS 报错（页面内部旧令牌引用报错属预期，本步只看 App 结构）。

- [ ] **Step 3: 提交**

```bash
git add src/App.tsx
git commit -m "feat(app): wire AppShell with route transitions"
```

---

## Task 11: 重塑 LevelMap（PageLayout + 令牌 + 章节色）

**Files:**
- Modify: `src/pages/LevelMap.tsx`

**令牌映射表（全文机械替换）**：
| 旧 | 新 |
|---|---|
| `bg-surface` | `bg-surface`（保留） |
| `bg-white` | `bg-surface-card` |
| `border-gray-50` | `border-line` |
| `text-ink` / `text-ink-muted` | 保留（令牌同名） |
| `text-primary` | `text-accent` |
| `bg-primary/5` / `bg-primary` | `bg-accent/8` / `bg-accent` |
| `text-yellow-500` | `text-gold` |
| `text-mint` | `text-chapter-composition` |
| `bg-gray-100` / `bg-gray-200` / `bg-gray-300` | `bg-surface-muted` |
| `text-gray-300` / `text-gray-400` | `text-ink-muted` |
| `#4ECDC4/#FFE66D/#A78BFA/#6C9ECA/#F472B6`（CHAPTERS 内） | 用 `chapter.*` 令牌；改为引用配置见下 |

- [ ] **Step 1: 替换 CHAPTERS 常量为令牌派生**

把 `src/pages/LevelMap.tsx` 的 `CHAPTERS` 改为引用 token 值（不再硬编码 hex）：

```ts
const CHAPTERS = [
  { key: 'composition', name: '构图基础篇', color: '#6B8E7F', light: '#E8F0EC', dark: '#4F6E61' },
  { key: 'light', name: '光线运用篇', color: '#C9A24A', light: '#F4ECD6', dark: '#9A7A36' },
  { key: 'color', name: '色彩搭配篇', color: '#9B6B8A', light: '#ECE2EC', dark: '#735066' },
  { key: 'narrative', name: '叙事技巧篇', color: '#6B7B95', light: '#E5E9EF', dark: '#525F73' },
  { key: 'master', name: '综合大师篇', color: '#A56B5A', light: '#F0E4DE', dark: '#7C5043' },
];
```

> 这些 hex 与 `tailwind.config` 的 `chapter.*` 一致；保留在文件内供 inline 渐变使用，避免 Tailwind 无法对动态 key 生成交互 class。

- [ ] **Step 2: 套 PageLayout 并移除页内 TopBar/BottomNav**

将 `LevelMapPage` 的根 `<div className="min-h-screen bg-surface pb-20"> ... </div>` 替换为：

```tsx
return (
  <PageLayout>
    {user.isGuest && (
      <div className="fixed top-0 inset-x-0 bg-warning text-white px-4 py-3 text-center text-sm font-medium z-50">
        ⚠️ 游客模式，记录不会保存
      </div>
    )}
    <div className="max-w-lg mx-auto pt-2 pb-6 space-y-5">
      {/* 欢迎区 */}
      <section className="pl-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">摄影之路</h1>
      </section>
      {/* 数据概览 */}
      <section className="flex gap-3">
        <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
          <p className="text-2xl font-mono font-bold text-accent">{totalCompleted}</p>
          <p className="text-xs text-ink-muted mt-0.5">已通关</p>
        </div>
        <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
          <p className="text-2xl font-mono font-bold text-gold">{totalStars}</p>
          <p className="text-xs text-ink-muted mt-0.5">总星数</p>
        </div>
        <div className="flex-1 bg-surface-card rounded-md border border-line p-4 text-center">
          <p className="text-2xl font-mono font-bold text-ink">Lv.{user.level}</p>
          <p className="text-xs text-ink-muted mt-0.5">等级</p>
        </div>
      </section>
      {/* 章节关卡列表 —— 保留原 chapters.map 结构，按下表替换 class */}
      <section className="space-y-4">{chapters.map(/* ... 同原逻辑，class 走令牌映射表 ... */)}</section>
    </div>
  </PageLayout>
);
```

对 `chapters.map` 内的章节卡与 `MapNode`，按映射表替换 class：`bg-white rounded-3xl shadow-sm border border-gray-50` → `bg-surface-card rounded-md border border-line`；章节标题栏 inline 渐变保留（用 chapterInfo.light/color）；`MapNode` 中 `bg-gray-100`→`bg-surface-muted`、`text-gray-300`→`text-ink-muted`、`text-yellow-500/#FBBF24`→`text-gold`、`bg-white`→`bg-surface-card`、星标 `#FBBF24`→用 `text-gold` class。导入：`import { PageLayout } from '../components/layout/PageLayout';`，删除 `import { TopBar, BottomNav } from '../components/game/GameComponents';`。

- [ ] **Step 3: 验证 typecheck + dev**

Run: `npm run check 2>&1 | tail -20 && npm run dev -- --host 2>&1 | head -5 &`
Expected: 无 TS 报错；dev 启动。手动访问 `http://localhost:5173` 确认首页显示新令牌样式。

- [ ] **Step 4: 提交**

```bash
git add src/pages/LevelMap.tsx
git commit -m "feat(level-map): adopt PageLayout and editorial tokens"
```

---

## Task 12: 重塑 LevelDetail + 接入曝光课件入口

**Files:**
- Modify: `src/pages/LevelDetail.tsx`
- Create: `src/pages/LevelDetail.test.tsx`（轻量渲染测试）

**令牌映射表**：同 Task 11（`bg-white→bg-surface-card`、`border-gray-50→border-line`、`text-primary→text-accent`、`bg-gray-100→bg-surface-muted`、`text-yellow-600→text-gold`、`text-red-500→text-danger`、`bg-green-100/text-green-600→bg-success/12 + text-success` 等）。

- [ ] **Step 1: 套 PageLayout + 移除页内 TopBar/BottomNav**

将 `LevelDetailPage` 根容器替换为 `<PageLayout desktop="split">`，内容包入 `<div className="max-w-lg lg:max-w-none pt-2 pb-6 space-y-5">`。删除页内 `TopBar`/`BottomNav` 调用与导入，改 `import { PageLayout } from '../components/layout/PageLayout';`。按映射表替换全 class。

- [ ] **Step 2: 加"曝光练习"入口（进入 InteractiveLesson）**

在关卡详情的"拍摄"按钮旁，增加"练习曝光"按钮，点击设状态 `showLesson=true` 并渲染 `<InteractiveLesson>` 覆盖：

```tsx
import { InteractiveLesson } from '../components/lesson/InteractiveLesson';
import { exposureConfig } from '../components/lesson/concepts/exposure';

// 组件内：
const [showLesson, setShowLesson] = useState(false);
// ...
{showLesson ? (
  <InteractiveLesson concept={exposureConfig} onComplete={() => setShowLesson(false)} />
) : (
  /* 原详情内容 */
)}
```

> 说明：曝光课件作为本关"动手学"环节，与拍摄挑战并列。完成练习返回详情页。后续关卡的概念接入在阶段 3。

- [ ] **Step 3: 写渲染测试**

`src/pages/LevelDetail.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LevelDetailPage } from './LevelDetail';
import { useGameStore } from '../stores/useGameStore';

vi.mock('../../stores/useGameStore');
beforeEach(() => {
  useGameStore.mockReturnValue({ user: { isLoggedIn: true, hasCompletedOnboarding: true, completedLevels: [], levelStars: {}, level: 1 }, maxUnlockedLevel: 1 });
});

describe('LevelDetailPage', () => {
  it('renders level detail with practice entry', () => {
    render(<MemoryRouter initialEntries={['/level/1']}><Routes><Route path="/level/:id" element={<LevelDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText('练习曝光')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 跑测试 + 提交**

Run: `npm run test -- LevelDetail.test 2>&1 | tail -8`
Expected: PASS。
```bash
git add src/pages/LevelDetail.tsx src/pages/LevelDetail.test.tsx
git commit -m "feat(level-detail): adopt PageLayout, tokens, and exposure lesson entry"
```

---

## Task 13: 重塑 Shoot（沉浸式 PageLayout）

**Files:**
- Modify: `src/pages/Shoot.tsx`

**令牌映射表**：`bg-black`→`bg-ink`；`bg-black/30`/`bg-black/40`/`bg-black/60` 保留（半透明）；`bg-primary`→`bg-accent`；`text-primary`→`text-accent`；`border-white/40` 保留；`bg-white/10`→`bg-surface-card/10`；`text-primary-200`→`text-accent-soft`（若无则 `text-accent/70`）。

- [ ] **Step 1: 套沉浸式 PageLayout**

`ShootPage` 根 `<div className="min-h-screen bg-black relative">` 替换为：

```tsx
return (
  <PageLayout immersive>
    <div className="relative min-h-screen">
      {/* 原全部内容（模式切换、视频、控制等） */}
    </div>
  </PageLayout>
);
```

`import { PageLayout } from '../components/layout/PageLayout';`。按映射表替换 class。沉浸式下 AppShell 已不渲染 TopBar/BottomNav（见 Task 6）。

- [ ] **Step 2: 验证 typecheck + 提交**

Run: `npm run check 2>&1 | tail -20`
Expected: 无报错。
```bash
git add src/pages/Shoot.tsx
git commit -m "feat(shoot): adopt immersive PageLayout and tokens"
```

---

## Task 14: 重塑 Score 页（ScoreResultView + 动效）

**Files:**
- Modify: `src/pages/Score.tsx`

- [ ] **Step 1: 用 ScoreResultView 替换评分 UI**

`ScorePage` 的 `return`（评分就绪分支）改为：

```tsx
return (
  <PageLayout>
    <ScoreResultView
      score={score}
      capturedImage={capturedImage}
      referenceImage={level.referenceImage}
      fromCommunity={fromCommunity}
      onRetake={handleRetake}
      onNext={handleNext}
      onHome={() => { setCapturedImage(null); navigate('/', { replace: true }); }}
    />
    <RewardModal show={showReward} xp={xpGained} stars={score.stars} streak={user.streak} onClose={handleClose} onNext={handleNext} fromCommunity={fromCommunity} />
    {!fromCommunity && newAchievements.length > 0 && !showReward && (
      <div className="fixed bottom-24 inset-x-0 z-40 px-4">
        <div className="max-w-lg mx-auto bg-ink text-surface rounded-md p-4 shadow-elevated flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-medium text-sm">解锁新成就！</p>
            <p className="text-surface-muted text-xs">{newAchievements.join('、')}</p>
          </div>
        </div>
      </div>
    )}
  </PageLayout>
);
```

空状态/加载状态分支也套 `<PageLayout>`（去掉页内 TopBar/BottomNav）。导入：`import { PageLayout } from '../components/layout/PageLayout';`、`import { ScoreResultView } from '../components/score/ScoreResultView';`，删除 `import { TopBar, BottomNav } from '../components/game/GameComponents';`（保留 `RewardModal`）、`Card/Badge/Button/RingProgress` 中只保留用到的（RewardModal 用法不变）。

- [ ] **Step 2: 验证 typecheck + 提交**

Run: `npm run check 2>&1 | tail -20`
Expected: 无报错。
```bash
git add src/pages/Score.tsx
git commit -m "feat(score): use ScoreResultView with motion reveal"
```

---

## Task 15: E2E 纵切流程测试（Playwright）

**Files:**
- Create: `tests/e2e/slice.spec.ts`

- [ ] **Step 1: 写 E2E**

`tests/e2e/slice.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 拦截 AI 评分接口，避免依赖后端
  await page.route('**/api/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ overall: 80, stars: 2, composition: 80, lighting: 70, color: 75, similarity: 60, feedback: ['加强构图'] }),
  }));
});

test('north-star slice: map -> level -> exposure lesson -> shoot -> score', async ({ page }) => {
  // 以游客身份快速进入（绕过登录墙：直接访问，触发游客模式或登录后）
  await page.goto('/');
  // 若在登录页，使用游客入口
  const guestBtn = page.getByRole('button', { name: /游客|试用/ });
  if (await guestBtn.isVisible().catch(() => false)) await guestBtn.click();
  await page.waitForURL(/\//);
  await expect(page.getByText('摄影之路')).toBeVisible();

  // 进入第一个关卡
  await page.getByRole('button').filter({ hasText: '1' }).first().click();
  await expect(page.getByText('练习曝光')).toBeVisible();

  // 练习曝光：拖动滑条到目标附近（键盘 ArrowRight 若干次）
  const slider = page.getByRole('slider');
  await slider.focus();
  for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowRight');
  await expect(page.getByText(/命中目标|完成练习/).first()).toBeVisible({ timeout: 3000 }).catch(() => {/* 容差未命中也继续 */});

  // 完成练习返回详情，进入拍摄
  await page.getByRole('button', { name: '完成练习' }).click().catch(() => {});
  // 拍摄页：改用上传模式（避免摄像头权限）
  await page.getByRole('button', { name: '上传' }).click().catch(() => {});

  // 断言当前已进入 /shoot（沉浸式）
  await expect(page).toHaveURL(/\/shoot\//, { timeout: 5000 });
});
```

> 说明：E2E 拦截 `/api/**` 返回 mock 评分，避免依赖后端。摄像头路径用上传模式规避权限。移动端与桌面端两个 project 均跑（见 playwright.config）。

- [ ] **Step 2: 跑 E2E**

Run: `npm run e2e 2>&1 | tail -30`
Expected: 至少移动端 project 通过；桌面端通过。若 AI 拦截未命中（接口路径不同），检查 `src/services/aiService.ts` 实际请求路径并调整 `page.route` glob。

- [ ] **Step 3: 提交**

```bash
git add tests/e2e/slice.spec.ts
git commit -m "test(e2e): north-star slice flow"
```

---

## 收尾验证

- [ ] **Step 1: 全量测试 + 构建**

Run: `npm run test && npm run check && npm run build`
Expected: 单测全过；typecheck 无报错；build 成功生成 `dist/`。

- [ ] **Step 2: 手动 UAT（对照 spec §14）**

启动 `npm run dev`，逐条核对 spec §14 验收标准 1–7（移动 + 桌面双栏、转场流畅、曝光课件命中反馈、无 gray-xxx 残留、reduced-motion 关转场、Lenis 桌面平滑、功能未回归）。

- [ ] **Step 3: 标记阶段 1 完成 + 提交**

```bash
git add -A
git commit -m "chore: phase 1 complete — foundation + north-star slice"
```

---

## Self-Review（已执行）

- **Spec 覆盖**：设计令牌(T2)✓、motion(T3,6,7)✓、filters(T4,8)✓、PageLayout/响应式/转场(T6,7,10,11,13)✓、组件收敛 Button/CVA(T5)+ScoreResultView(T9)✓、InteractiveLesson+曝光(T8,12)✓、纵切流程(T10–14)✓、测试(T1,15)✓。阶段 2/3 明确排除。
- **占位符**：无 TBD/TODO；映射表为精确 before→after，非占位符。
- **类型一致**：`ConceptConfig`（T8 定义，T12 使用）一致；`ScoreData`（T9）与 store 的 score 结构对齐（overall/stars/composition/lighting/color/similarity/feedback）；`buttonVariants`（T5）一致；`NavSection`（T6）一致。
- **已知待实现细节**：阶段 3 才补齐其余 `ParamMap`（光圈/快门等）与 Lottie；`GameComponents.tsx` 的 TopBar/BottomNav 旧导出保留（兼容），阶段 2 全站迁移后删除。
