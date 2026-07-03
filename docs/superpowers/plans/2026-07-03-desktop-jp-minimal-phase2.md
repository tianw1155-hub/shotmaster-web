# ShotMaster 桌面优先 + 日式极简 · 阶段 2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端从移动优先改为桌面优先（左侧栏），落地日式极简设计系统（washi/sumi/朱/金 + Geist + 系统CJK + 细线图标），精雕首屏（关卡地图）到成品级，并加入克制动效 + 3 个炫技时刻（揭晓/首屏入场/路由 morph）。

**Architecture:** 改令牌值不改名（全站自动去 AI 味）；新增桌面 `Sidebar`，`AppShell` 重写为 `grid-cols-[208px_1fr]`（桌面侧栏 + 移动底部导航，`lg:hidden` 切换）；`LevelMap` 重设计为非对称双区 + inline 统计 + 发丝线分组；`lib/motion` 扩展 reveal/heroEnter 变体；`ScoreResultView` 加揭晓序列；路由加 `AnimatePresence` + `layoutId` 做共享元素 morph。

**Tech Stack:** React 18 + TS + Vite + Tailwind 3 + framer-motion + lucide-react（已有）。设计规格：`docs/superpowers/specs/2026-07-03-desktop-jp-minimal-design.md`。分支 `desktop-jp-minimal`，基线 `master`（Phase 1，8538425）。

## Global Constraints

- **配色**：surface washi `#F7F6F2`/纸 `#FBFAF7`/弱底 `#EFEDE6`；ink sumi `#1A1A1A`/次 `#3D3D3A`/弱 `#8A8A86`；accent 朱 `#B14A3A`/soft `#C76A5C`；gold `#9A7B3A`；line `#E6E4DE`；success `#4A7A5C`/warning `#B0894A`/danger `#A8412E`。兼容旧令牌重映射：primary→朱、mint/grape→中性灰、sun→金系、sky→灰蓝。
- **字体**：`fontFamily.display`/`body` = `['Geist','"PingFang SC"','"Hiragino Sans GB"','"Microsoft YaHei"','"Noto Sans SC"','system-ui','sans-serif']`；`mono` = `'"Geist Mono"',ui-monospace,monospace`。弃 Bodoni/Inter。**中文不斜体**（强调用朱色+加粗）。
- **圆角**：sm 4 / DEFAULT 6 / md 8 / lg 12。发丝线分组（`border-line`/`divide-y`）+ 留白，**不堆卡片**。**无 emoji**，lucide `strokeWidth={1.25}`。
- **动效**：只用 transform/opacity；统一 `cubic-bezier(.22,1,.36,1)`；无 linear、无弹跳（弹簧仅触控/命中）；`MotionConfig reducedMotion="user"` 尊重 reduced-motion；路由 enter-only 淡入轻推 + shared-layout morph。
- **桌面**：侧栏 `208px` + 主区；`lg+` 双栏；移动底部导航；`max-w-[1400px] mx-auto`。
- **范围**：仅阶段 2。非首屏页面（图库/社区/学习/个人/admin）的深度重设计、其余交互概念、Lottie 属阶段 3。

---

## File Structure

**新建**
- `src/components/layout/Sidebar.tsx` — 桌面左侧栏（导航 + 滑动朱条 + 用户卡）

**修改**
- `tailwind.config.js` — 令牌改值（washi/sumi/朱/金/line + 兼容重映射）+ 字体（Geist + 系统CJK）
- `src/index.css` — Geist + Geist Mono import，base 改 washi/sumi
- `index.html` — Geist preconnect
- `src/lib/motion.ts` — 扩展 reveal/starPop/heroImage/heroTitle/lineDraw 变体
- `src/components/layout/AppShell.tsx` — 桌面 grid 侧栏 + 移动 nav + AnimatePresence(frozen location)
- `src/components/layout/TopBar.tsx` / `BottomNav.tsx` — 加 `lg:hidden`
- `src/pages/LevelMap.tsx` — 桌面优先首屏重设计 + hero 入场炫技 + layoutId 节点
- `src/components/score/ScoreResultView.tsx` — 揭晓炫技序列
- `src/App.tsx` — AppShell 改为接收 `<Route>` 元素（AnimatePresence 需要）
- `src/pages/LevelDetail.tsx` — hero 图加 `layoutId`（路由 morph 目标）

---

## Task 1: 设计系统令牌 + 字体

**Files:**
- Modify: `tailwind.config.js`, `src/index.css`, `index.html`

