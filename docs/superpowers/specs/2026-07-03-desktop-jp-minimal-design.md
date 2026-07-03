# ShotMaster 前端重塑 · 桌面优先 + 日式极简 设计规格

- **日期**：2026-07-03
- **状态**：待审阅
- **分支**：`desktop-jp-minimal`
- **前置**：Phase 1（移动优先 + 亮调编辑）已合并到 `master`（commit 8538425）。本 spec 是 Phase 1 之上的方向调整。
- **设计参考**：craft.do / cursor.com / amie.so 的"工具感 + 克制"；日式杂志的留白与无衬线。

---

## 1. 背景与动机

Phase 1 完成了游戏化摄影学习站的基础前端（令牌、共享外壳、可交互课件、纵切流程）。但用户反馈两点：

1. **仍竖版**：全站 `max-w-lg` 居中，桌面端是窄手机列 + 大片留白，未真正适配电脑网页。
2. **AI 味重**：兼容旧令牌（coral/mint/sun/sky/grape）仍在非切片页显示，emoji 满天飞，大圆角 + 彩色按钮 + demo 感交互，像 AI 生成的 SaaS 模板。

用户要：**桌面优先**、**高级克制**、**去 AI 味**、**带工具感与未来感**，参考 craft/cursor/amie。经多轮收敛，定为 **日式极简编辑（Japanese Minimal Editorial）**。

## 2. 目标（可验收）

1. **桌面优先**：桌面端左侧栏导航 + 宽主区双栏内容；移动端底部导航。9:16 与 16:9 都成立。
2. **日式极简**：大量留白、无衬线、黑白灰 + 1–2 点缀色、发丝线分组、不堆卡片、无 emoji、细线图标。
3. **高级克制动效** + 3 个"炫技时刻"（揭晓/首屏入场/路由 morph），其余冷静。
4. **去 AI 味**：兼容旧彩色令牌重映射为中性灰，全站自动去饱和；去 emoji。
5. **首屏优先**：地基（令牌/字体/外壳）全站生效 + 首屏（关卡地图）精雕到成品级；其余页面滚动铺开（Phase 3）。

## 3. 设计方向（已锁定）

| 维度 | 决策 |
|---|---|
| 美学 | 日式极简编辑（Japanese Minimal Editorial） |
| 配色 | washi 暖白 + sumi 墨 + 单点朱色 + 哑光金（2 点缀色） |
| 字体 | Geist（拉丁）+ 系统 CJK 栈（PingFang SC 优先）+ Geist Mono |
| 布局 | 桌面左侧栏 + 主区双栏；非对称、不居中堆叠 |
| 图标 | 细线 stroke 1.25，去 emoji |
| 动效 | 克制为主 + 3 炫技时刻；transform/opacity；尊重 reduced-motion |
| 范围 | 首屏优先（地基 + 关卡地图），其余 Phase 3 |
| 执行 | 北极星纵切（地基 + 首屏样板 → 铺开） |

## 4. 设计系统

### 4.1 配色（tailwind.config `theme.extend.colors`，沿用 Phase 1 命名、改值）

```js
surface: { DEFAULT: '#F7F6F2', card: '#FBFAF7', muted: '#EFEDE6' },   // washi / 纸 / 弱底
ink:     { DEFAULT: '#1A1A1A', secondary: '#3D3D3A', muted: '#8A8A86' }, // sumi 墨
accent:  { DEFAULT: '#B14A3A', soft: '#C76A5C' },                       // 朱 vermilion（唯一强调）
gold:    '#9A7B3A',                                                       // 金（仅星级）
line:    '#E6E4DE',                                                       // 发丝线
success: '#4A7A5C', warning: '#B0894A', danger: '#A8412E',
chapter: { composition: '#6B8E7F', light: '#B0894A', color: '#8E7AA0', narrative: '#5E7AA0', master: '#A56B5A' }, // 仅作小色块/章节标，极克制
// 兼容旧令牌名 → 重映射（去 AI 味，非切片页不失色）
primary: { DEFAULT: '#B14A3A', light: '#C76A5C', dark: '#8A3528' },     // → 朱
mint:    { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },       // → 中性灰
sun:     { DEFAULT: '#9A7B3A', light: '#B89A55', dark: '#765C2A' },      // → 金系
sky:     { DEFAULT: '#5E7AA0', light: '#7E94B4', dark: '#465E80' },       // → 灰蓝
grape:   { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },       // → 中性灰
```

