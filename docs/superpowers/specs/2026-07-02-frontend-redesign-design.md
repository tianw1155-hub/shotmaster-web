# ShotMaster 前端重塑设计规格

- **日期**：2026-07-02
- **状态**：待审阅
- **范围**：ShotMaster 摄影学习站的全部前端（公开页面 + 后台 admin）的视觉与交互重塑
- **执行策略**：北极星纵切（North-star vertical slice），分三期推进
- **关联**：本 spec 描述完整愿景；第一个实现计划（writing-plans）只覆盖**阶段 1（地基 + 纵切流程）**，阶段 2/3 作为后续计划

---

## 1. 背景与目标

ShotMaster 是一个游戏化摄影学习站：关卡地图、星级评分、连击、拍摄挑战、AI 评分、图库、社区、课程、后台管理。技术栈 React 18 + TS + Vite + Tailwind 3 + react-router v7 + zustand + lucide。

用户反馈："前端不够好看，想要风格统一、动效高级、衔接流畅。"并进一步要求：不仅改视觉，还要**优化交互方式**（例：学曝光时可拖动曝光条实时改变图像）。

### 目标（可验收）
1. **风格统一**：全站从单一设计系统派生，消除令牌泄漏、重复外壳、死深色模式。
2. **动效高级**：统一 motion 系统，路由转场、微交互、滚动触发、弹簧触控；尊重 reduced-motion。
3. **衔接流畅**：路由间淡入轻推 + shared-layout 图片过渡，无硬切。
4. **可交互学习**：6–8 个摄影基础概念做成"拖动 → 实时图像 → 讲解 → 目标反馈"的统一课件组件。
5. **响应式**：移动优先，桌面/平板也好看，修掉桌面端"窄手机列 + 大片留白"。

### 非目标（Out of Scope）
- 不改产品逻辑/数据模型/后端 API（仅前端 + 必要的本地状态）。
- 不做 3D（Three/R3F/Spline）、不上 GSAP（Framer Motion 覆盖）、不引入 Shadcn 默认外观、不上弥散渐变背景。
- 不重做游戏化机制（关卡/星级/连击保留）。
- 不做深色模式（见 §5.4：移除死代码，亮调编辑为唯一身份；将来想要深色作为独立后续）。

---

## 2. 现状诊断（改造依据）

| 问题 | 证据 |
|---|---|
| 无统一布局壳 | 每页各自复制 `min-h-screen + TopBar + BottomNav`；`App.tsx` 公开路由无 Layout 包裹 |
| 令牌泄漏 | 100+ 处 `gray-xxx/red-500/green-600/pink-500/yellow-400`；引用未定义的 `accent`（渐变失效）；多处硬编码 hex |
| 深色模式名存实亡 | `darkMode:"class"` + `useTheme` 存在，但全项目 0 个 `dark:` 变体 |
| 无路由转场 | 页面间硬切换 |
| 动效纯 CSS 关键帧 | 有入场动画，无编排/退场/shared-layout |
| 桌面观感差 | 全站 `max-w-lg` 居中，大屏两侧大片留白 |
| 组件重复 | 评分结果页（Score/GalleryScore/CommunityScore）三处近似；悬浮返回按钮三处；AI 计划折叠两处 |
| `Button` 未用 `cn()` | 用裸字符串拼接 |

---

## 3. 设计方向（已定决策）

| 维度 | 决策 |
|---|---|
| 改造方向 | 精致升级（保留游戏化内核，提升视觉语言到高级层次） |
| 视觉气质 | 亮调编辑 · 凌厉版（ink-on-paper，非奶油） |
| 标题字体 | Bodoni Moda（Didone 高对比衬线，仅大标题）+ Inter（UI/正文） |
| 配色 | 冷纸 + 真黑墨 + 暗酒红单点强调 + 哑光金星级 + 语义色 |
| 交互学习 | 拖动→实时图像→讲解→目标反馈；6–8 概念；融入 Learn |
| 执行策略 | 北极星纵切，三期 |
| 目标设备 | 移动优先，桌面 ≥1024 双栏响应式 |
| 深色模式 | 移除死代码，亮调编辑为唯一身份 |
| 工具箱 | Framer Motion + CVA + Radix + Lenis + Lottie + Playwright（全套） |

---

## 4. 设计系统（令牌）

### 4.1 配色（tailwind.config `theme.extend.colors`）