**Interfaces:**
- Produces: 全站令牌（`bg-surface`=#F7F6F2、`bg-ink`、`bg-accent`=#B14A3A、`text-gold`、`border-line`=#E6E4DE、`font-display`/`font-body`=Geist+系统CJK、`font-mono`=Geist Mono）。

- [ ] **Step 1: 改 tailwind.config.js 颜色与字体**

替换 `theme.extend.colors` 与 `fontFamily`（保留 content/container/radius/shadow/keyframes 结构，仅改值）：

```js
colors: {
  surface: { DEFAULT: '#F7F6F2', card: '#FBFAF7', muted: '#EFEDE6' },
  ink: { DEFAULT: '#1A1A1A', secondary: '#3D3D3A', muted: '#8A8A86' },
  accent: { DEFAULT: '#B14A3A', soft: '#C76A5C' },
  gold: '#9A7B3A',
  line: '#E6E4DE',
  success: '#4A7A5C',
  warning: '#B0894A',
  danger: '#A8412E',
  chapter: { composition: '#6B8E7F', light: '#B0894A', color: '#8E7AA0', narrative: '#5E7AA0', master: '#A56B5A' },
  // 兼容旧令牌 → 重映射（去 AI 味，非切片页不失色）
  primary: { DEFAULT: '#B14A3A', light: '#C76A5C', dark: '#8A3528' },
  mint: { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },
  sun: { DEFAULT: '#9A7B3A', light: '#B89A55', dark: '#765C2A' },
  sky: { DEFAULT: '#5E7AA0', light: '#7E94B4', dark: '#465E80' },
  grape: { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },
},
fontFamily: {
  display: ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
  body: ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
  mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
},
```
`boxShadow.focus` 改 `rgba(177,74,58,.24)`。

- [ ] **Step 2: 改 index.css 字体导入与底色**

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
@tailwind base; @tailwind components; @tailwind utilities;
@layer base {
  :root { font-family: 'Geist', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif; line-height: 1.5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  body { background-color: #F7F6F2; color: #1A1A1A; min-height: 100vh; margin: 0; }
  ::selection { background: #B14A3A; color: #fff; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D8D6D0; border-radius: 5px; border: 2px solid #F7F6F2; }
  ::-webkit-scrollbar-thumb:hover { background: #B6B4AE; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 3: index.html 加 Geist preconnect**

在 `<head>` 的 viewport meta 后加：
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- [ ] **Step 4: 验证构建**

Run: `npm run check 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: check 干净；build 成功。

- [ ] **Step 5: 提交**

```bash
git add tailwind.config.js src/index.css index.html
git commit -m "feat(design): jp-minimal tokens (washi/sumi/朱/金) + Geist fonts"
```

---

## Task 2: lib/motion 扩展（揭晓/首屏入场变体，TDD）

**Files:**
- Modify: `src/lib/motion.ts`, `src/lib/motion.test.ts`

**Interfaces:**
- Produces: `variants.reveal`（toast 缩放淡入）、`variants.starPop`（星级 spring overshoot）、`variants.heroImage`（clip-path 揭幕）、`variants.heroTitle`（标题上升）、`variants.lineDraw`（朱线 scaleX）。

- [ ] **Step 1: 加失败测试**

在 `src/lib/motion.test.ts` 末尾 `describe` 内追加：

```ts
it('starPop show uses spring transition', () => {
  expect(variants.starPop.show.transition).toHaveProperty('type', 'spring');
});
it('heroImage hidden clips bottom', () => {
  expect((variants.heroImage.hidden as any).clipPath).toBe('inset(0 0 100% 0)');
  expect((variants.heroImage.show as any).clipPath).toBe('inset(0 0 0% 0)');
});
it('lineDraw hidden has scaleX 0', () => {
  expect((variants.lineDraw.hidden as any).scaleX).toBe(0);
  expect((variants.lineDraw.show as any).scaleX).toBe(1);
});
it('reveal show has scale 1', () => {
  expect((variants.reveal.hidden as any).scale).toBeLessThan(1);
  expect((variants.reveal.show as any).scale).toBe(1);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- motion.test 2>&1 | tail -8`
Expected: FAIL（新变体未定义）。

- [ ] **Step 3: 实现**

在 `src/lib/motion.ts` 的 `variants` 对象内（`stagger` 之前）追加：

```ts
  reveal: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.42, ease: EASE.editorial } },
  } satisfies Variants,
  starPop: {
    hidden: { opacity: 0, scale: 0 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 14 } },
  } satisfies Variants,
  heroImage: {
    hidden: { clipPath: 'inset(0 0 100% 0)' },
    show: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.8, ease: EASE.editorial } },
  } satisfies Variants,
  heroTitle: {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.editorial } },
  } satisfies Variants,
  lineDraw: {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.65, ease: EASE.editorial } },
  } satisfies Variants,
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- motion.test 2>&1 | tail -8`
Expected: PASS（9 passed）。

- [ ] **Step 5: 提交**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts
git commit -m "feat(motion): add reveal/heroEnter/starPop/lineDraw variants"
```

