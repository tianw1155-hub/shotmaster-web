import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Settings, Shield, HelpCircle, Camera, Heart, Award, Image as ImageIcon, Clock, Star, X, Flame } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Badge, Button, ProgressBar } from '../components/ui/Button';

// ==================== 我的作品页面 ====================
export function MyWorksPage() {
  const navigate = useNavigate();
  const { user, galleryImages } = useGameStore();

  // 获取用户完成的作品
  const completedWorks = galleryImages.slice(0, user.worksCount);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">我的作品</h1>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.worksCount}</p>
            <p className="text-xs text-ink-muted">作品总数</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-sun">{user.totalStars}</p>
            <p className="text-xs text-ink-muted">获得星数</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-mint">{user.averageScore}</p>
            <p className="text-xs text-ink-muted">平均分</p>
          </Card>
        </div>

        {/* 作品列表 */}
        {completedWorks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {completedWorks.map((work, idx) => (
              <Card key={idx} className="overflow-hidden">
                <img src={work.url} alt={work.title} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink truncate">{work.title}</p>
                  <p className="text-xs text-ink-muted">{work.category}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-ink-secondary">还没有作品</p>
            <p className="text-ink-muted text-sm mt-1">开始闯关拍摄你的第一张作品吧</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
              去闯关
            </Button>
          </Card>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

// ==================== 成就页面 ====================
export function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const unlockedCount = user.achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">成就墙</h1>
        </div>

        {/* 统计 */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-secondary text-sm">已解锁</p>
              <p className="text-2xl font-bold text-ink">{unlockedCount}/{user.achievements.length}</p>
            </div>
            <ProgressBar value={(unlockedCount / user.achievements.length) * 100} color="sun" />
          </div>
        </Card>

        {/* 成就列表 */}
        <div className="grid grid-cols-2 gap-3">
          {user.achievements.map(ach => (
            <Card
              key={ach.id}
              className={`p-4 ${ach.unlocked ? '' : 'opacity-60'}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${
                  ach.unlocked ? 'bg-sun/10' : 'bg-gray-100'
                }`}>
                  <span className={ach.unlocked ? '' : 'grayscale'}>{ach.icon}</span>
                </div>
                <h3 className="font-medium text-ink text-sm mb-1">{ach.name}</h3>
                <p className="text-xs text-ink-muted mb-2">{ach.description}</p>
                {ach.unlocked ? (
                  <Badge color="sun">已解锁</Badge>
                ) : (
                  <div className="w-full">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-sun rounded-full"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink-muted">{ach.progress}%</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

// ==================== 我的收藏页面 ====================
export function MyFavoritesPage() {
  const navigate = useNavigate();
  const { user, galleryImages, customGalleryImages, toggleFavoriteImage, isFavoriteImage } = useGameStore();

  const allImages = [...customGalleryImages, ...galleryImages];
  const favoriteImages = allImages.filter(img => isFavoriteImage(img.id));

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">我的收藏</h1>
          <span className="text-ink-muted text-sm">{favoriteImages.length} 张</span>
        </div>

        {favoriteImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {favoriteImages.map((image, idx) => {
              const isCustom = image.id.startsWith('custom_');
              return (
                <button
                  key={image.id}
                  onClick={() => navigate(`/gallery/${image.id}`)}
                  className="group relative aspect-square rounded-2xl overflow-hidden animate-scale-in text-left"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">{image.title}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow" />
                  </div>
                  {isCustom && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-primary/90 text-white text-xs rounded-full">我的</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-ink-secondary">还没有收藏</p>
            <p className="text-ink-muted text-sm mt-1">在图库中收藏喜欢的参考图</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/gallery')}>
              去图库看看
            </Button>
          </Card>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

// ==================== 主个人中心页面 ====================
export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const completedCount = user.completedLevels.length;
  const unlockedAchievements = user.achievements.filter(a => a.unlocked);
  const xpProgress = (user.xp / user.xpToNext) * 100;

  const favoriteCount = (user.favoriteImageIds || []).length;

  const menuItems = [
    { icon: ImageIcon, label: '我的作品', value: `${user.worksCount}幅`, color: 'bg-primary/10 text-primary', path: '/profile/works' },
    { icon: Heart, label: '我的收藏', value: `${favoriteCount}张`, color: 'bg-pink-50 text-pink-500', path: '/profile/favorites' },
    { icon: Award, label: '获得成就', value: `${unlockedAchievements.length}/${user.achievements.length}`, color: 'bg-sun/10 text-yellow-600', path: '/profile/achievements' },
    { icon: Clock, label: '学习时长', value: `${user.worksCount * 15}分钟`, color: 'bg-mint/10 text-mint-dark', path: null },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 用户信息卡片 */}
        <Card className="p-5 animate-fade-in bg-gradient-to-br from-white to-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-sun flex items-center justify-center text-4xl shadow-lg">
              {user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-ink">{user.name}</h1>
                <Badge color="sun">Lv.{user.level}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-ink-muted">{user.xp} / {user.xpToNext} XP</span>
              </div>
              <ProgressBar value={xpProgress} color="sun" />
            </div>
          </div>
        </Card>

        {/* 数据统计 */}
        <div className="grid grid-cols-4 gap-2 animate-slide-up">
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-primary">{user.worksCount}</p>
            <p className="text-xs text-ink-muted mt-0.5">作品</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-mint">{completedCount}</p>
            <p className="text-xs text-ink-muted mt-0.5">通关</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-sun">{user.totalStars}</p>
            <p className="text-xs text-ink-muted mt-0.5">星数</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xl font-bold text-primary">{user.maxStreak}</p>
            <p className="text-xs text-ink-muted mt-0.5">最高连胜</p>
          </Card>
        </div>

        {/* 功能菜单 */}
        <div className="space-y-2 animate-slide-up">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.label}
                className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => item.path && navigate(item.path)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-ink">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted text-sm">{item.value}</span>
                  <ChevronRight className="w-5 h-5 text-ink-muted" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* 设置 */}
        <div className="space-y-2 animate-slide-up">
          <h3 className="text-ink-muted text-sm px-1 mb-1">更多</h3>
          {[
            { icon: Settings, label: '设置' },
            { icon: Shield, label: '隐私政策' },
            { icon: HelpCircle, label: '帮助与反馈' },
          ].map(item => {
            const IconComponent = item.icon;
            return (
              <Card key={item.label} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-ink-secondary" />
                  </div>
                  <span className="text-ink">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" />
              </Card>
            );
          })}
        </div>

        <p className="text-center text-ink-muted text-xs py-2">
          ShotMaster v1.0.0 · 让摄影学习更有趣
        </p>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}