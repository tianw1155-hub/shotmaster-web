import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Settings,
  Shield,
  HelpCircle,
  Camera,
  Heart,
  Image as ImageIcon,
  Clock,
  Star,
  X,
  Flame,
  Trophy,
  Sprout,
  Palette,
  Sun,
  Swords,
  Award,
  Triangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/useGameStore';
import { PageLayout } from '../components/layout/PageLayout';
import { Badge, Button, ProgressBar } from '../components/ui/Button';
import { variants } from '../lib/motion';

// ==================== Achievement icon mapping ====================
const achievementIconMap: Record<string, React.ReactNode> = {
  '🌱': <Sprout className="w-6 h-6" strokeWidth={1.25} />,
  '📐': <Triangle className="w-6 h-6" strokeWidth={1.25} />,
  '☀️': <Sun className="w-6 h-6" strokeWidth={1.25} />,
  '🎨': <Palette className="w-6 h-6" strokeWidth={1.25} />,
  '🔥': <Flame className="w-6 h-6" strokeWidth={1.25} />,
  '⚔️': <Swords className="w-6 h-6" strokeWidth={1.25} />,
  '⭐': <Star className="w-6 h-6" strokeWidth={1.25} />,
  '🏆': <Trophy className="w-6 h-6" strokeWidth={1.25} />,
};

function getAchievementIcon(emoji: string): React.ReactNode {
  return achievementIconMap[emoji] ?? <Award className="w-6 h-6" strokeWidth={1.25} />;
}