- **使用纪律**：朱色 `accent` 仅用于 当前态 / 强调字 / 主 CTA / 命中反馈；金 `gold` 仅用于星级；其余皆 sumi 墨 + 灰 + washi。禁止裸 `gray-xxx/red-500/pink-500/yellow-400`。
- 兼容重映射让非切片页（图库/社区/学习/个人/admin）自动去饱和，不破坏。

### 4.2 字体

```js
fontFamily: {
  display: ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
  body:    ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
  mono:    ['"Geist Mono"', 'ui-monospace', 'monospace'],
}
```

- **Geist**（拉丁，Vercel/cursor 同款几何无衬线）= "未来感 + 工具感"。
- **CJK 走系统栈**（mac = PingFang SC 精致；Win = 微软雅黑；Linux/Android = Noto Sans SC）——性能零成本、简体全覆盖、原生精致。
- 弃 Phase 1 的 Bodoni Moda 衬线 + Inter。**中文不斜体**（合成斜体易与下一字重叠；强调改用朱色 + 加粗）。
- 字阶：display 38–46px / title 22 / body 14 / caption 12 / overline 11（大写 letter-spacing .16em）/ mono-value 数字。
- 可选：若需跨平台一致 CJK，加载 Noto Sans SC webfont（`font-display: swap` + 子集）；默认不加载以省体积。

### 4.3 圆角 / 描边 / 阴影

```js
borderRadius: { sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px' },   // 小圆角，日式利落
boxShadow: {
  hairline: 'inset 0 0 0 1px #E6E4DE',
  elevated: '0 1px 2px rgba(26,26,26,.03), 0 18px 44px -18px rgba(26,26,26,.10)',
  focus: '0 0 0 3px rgba(177,74,58,.24)',
}
```

- 分组优先用 1px 发丝线（`border-line` / `divide-y`）+ 留白，**不堆卡片**；卡片仅在需要 elevation 时用。

### 4.4 图标

- 统一 lucide-react，`strokeWidth={1.25}`，`w-[17px]` 量级。
- **禁 emoji**：所有 📷🎯📌⚠️🏆🔥 等换 lucide 线性图标（光圈 Aperture / 滑杆 Sliders / 九宫格 Grid / 指南 Compass / 收藏 Bookmark / 曝光 Sun / 对比 Contrast / 白平衡 等）。

### 4.5 动效令牌

```js
transitionDuration: { fast: '160ms', base: '260ms', slow: '420ms', scenic: '700ms' },
transitionTimingFunction: { editorial: 'cubic-bezier(.22,1,.36,1)' },
// framer-motion: spring (触控) { stiffness:320, damping:30 }; stagger 60ms
```

---

## 5. 架构：桌面外壳

### 5.1 `AppShell` 重写（桌面优先）

- **桌面（lg+）**：`grid-cols-[208px_1fr]` —— 左 `Sidebar`（固定）+ 右主区（`<main>`）。
- **移动**：`TopBar`（顶，avatar + XP + 连击）+ `<main>` + `BottomNav`（底）。`Sidebar` / `TopBar` / `BottomNav` 用 `hidden lg:flex` / `lg:hidden` 切换。
- **沉浸式**（`/shoot`）：隐藏所有 nav，主区全屏。
- **no-nav**（`/login`、`/preferences`、`/admin`）：隐藏 nav。
- 路由转场延续 Phase 1：enter-only 淡入轻推（`PageLayout` 的 `motion.main`），无 `AnimatePresence`（避免 frozen-location 复杂度）。

