# ShotMaster 阶段 3.1 页面铺开 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把阶段 2 的 jp-minimal + 桌面外壳套用到 学习/图库/社区/个人中心（含子页），全站一致桌面优先。

**Architecture:** 逐页套用：移除页内 TopBar/BottomNav（AppShell 已全局提供），内容包入 `PageLayout`（桌面 split/宽网格），卡片堆叠→发丝线分组，迁移兼容旧令牌名→新名，emoji→lucide 线性图标，CSS 动画→framer-motion `fadeUp`/`stagger`。保留各页现有 IA/内容/逻辑。

**Tech Stack:** React 18 + TS + Tailwind 3 + framer-motion + lucide-react（已有）。设计规格：`docs/superpowers/specs/2026-07-03-phase3-page-rollout-design.md`。分支 `phase3-page-rollout`，基线 `master`（cb7dcf7）。

## Global Constraints（每页任务隐含遵守）

- **配色令牌**：surface washi `#F7F6F2`/纸 `#FBFAF7`/弱 `#EFEDE6`；ink sumi `#1A1A1A`/次 `#3D3D3A`/弱 `#8A8A86`；accent 朱 `#B14A3A`；gold `#9A7B3A`；line `#E6E4DE`；success/warning/danger；chapter.*。
- **令牌迁移表（全适用）**：`text/bg/border-primary`→`accent`；`text/bg-mint`→`ink-muted`（章节语境→`chapter.composition`）；`text/bg-sun`→`gold`；`text/bg-sky`→`ink-muted`（章节→`chapter.narrative`）；`text/bg-grape`→`ink-muted`（章节→`chapter.color`）；`text-yellow-*`→`gold`；`text/bg-red-*`→`danger`；`text/bg-green-*`→`success`；`text/bg-pink-*`→`accent`；`bg-orange-*`→`warning`；`bg-gray-50/100/200`→`surface-muted`；`border-gray-50/100`→`line`；`text-gray-300/400`→`ink-muted`；`text-ink-light`→`ink-muted`；`bg-white`→`surface-card`；`bg-black`→`ink`。内联章节 hex 保留（渐变处）。
- **字体**：Geist + 系统 CJK（已设）；**中文不斜体**（强调朱色+加粗）。
- **圆角**：卡片 `rounded-md`(8px)；图框直角；badge `rounded-sm`。
- **去卡片堆叠**：分组用 1px `border-line`/`divide-y` + 留白；卡片仅 elevation 必要时。
- **无 emoji**：全换 lucide `strokeWidth={1.25}`。已知：`🤖`→`Sparkles`/`Bot`，`💡`→`Lightbulb`（已是 lucide，去掉 emoji 字符），`📸/🎯/📌/⚠️/🏆/🔥`→对应 lucide 图标。
- **动效**：CSS `animate-fade-in/slide-up/scale-in`→framer-motion `variants.fadeUp` + `stagger 60ms`；悬停 `hover:` 颜色/边框 + 按压 `translate-y-px`；`prefers-reduced-motion` 由 AppShell `MotionConfig` 处理。无新增炫技。
- **外壳**：移除页内 `import { TopBar, BottomNav } from '../components/game/GameComponents'` 及其 JSX（AppShell 全局提供）；根 `<div className="min-h-screen bg-surface pb-20">…<TopBar/>…<BottomNav/>…</div>` → `<PageLayout>…</PageLayout>`（import from `../components/layout/PageLayout`）。`max-w-lg mx-auto px-4` → `max-w-[1400px] mx-auto w-full px-6 lg:px-10`。
- **范围**：仅 学习/图库/社区/个人（+子页）。不含 admin/Lottie/其余交互概念/组件提取/兼容映射清理。

## Shared Approach（每页任务都执行）

