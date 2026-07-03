# ShotMaster 前端重塑 · 阶段 3.1 页面铺开 设计规格

- **日期**：2026-07-03
- **状态**：待审阅
- **分支**：`phase3-page-rollout`
- **前置**：阶段 2（桌面优先 + 日式极简：令牌/字体/Sidebar/AppShell/首屏/揭晓/路由 morph）已合并 `master`（`cb7dcf7`）。
- **关联**：Phase 3 拆为 5 个子项目；本 spec 是 **① 页面铺开**。其余（② 交互概念 / ③ 组件收敛+令牌迁移 / ④ admin / ⑤ Lottie+打磨）各自独立 spec。

---

## 1. 背景与目标

阶段 2 建立了日式极简设计系统 + 桌面外壳（AppShell Sidebar + PageLayout）+ 动效，并精雕了首屏（关卡地图）。但**其余页面**（学习 / 图库 / 社区 / 个人中心）仍是阶段 1 的移动竖版 + 卡片堆叠布局——虽经令牌兼容重映射已"去饱和"，但内容仍是 `max-w-lg` 窄列、堆卡片、用兼容旧令牌名、含 emoji，未真正桌面化。

**目标（可验收）**：
1. 把 jp-minimal + 桌面布局套用到 学习 / 图库 / 社区 / 个人中心（含子页），全站一致桌面优先。
2. 去卡片堆叠（发丝线分组）、去 emoji（lucide stroke 1.25）、迁移兼容旧令牌名 → 新名。
3. 套用动效（入场错峰 + 悬停），无新增炫技（炫技属阶段 2）。
4. 保留各页现有内容/IA（不重想信息架构）。

## 2. 设计方向（已锁定）

| 维度 | 决策 |
|---|---|
| 系统 | 套用阶段 2 的 jp-minimal（washi/sumi/朱/金 + Geist + 系统CJK + 发丝线 + lucide 1.25 + 无 emoji） |
| 深度 | 保留各页现有 IA/内容，只做"套壳 + 桌面化 + 去卡片/emoji + 令牌迁移 + 动效" |
| 执行 | 逐页推进（Learn → Gallery → Community → Profile），每页一个完整任务 |
| 桌面 | 每页用 `PageLayout desktop="split"` 或宽主区网格；移动单栏 + 底部导航 |
| 令牌 | 兼容旧名（primary/mint/sun/sky/grape + gray-xxx/red/green/pink/yellow/orange）→ 新名；迁移后该页不再依赖兼容映射 |

## 3. 共享设计

### 3.1 桌面布局
- 每页用 `PageLayout`（已存在）：桌面 `max-w-[1400px] mx-auto`，`desktop="split"` 处主内容 + 侧栏；网格页用响应式 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`。
- 移动单栏 + 底部导航（AppShell 已处理）。

### 3.2 jp-minimal 套用
- 分组用 1px 发丝线（`border-line` / `divide-y`）+ 留白，**去卡片堆叠**；卡片仅 elevation 必要时。
- 图标 lucide `strokeWidth={1.25}`；**去尽 emoji**（章节/状态/CTA 全换线性图标）。
- 字体 Geist + 系统 CJK；**中文不斜体**（强调朱色 + 加粗）。
- 朱色仅 当前态/强调字/主 CTA；金仅星级。

### 3.3 令牌迁移（本 spec 内完成的页面）
| 旧 | 新 |
|---|---|
| `text-primary`/`bg-primary`/`border-primary` | `accent` |
| `text-mint`/`bg-mint` | `ink-muted`（章节语境用 `chapter.composition`） |
| `text-sun`/`bg-sun` | `gold` |
| `text-sky`/`bg-sky` | `ink-muted`（章节语境用 `chapter.narrative`） |
| `text-grape`/`bg-grape` | `ink-muted`（章节语境用 `chapter.color`） |
| `text-yellow-*` | `gold` |
| `text-red-*`/`bg-red-*` | `danger` |
| `text-green-*`/`bg-green-*` | `success` |
| `text-pink-*`/`bg-pink-*` | `accent`（或 `danger`） |
| `bg-orange-*` | `warning` |
| `bg-gray-50/100/200` | `surface-muted` |
| `border-gray-50/100` | `line` |
| `text-gray-300/400` | `ink-muted` |
| 内联章节 hex（`#6B8E7F` 等） | `chapter.*` token class 或保留（渐变处） |