### 5.2 `Sidebar`（新增，桌面）

- 顶部：Aperture 图标（朱）+ "ShotMaster" 字标（Geist 500, 紧字距）。
- 导航：闯关 / 学习 / 图库 / 社区 / 我的（lucide 线性 + 小字），当前态 = 朱色 3px 细条（左侧，`layout` 滑动）+ 浅底。
- 底部：用户卡（avatar + Lv + XP + 连击，极简）。
- 大量留白，无重阴影。

### 5.3 `PageLayout`（沿用 + 微调）

- `desktop="single|split"`：`split` → `lg:grid lg:grid-cols-[1fr_320px]`。
- `immersive`：`bg-ink text-surface`（拍摄页）。
- `motion.main` 入场（routeIn，`initial/animate`，无 exit）。

### 5.4 响应式

- 移动优先；断点 `md 768 / lg 1024`。
- `lg+` 启用侧栏 + 双栏；移动单栏 + 底部导航。
- 全站 `max-w-lg` 约束改为响应式（移动满宽，桌面入栏 `max-w-[1400px] mx-auto`）。

---

## 6. 首屏 · 关卡地图（`LevelMap`，桌面优先成品级）

非对称、不居中、不堆卡片：

- **顶栏条**（主区内）：面包屑 `摄影之路 ／ 构图基础篇` + 右侧 `本周挑战 · 剩 N 日`（mono 小字 + 朱点）。
- **Hero（非对称 1.15fr / .85fr）**：
  - 左：kicker（`继续 · 第 12 关`，朱 mono 大写）+ 大标题 `三分构图法`（Geist 46px，"构图"朱色加粗不斜体）+ 描述 + CTA（`开始拍摄` 朱实底 / `练习曝光` 线框）。
  - 右：参考图（4:5，圆角 4px）+ 构图网格叠加（`grid-cols-3` 半透明白线）+ 角标 `三分构图 · 参考 · 04/09`。
- **统计行（inline `divide-x`，非卡片）**：已通关（朱）/ 总星数（金）/ 等级 / 连击（日），mono 大数字 + 小灰标签，上下发丝线。
- **双栏**：
  - 左：`章节进度` —— 发丝线列表（章节色点 + 名 + N/10 + 2px 细进度条 + 百分比），非卡片。
  - 右：`本章节关卡` —— 节点网格（5 列）：已完成=墨实心、当前=朱环+朱字、锁定=灰。
- **去 AI 味**：无 emoji、无大圆角、无重阴影、发丝线分组。

移动端：顶栏 + 缩小 hero + 折叠章节 + 底部导航（9:16 成立）。

---

## 7. 动效系统

### 7.1 克制原则

- 只用 `transform` + `opacity`（GPU）。
- 统一 `cubic-bezier(.22,1,.36,1)`，**无 linear、无弹跳**；弹簧仅用于拖拽滑条 / 命中触感。
- 服务信息：入场 / 焦点 / 反馈 / 转场，不炫技。
- `prefers-reduced-motion`：`MotionConfig reducedMotion="user"` 关转场/弹簧/错峰，瞬时切换。

### 7.2 通用动效（克制）

- **入场错峰**：`stagger 60ms`，fadeUp + 10px，`scenic`。
- **悬停 / 按压**：`fast 160ms`，颜色/边框变化；按压 `translateY(1px)`，不弹跳。
- **当前态指示**：`base 260ms`，朱色细条在侧栏项间 `layout` 滑动。
- **命中反馈**：`slow 420ms`，toast 轻微缩放 + 淡入（无 spring 弹跳）。
- **路由转场**：enter-only 淡入轻推（`PageLayout` `motion.main`）。

### 7.3 三个"炫技时刻"（仅此三处）

