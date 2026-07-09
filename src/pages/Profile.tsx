import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Settings,
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
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/useGameStore';
import { PageLayout } from '../components/layout/PageLayout';
import { Badge, Button, ProgressBar } from '../components/ui/Button';
import { variants } from '../lib/motion';
import { CommunityWork } from '../types';

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
            aria-label="返回"
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
            aria-label="返回"
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
  const { user, customGalleryImages, getAllGalleryImages, communityWorks, toggleFavoriteImage, isFavoriteImage, toggleFavoriteWork, isFavoriteWork } =
    useGameStore();
  const [activeTab, setActiveTab] = useState<'gallery' | 'community'>('gallery');
  const [selectedWork, setSelectedWork] = useState<CommunityWork | null>(null);

  const allImages = [...customGalleryImages, ...getAllGalleryImages()];
  const favoriteImages = allImages.filter((img) => isFavoriteImage(img.id));
  const favoriteWorks = communityWorks.filter((work) => isFavoriteWork(work.id));

  const handleToggleWorkFav = (workId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteWork(workId);
  };

  return (
    <PageLayout desktop="single">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            aria-label="返回"
            className="w-10 h-10 rounded-full bg-surface-card border border-line flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">我的收藏</h1>
          <span className="text-ink-muted text-sm">
            {activeTab === 'gallery' ? `${favoriteImages.length} 张` : `${favoriteWorks.length} 个作品`}
          </span>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-accent text-white'
                : 'bg-surface-card text-ink-secondary border border-line hover:bg-surface-muted'
            }`}
          >
            图库收藏
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'community'
                ? 'bg-accent text-white'
                : 'bg-surface-card text-ink-secondary border border-line hover:bg-surface-muted'
            }`}
          >
            社区作品
          </button>
        </div>

        {activeTab === 'gallery' ? (
          favoriteImages.length > 0 ? (
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
              <p className="text-ink-secondary">还没有收藏图库图片</p>
              <p className="text-ink-muted text-sm mt-1">在图库中收藏喜欢的参考图</p>
              <Button variant="primary" className="mt-4" onClick={() => navigate('/gallery')}>
                去图库看看
              </Button>
            </motion.div>
          )
        ) : (
          favoriteWorks.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {favoriteWorks.map((work) => (
                <motion.button
                  key={work.id}
                  onClick={() => setSelectedWork(work)}
                  variants={variants.fadeUp}
                  className="group relative aspect-square rounded-md overflow-hidden text-left border border-line"
                >
                  <img
                    src={work.image}
                    alt={work.author}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">{work.author}</p>
                      <p className="text-white/70 text-xs flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-white" />
                        {work.votes}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleWorkFav(work.id, e)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-danger fill-danger" strokeWidth={1.25} />
                  </button>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={variants.fadeUp}
              initial="hidden"
              animate="show"
              className="bg-surface-card border border-line rounded-md p-8 text-center"
            >
              <Heart className="w-12 h-12 text-ink-muted mx-auto mb-3" strokeWidth={1.25} />
              <p className="text-ink-secondary">还没有收藏社区作品</p>
              <p className="text-ink-muted text-sm mt-1">在社区中点赞喜欢的作品会自动收藏</p>
              <Button variant="primary" className="mt-4" onClick={() => navigate('/community')}>
                去社区看看
              </Button>
            </motion.div>
          )
        )}
      </div>

      {/* 社区作品详情弹窗 */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-md max-w-2xl w-full max-h-[90vh] overflow-hidden animate-bounce-in relative">
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 bg-ink flex items-center justify-center">
                <img
                  src={selectedWork.image}
                  alt={selectedWork.author}
                  className="max-h-[60vh] md:max-h-[80vh] w-full object-contain"
                />
              </div>
              <div className="md:w-1/3 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={selectedWork.avatar}
                    alt={selectedWork.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-ink">{selectedWork.author}</p>
                    <p className="text-xs text-ink-muted">Lv.{selectedWork.authorLevel}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span>{selectedWork.authorStars} 星</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Trophy className="w-4 h-4 text-accent" />
                    <span>通关 {selectedWork.authorCompletedCount} 关</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>连胜 {selectedWork.authorStreak} 天</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Heart className="w-4 h-4 text-danger fill-danger" />
                    <span>{selectedWork.votes} 票</span>
                  </div>
                </div>
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => {
                      toggleFavoriteWork(selectedWork.id);
                      setSelectedWork(null);
                    }}
                    className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
                      isFavoriteWork(selectedWork.id)
                        ? 'bg-danger/10 text-danger hover:bg-danger/20'
                        : 'bg-surface-muted text-ink-secondary hover:bg-surface hover:text-ink'
                    }`}
                  >
                    {isFavoriteWork(selectedWork.id) ? '取消收藏' : '收藏作品'}
                  </button>
                  <p className="text-center text-xs text-ink-muted">{selectedWork.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

// ==================== 主个人中心页面 ====================
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useGameStore();
  const [isUploading, setIsUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const completedCount = user.completedLevels.length;
  const unlockedAchievements = user.achievements.filter((a) => a.unlocked);
  const xpProgress = (user.xp / user.xpToNext) * 100;
  const favoriteCount = (user.favoriteImageIds || []).length + (user.favoriteWorkIds || []).length;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateUser({ avatar: dataUrl });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
            <div className="relative flex-shrink-0">
              <label
                htmlFor="avatar-upload"
                className="block cursor-pointer"
              >
                {user.avatar && user.avatar.startsWith('data:') ? (
                  <img
                    src={user.avatar}
                    alt="头像"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-4xl">
                    <Camera className="w-10 h-10 text-accent" strokeWidth={1.25} />
                  </div>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                className="hidden"
              />
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
            { icon: Settings, label: '设置', onClick: () => setShowSettings(true) },
            { icon: HelpCircle, label: '帮助与反馈', path: '/feedback' },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={variants.fadeUp}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.path) navigate(item.path);
                }}
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

      {/* 设置弹窗 */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-ink/40 z-50 flex items-end justify-center"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-surface-card rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="font-semibold text-ink">设置</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-ink-secondary" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowSettings(false);
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-muted/60 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">切换账号</p>
                  <p className="text-xs text-ink-muted mt-0.5">使用其他账号登录</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
              </button>

              <button
                onClick={() => {
                  if (confirm('确定要退出登录吗？')) {
                    setShowSettings(false);
                    logout();
                    navigate('/login', { replace: true });
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50/60 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-500">退出登录</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    当前账号：{user.name || '未命名用户'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-xl bg-surface-muted text-ink-secondary font-medium hover:bg-surface-muted/80 transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageLayout>
  );
}
