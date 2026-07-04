# ShotMaster PhotoScene 合成场景 设计规格

- **日期**：2026-07-04
- **状态**：待审阅
- **分支**：`photoscene-synthetic`
- **前置**：master（`e9dc7d4`）。InteractiveLesson + 5 concept（exposure/wb/iso/aperture/focal）现状用 Unsplash 外链预览图。

## 1. 背景与目标

学习中心"动手练习"5 个概念（曝光/白平衡/ISO/光圈/焦距）的实时预览依赖一张可见图，目前该图是 `https://images.unsplash.com/...` 外链。外链失败/被墙/图被删会导致"图片没加载"，而互动调节参数（拖滑条 → 实时 `filter`/`transform`）完全依赖这张图可见才有意义。

**目标**：用内联 SVG 合成的"场景"替换真实照片 —— 永不失败（零网络）、仍支持全部实时调节机制、且扁平编辑插画风更贴合 jp-minimal 品牌。

## 2. PhotoScene 组件

- **文件**：`src/components/lesson/PhotoScene.tsx`
- **Props**：`{ variant: SceneVariant; style?: CSSProperties; className?: string; alt?: string }`
- **SceneVariant**：`'landscape' | 'neutral' | 'lowlight' | 'portrait' | 'street'`
- **渲染**：`<div className style><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt}>…</svg></div>`
  - 外层 `div` 承接 `style`（filter/transform 由 InteractiveLesson 传入）与 `className`（`absolute inset-0 w-full h-full`）。
  - `preserveAspectRatio="xMidYMid slice"` 模拟 `object-cover` 裁切。
- **调色**：washi `#F7F6F2` / sumi `#1A1A1A` / 朱 `#B14A3A` / 金 `#9A7B3A` + 中性灰阶；扁平编辑插画风（几何 + 渐变，**非仿真**）。
- **a11y**：`svg role="img" aria-label`（替代原 `<img alt>`）。

## 3. 5 个场景构图（按概念定制）

| variant | 概念 | 构图 | 为何适配该参数 |
|---|---|---|---|
| `landscape` | 曝光 | 日照风景：天空渐变（浅蓝→暖白）、太阳（径向朱/金辉光）、远山（灰阶 3 层）、暖绿草地 | 强明暗与色彩范围，`brightness/saturate` 增减读得最清 |
| `neutral` | 白平衡 | 雪景/白花：大面积中性白 + 灰卡（灰阶方块）+ 淡蓝阴影 | 中性白让 `hue-rotate/sepia` 暖冷偏色最明显 |
| `lowlight` | ISO | 昏黄街灯夜景：深蓝夜空、暖黄路灯（径向金辉光）、建筑剪影 | 低光让 `brightness/contrast` 与噪点 overlay 读得清 |
| `portrait` | 光圈 | 中心人像主体（头肩剪影）+ 繁杂背景（树叶/光斑纹理） | 径向 mask 揭示中心合焦点，景深最直观 |
| `street` | 焦距 | 纵深透视街道：两侧建筑透视线、远端消失点、近景路面 | `scale` 裁切展示空间压缩 |

## 4. InteractiveLesson 改造

`ConceptConfig` 类型：`image: { src: string; alt: string }` → `scene: SceneVariant; alt: string`。

三条渲染路径：

1. **普通**（曝光/WB/ISO/焦距）：
   `<img src style={filter}/>` → `<PhotoScene variant={scene} alt={alt} className="w-full h-full" style={comparing ? {} : concept.filter(value)} />`
2. **`layers`**（光圈）：两个 `<img>` → 两个 `<PhotoScene>`
   - 背景层：`style={comparing ? {} : concept.filter(value)}`（`blur`）
   - 前景层：`style={comparing ? {} : { WebkitMaskImage: radial-gradient(...), maskImage: radial-gradient(...) }}`（径向 mask 应用在 PhotoScene wrapper div 上，揭示中心合焦点）
3. **`overlay`**（ISO 噪点 div）：不变，仍叠在最上层。

其他不变：
- `comparing`（长按对比原图）仍清空 style —— 露出未处理 SVG，仍是有效 before/after。
- 滑条 / 命中反馈 / `readout` / `captions` / toast 全不动。
- 移除 `loading="lazy"`（SVG 无需懒加载）。

## 5. 5 concept 配置改

| 文件 | 旧 | 新 |
|---|---|---|
| `exposure.ts` | `image: { src: unsplash…, alt }` | `scene: 'landscape', alt: '日照风景'` |
| `wb.ts` | 同 | `scene: 'neutral', alt: '雪景与白花'` |
| `iso.ts` | 同 | `scene: 'lowlight', alt: '昏黄街灯夜景'` |
| `aperture.ts` | 同 | `scene: 'portrait', alt: '中心人像主体'` |
| `focal.ts` | 同 | `scene: 'street', alt: '纵深透视街道'` |

全部移除 Unsplash URL。

## 6. 测试

- **`PhotoScene.test.tsx`**（新增）：5 个 variant 各渲染不报错；svg `role="img"` + `aria-label` 透传。
- **`filters.test.ts`**：不变（测 ParamMap 纯函数，与图源无关）。
- **手测**：5 概念打开即见合成场景（无网络请求）；拖动参数实时滤镜生效；光圈 mask 景深、ISO 噪点、焦距裁切、长按对比均工作。

## 7. 范围

- 新增 `PhotoScene` 组件 + 5 段内联 SVG。
- `InteractiveLesson`：`<img>` → `<PhotoScene>`（2 路径）+ `ConceptConfig.image` → `scene`。
- 5 concept 配置改 `scene` + 移除 Unsplash URL。
- **不含**：Learn hub 文字按钮（本就无图）、课程列表 `course.thumbnail` 缩略图（另一处，本次不动）、admin ④。

## 8. 验收

1. 5 概念打开即见合成场景，**无加载失败、无网络请求**（DevTools Network）。
2. 拖动参数实时 `filter`/`transform` 生效。
3. 光圈径向 mask 景深、ISO 噪点 overlay、焦距 scale 裁切均工作。
4. 长按"对比原图"露出未处理 SVG，有效 before/after。
5. `npm run check`/`build`/`test` 绿；a11y（svg role/aria-label）到位。