1. **评分 / 通关揭晓**（reward，情感峰值）：
   - 朱色径向光一闪（scale 0→7，900ms，opacity .32→0）。
   - 三星依次 overshoot 弹出（150ms 错峰，金，`scale 0→1.18→1`，无过头弹跳）。
   - 总分戏剧性滚动（0→N，~1.1s ease-out）。
   - 相似度环形进度填满（朱，`stroke-dashoffset`，1s）。
   - 朱色细线划过（`scaleX` 0→1，650ms）。
2. **首屏 hero 入场**（cinematic）：参考图 `clip-path` 揭幕 + 标题字依次上升 + kicker 滑入。
3. **路由 shared-layout morph**：关卡节点 → 详情大图 `layoutId` 共享过渡（"衔接流畅"高级感）。

---

## 8. Phase 1 复用与变更

| 项 | 处置 |
|---|---|
| 令牌命名 | **沿用**（surface/ink/accent/line/gold/chapter/语义色/兼容名），改值 |
| 字体 | **换**：Bodoni+Inter → Geist + 系统CJK + Geist Mono |
| `AppShell` | **重写**：移动 TopBar/BottomNav → 桌面 Sidebar + 移动 nav |
| `Sidebar` | **新增** |
| `TopBar`/`BottomNav` | 保留，加 `lg:hidden`，令牌刷新 |
| `PageLayout` | 沿用 + split/immersive 微调 |
| `Button`/CVA 原语 | 沿用，令牌刷新（去 coral） |
| `InteractiveLesson` + `lib/filters` | 沿用，令牌刷新（朱/金） |
| `ScoreResultView` | 沿用 + 接入"揭晓"炫技动效 |
| `lib/motion` | 扩展：加 `reveal`/`heroEnter` variants + 弹簧微调 |
| emoji | 全去，换 lucide 线性 |

## 9. 范围与分期

- **阶段 2（本 spec，首屏优先）**：地基（令牌/字体/桌面外壳，全站生效）+ 首屏（关卡地图）成品级 + 揭晓炫技动效。北极星样板。
- **阶段 3（后续）**：铺开 图库 / 社区 / 学习 / 个人中心（套用已验证外壳/令牌/动效）；迁移兼容旧令牌名 → 新名；其余 5–7 个可交互概念；后台 admin 风格统一；Lottie（若需）。

## 10. 边界与测试

- 摄像头/AI/图片错误沿用 Phase 1 处理，令牌刷新。
- `prefers-reduced-motion` 关炫技与转场。
- 拖拽性能：filter 走 GPU + rAF 节流。
- 测试：`Sidebar`/`AppShell`（桌面+移动渲染）、`LevelMap`（首屏渲染 + 响应式）、动效 variants 单测；Playwright E2E 扩展桌面视口；`npm run check`/`build` 绿。

## 11. 非目标

- 不改产品逻辑/数据模型/后端。
- 不做深色模式（亮调 washi 为唯一身份）。
- 不引入 GSAP/Three（Framer Motion 足够）。
- 阶段 2 不重做非首屏页面（Phase 3）。
- 不做大面积渐变 / 重阴影 / 大圆角 / emoji。

## 12. 验收（阶段 2）

1. 桌面端：左侧栏导航 + 首屏非对称双区 + 双栏章节/关卡，16:9 成品级。
2. 移动端 9:16：顶栏 + 缩小 hero + 折叠章节 + 底部导航，成立。
3. 全站令牌走 washi/sumi/朱/金；grep 无裸 `gray-xxx/red-500`；无 emoji。
4. 动效：入场错峰、侧栏朱条滑动、按压、命中 toast；揭晓炫技（星弹+滚动+径向光+环+线）触发正常；reduced-motion 下全关。
5. 字体 Geist + 系统CJK，中文不斜体、不重叠。
6. `npm run check`/`build` 绿；现有功能未回归。