1. 读该页现有代码。
2. 移除页内 TopBar/BottomNav + import；加 `import { PageLayout } from '../components/layout/PageLayout'` + `import { motion } from 'framer-motion'` + `import { variants } from '../lib/motion'`。
3. 根容器 → `<PageLayout desktop="split">`（或网格页不加 split，用宽主区 + 响应式 grid）。
4. 按令牌迁移表替换全 class。
5. 卡片堆叠 → 发丝线分组（`divide-y divide-line` / `border-b border-line` + 留白）；`bg-white`→`bg-surface-card`；`rounded-2xl/3xl`→`rounded-md`。
6. emoji → lucide 图标（stroke 1.25）。
7. CSS `animate-*` → `motion.* variants={variants.fadeUp} initial="hidden" animate="show"`（列表项加 stagger delay）。
8. `npm run check` + `npm run build` 绿；grep 该页 `gray-[0-9]|red-[0-9]|green-[0-9]|pink-[0-9]|yellow-[0-9]|orange-[0-9]|text-primary|bg-primary|text-mint|text-sun|text-sky|text-grape|rounded-2xl|rounded-3xl`（应空，除内联 hex）。
9. 提交。

---

## Task 1: Learn 学习页（+ CourseDetail）

**Files:**
- Modify: `src/pages/Learn.tsx`（LearnPage + CourseDetailPage）

**桌面 IA**：
- **LearnPage**：split —— 左课程列表栏（按 category 分组，发丝线 hairline 列表，非卡片）+ 右"学习进度"概览（inline 统计 + ProgressBar）。移动单栏。
- **CourseDetailPage**：宽主区 —— hero 缩略图（aspect-video）+ 下方 split（左课程介绍/内容 hairline 列表 + 右 sticky 操作卡：开始学习/已完成 + 课时数）。移动单栏。

**该页特定**：
- `categoryLabels` color 用 `sky/sun/grape/primary` → 迁移：`sky`→`ink-muted`，`sun`→`gold`，`grape`→`ink-muted`，`primary`→`accent`（或按章节：composition→`chapter.composition` 等）。
- `ProgressBar color="sun"`→`gold`。
- 课程卡 `Card className="p-3 flex items-center gap-3 hover:bg-gray-50"` → 发丝线行：`divide-y divide-line` 列表，每行 `py-3 flex items-center gap-3 hover:bg-surface-muted/60`；`ring-mint`→`ring-accent`；`bg-mint`→`bg-accent`。
- `bg-gray-50`(课时行)→`bg-surface-muted`；`border-gray-100`→`border-line`。
- `bg-primary`(播放按钮)→`bg-accent`；`shadow-primary/40`→`shadow-elevated`。
- `bg-black/40`(锁定遮罩)→`bg-ink/40`。
- CourseDetail `bg-gray-900`(hero)→`bg-ink`。
- emoji：本页无明显 emoji（图标已是 lucide）。`BookOpen` `text-primary`→`text-accent`。
- CSS `animate-fade-in/slide-up`→motion fadeUp（标题/进度/课程列表 stagger）。

- [ ] **Step 1**: 按 Shared Approach 改造 `Learn.tsx`（LearnPage split + CourseDetailPage 宽主区 + 令牌迁移 + 发丝线 + 动效）。
- [ ] **Step 2**: `npm run check 2>&1 | tail -8 && npm run build 2>&1 | tail -3` — 绿。
- [ ] **Step 3**: `grep -nE "gray-[0-9]|red-[0-9]|green-[0-9]|text-primary|bg-primary|text-mint|text-sun|text-sky|text-grape|rounded-2xl|rounded-3xl|animate-fade-in|animate-slide-up" src/pages/Learn.tsx | head` — 应空（内联 hex 除外）。
- [ ] **Step 4**: 提交 `git add src/pages/Learn.tsx && git commit -m "feat(learn): jp-minimal desktop rollout (split + hairline + token migration)"`.

## Task 2: Gallery 图库页（+ GalleryDetail + GalleryScore）

**Files:**
- Modify: `src/pages/Gallery.tsx`（GalleryPage + GalleryDetailPage）

