# PhotoScene 合成场景 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用内联 SVG 合成的 `<PhotoScene>` 组件替换 `InteractiveLesson` 里的 Unsplash `<img>`，5 个概念各配一个为该参数定制的场景——永不失败、仍支持实时 filter/transform/layers/overlay/对比。

**Architecture:** 新建 `PhotoScene.tsx`（`variant` 选 5 段 SVG 之一，外层 div 承接 `style`/`className`，svg `role="img" aria-label`）；`ConceptConfig.image:{src,alt}` → `scene:SceneVariant; alt`；`InteractiveLesson` 3 条渲染路径 `<img>` → `<PhotoScene>`（光圈仍两层径向 mask、ISO 噪点 overlay 不变）。

**Tech Stack:** React 18 + TS + 内联 SVG（无依赖）。分支 `photoscene-synthetic`，基线 `master`（`d24888f`）。

## Global Constraints

- **调色**：washi `#F7F6F2` / sumi `#1A1A1A` / 朱 `#B14A3A` / 金 `#9A7B3A` / line `#E6E4DE` + 场景专属低饱和色（天蓝/暖绿/夜蓝/金辉光）。扁平编辑插画风（几何 + 渐变，**非仿真**）。
- **SVG**：`viewBox="0 0 400 300"` + `preserveAspectRatio="xMidYMid slice"`（模拟 `object-cover` 裁切）。
- **渐变 ID 唯一**：每个 `PhotoScene` 实例用 `React.useId()` 去冒号作前缀，所有 `<defs>` id 与 `url(#…)` 引用都带该前缀——光圈场景会渲染 2 个 `portrait` 实例，重复 id 会导致渲染错乱。
- **ConceptConfig 类型**：`image: { src; alt }` → `scene: SceneVariant; alt: string`。
- **零网络**：移除全部 Unsplash URL；SVG 全部内联。无 `loading="lazy"`（SVG 无需）。
- **reduced-motion**：SVG 场景静态无动画，与 reduced-motion 无冲突；filter/transform 照常应用。
- **范围**：仅 `PhotoScene` + `InteractiveLesson` + 5 concept。Learn hub 文字按钮无图不动；课程 `thumbnail` 缩略图不动。

---

## Task 1: PhotoScene 组件（TDD）

**Files:**
- Create: `src/components/lesson/PhotoScene.tsx`、`src/components/lesson/PhotoScene.test.tsx`

**Interfaces:**
- Produces: `SceneVariant` type、`PhotoScene` 组件（`{ variant: SceneVariant; alt: string; style?: CSSProperties; className?: string }`）。

- [ ] **Step 1: 写 PhotoScene.test.tsx（RED）**

```tsx
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
```

- [ ] **Step 2: 跑测试确认 RED**

Run: `npm run test -- PhotoScene 2>&1 | tail -8`
Expected: FAIL（PhotoScene 未定义）。

- [ ] **Step 3: 写 PhotoScene.tsx（5 段 SVG，渐变 id 用 useId 前缀）**