// ==================== 我的作品页面 ====================
export function MyWorksPage() {
  const navigate = useNavigate();
  const { user, galleryImages } = useGameStore();

  const completedWorks = galleryImages.slice(0, user.worksCount);

  return (
    <PageLayout desktop="single">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-surface-card border border-line flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">我的作品</h1>
        </div>

        {/* 统计 — hairline rows */}
        <motion.div
          className="grid grid-cols-3 divide-x divide-line border border-line rounded-md overflow-hidden"
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
        >
          {[
            { value: user.worksCount, label: '作品总数', color: 'text-accent' },
            { value: user.totalStars, label: '获得星数', color: 'text-gold' },
            { value: user.averageScore, label: '平均分', color: 'text-ink-muted' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 text-center bg-surface-card first:border-l-0">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* 作品列表 — hairline grid */}
        {completedWorks.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {completedWorks.map((work, idx) => (
              <motion.div
                key={idx}
                variants={variants.fadeUp}
                className="bg-surface-card border border-line rounded-md overflow-hidden group cursor-pointer hover:border-accent/30 transition-colors"
              >
                <img
                  src={work.url}
                  alt={work.title}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <div className="p-3 border-t border-line">
                  <p className="text-sm font-medium text-ink truncate">{work.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{work.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={variants.fadeUp}
            initial="hidden"
            animate="show"
            className="bg-surface-card border border-line rounded-md p-8 text-center"
          >
            <Camera className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.25} />
            <p className="text-ink-secondary">还没有作品</p>
            <p className="text-ink-muted text-sm mt-1">开始闯关拍摄你的第一张作品吧</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
              去闯关
            </Button>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}

// ==================== 成就页面 ====================
export function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const unlockedCount = user.achievements.filter((a) => a.unlocked).length;

  return (
    <PageLayout desktop="single">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-surface-card border border-line flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">成就墙</h1>
        </div>

        {/* 统计 — hairline row */}
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
          className="bg-surface-card border border-line rounded-md p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-secondary text-sm">已解锁</p>
              <p className="text-2xl font-bold text-ink">
                {unlockedCount}/{user.achievements.length}
              </p>
            </div>
            <ProgressBar value={(unlockedCount / user.achievements.length) * 100} color="gold" />
          </div>
        </motion.div>

        {/* 成就列表 — hairline grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {user.achievements.map((ach) => (
            <motion.div
              key={ach.id}
              variants={variants.fadeUp}
              className={`bg-surface-card border border-line rounded-md p-4 ${ach.unlocked ? '' : 'opacity-60'}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    ach.unlocked ? 'bg-accent/10 text-accent' : 'bg-surface-muted text-ink-muted'
                  }`}
                >
                  {getAchievementIcon(ach.icon)}
                </div>
                <h3 className="font-medium text-ink text-sm mb-1">{ach.name}</h3>
                <p className="text-xs text-ink-muted mb-2">{ach.description}</p>
                {ach.unlocked ? (
                  <Badge color="gold">已解锁</Badge>
                ) : (
                  <div className="w-full">
                    <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink-muted">{ach.progress}%</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
}

// ==================== 我的收藏页面 ====================
export function MyFavoritesPage() {
  const navigate = useNavigate();
  const { user, galleryImages, customGalleryImages, toggleFavoriteImage, isFavoriteImage } =
    useGameStore();

  const allImages = [...customGalleryImages, ...galleryImages];
  const favoriteImages = allImages.filter((img) => isFavoriteImage(img.id));

  return (
    <PageLayout desktop="single">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-surface-card border border-line flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">我的收藏</h1>
          <span className="text-ink-muted text-sm">{favoriteImages.length} 张</span>
        </div>

        {favoriteImages.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {favoriteImages.map((image) => {
              const isCustom = image.id.startsWith('custom_');
              return (
                <motion.button
                  key={image.id}
                  onClick={() => navigate(`/gallery/${image.id}`)}
                  variants={variants.fadeUp}
                  className="group relative aspect-square rounded-md overflow-hidden text-left border border-line"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">{image.title}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Heart className="w-5 h-5 text-danger fill-danger drop-shadow" strokeWidth={1.25} />
                  </div>
                  {isCustom && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-accent/90 text-white text-xs rounded-full">我的</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            variants={variants.fadeUp}
            initial="hidden"
            animate="show"
            className="bg-surface-card border border-line rounded-md p-8 text-center"
          >
            <Heart className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.25} />
            <p className="text-ink-secondary">还没有收藏</p>
            <p className="text-ink-muted text-sm mt-1">在图库中收藏喜欢的参考图</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/gallery')}>
              去图库看看
            </Button>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}

// ==================== 主个人中心页面 ====================
export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const completedCount = user.completedLevels.length;
  const unlockedAchievements = user.achievements.filter((a) => a.unlocked);
  const xpProgress = (user.xp / user.xpToNext) * 100;
  const favoriteCount = (user.favoriteImageIds || []).length;

  const menuItems = [
    {
      icon: ImageIcon,
      label: '我的作品',
      value: `${user.worksCount}幅`,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      path: '/profile/works',
    },
    {
      icon: Heart,
      label: '我的收藏',
      value: `${favoriteCount}张`,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      path: '/profile/favorites',
    },
    {
      icon: Award,
      label: '获得成就',
      value: `${unlockedAchievements.length}/${user.achievements.length}`,
      iconBg: 'bg-gold/16',
      iconColor: 'text-gold',
      path: '/profile/achievements',
    },
    {
      icon: Clock,
      label: '学习时长',
      value: `${user.worksCount * 15}分钟`,
      iconBg: 'bg-surface-muted',
      iconColor: 'text-ink-muted',
      path: null,
    },
  ];

  return (
    <PageLayout desktop="single">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        {/* 用户资料头 — hairline card */}
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
          className="bg-surface-card border border-line rounded-md p-6"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-4xl flex-shrink-0">
              <Camera className="w-10 h-10 text-accent" strokeWidth={1.25} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-xl font-bold text-ink">{user.name}</h1>
                <Badge color="gold">Lv.{user.level}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-ink-muted">
                  {user.xp} / {user.xpToNext} XP
                </span>
              </div>
              <ProgressBar value={xpProgress} color="gold" />
            </div>
          </div>
        </motion.div>

        {/* 数据统计 — inline divide-x */}
        <motion.div
          className="grid grid-cols-4 divide-x divide-line border border-line rounded-md overflow-hidden"
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
        >
          {[
            { value: user.worksCount, label: '作品', color: 'text-accent' },
            { value: completedCount, label: '通关', color: 'text-ink-muted' },
            { value: user.totalStars, label: '星数', color: 'text-gold' },
            { value: user.maxStreak, label: '最高连胜', color: 'text-accent' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 text-center bg-surface-card first:border-l-0">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* 功能菜单 — hairline rows */}
        <motion.div
          className="space-y-0 border border-line rounded-md overflow-hidden"
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
        >
          {menuItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={variants.fadeUp}
                className="flex items-center justify-between p-4 bg-surface-card hover:bg-surface-muted/60 transition-colors cursor-pointer border-b border-line last:border-b-0"
                onClick={() => item.path && navigate(item.path)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center ${item.iconBg}`}
                  >
                    <IconComponent className={`w-5 h-5 ${item.iconColor}`} strokeWidth={1.25} />
                  </div>
                  <span className="text-ink">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted text-sm">{item.value}</span>
                  <ChevronRight className="w-5 h-5 text-ink-muted" strokeWidth={1.25} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 设置 — hairline rows */}
        <motion.div
          className="space-y-0 border border-line rounded-md overflow-hidden"
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
        >
          <h3 className="text-ink-muted text-sm px-4 py-2 bg-surface-muted/50">更多</h3>
          {[
            { icon: Settings, label: '设置' },
            { icon: Shield, label: '隐私政策' },
            { icon: HelpCircle, label: '帮助与反馈' },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={variants.fadeUp}
                className="flex items-center justify-between p-4 bg-surface-card hover:bg-surface-muted/60 transition-colors cursor-pointer border-b border-line last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-surface-muted flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-ink-secondary" strokeWidth={1.25} />
                  </div>
                  <span className="text-ink">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" strokeWidth={1.25} />
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-center text-ink-muted text-xs py-2">
          ShotMaster v1.0.0 &middot; 让摄影学习更有趣
        </p>
      </div>
    </PageLayout>
  );
}