```js
surface: { DEFAULT: '#F2F2EF', card: '#FFFFFF', muted: '#EDEDEA' },
ink:     { DEFAULT: '#14161A', secondary: '#3A3D44', muted: '#6B6E76' },
accent:  { DEFAULT: '#6E2233', soft: '#9A4A55' },   // 暗酒红（珊瑚深化）
line:    '#E2E2DE',
success: '#2D784B',
warning: '#A05014',
danger:  '#9A2A2A',
gold:    '#B8954A',                                    // 哑光金，替代亮黄
// 章节色（低饱和和谐，仍可区分）
chapter: {
  composition: '#6B8E7F',  // 鼠尾草绿
  light:       '#C9A24A',  // 哑光金
  color:       '#9B6B8A',  // 雾紫
  narrative:   '#6B7B95',  // 石板蓝
  master:      '#A56B5A',  // 赤陶
},
```

- **使用规则**：语义场景一律走令牌。`accent` 仅用于关键 CTA / 当前态 / 命中反馈，**克制使用**。主操作按钮用 `ink` 实底。星级用 `gold`。禁止再出现裸 `gray-xxx/red-500/pink-500` 等。
- 章节色统一通过 `chapter.*` 派生 light（/10 tint 背景）/ DEFAULT（节点/强调），不再散落 hex。

### 4.2 字体

```js
fontFamily: {
  display: ['"Bodoni Moda"', 'Georgia', 'serif'],   // 大标题/封面/引语
  body:    ['"Inter"', 'system-ui', 'sans-serif'],  // 全部 UI/正文
  mono:    ['"JetBrains Mono"', 'monospace'],       // 数值/EV/读数
}
```

字阶（Figma-like 命名 → 实际 px/weight）：
- `display-xl`：Bodoni 30/600（页面大标题，可斜体点睛）
- `display`：Bodoni 22/600（章节标题）
- `title`：Bodoni 18/500（关卡/卡片标题）
- `body`：Inter 16/500
- `caption`：Inter 14/400
- `overline`：Inter 11/600 大写 letter-spacing .14em（标签/状态）
- `mono-value`：JetBrains Mono 用于 EV/参数读数

### 4.3 圆角 / 描边 / 阴影

```js
borderRadius: { none:'0', sm:'4px', DEFAULT:'6px', md:'8px', lg:'12px', xl:'16px', full:'9999px' },
// 卡片/按钮默认 8px；图框直角(0)；badge 4px。整体比现状(2xl/3xl/4xl)更利。
boxShadow: {
  none: 'none',
  hairline: 'inset 0 0 0 1px #E2E2DE',           // 发丝线（首选分隔方式）
  elevated: '0 1px 2px rgba(20,22,26,.04), 0 8px 24px rgba(20,22,26,.06)',
  focus: '0 0 0 3px rgba(110,34,51,.28)',        // 聚焦环（accent）
}
```

### 4.4 动效令牌

```js
// 时长
duration: { fast: '140ms', base: '220ms', slow: '380ms', scenic: '600ms' },
// 缓动
ease: { out: 'cubic-bezier(.22,1,.36,1)', inOut: 'cubic-bezier(.65,0,.35,1)', editorial: 'cubic-bezier(.22,1,.36,1)' },
```

Framer Motion variants（见 §6.2）。

---

## 5. 架构与外壳

### 5.1 `<PageLayout>`（新增，统一外壳）

```tsx
<PageLayout
  nav="levels"            // BottomNav active tab；桌面侧栏高亮
  title="摄影之路"        // 可选，注入 TopBar
  variant="default"       // default | immersive（拍摄页全屏黑底，无 nav）
  desktop="single"        // single | split（主内容+侧详情）
>
  {children}
</PageLayout>
```

- 内部组合 `TopBar` + 内容区 + `BottomNav`（移动）/ 桌面顶栏+侧栏。
- `pb-20/pb-24` 不一致问题在此统一为单一 token（`--nav-height`）。
- immersive 变体用于 `/shoot`（全屏相机），不渲染 nav。

### 5.2 响应式策略

- 移动优先，断点 `sm 640 / md 768 / lg 1024 / xl 1280`。
- `lg+`：公开页面从单列窄手机栏改为**双栏**（主内容 + 侧栏导航/详情），内容区 `max-w` 提升到 `max-w-6xl`，居中。
- 拍摄/课件等全屏交互页保持全屏。
- `max-w-lg` 全局替换为响应式（移动满宽，桌面入栏）。

### 5.3 路由与转场（Framer Motion）

- 在 `<PageLayout>` 外层包 `<AnimatePresence mode="wait">`，路由 enter/exit 做 `fade + slide 8px`（`ease.editorial`，`duration.scenic`）。
- 详情页（`/level/:id`、`/gallery/:id`、`/learn/:id`）用 `layoutId` 做**图片放大 shared-layout 过渡**（列表缩略图 → 详情大图）。
- 弹窗/抽屉用 scale+fade；列表项用 stagger。