迁移后，本 spec 涉及页面不再用兼容旧名。tailwind.config 的兼容重映射保留（供未迁移页/admin），③ 子项目统一清理。

### 3.4 动效
- 入场：`variants.fadeUp` + `stagger 60ms`（列表/卡片错峰）。
- 悬停：`hover` 颜色/边框 + 按压 `translate-y-px`。
- `prefers-reduced-motion`：`MotionConfig reducedMotion="user"`（AppShell 已设）。
- 无新增炫技（揭晓/首屏入场/路由 morph 属阶段 2）。

## 4. 每页桌面 IA（保留内容，套新壳）

| 页面 | 桌面 IA | jp-minimal 要点 |
|---|---|---|
| **Learn 学习** | split：左课程列表栏（章节分组）+ 右课程内容/详情 | 发丝线课程列表（非卡片）；课程卡用留白 + hairline；InteractiveLesson 集成保留 |
| **Gallery 图库** | 响应式照片网格（`grid-cols-2 md:3 lg:4`）+ 详情页（大图 + 发丝线元数据侧栏） | 影像优先；元数据 hairline；`<img>` 直角 + 1px 边 |
| **Community 社区** | 主信息流 + 右侧栏（本周挑战/排行） | feed 项 hairline 分组（非卡片）；挑战卡用 hairline + 留白 |
| **Profile 个人** | 资料头（头像/Lv/XP/连击）+ 标签网格（作品/成就/收藏） | 头部 inline 统计 divide-x；标签下网格 hairline |

**子页**：CourseDetail / GalleryDetail / GalleryScore / CommunityScore / Profile·works·achievements·favorites 一并套（同一套 jp-minimal + 桌面 split/网格）。

## 5. 范围与执行

- **本 spec（阶段 3.1）**：Learn / Gallery / Community / Profile（+ 子页）的 jp-minimal + 桌面化 + 令牌迁移 + emoji 清除 + 动效。
- **逐页任务**：每页一个任务（含子页），完整套用 + 验证。
- **不在本 spec**：admin（④）、Lottie（⑤）、其余交互概念（②）、跨页组件提取（③ HeroBack/PlanSections/ChapterHeader）、tailwind 兼容映射清理。

## 6. 边界与测试

- 功能不回归（学习/图库/社区/个人现有交互、AI 评分、拍摄入口）。
- `prefers-reduced-motion` 关错峰。
- 测试：每页渲染冒烟测试（挂载 + 关键元素）；E2E 桌面视口访问各页；`npm run check`/`build` 绿；grep 无裸 `gray-xxx/red-500/pink/yellow/orange` + 无 emoji（生产代码）。

## 7. 非目标

- 不重想各页 IA/内容（深度 a：套用既定系统）。
- 不新增炫技动效。
- 不做 admin / Lottie / 其余交互概念 / 兼容映射清理。

## 8. 验收

1. 桌面端：Learn/Gallery/Community/Profile 桌面双栏/网格 + jp-minimal（发丝线、无卡片堆叠、无 emoji、lucide 1.25）；移动端单栏 + 底部导航成立。
2. 兼容旧令牌名在该 4 页已迁移为新名（grep 旧名在该 4 页为空）。
3. 动效：入场错峰 + 悬停；reduced-motion 下关。
4. `npm run check`/`build` 绿；E2E 桌面访问各页通过；grep 无裸 gray/emoji。
5. 现有功能未回归。