---

## Task 3: Sidebar（桌面左侧栏，TDD）

**Files:**
- Create: `src/components/layout/Sidebar.tsx`, `src/components/layout/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `useGameStore`（user）、`react-router-dom`（Link/useLocation）、`lib/motion`（layout 滑动朱条）。
- Produces: `<Sidebar />`，桌面 `hidden lg:flex`；导航 5 项 + 用户卡；当前态朱条 `layoutId="nav-indicator"` 滑动。

- [ ] **Step 1: 写失败测试**

`src/components/layout/Sidebar.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
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
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm run test -- Sidebar.test 2>&1 | tail -8`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现**

`src/components/layout/Sidebar.tsx`:
```tsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Aperture, LayoutGrid, BookOpen, Image as ImageIcon, Users, User, Flame } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import type { NavSection } from './BottomNav';

const NAV: { id: NavSection; icon: typeof LayoutGrid; label: string; path: string }[] = [
  { id: 'levels', icon: LayoutGrid, label: '闯关', path: '/' },
  { id: 'learn', icon: BookOpen, label: '学习', path: '/learn' },
  { id: 'gallery', icon: ImageIcon, label: '图库', path: '/gallery' },
  { id: 'community', icon: Users, label: '社区', path: '/community' },
  { id: 'profile', icon: User, label: '我的', path: '/profile' },
];

function deriveSection(p: string): NavSection {
  if (p.startsWith('/gallery')) return 'gallery';
  if (p.startsWith('/community')) return 'community';
  if (p.startsWith('/learn')) return 'learn';
  if (p.startsWith('/profile')) return 'profile';
  return 'levels';
}