### 5.4 移除死代码

- 删除 `src/hooks/useTheme.ts`、`tailwind.config` 的 `darkMode: "class"`、`index.css` 里硬编码的 `background-color/color`（改走令牌）。
- 修复未定义 `accent`：现在 `accent` 是真令牌（§4.1），原 `to-accent` 渐变生效或改用 `ink→accent`。

### 5.5 目录结构（新增）

```
src/
  components/
    layout/PageLayout.tsx          # 新增
    ui/                            # Button/Card/Badge/StarRating/ProgressBar/RingProgress（改用 CVA + cn）
    lesson/InteractiveLesson.tsx   # 新增（§8）
    lesson/concepts/               # 每个概念一份配置（§8.3）
    score/ScoreResultView.tsx      # 提取（§7）
  lib/motion.ts                    # motion variants + easings（新增）
  lib/filters.ts                   # 参数→CSS filter 映射纯函数（新增，可单测）
  styles/tokens.css                # CSS 变量镜像（供非 tailwind 场景）
```

---

## 6. 动效系统

### 6.1 原则
- 动画只用 `transform` + `opacity`（性能）。
- 统一走 `lib/motion.ts` 的 variants，禁止散落 inline magic numbers。
- `prefers-reduced-motion: reduce` 时：关闭转场/弹簧/stagger，仅保留瞬时态变化（全局 `MotionConfig reducedMotion="user"`）。

### 6.2 Motion variants（`lib/motion.ts`）

```ts
export const EASE = { editorial: [0.22,1,0.36,1], inOut: [0.65,0,0.35,1] };
export const variants = {
  fadeUp:   { hidden:{opacity:0,y:8}, show:{opacity:1,y:0,transition:{duration:.38,ease:EASE.editorial}} },
  fadeIn:   { hidden:{opacity:0}, show:{opacity:1,transition:{duration:.22,ease:'easeOut'}} },
  scaleIn:  { hidden:{opacity:0,scale:.96}, show:{opacity:1,scale:1,transition:{duration:.22,ease:'easeOut'}} },
  routeIn:  { initial:{opacity:0,y:8}, animate:{opacity:1,y:0,transition:{duration:.6,ease:EASE.editorial}}, exit:{opacity:0,y:-8,transition:{duration:.3,ease:EASE.inOut}} },
  stagger:  (i)=>({ hidden:{opacity:0,y:8}, show:{opacity:1,y:0,transition:{duration:.38,delay:i*0.04,ease:EASE.editorial}} }),
};
export const spring = { type:'spring', stiffness:320, damping:30 }; // 触控/拖拽
```

### 6.3 滚动触发
- 用 Framer Motion `whileInView` + `viewport={{ once:true, margin:'-80px' }}` 做列表/卡片入场。
- Lenis 接管桌面滚动（`<SmoothScroll>` provider），移动端不启用（避免与原生滚动冲突）。

### 6.4 关键时刻（Lottie）
- 评分揭晓、通关庆祝、星级弹出：用 Lottie JSON 替代现状 CSS `confetti/star-pop/flame`。
- 保留 Tailwind keyframes 仅用于轻量无限循环（如当前关卡 `animate-pulse` 的等价）。

---

## 7. 组件库收敛

| 动作 | 说明 |
|---|---|
| `Button`/`Badge`/`Card` 改用 **CVA + cn** | 变体类型化，替代裸字符串拼接 |
| 提取 `<ScoreResultView>` | 合并 `Score.tsx`/`GalleryScore.tsx`/`CommunityScore.tsx` 三处评分 UI，差异通过 props（标题/跳转目标）注入 |
| 提取 `<HeroBack>` | 合并详情页三处悬浮返回按钮（Learn/LevelDetail/Gallery） |
| 提取 `<PlanSections>` | 合并 `LevelDetail`/`Gallery` 两处 AI 拍摄计划折叠 |
| 提取 `<ChapterHeader>` | 关卡地图章节标题栏统一组件 |
| 语义色替换 | `red-500→danger`、`green-600→success`、`pink-500→accent`（或 danger）、`yellow-400→gold`、`gray-xxx→surface.muted/line/ink.muted` |
| `TopBar` title 普及 | 各页传入页面标题，统一信息架构 |