**桌面 IA**：
- **GalleryPage**：宽主区 —— 顶部标题 + 上传入口（hairline 行，非卡片）+ 分类标签（pill，朱色 active）+ 响应式照片网格 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`。移动 2 列。
- **GalleryDetailPage**：split —— 左大图（含构图叠加/参考线/作者）+ 右 hairline 元数据侧栏（标签/AI 拍摄计划折叠/参数/开始挑战）。移动单栏（图在上）。

**该页特定**：
- `difficultyLabels` color `mint/sun/grape`→`ink-muted/gold/ink-muted`。
- `planSections` color `text-primary/text-yellow-500/text-sky/text-mint/text-grape/text-sky`→`accent/gold/ink-muted/ink-muted/ink-muted`（或章节色）。
- `bg-primary text-white`(分类 active)→`bg-accent text-white`；`bg-primary/10`→`bg-accent/10`。
- `bg-gray-50`(参数格)→`bg-surface-muted`；`rounded-xl`→`rounded-md`。
- `bg-red-100 text-red-500`(心标/赞)→`bg-accent/12 text-accent`；`bg-green-100 text-green-600`(赞)→`bg-success/12 text-success`。
- emoji：`🤖 AI 拍摄计划`→`<Sparkles className="w-5 h-5 text-accent" strokeWidth={1.25} /> AI 拍摄计划`；`💡 {p.lighting.suggestion}`→`<Lightbulb .../>`（去掉 💡 字符）。
- `text-ink-light`→`text-ink-muted`。
- `bg-gray-900`(detail hero)→`bg-ink`；`bg-black/60`→`bg-ink/60`。
- GalleryImageCard：`rounded-2xl`→`rounded-md`；`from-black/60`→`from-ink/60`；`bg-red-500`→`bg-danger`；`bg-primary/90`→`bg-accent/90`；`group-hover:scale-110`→`group-hover:scale-105`（克制）。
- CSS `animate-*`→motion fadeUp（标题/上传/标签/网格 stagger）。
- **注意**：GalleryDetail 用 `TopBar`（无 title）+ `BottomNav`→移除（AppShell 提供）。`getCompositionTips/getLightingTips/...` 等纯函数不动。

- [ ] **Step 1**: 按 Shared Approach 改造 `Gallery.tsx`（GalleryPage 网格 + GalleryDetail split + 令牌 + emoji + 发丝线 + 动效）。
- [ ] **Step 2**: `npm run check && npm run build` — 绿。
- [ ] **Step 3**: grep `src/pages/Gallery.tsx` 同 Task1 Step3 — 应空。
- [ ] **Step 4**: 提交 `git commit -m "feat(gallery): jp-minimal desktop rollout (grid + detail split + emoji/icons migration)"`.

## Task 3: Community 社区页（+ CommunityScore）

**Files:**
- Modify: `src/pages/Community.tsx`

**桌面 IA**：split —— 主信息流（挑战/作品 feed，hairline 行非卡片）+ 右侧栏（本周挑战卡 + 排行榜 hairline 列表）。移动单栏 + tab。

**该页特定**：
- 按 Shared Approach：移除 TopBar/BottomNav；PageLayout split；令牌迁移（`bg-primary`→`bg-accent`，`text-yellow-500/600`→`gold`，`bg-red-500`→`danger`，`bg-green-100/text-green-600`→`success`，`bg-pink-50/text-pink-500`→`accent`，`bg-orange-50`→`warning`，`bg-gray-*`→`surface-muted`，`text-sky/mint/grape`→`ink-muted`/章节色，`from-yellow-400/bg-slate-400/bg-amber-600`(podium)→`gold/ink-muted/warning`）。
- emoji（若有 🏆🔥 等）→lucide `Trophy`/`Flame`（stroke 1.25）。
- feed 项 `Card`→发丝线行；tab pill active 朱色。
- CSS `animate-*`→motion fadeUp/stagger。

- [ ] **Step 1**: 改造 `Community.tsx`（split feed+侧栏 + 令牌 + emoji + 发丝线 + 动效）。
- [ ] **Step 2**: `npm run check && npm run build` — 绿。
- [ ] **Step 3**: grep 同上 — 应空。
- [ ] **Step 4**: 提交 `git commit -m "feat(community): jp-minimal desktop rollout (feed + sidebar + token migration)"`.

## Task 4: Profile 个人页（+ works/achievements/favorites）

**Files:**
- Modify: `src/pages/Profile.tsx`（ProfilePage + MyWorksPage + AchievementsPage + MyFavoritesPage）

**桌面 IA**：宽主区 —— 资料头（avatar + Lv/XP/连击 inline 统计 divide-x）+ 标签网格（作品/成就/收藏，响应式 grid）。子页同套。

**该页特定**：
- 移除 TopBar/BottomNav；PageLayout；令牌迁移（`from-blue-500 to-cyan-400`/`from-pink-500 to-rose-400`(偏好图标)→`accent` 单色或章节色；`bg-primary`→`bg-accent`；`text-red-500`→`danger`；`bg-pink-50/text-pink-500`→`accent`；`bg-gray-*`→`surface-muted`）。
- emoji（🏆 等）→lucide。
- 成就/作品卡→发丝线网格；资料头 inline 统计。
- CSS `animate-*`→motion fadeUp/stagger。

- [ ] **Step 1**: 改造 `Profile.tsx`（资料头 + 标签网格 + 令牌 + emoji + 发丝线 + 动效，4 个导出组件）。
- [ ] **Step 2**: `npm run check && npm run build` — 绿。
- [ ] **Step 3**: grep `src/pages/Profile.tsx` 同上 — 应空。
- [ ] **Step 4**: 提交 `git commit -m "feat(profile): jp-minimal desktop rollout (header + tabbed grid + token migration)"`.

## Task 5: E2E 桌面访问 + 全量验证

**Files:**
- Modify: `tests/e2e/slice.spec.ts`（加桌面访问 Learn/Gallery/Community/Profile）

- [ ] **Step 1**: 在 E2E desktop project 中，登录后依次访问 `/learn`、`/gallery`、`/community`、`/profile`，断言各页标题/关键元素可见（`/learn`→"学习中心"；`/gallery`→"参考图库"；`/community`→社区标题；`/profile`→用户/Lv）。用 `test.info().project.name === 'desktop'` 守卫。
- [ ] **Step 2**: `npm run e2e` — 移动+桌面通过。
- [ ] **Step 3**: 全量 `npm run test && npm run check && npm run build` — 绿。
- [ ] **Step 4**: grep 全 src/pages 生产代码 emoji + 旧令牌：`grep -rnE "📷|🎯|📌|⚠️|🏆|🔥|🤖|💡|gray-[0-9]|red-[0-9]|green-[0-9]|pink-[0-9]|yellow-[0-9]|orange-[0-9]" src/pages/Learn.tsx src/pages/Gallery.tsx src/pages/Community.tsx src/pages/Profile.tsx | head` — 应空（lucide 图标不算）。
- [ ] **Step 5**: 提交 `git commit -m "test(e2e): desktop visits for rolled-out pages + de-AI grep"`.

## 收尾验证

- [ ] `npm run test && npm run check && npm run build` 全绿。
- [ ] 手动 UAT：桌面端访问 学习/图库/社区/个人，各页桌面双栏/网格 + jp-minimal（发丝线、无卡片堆叠、无 emoji、lucide 1.25）；移动端单栏 + 底部导航成立。
- [ ] `git commit -m "chore: phase 3.1 complete — page rollout jp-minimal + desktop"`.

---

## Self-Review（已执行）

- **Spec 覆盖**：Learn(T1)✓ Gallery(T2)✓ Community(T3)✓ Profile(T4)✓ + 子页（CourseDetail/GalleryDetail 在 T1/T2 内；CommunityScore/Profile 子页在 T3/T4 内）；令牌迁移(Shared Approach 表)✓；emoji 清除(每页)✓；动效(每页)✓；E2E/验证(T5)✓。GalleryScore 复用 ScoreResultView（Phase 2 已 jp-minimal）——T2 确认其令牌迁移。
- **占位符**：无 TBD；每页令牌映射 + 结构改造具体。
- **一致性**：令牌迁移表/Shared Approach 全任务一致；PageLayout/motion variants 接口一致（Phase 2 已建）。
- **风险**：4 页较大（Gallery 770 行）；每页改造范围大，reviewer 逐页把关。GalleryDetail 的 AI 拍摄计划折叠逻辑保留，仅外观迁移。