export function Sidebar() {
  const { user } = useGameStore();
  const { pathname } = useLocation();
  const active = deriveSection(pathname);
  return (
    <aside className="hidden lg:flex lg:flex-col w-[208px] shrink-0 bg-surface-card border-r border-line sticky top-0 h-dvh">
      <div className="h-14 flex items-center gap-2 px-5 border-b border-line">
        <Aperture className="w-5 h-5 text-accent" strokeWidth={1.25} />
        <span className="font-display font-medium text-[14px] tracking-tight">ShotMaster</span>
      </div>
      <nav className="flex-1 px-3 py-5 relative">
        {NAV.map(({ id, icon: Icon, label, path }) => (
          <Link key={id} to={path}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors duration-base ease-editorial ${
              active === id ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-surface-muted/60'
            }`}>
            {active === id && (
              <motion.span layoutId="nav-indicator"
                className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-full"
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }} />
            )}
            <Icon className="w-[17px] h-[17px]" strokeWidth={1.25} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-line">
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-ink text-surface flex items-center justify-center text-[11px] font-medium">{user.avatar}</div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-ink truncate">Lv.{user.level} · 摄影师</p>
            <p className="text-[10px] text-ink-muted font-mono">{user.xp}/{user.xpToNext} XP</p>
          </div>
          <Flame className="w-4 h-4 text-accent ml-auto" strokeWidth={1.25} />
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm run test -- Sidebar.test 2>&1 | tail -8`
Expected: PASS（2 passed）。

- [ ] **Step 5: 提交**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "feat(layout): add desktop Sidebar with sliding vermilion indicator"
```

---

## Task 4: AppShell 桌面 grid + 移动 nav + TopBar/BottomNav lg:hidden

**Files:**
- Modify: `src/components/layout/AppShell.tsx`, `src/components/layout/TopBar.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/AppShell.test.tsx`

**Interfaces:**
- Consumes: `Sidebar`、`TopBar`、`BottomNav`、`SmoothScroll`。
- Produces: `<AppShell>` 桌面 `grid-cols-[208px_1fr]`（Sidebar + 主区），移动 TopBar+BottomNav；`showNav` 逻辑不变；此任务仍用 enter-only（AnimatePresence 留给 Task 7）。

- [ ] **Step 1: 更新 AppShell 为桌面 grid**

`src/components/layout/AppShell.tsx` 完整替换：
```tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SmoothScroll } from './SmoothScroll';

const NO_NAV_PREFIXES = ['/login', '/preferences', '/admin'];
const IMMERSIVE_PREFIXES = ['/shoot'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));
  const immersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const showNav = !noNav && !immersive;
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll disabled={immersive}>
        <div className={showNav ? 'lg:grid lg:grid-cols-[208px_1fr]' : ''}>
          {showNav && <Sidebar />}
          <div className="flex flex-col min-h-dvh">
            {showNav && <TopBar />}
            <div className="flex-1 flex flex-col">{children}</div>
            {showNav && <BottomNav active={deriveActive(location.pathname)} />}
          </div>
        </div>
      </SmoothScroll>
    </MotionConfig>
  );
}

function deriveActive(p: string): 'levels' | 'gallery' | 'community' | 'learn' | 'profile' {
  if (p.startsWith('/gallery')) return 'gallery';
  if (p.startsWith('/community')) return 'community';
  if (p.startsWith('/learn')) return 'learn';
  if (p.startsWith('/profile')) return 'profile';
  return 'levels';
}
```

- [ ] **Step 2: TopBar 加 lg:hidden**

`src/components/layout/TopBar.tsx`：把根 `<header className="sticky top-0 z-40 ...">` 改为加 `lg:hidden`：
```tsx
<header className="lg:hidden sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-line">
```
（其余不变。）

- [ ] **Step 3: BottomNav 加 lg:hidden**

`src/components/layout/BottomNav.tsx`：根 `<nav ...>` 加 `lg:hidden`：
```tsx
<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/90 backdrop-blur-md border-t border-line">
```

- [ ] **Step 4: 更新 AppShell 测试（桌面不渲染 TopBar/BottomNav）**

`src/components/layout/AppShell.test.tsx` 现有断言 `getByRole('navigation')` 在 `/` 出现——桌面端 BottomNav 是 `lg:hidden`（仍渲染于 DOM，只是 CSS 隐藏），所以 `getByRole('navigation')` 仍存在。测试无需改，重跑确认通过。若 `vi.mocked(useGameStore)` 模式已就位（Phase 1 已修），直接跑：

Run: `npm run test -- AppShell.test 2>&1 | tail -8`
Expected: PASS（2 passed）。

- [ ] **Step 5: 验证 check + build + 提交**

Run: `npm run check 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: 干净/成功。
```bash
git add src/components/layout/AppShell.tsx src/components/layout/TopBar.tsx src/components/layout/BottomNav.tsx
git commit -m "feat(layout): desktop grid shell (sidebar + main), mobile nav lg:hidden"
```

---

## Task 5: LevelMap 桌面优先首屏重设计 + hero 入场炫技

**Files:**
- Modify: `src/pages/LevelMap.tsx`

**Interfaces:**
- Consumes: `PageLayout`、`useGameStore`、`getLevel`、`lib/motion`（heroImage/heroTitle/lineDraw/stagger）、lucide。
- Produces: 桌面非对称首屏（hero 双区 + inline 统计 + 发丝线章节 + 节点网格），hero clip-path 揭幕 + 标题上升，无 emoji，lucide stroke 1.25。节点含 `layoutId={`lvl-${id}`}` 供 Task 7 morph。

- [ ] **Step 1: 重写 LevelMap.tsx**

`src/pages/LevelMap.tsx` 完整替换：
```tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Check, Camera, Sliders, ChevronRight, Aperture } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel } from '../services/levelService';
import { PageLayout } from '../components/layout/PageLayout';
import { variants } from '../lib/motion';

type LessonStatus = 'locked' | 'available' | 'completed';
interface LevelNode { id: number; status: LessonStatus; stars: number; title: string; chapterKey: string; chapterName: string; }

const CHAPTERS = [
  { key: 'composition', name: '构图基础篇', color: '#6B8E7F' },
  { key: 'light', name: '光线运用篇', color: '#B0894A' },
  { key: 'color', name: '色彩搭配篇', color: '#8E7AA0' },
  { key: 'narrative', name: '叙事技巧篇', color: '#5E7AA0' },
  { key: 'master', name: '综合大师篇', color: '#A56B5A' },
];
const PER = 10;
const chapterOf = (id: number) => CHAPTERS[Math.min(Math.floor((id - 1) / PER), CHAPTERS.length - 1)];

export function LevelMapPage() {
  const navigate = useNavigate();
  const { user, maxUnlockedLevel } = useGameStore();

  const chapters = useMemo(() => {
    const total = Math.max(maxUnlockedLevel + 5, 50);
    const list: LevelNode[] = [];
    for (let id = 1; id <= total; id++) {
      const ch = chapterOf(id);
      const completed = user.completedLevels.includes(id);
      const stars = user.levelStars[id] || 0;
      list.push({ id, status: completed ? 'completed' : id <= maxUnlockedLevel ? 'available' : 'locked', stars, title: getLevel(id, stars, completed).title, chapterKey: ch.key, chapterName: ch.name });
    }
    const map = new Map<string, LevelNode[]>();
    list.forEach(n => { const k = n.chapterKey; if (!map.has(k)) map.set(k, []); map.get(k)!.push(n); });
    return Array.from(map.entries()).map(([k, lv]) => ({ key: k, chapter: CHAPTERS.find(c => c.key === k)!, levels: lv }));
  }, [user.completedLevels, user.levelStars, maxUnlockedLevel]);

  const cur = Math.min(maxUnlockedLevel, 50);
  const curLevel = getLevel(cur, user.levelStars[cur] || 0, user.completedLevels.includes(cur));
  const curChapter = chapterOf(cur);
  const totalDone = user.completedLevels.length;
  const totalStars = user.totalStars;

  const stats = [
    { n: totalDone, label: '已通关', c: 'text-accent' },
    { n: totalStars, label: '总星数', c: 'text-gold' },
    { n: user.level, label: '等级', c: 'text-ink' },
    { n: user.streak, label: '连击 · 日', c: 'text-ink' },
  ];

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-8 lg:py-12 flex flex-col gap-8 lg:gap-10">
        {/* breadcrumb */}
        <div className="flex items-center justify-between text-[11px] tracking-[.16em] uppercase text-ink-muted font-mono">
          <span>摄影之路 <span className="text-line">／</span> <span className="text-ink font-semibold">{curChapter.name}</span></span>
          <span className="hidden md:flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent" />本周挑战 · 残 3 日</span>
        </div>

        {/* hero asymmetric */}
        <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-12 items-end">
          <div className="flex flex-col gap-4">
            <motion.div variants={variants.heroTitle} initial="hidden" animate="show" className="text-[11px] tracking-[.18em] uppercase text-accent font-mono font-semibold flex items-center gap-2">
              <Aperture className="w-4 h-4" strokeWidth={1.25} />继续 · 第 {cur} 关
            </motion.div>
            <motion.h1 variants={variants.heroTitle} initial="hidden" animate="show" className="font-display text-4xl lg:text-5xl font-medium tracking-[-.015em] leading-[1.05]">
              {curLevel.title}
            </motion.h1>
            <motion.p variants={variants.heroTitle} initial="hidden" animate="show" className="text-[13px] lg:text-sm text-ink-secondary leading-relaxed max-w-[42ch]">
              将主体置于九宫格的交叉点，让视线自然流动。本关提供实时构图叠加，与参考图逐项对照。
            </motion.p>
            <motion.div variants={variants.heroTitle} initial="hidden" animate="show" className="flex gap-2.5 mt-1">
              <button onClick={() => navigate(`/shoot/${cur}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-[#9A3D30] active:translate-y-px transition-colors duration-base">
                <Camera className="w-4 h-4" strokeWidth={1.25} />开始拍摄
              </button>
              <button onClick={() => navigate(`/level/${cur}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-line text-ink-secondary text-[13px] font-medium hover:border-ink hover:text-ink active:translate-y-px transition-colors duration-base">
                <Sliders className="w-4 h-4" strokeWidth={1.25} />练习曝光
              </button>
            </motion.div>
          </div>
          <motion.div variants={variants.heroImage} initial="hidden" animate="show" className="relative aspect-[4/5] rounded-md overflow-hidden border border-line bg-ink">
            <img src={curLevel.referenceImage.url} alt={curLevel.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)', backgroundSize: '33.3% 33.3%' }} />
            <div className="absolute left-3 bottom-3 text-white/90 text-[10px] font-mono tracking-wide bg-ink/55 backdrop-blur px-2 py-1 rounded">{curLevel.title} · 参考</div>
          </motion.div>
        </section>

        {/* stats inline divide-x */}
        <section className="flex border-y border-line py-5">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-6 lg:px-8 ${i === 0 ? 'pl-0' : ''} ${i < stats.length ? 'border-r border-line' : ''}`}>
              <span className={`block font-mono text-2xl lg:text-3xl font-medium tracking-[-.02em] ${s.c}`}>{s.n}</span>
              <span className="text-[10px] lg:text-[11px] text-ink-muted tracking-[.06em] mt-1.5 block">{s.label}</span>
            </div>
          ))}
        </section>

        {/* two col: chapters + current chapter levels */}
        <section className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-12">
          <div>
            <h3 className="text-[11px] tracking-[.16em] uppercase text-ink-muted font-semibold mb-5 flex justify-between"><span>章节进度</span><span className="font-mono">{chapters.length} ／ {CHAPTERS.length}</span></h3>
            <div className="flex flex-col">
              {chapters.map(ch => {
                const done = ch.levels.filter(l => l.status === 'completed').length;
                const pct = Math.round((done / ch.levels.length) * 100);
                return (
                  <div key={ch.key} className="flex items-center gap-3.5 py-3.5 border-b border-line last:border-b-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ch.chapter.color }} />
                    <span className="text-[13px] flex-1">{ch.chapterName}<span className="block text-[10px] text-ink-muted font-mono mt-0.5">{String(done).padStart(2,'0')} / {ch.levels.length}</span></span>
                    <span className="w-14 h-[2px] bg-line rounded-full overflow-hidden"><span className="block h-full bg-ink" style={{ width: `${pct}%` }} /></span>
                    <span className="text-[10px] text-ink-muted font-mono w-7 text-right">{pct}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] tracking-[.16em] uppercase text-ink-muted font-semibold mb-5 flex justify-between"><span>本章节关卡</span><span className="font-mono">{cur} — {Math.min(cur + 4, 50)}</span></h3>
            <div className="grid grid-cols-5 gap-x-2 gap-y-5">
              {chapters.find(c => c.chapter.key === curChapter.key)?.levels.slice(Math.max(0, cur - chapterOf(cur).key === curChapter.key ? (Math.floor((cur - 1) / PER) * PER) : 0, cur - 2), Math.max(0, cur - 2) + 10).map(n => (
                <button key={n.id} disabled={n.status === 'locked'} onClick={() => navigate(`/level/${n.id}`)} className="flex flex-col items-center gap-2 disabled:cursor-default">
                  <motion.span layoutId={`lvl-${n.id}`} className={`w-9 h-9 rounded-full border flex items-center justify-center text-[12px] font-mono ${
                    n.status === 'completed' ? 'bg-ink text-surface border-ink' :
                    n.id === cur ? 'border-accent text-accent' : 'border-line text-ink-muted bg-surface-card'}`}>
                    {n.status === 'completed' ? <Check className="w-4 h-4" strokeWidth={2} /> : n.id}
                  </motion.span>
                  <span className="text-[9px] text-ink-muted text-center line-clamp-1 w-full">{n.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
```

> 注：节点 `layoutId={`lvl-${n.id}`}` 供 Task 7 路由 morph。`slice` 取当前章节 10 关；可简化为 `chapters.find(...).levels` 全量渲染——若 slice 表达式过繁，改用 `{chapters.find(c => c.chapter.key === curChapter.key)!.levels.map(n => ...)}` 全量渲染该章节。

- [ ] **Step 2: 验证 check + build + 提交**

Run: `npm run check 2>&1 | tail -8 && npm run build 2>&1 | tail -3`
Expected: 干净/成功（若 `slice` 表达式有 TS 报错，按注改为全量渲染该章节）。
```bash
git add src/pages/LevelMap.tsx
git commit -m "feat(level-map): desktop-first jp-minimal home + hero entrance motion"
```

---

## Task 6: ScoreResultView 揭晓炫技序列

**Files:**
- Modify: `src/components/score/ScoreResultView.tsx`, `src/components/score/ScoreResultView.test.tsx`

**Interfaces:**
- Consumes: `lib/motion`（starPop/lineDraw/reveal）、`framer-motion`。
- Produces: 挂载后触发揭晓：径向光一闪 + 星级 spring overshoot 依次 + 总分滚动 + 环形填满 + 朱线划过。

- [ ] **Step 1: 加揭晓序列到 ScoreResultView**

在 `src/components/score/ScoreResultView.tsx` 顶部 import 加 `useEffect, useRef` 与 `variants` 已有。替换 stars/总分/环 区域为带揭晓序列的版本。关键改动：

- 顶部加状态与计数 hook：
```tsx
import { useState, useEffect, useRef } from 'react';
```
组件内（`headline` 之后）加：
```tsx
const [revealed, setRevealed] = useState(false);
const [scoreNum, setScoreNum] = useState(0);
const [ringNum, setRingNum] = useState(0);
useEffect(() => {
  const t = setTimeout(() => setRevealed(true), 80);
  return () => clearTimeout(t);
}, []);
// count-up score
useEffect(() => {
  if (!revealed) return;
  let raf = 0; const start = performance.now(); const dur = 1100;
  const tick = (now: number) => { const p = Math.min(1, (now - start) / dur); setScoreNum(Math.round(score.overall * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
}, [revealed, score.overall]);
// count-up ring
useEffect(() => {
  if (!revealed) return;
  let raf = 0; const start = performance.now(); const dur = 1000;
  const tick = (now: number) => { const p = Math.min(1, (now - start) / dur); setRingNum(Math.round(score.similarity * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
}, [revealed, score.similarity]);
```

- 替换 stars 区块为（径向光 + spring 星）：
```tsx
<div className="relative flex justify-center gap-3 mb-3">
  {revealed && <span className="pointer-events-none absolute left-1/2 top-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full" style={{ background: 'radial-gradient(circle,rgba(177,74,58,.32),rgba(177,74,58,0) 70%)', animation: 'burst 900ms cubic-bezier(.22,1,.36,1) forwards' }} />}
  {[1, 2, 3].map((i) => (
    <motion.svg key={i} variants={variants.starPop} initial="hidden" animate={revealed ? 'show' : 'hidden'} transition={{ delay: 0.18 + i * 0.15 }}
      className={`w-14 h-14 ${i <= score.stars ? 'text-gold' : 'text-line'}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </motion.svg>
  ))}
</div>
```
- 总分改为：`总分 {scoreNum} 分`（用 `scoreNum`）。
- 环形 `RingProgress` 改为自定义带 `stroke-dashoffset` 动画的 SVG（或给 RingProgress 传 `value={revealed ? score.similarity : 0}` 并依赖其 transition），并在中心显示 `ringNum`。最简：保留 `<RingProgress value={revealed ? score.similarity : 0} size={90} label="相似度" />`（RingProgress 已有 `transition-all duration-scenic`）。
- 在 stars 下方加朱线：
```tsx
<motion.div variants={variants.lineDraw} initial="hidden" animate={revealed ? 'show' : 'hidden'} transition={{ delay: 0.7 }} className="h-px bg-accent mx-auto w-1/2 origin-left" />
```

- 在 `src/index.css` 末尾加 keyframe：
```css
@keyframes burst { 0%{transform:scale(0);opacity:0} 30%{opacity:1} 100%{transform:scale(7);opacity:0} }
```

- [ ] **Step 2: 跑测试确认通过**

Run: `npm run test -- ScoreResultView 2>&1 | tail -8`
Expected: PASS（既有断言 stars/total/feedback 仍通过——总数现在初始 0，断言用 `getByText(/总分/)` 匹配"总分 0 分"仍含"总分"；若断言精确数字则放宽为正则）。

- [ ] **Step 3: 验证 check + build + 提交**

Run: `npm run check 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: 干净/成功。
```bash
git add src/components/score/ScoreResultView.tsx src/index.css
git commit -m "feat(score): reveal sequence (burst + star spring + count-up + line)"
```

---

## Task 7: 路由 shared-layout morph（AnimatePresence + layoutId）

**Files:**
- Modify: `src/App.tsx`、`src/components/layout/AppShell.tsx`、`src/pages/LevelDetail.tsx`

**Interfaces:**
- Produces: 路由 enter/exit + 关卡节点 → 详情大图共享元素 morph。AppShell 用 `<AnimatePresence mode="wait"><Routes location key>{children(Route 元素)}</Routes></AnimatePresence>`；LevelMap 节点 `layoutId={`lvl-${id}`}`（Task 5 已加）→ LevelDetail hero 图同 `layoutId`。

- [ ] **Step 1: App.tsx 改为传 `<Route>` 元素（非 `<Routes>`）**

把 `App()` 中 `<AppShell><Routes>...</Routes></AppShell>` 改为 `<AppShell>{/* Route 元素直接作为 children */}<Route .../>...</AppShell>`——即去掉外层 `<Routes>`，所有 `<Route>` 直接作为 AppShell 的 children。

- [ ] **Step 2: AppShell 加 AnimatePresence + keyed Routes**

`src/components/layout/AppShell.tsx`：import 加 `AnimatePresence`、`Routes`。把 `{children}` 包裹改为：
```tsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    {children}
  </Routes>
</AnimatePresence>
```
（`children` 现在是 `<Route>` 元素。）`PageLayout` 的 `motion.main` 用 `variants.routeIn`（含 exit）——现在 AnimatePresence 会触发 exit。

- [ ] **Step 3: LevelDetail hero 图加 layoutId**

`src/pages/LevelDetail.tsx`：找到 hero 参考图 `<img>`（或其容器），包一层 `motion.div layoutId={`lvl-${lid}`}`（与 LevelMap 节点同 id）。若详情页 hero 图 id 不是关卡号，用 `lid`。最小改动：在参考图容器加 `layoutId`。

- [ ] **Step 4: 验证 morph + check + build**

Run: `npm run check 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: 干净/成功。手测 `npm run dev`：关卡地图点节点 → 详情大图应从节点位置 morph 过渡（若 morph 不生效，确认两端 `layoutId` 相同 + AnimatePresence 包裹 Routes）。

- [ ] **Step 5: 提交**

```bash
git add src/App.tsx src/components/layout/AppShell.tsx src/pages/LevelDetail.tsx
git commit -m "feat(route): shared-layout morph (AnimatePresence + layoutId)"
```

---

## Task 8: E2E 桌面视口 + 全量验证

**Files:**
- Modify: `tests/e2e/slice.spec.ts`（加桌面断言）

- [ ] **Step 1: 扩展 E2E 桌面断言**

在 `tests/e2e/slice.spec.ts` 的 desktop project 测试中，确认桌面端侧栏存在 + 首屏标题可见。追加（在到达 `/` 后）：
```ts
// desktop only
if (project.name === 'desktop') {
  await expect(page.getByText('ShotMaster').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: curLevelTitle })).toBeVisible();
}
```
（若不便引用变量，用 `page.getByText(/构图|三分/)`)。

- [ ] **Step 2: 跑 E2E + 全量**

Run: `npm run e2e 2>&1 | tail -20 && npm run test 2>&1 | tail -6 && npm run check 2>&1 | tail -4 && npm run build 2>&1 | tail -3`
Expected: E2E 移动+桌面通过；单测全过；check 干净；build 成功。

- [ ] **Step 3: grep 去 AI 味 + 提交**

Run: `grep -rnE "📷|🎯|📌|⚠️|🏆|🔥|gray-[0-9]|red-500|pink-500|yellow-400" src/pages/LevelMap.tsx src/components/layout/ src/components/score/ | head`
Expected: 仅 `🔥` 在 BottomNav/Sidebar 的 Flame 图标非 emoji（lucide）；无裸 gray/red/pink/yellow。
```bash
git add tests/e2e/slice.spec.ts
git commit -m "test(e2e): desktop viewport assertions for jp-minimal home"
```

---

## 收尾验证

- [ ] **Step 1: 全量测试 + 构建**

Run: `npm run test && npm run check && npm run build`
Expected: 全过；check 干净；build 成功。

- [ ] **Step 2: 手动 UAT（对照 spec §12）**

`npm run dev`，逐条核对 spec §12 验收 1–6（桌面侧栏 + 非对称首屏 + 移动 9:16 + 令牌无 gray/emoji + 动效/揭晓/reduced-motion + 字体不斜体重叠）。

- [ ] **Step 3: 提交 + 标记阶段 2 完成**

```bash
git add -A && git commit -m "chore: phase 2 complete — desktop jp-minimal home + reveal"
```

---

## Self-Review（已执行）

- **Spec 覆盖**：令牌/字体(T1)✓、动效变体(T2)✓、桌面外壳+Sidebar(T3,4)✓、首屏重设计+hero入场(T5)✓、揭晓炫技(T6)✓、路由morph(T7)✓、E2E/验证(T8)✓。去emoji/去gray 在 T5/T8 grep。reduced-motion 在 Global Constraints + MotionConfig。
- **占位符**：无 TBD；T5 的 `slice` 表达式给了简化备选（全量渲染该章节）。
- **类型一致**：`NavSection`(BottomNav 导出，Sidebar/T4 消费)✓；`variants.reveal/starPop/heroImage/heroTitle/lineDraw`(T2 定义，T5/T6 消费)✓；`layoutId={`lvl-${id}`}`(T5 加，T7 消费)✓。
- **风险**：T7（AnimatePresence + frozen location + layoutId）最复杂；若 morph 不稳，可回退为 enter-only（T4 状态）而不破坏其余。