### 7.1 Radix 原语接入
- `@radix-ui/react-slider` → InteractiveLesson 参数滑条（可访问、可样式化、键盘可达）
- `@radix-ui/react-dialog` → 参考图放大、评分弹窗、删除确认
- `@radix-ui/react-tabs` → 社区/图库 tab
- `@radix-ui/react-tooltip` → 图标提示
- 全部用编辑风样式覆盖（`data-*` 选择器），不暴露 Radix 默认外观。

---

## 8. 可交互课件组件（核心创新）

### 8.1 `<InteractiveLesson>` 组件契约

```tsx
<InteractiveLesson
  concept={exposureCompensationConfig}   // §8.3 配置
  onComplete={() => navigate(`/score/${lid}`)}
  onPrev / onNext
/>
```

**结构**（已在浏览器原型验证）：
1. 顶部：返回 + 课名（Didone）+ 进度点
2. 大图实时预览（filter 受参数驱动）+ EV/读数 overlay + 长按对比原图
3. 参数滑条（Radix Slider）+ 目标标记
4. 讲解 caption（随参数区间变化 + 状态色）
5. 命中目标反馈 toast（spring）
6. 概念 chip 序列（当前/已完成/待解锁）

### 8.2 参数→实时图像引擎（`lib/filters.ts`）

纯函数，参数 → CSS `filter` 字符串。GPU 友好，无后端。

```ts
export type ParamMap = (value:number)=>string;   // 返回 CSS filter
// 例：曝光补偿
export const exposureFilter: ParamMap = (ev)=>`brightness(${1+ev*0.30}) saturate(${Math.max(0.6,1-Math.abs(ev)*0.06)})`;
// 光圈(景深)→ blur + brightness；白平衡→ sepia+hue-rotate+saturate；焦距→ scale+crop 模拟等
```

复杂概念（景深/焦距）用 canvas 叠加或分层图（前景模糊层），仍归一到 `ParamMap`。

### 8.3 concept 配置 schema

```ts
interface ConceptConfig {
  key: 'exposure'|'aperture'|'shutter'|'iso'|'wb'|'focal'|'dof'|'composition';
  title: string;                 // "曝光补偿"
  image: { src:string; alt:string };
  param: { name:string; min:number; max:number; step:number; unit:string; default:number };
  filter: ParamMap;
  readout: (v:number)=>{ value:string; label:string };  // EV +0.7
  target: number;                // 目标值
  hitTolerance: number;         // 命中容差
  captions: { range:[number,number]; text:string; level:'under'|'ok'|'over' }[];
  hitToast: string;              // "命中目标曝光 · ..."
  nextConcepts: ConceptConfig['key'][];
}
```

**一个概念 = 一份配置文件**（`src/components/lesson/concepts/exposure.ts`），无需写新组件。

### 8.4 概念清单（6–8 个）
1. 曝光补偿（brightness）— 纵切流程内首个
2. 光圈（景深 blur + 亮度）
3. 快门（运动模糊 + 曝光）
4. ISO（颗粒 noise + 亮度）
5. 白平衡（sepia/hue-rotate）
6. 焦距（scale/裁切模拟广角-长焦）
7. 景深（前景/背景分层模糊）
8. 构图法则（三分/引导线 overlay 切换，非 filter）

### 8.5 融入 Learn
- 现有 `Learn.tsx`/`CourseDetailPage` 改造为"讲解段落 + `<InteractiveLesson>`"组合。
- 保留章节/关卡结构；课件作为关卡内的"动手"环节，与"拍摄挑战"并列。

---

## 9. 北极星纵切流程（阶段 1 主体）

路径：`/`（关卡地图）→ `/level/:id`（关卡详情 + AI 拍摄计划 + 进入曝光课件）→ **交互课件（曝光补偿）** → `/shoot/:levelId`（拍摄）→ `/score/:levelId`（评分揭晓）

在此流程上**一次性建好并验证**：
- `PageLayout` + 响应式双栏
- 路由转场（AnimatePresence）+ shared-layout
- `lib/motion.ts` variants + Lenis
- `InteractiveLesson` + `lib/filters.ts` + Radix Slider
- `ScoreResultView`（提取）
- 设计令牌全套接入

**验收**：该流程在移动 + 桌面两端达到"成品级"观感与流畅度，作为后续铺开的样板。

---

## 10. 横向铺开与分期

| 阶段 | 内容 | 验收 |
|---|---|---|
| **1 北极星** | 设计系统令牌 + PageLayout + motion 基建 + 纵切流程（含 InteractiveLesson + ScoreResultView） | 纵切流程端到端走通、视觉达高级、转场流畅 |
| **2 铺开** | 图库 / 社区 / 学习其余 / 个人中心 套用已验证外壳/动效/令牌；组件收敛（HeroBack/PlanSections/ChapterHeader）；语义色替换全站 | 全站视觉统一、无 gray-xxx 残留、桌面双栏可用 |
| **3 收尾** | 其余 5–7 个可交互概念；后台 admin 风格统一；Lottie 关键时刻；性能与可访问性扫尾 | 6–8 概念齐备、admin 风格一致、Lighthouse/a11y 达标 |

