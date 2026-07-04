import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mountain, User, Building, Leaf, Plane, Utensils, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import type { PhotoPreference } from '../types';

const PREFERENCES: { id: PhotoPreference; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  { id: 'landscape', label: '风光摄影', icon: <Mountain className="w-8 h-8" />, description: '山川湖海，壮丽风景', color: 'from-blue-500 to-cyan-400' },
  { id: 'portrait', label: '人像摄影', icon: <User className="w-8 h-8" />, description: '人物神态，情感捕捉', color: 'from-pink-500 to-rose-400' },
  { id: 'street', label: '街头摄影', icon: <Camera className="w-8 h-8" />, description: '城市故事，人间烟火', color: 'from-gray-700 to-gray-500' },
  { id: 'still', label: '静物摄影', icon: <Sparkles className="w-8 h-8" />, description: '光影质感，细节之美', color: 'from-amber-500 to-orange-400' },
  { id: 'architecture', label: '建筑摄影', icon: <Building className="w-8 h-8" />, description: '线条几何，空间美学', color: 'from-indigo-500 to-purple-400' },
  { id: 'nature', label: '自然生态', icon: <Leaf className="w-8 h-8" />, description: '动植物，生态之美', color: 'from-green-500 to-emerald-400' },
  { id: 'travel', label: '旅行摄影', icon: <Plane className="w-8 h-8" />, description: '探索世界，记录旅途', color: 'from-sky-500 to-blue-400' },
  { id: 'food', label: '美食摄影', icon: <Utensils className="w-8 h-8" />, description: '舌尖艺术，美味定格', color: 'from-orange-500 to-red-400' },
];

export function PreferencesPage() {
  const navigate = useNavigate();
  const { setPreferences, completeOnboarding, user, refreshUnsplashImages } = useGameStore();
  const [selected, setSelected] = useState<PhotoPreference[]>(user.preferences || []);
  const [isLoading, setIsLoading] = useState(false);

  const togglePreference = (pref: PhotoPreference) => {
    setSelected(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const handleContinue = async () => {
    setPreferences(selected);
    completeOnboarding();
    setIsLoading(true);
    try {
      await refreshUnsplashImages();
    } catch (e) {
      // 即使刷新失败也继续导航
    }
    setIsLoading(false);
    navigate('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-accent/10">
      {/* 游客提示 */}
      {user.isGuest && (
        <div className="fixed top-0 left-0 right-0 bg-warning text-surface px-4 py-3 text-center text-sm font-medium shadow-lg z-50 animate-fade-in">
          ⚠️ 您正在使用游客模式，游戏记录不会保存，关闭页面后需重新登录
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 进度指示 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-semibold">1</div>
          <span className="text-ink font-medium">选择偏好</span>
        </div>
          <button
            onClick={handleSkip}
            className="text-ink-light hover:text-ink transition text-sm"
          >
            跳过
          </button>
        </div>

        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink mb-3">你喜欢拍什么？</h1>
          <p className="text-ink-light">选择你感兴趣的摄影类型，我们会为你推荐更适合的学习内容</p>
          <p className="text-ink-light text-sm mt-1">至少选择 1 项，可多选</p>
        </div>

        {/* 偏好选项网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {PREFERENCES.map((pref) => {
          const isSelected = selected.includes(pref.id);
          return (
            <button
              key={pref.id}
              onClick={() => togglePreference(pref.id)}
              className={`relative p-5 rounded-md border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-line bg-surface hover:border-ink-muted hover:shadow-md'
              }`}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* 图标 */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pref.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
                {pref.icon}
              </div>

              {/* 文字 */}
              <h3 className="font-semibold text-ink mb-1">{pref.label}</h3>
              <p className="text-xs text-ink-light">{pref.description}</p>
            </button>
          );
        })}
        </div>

        {/* 底部按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0 || isLoading}
            className="w-full py-4 rounded-md bg-gradient-to-r from-accent to-accent-soft text-white font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                正在为你准备推荐...
              </>
            ) : (
              <>
                开始学习
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-ink-light text-sm">
            已选择 <span className="text-accent font-medium">{selected.length}</span> 项
          </p>
        </div>
      </div>
    </div>
  );
}