```tsx
import React from 'react';
import type { CSSProperties } from 'react';

export type SceneVariant = 'landscape' | 'neutral' | 'lowlight' | 'portrait' | 'street';

const SCENES: Record<SceneVariant, (uid: string) => React.ReactNode> = {
  // 曝光：日照风景（强明暗 + 色彩范围）
  landscape: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8D2E0" />
          <stop offset="1" stopColor="#F0E8D6" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4DC8C" />
          <stop offset="0.4" stopColor="#E8B86A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E8B86A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <circle cx="296" cy="74" r="78" fill={`url(#${uid}-sun)`} />
      <circle cx="296" cy="74" r="30" fill="#F4DC8C" />
      <path d="M0 188 L78 142 L150 184 L214 138 L286 182 L360 150 L400 172 L400 232 L0 232 Z" fill="#9AA6A0" />
      <path d="M0 214 L64 182 L140 210 L210 176 L282 214 L352 192 L400 206 L400 240 L0 240 Z" fill="#7E8B84" />
      <rect x="0" y="232" width="400" height="68" fill="#9DAE7C" />
      <rect x="0" y="232" width="400" height="8" fill="#8A9B68" />
      <rect x="68" y="200" width="6" height="32" fill="#5A6450" />
      <circle cx="71" cy="194" r="20" fill="#6E7A5E" />
    </>
  ),
  // 白平衡：雪景 + 白花 + 灰卡（中性白/灰让暖冷偏色最明显）
  neutral: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8E6E0" />
          <stop offset="1" stopColor="#F7F6F2" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <rect x="0" y="180" width="400" height="120" fill="#FBFAF7" />
      <path d="M0 180 Q100 168 200 180 Q300 192 400 178 L400 200 L0 200 Z" fill="#EDEFF2" />
      <rect x="40" y="150" width="56" height="42" fill="#8A8A86" />
      <rect x="40" y="150" width="56" height="42" fill="none" stroke="#6B6B66" strokeWidth="1" />
      <path d="M300 300 L300 150 M300 180 L280 150 M300 175 L322 150 M300 200 L286 175 M300 205 L316 182" stroke="#3D3D3A" strokeWidth="2" fill="none" />
      <g fill="#FFFFFF" stroke="#E6E4DE" strokeWidth="1">
        <circle cx="150" cy="220" r="9" />
        <circle cx="175" cy="245" r="7" />
        <circle cx="120" cy="250" r="8" />
        <circle cx="220" cy="225" r="8" />
      </g>
      <g fill="#E8B86A">
        <circle cx="150" cy="220" r="2" />
        <circle cx="175" cy="245" r="2" />
        <circle cx="120" cy="250" r="2" />
        <circle cx="220" cy="225" r="2" />
      </g>
    </>
  ),
  // ISO：昏黄街灯夜景（低光让 brightness/contrast/噪点读得清）
  lowlight: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2A3D" />
          <stop offset="1" stopColor="#3A3340" />
        </linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4DC8C" />
          <stop offset="0.4" stopColor="#E8B86A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E8B86A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <rect x="0" y="120" width="90" height="180" fill="#1A1A1A" />
      <rect x="80" y="160" width="70" height="140" fill="#232321" />
      <rect x="250" y="140" width="80" height="160" fill="#232321" />
      <rect x="320" y="100" width="80" height="200" fill="#1A1A1A" />
      <g fill="#E8B86A" opacity="0.85">
        <rect x="20" y="150" width="8" height="12" />
        <rect x="40" y="150" width="8" height="12" />
        <rect x="20" y="190" width="8" height="12" />
        <rect x="340" y="140" width="8" height="12" />
        <rect x="360" y="180" width="8" height="12" />
      </g>
      <circle cx="200" cy="120" r="90" fill={`url(#${uid}-lamp)`} />
      <circle cx="200" cy="120" r="9" fill="#F4DC8C" />
      <rect x="198" y="120" width="4" height="180" fill="#1A1A1A" />
      <rect x="0" y="280" width="400" height="20" fill="#15151A" />
    </>
  ),
  // 光圈：中心人像主体 + 繁杂散景背景（径向 mask 揭示中心合焦点）
  portrait: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A86A" />
          <stop offset="1" stopColor="#8FA68A" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-bg)`} />
      <g opacity="0.5">
        <circle cx="60" cy="60" r="26" fill="#E8C77A" />
        <circle cx="340" cy="70" r="32" fill="#A8C0A2" />
        <circle cx="40" cy="220" r="22" fill="#D9B27A" />
        <circle cx="360" cy="200" r="28" fill="#9DB4A0" />
        <circle cx="110" cy="40" r="14" fill="#F0DC9A" />
        <circle cx="300" cy="240" r="18" fill="#C9A86A" />
        <circle cx="180" cy="50" r="12" fill="#B8C8A8" />
        <circle cx="240" cy="250" r="16" fill="#E8C77A" />
      </g>
      <circle cx="200" cy="140" r="42" fill="#3D3D3A" />
      <path d="M132 300 Q132 210 200 210 Q268 210 268 300 Z" fill="#3D3D3A" />
      <circle cx="200" cy="140" r="42" fill="none" stroke="#2A2A28" strokeWidth="1" />
    </>
  ),
  // 焦距：纵深透视街道（scale 裁切展示空间压缩）
  street: (uid) => (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CDD8DC" />
          <stop offset="1" stopColor="#EDEAE2" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <polygon points="0,300 0,90 200,150 200,300" fill="#6E6A60" />
      <polygon points="0,90 0,70 210,150 200,150" fill="#8A8578" />
      <polygon points="400,300 400,110 200,150 200,300" fill="#5E5A50" />
      <polygon points="400,110 400,90 190,150 200,150" fill="#7A7568" />
      <g fill="#3D3D3A" opacity="0.6">
        <rect x="30" y="120" width="20" height="28" />
        <rect x="70" y="130" width="18" height="26" />
        <rect x="30" y="180" width="20" height="28" />
        <rect x="70" y="185" width="18" height="26" />
        <rect x="350" y="135" width="18" height="26" />
        <rect x="310" y="125" width="20" height="28" />
        <rect x="350" y="185" width="18" height="26" />
      </g>
      <polygon points="150,300 250,300 200,150" fill="#4A4A45" />
      <polygon points="180,300 220,300 200,150" fill="#5A5A55" />
      <circle cx="200" cy="150" r="3" fill="#2A2A28" />
    </>
  ),
};

interface Props {
  variant: SceneVariant;
  alt: string;
  style?: CSSProperties;
  className?: string;
  ariaHidden?: boolean;
}

export function PhotoScene({ variant, alt, style, className = '', ariaHidden = false }: Props) {
  const uid = React.useId().replace(/:/g, '');
  return (
    <div className={className} style={style} aria-hidden={ariaHidden || undefined}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : alt}
        className="block w-full h-full"
      >
        {SCENES[variant](uid)}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: 跑测试确认 GREEN**

Run: `npm run test -- PhotoScene 2>&1 | tail -8`
Expected: PASS（7 用例：5 variant + className/style）。

- [ ] **Step 5: 验证 + 提交**

Run: `npm run check 2>&1 | tail -5 && npm run build 2>&1 | tail -3`
Expected: 绿。
```bash
git add src/components/lesson/PhotoScene.tsx src/components/lesson/PhotoScene.test.tsx
git commit -m "feat(lesson): PhotoScene inline-SVG synthetic scene component"
```

## Task 2: InteractiveLesson 接入 PhotoScene + 类型改造

**Files:**
- Modify: `src/components/lesson/InteractiveLesson.tsx`

**Interfaces:**
- Consumes: `PhotoScene`、`SceneVariant`（Task 1 产出）。
- Produces: `ConceptConfig` 新签名 `scene: SceneVariant; alt: string`（替换 `image`）。

- [ ] **Step 1: 改 ConceptConfig 类型 + import**

`InteractiveLesson.tsx` 顶部加 import：
```tsx
import { PhotoScene, type SceneVariant } from './PhotoScene';
```
`ConceptConfig` 接口里把：
```tsx
  image: { src: string; alt: string };