每阶段：原子提交、可验证、可回滚。

---

## 11. 工具与依赖

**新增依赖**：
```
framer-motion                    # 动效核心
class-variance-authority         # 组件变体
@radix-ui/react-slider           # 课件滑条
@radix-ui/react-dialog           # 弹窗
@radix-ui/react-tabs             # tab
@radix-ui/react-tooltip          # 提示
lenis                            # 平滑滚动
lottie-react                     # 关键时刻动画
```
**dev**：
```
@playwright/test                 # E2E
```
**字体**（Google Fonts，`index.html` 预连接 + CSS import）：Bodoni Moda、Inter、JetBrains Mono。

**明确不引入**：GSAP、three/@react-three/fiber、@splinetool、Shadcn 默认组件、mesh-gradient 库、Capsize。

体积预估：新增 gzip ≈ 60–80KB（framer-motion ~30 + radix ~15 + lenis ~5 + lottie ~10 + cva ~1）。可接受。

---

## 12. 边界与错误处理

| 场景 | 处理 |
|---|---|
| 摄像头被拒/不可用/非安全上下文 | 现有逻辑保留，用编辑风重做错误态；提供"改用上传" |
| AI 服务失败 | 降级文案 + 重试按钮；不阻塞课件交互（课件纯本地 filter） |
| 图片加载失败 | 占位 + 重试；Unsplash 失败回退本地默认图 |
| `prefers-reduced-motion` | `MotionConfig reducedMotion="user"` 关转场/弹簧/stagger |
| 拖拽性能 | filter 走 GPU；`requestAnimationFrame` 节流；大图用低清预览 |
| Lenis 与移动端 | 仅桌面启用；移动用原生 |
| 路由转场闪烁 | `AnimatePresence mode="wait"` + 滚动复位 |

---

## 13. 测试策略

- **单元**（Vitest）：`lib/filters.ts` 的 `ParamMap` 输出；`InteractiveLesson` 命中判定（`|value-target|<=tolerance`）；concept 配置 schema 校验。
- **组件**：`<InteractiveLesson>` 拖动→filter 变化→caption 切换→toast（Testing Library）。
- **E2E（Playwright）**：北极星纵切流程端到端（含移动 + 桌面视口）。
- **视觉回归**（可选）：关键页快照（如时间允许）。
- **手测/UAT**：见 §14。

---

## 14. 验收标准（UAT）

阶段 1 完成判定：
1. 关卡地图在移动 + 桌面均美观，桌面无双栏留白问题。
2. `/ → /level/:id → 课件 → /shoot → /score` 全程转场流畅、无硬切、图片 shared-layout 过渡正常。
3. 曝光课件：拖动滑条图像实时变、命中 +0.7 触发反馈、讲解随区间切换、长按对比原图可用。
4. 全站颜色/字体/圆角走令牌，无裸 `gray-xxx`/`red-500` 残留（lint 可查）。
5. `prefers-reduced-motion` 下转场关闭。
6. 桌面滚动平滑（Lenis），移动端不受影响。
7. 现有功能未回归（登录、拍摄、评分、关卡解锁）。

---

## 15. 风险与对策

| 风险 | 对策 |
|---|---|
| 改动面大、易回归 | 纵切先证明模式；阶段 2 机械套用；每阶段原子提交 + E2E |
| Didone 小字号脆弱 | 仅大标题用 Bodoni；UI/小字一律 Inter |
| 拖拽 filter 性能 | rAF 节流 + 低清预览 + GPU filter |
| 依赖体积 | 全套 gzip ~70KB 可接受；按阶段引入，未用的不装 |
| 桌面双栏改动大 | 仅 lg+ 启用；移动不动，降低风险 |
| admin 风格统一延后 | 阶段 3 处理，不影响主站 |

---

## 16. 已确认决策（用户 2026-07-02 审阅时确认）
- ✅ 章节配色采用低饱和和谐色（§4.1，鼠尾草绿/哑光金/雾紫/石板蓝/赤陶）。
- ✅ 主操作按钮用墨色 `#14161A` 实底，强调色 `#6E2233` 仅用于关键 CTA / 当前态 / 命中反馈。
- ✅ Lottie 使用免费现成素材（LottieFiles），不定制；阶段 3 接入。