```
替换为：
```tsx
  scene: SceneVariant;
  alt: string;
```

- [ ] **Step 2: 普通路径 img → PhotoScene**

把第 86 行（普通路径，非 layers 分支）的：
```tsx
          <img src={concept.image.src} alt={concept.image.alt} className="w-full h-full object-cover transition-[filter,transform] duration-75" style={comparing ? {} : concept.filter(value)} loading="lazy" />
```
替换为：
```tsx
          <PhotoScene variant={concept.scene} alt={concept.alt} className="w-full h-full transition-[filter,transform] duration-75" style={comparing ? {} : concept.filter(value)} />
```

- [ ] **Step 3: layers 路径 2 个 img → 2 个 PhotoScene**

把第 82–83 行（layers 分支）的：
```tsx
            <img src={concept.image.src} alt={concept.image.alt} className="absolute inset-0 w-full h-full object-cover" style={comparing ? {} : concept.filter(value)} loading="lazy" />
            <img src={concept.image.src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={comparing ? {} : { WebkitMaskImage: `radial-gradient(circle at 50% 50%, #000 ${concept.layers.foregroundMask?.(value) ?? 100}%, transparent)`, maskImage: `radial-gradient(circle at 50% 50%, #000 ${concept.layers.foregroundMask?.(value) ?? 100}%, transparent)` }} loading="lazy" />
```
替换为：
```tsx
            <PhotoScene variant={concept.scene} alt={concept.alt} className="absolute inset-0 w-full h-full" style={comparing ? {} : concept.filter(value)} />
            <PhotoScene variant={concept.scene} alt="" ariaHidden className="absolute inset-0 w-full h-full" style={comparing ? {} : { WebkitMaskImage: `radial-gradient(circle at 50% 50%, #000 ${concept.layers.foregroundMask?.(value) ?? 100}%, transparent)`, maskImage: `radial-gradient(circle at 50% 50%, #000 ${concept.layers.foregroundMask?.(value) ?? 100}%, transparent)` }} />
```
（前景层 `ariaHidden`：它是揭示合焦点的装饰副本，必须对读屏隐藏（svg `role="img"` + 空 `aria-label` 不如 `aria-hidden` 可靠），a11y 由背景层承担。`alt=""` 仅占位——`ariaHidden` 时不再渲染 role/aria-label。）

- [ ] **Step 4: 验证 + 提交**

Run: `npm run check 2>&1 | tail -8`
Expected: 类型报错指向 5 个 concept 的 `image` 字段（Task 3 修）。这是预期的——concept 还在用旧 `image`。
> 注：本步 tsc 会因 concept 文件未改而报错，属正常。先不提交，Task 3 一起验。若想本步独立绿，可暂用 `// @ts-expect-error` 跳过——不推荐，直接进 Task 3。

## Task 3: 5 concept 配置改 scene + 移除 Unsplash

**Files:**
- Modify: `exposure.ts`、`wb.ts`、`iso.ts`、`aperture.ts`、`focal.ts`（均在 `src/components/lesson/concepts/`）

- [ ] **Step 1: exposure.ts → landscape**

把：
```ts
  image: {
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd12c9da?auto=format&fit=crop&w=900&q=80',
    alt: '曝光示例风景',
  },
```
替换为：
```ts
  scene: 'landscape',
  alt: '日照风景',
```

- [ ] **Step 2: wb.ts → neutral**

把：
```ts
  image: { src: 'https://images.unsplash.com/photo-1519331379826-f10be5486986?auto=format&fit=crop&w=900&q=80', alt: '白平衡示例' },
```
替换为：
```ts
  scene: 'neutral',
  alt: '雪景与白花',
```

- [ ] **Step 3: iso.ts → lowlight**

把：
```ts
  image: { src: 'https://images.unsplash.com/photo-1502602898-b0deb70d70ac?auto=format&fit=crop&w=900&q=80', alt: 'ISO 示例' },
```
替换为：
```ts
  scene: 'lowlight',
  alt: '昏黄街灯夜景',
```

- [ ] **Step 4: aperture.ts → portrait**

把：
```ts
  image: { src: 'https://images.unsplash.com/photo-1504198266287-5f4a2f4a2f1f?auto=format&fit=crop&w=900&q=80', alt: '光圈示例' },
```
替换为：
```ts
  scene: 'portrait',
  alt: '中心人像主体',
```

- [ ] **Step 5: focal.ts → street**

把：
```ts
  image: { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80', alt: '焦距示例' },
```
替换为：
```ts
  scene: 'street',
  alt: '纵深透视街道',
```

- [ ] **Step 6: 验证 + 提交（Task 2+3 合并验）**

Run: `npm run check 2>&1 | tail -8 && npm run test 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: 全绿（类型、单测、构建）。
```bash
git add src/components/lesson/InteractiveLesson.tsx src/components/lesson/concepts/
git commit -m "refactor(lesson): swap img→PhotoScene + concept image→scene (drop Unsplash)"
```

## Task 4: 全量验证 + 手测

- [ ] **Step 1: 全量**

Run: `npm run test && npm run check && npm run build`
Expected: 全过（含原 34 + 新 PhotoScene 7 = 41）。

- [ ] **Step 2: grep 确认无 Unsplash 残留（concept 范围）**

Run: `grep -rn "unsplash" src/components/lesson/`
Expected: **空**。

- [ ] **Step 3: 手动 UAT + 提交**

`npm run dev` → 学习中心 → 动手练习，逐一打开 5 概念：
1. 打开即见合成场景，DevTools Network 无 unsplash 请求。
2. 拖滑条：曝光（亮暗）/WB（暖冷）/ISO（亮度+噪点）/光圈（背景虚化 + 中心合焦点）/焦距（缩放裁切）实时生效。
3. 长按"对比原图"露出未处理 SVG，before/after 有效。
4. 命中目标有 toast + "完成练习"可点。
```bash
git add -A && git commit -m "chore: photoscene synthetic scenes complete — verified"
```

---

## Self-Review（已执行）

- **Spec 覆盖**：PhotoScene 组件+5 SVG(T1)✓ InteractiveLesson 3 路径替换+类型改造(T2)✓ 5 concept scene+移除 Unsplash(T3)✓ 全量验证(T4)✓。
- **占位符**：无 TBD；5 段 SVG 完整代码；PhotoScene 组件完整；测试完整。
- **类型一致**：`SceneVariant`(T1) → `ConceptConfig.scene`(T2) → 5 concept `scene: 'landscape'/'neutral'/'lowlight'/'portrait'/'street'`(T3) 一致。`alt` 从 `image.alt` 提升为顶层 `concept.alt`(T2/T3) 一致。
- **渐变 id 唯一**：`React.useId()` 去冒号前缀——光圈 2 实例 portrait 不撞 id（T1 约束）。
- **范围**：仅 InteractiveLesson + 5 concept + PhotoScene；hub/course 缩略图不动。
