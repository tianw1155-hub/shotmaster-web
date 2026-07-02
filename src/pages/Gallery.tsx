import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Upload, Camera, Trash2, Aperture, Sun, Palette, Layers, ChevronDown, ChevronUp, Heart, RefreshCw, ThumbsDown, ThumbsUp, Lightbulb, Grid3X3, Package, Loader2 } from 'lucide-react';
import { CompositionOverlay } from '../components/game/GameComponents';
import { inferCompositionRule, compositionRuleLabels } from '../utils/compositionUtils';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Badge, Button } from '../components/ui/Button';
import { GalleryImage, ShootingPlan, ShootingPlanDimension } from '../types';
import { aiService } from '../services/aiService';

// 页签顺序：全部 -> 我的上传 -> 其他分类
const categoryOrder = ['all', 'myupload', 'composition', 'light', 'color', 'portrait', 'landscape', 'still', 'street'];
const categoryLabels: Record<string, string> = {
  all: '全部', myupload: '我的上传', composition: '构图', light: '光线', color: '色彩',
  portrait: '人像', landscape: '风景', still: '静物', street: '街拍',
};

const difficultyLabels: Record<string, { label: string; color: 'mint' | 'sun' | 'grape' }> = {
  beginner: { label: '入门', color: 'mint' },
  intermediate: { label: '进阶', color: 'sun' },
  advanced: { label: '高级', color: 'grape' },
};

export function GalleryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    customGalleryImages,
    addCustomGalleryImage,
    removeCustomGalleryImage,
    getRecommendedImages,
    getAllGalleryImages,
    user,
    isLoadingUnsplash,
    shouldRefreshUnsplash,
    refreshUnsplashImages,
  } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastManualRefresh, setLastManualRefresh] = useState<number>(0);
  const [canRefresh, setCanRefresh] = useState(true);

  const galleryImages = getAllGalleryImages();

  const recommendedImages = useMemo(() => getRecommendedImages(), [getRecommendedImages, user.preferences, user.favoriteImageIds, user.imageInteractions, user.shootCategories, galleryImages.length]);

  useEffect(() => {
    if (shouldRefreshUnsplash()) {
      refreshUnsplashImages();
    }
  }, []);

  // 检查是否可以刷新（5分钟限制）
  useEffect(() => {
    const checkRefreshAvailability = () => {
      const now = Date.now();
      const diff = now - lastManualRefresh;
      setCanRefresh(diff >= 5 * 60 * 1000 || lastManualRefresh === 0);
    };
    
    checkRefreshAvailability();
    const interval = setInterval(checkRefreshAvailability, 1000);
    return () => clearInterval(interval);
  }, [lastManualRefresh]);

  // 根据"我的上传"页签切换显示内容
  const displayImages = selectedCategory === 'myupload' 
    ? customGalleryImages 
    : selectedCategory === 'all' 
      ? recommendedImages 
      : recommendedImages.filter(img => img.category === selectedCategory);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newImage: GalleryImage = {
        id: `custom_${Date.now()}`,
        url: dataUrl,
        title: '自定义参考图',
        category: 'composition',
        difficulty: 'beginner',
        tags: ['自定义'],
      };
      addCustomGalleryImage(newImage);
      // 上传后跳转到我的上传页签
      setSelectedCategory('myupload');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这张图片吗？')) {
      removeCustomGalleryImage(imageId);
    }
  };

  const handleManualRefresh = () => {
    if (!canRefresh) {
      const remaining = Math.ceil((5 * 60 * 1000 - (Date.now() - lastManualRefresh)) / 1000 / 60);
      alert(`请等待 ${remaining} 分钟后再刷新`);
      return;
    }
    refreshUnsplashImages();
    setLastManualRefresh(Date.now());
    setCanRefresh(false);
  };

  const getRefreshTooltip = () => {
    if (canRefresh) return '从Unsplash获取新图片（每5分钟一次）';
    const remainingMs = 5 * 60 * 1000 - (Date.now() - lastManualRefresh);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `请等待 ${minutes}分${seconds}秒 后再刷新`;
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar title="图库" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">参考图库</h1>
          <p className="text-ink-secondary text-sm">精选参考图，覆盖各类拍摄主题</p>
        </div>

        {/* 上传入口 - 在页签上方显示 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full animate-slide-up"
        >
          <Card className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-dashed border-2 border-primary/20">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-ink">上传自定义参考图</p>
              <p className="text-xs text-ink-muted">AI 自动生成专属拍摄计划</p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </Card>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {/* 分类标签 */}
        <div className="animate-slide-up overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            {categoryOrder.map((key) => {
              const label = categoryLabels[key];
              if (!label) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === key
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white text-ink-secondary border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {key === 'myupload' && customGalleryImages.length > 0 && (
                    <span className="ml-1 text-xs">({customGalleryImages.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 图片数量和刷新按钮 */}
        <div className="flex items-center justify-between animate-slide-up">
          <span className="text-sm text-ink-light">
            共 {displayImages.length} 张
          </span>
          {selectedCategory !== 'myupload' && (
            <button
              onClick={handleManualRefresh}
              disabled={!canRefresh || isLoadingUnsplash}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                canRefresh 
                  ? 'bg-gray-100 text-ink-light hover:text-ink hover:bg-gray-200' 
                  : 'bg-gray-50 text-ink-muted cursor-not-allowed'
              } disabled:opacity-50`}
              title={getRefreshTooltip()}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingUnsplash ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* 图片网格 */}
        <div className="grid grid-cols-2 gap-3">
          {displayImages.map((image, idx) => {
            const isCustom = image.id.startsWith('custom_');
            return (
              <GalleryImageCard
                key={image.id}
                image={image}
                idx={idx}
                isCustom={isCustom}
                showDelete={selectedCategory === 'myupload'}
                onDelete={handleDeleteCustomImage}
                onClick={() => navigate(`/gallery/${image.id}`)}
              />
            );
          })}
        </div>
      </main>

      <BottomNav active="gallery" />
    </div>
  );
}

export function GalleryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customGalleryImages,
    getAllGalleryImages,
    setWeeklyChallengeImage,
    toggleFavoriteImage,
    isFavoriteImage,
    recordShootCategory,
    toggleLikeDimension,
    toggleDislikeDimension,
    getDimensionFeedback,
  } = useGameStore();

  const galleryImages = getAllGalleryImages();
  const allImages = [...customGalleryImages, ...galleryImages];
  const image = allImages.find(img => img.id === id);
  const isFav = image ? isFavoriteImage(image.id) : false;
  const isCustom = image?.id.startsWith('custom_');

  const [shootingPlan, setShootingPlan] = useState<ShootingPlan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('scene');
  const [showGuideLines, setShowGuideLines] = useState(true);
  const compositionRule = isCustom ? 'none' : inferCompositionRule(image);

  useEffect(() => {
    if (!image) return;
    // 使用 AI 生成拍摄计划
    let mounted = true;
    const generatePlan = async () => {
      setIsAnalyzing(true);
      try {
        const plan = await aiService.generateShootingPlan(image.url);
        if (mounted) {
          setShootingPlan(plan);
        }
      } catch (e) {
        console.error('Generate shooting plan failed:', e);
      } finally {
        if (mounted) setIsAnalyzing(false);
      }
    };
    generatePlan();
    return () => { mounted = false; };
  }, [image?.id, image?.url]);

  if (!image) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-ink-secondary">图片不存在</p>
      </div>
    );
  }

  const diff = difficultyLabels[image.difficulty];

  const handleStartChallenge = () => {
    setWeeklyChallengeImage(image.url);
    recordShootCategory(image.category);
    navigate(`/shoot/1?mode=upload&from=gallery&imageId=${image.id}`);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteImage(image.id, image.category);
  };

  const handleLike = (dimension: ShootingPlanDimension) => {
    if (!image) return;
    toggleLikeDimension(image.id, dimension);
  };

  const handleDislike = (dimension: ShootingPlanDimension) => {
    if (!image) return;
    toggleDislikeDimension(image.id, dimension);
  };

  const planSections: { key: ShootingPlanDimension; icon: React.ElementType; title: string; color: string; content: (plan: ShootingPlan) => React.ReactNode }[] = [
    {
      key: 'scene', icon: Sun, title: '场景', color: 'text-primary',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-1">{p.scene.type}</p>
          <p className="text-ink-secondary text-sm">{p.scene.description}</p>
        </div>
      ),
    },
    {
      key: 'lighting', icon: Lightbulb, title: '光线', color: 'text-yellow-500',
      content: (p) => (
        <div className="space-y-1 text-sm">
          <p className="text-ink-secondary">方向：<span className="text-ink font-medium">{p.lighting.direction}</span></p>
          <p className="text-ink-secondary">质量：<span className="text-ink font-medium">{p.lighting.quality}</span></p>
          <p className="text-ink-secondary">色温：<span className="text-ink font-medium">{p.lighting.colorTemp}</span></p>
          <p className="text-primary text-xs mt-2">💡 {p.lighting.suggestion}</p>
        </div>
      ),
    },
    {
      key: 'composition', icon: Grid3X3, title: '构图', color: 'text-sky',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-1">{p.composition.rule}</p>
          <p className="text-ink-secondary text-sm">{p.composition.details}</p>
        </div>
      ),
    },
    {
      key: 'params', icon: Camera, title: '参数建议', color: 'text-mint',
      content: (p) => (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-ink-muted">ISO</p>
            <p className="text-sm font-medium text-ink">{p.params.iso}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-ink-muted">光圈</p>
            <p className="text-sm font-medium text-ink">{p.params.aperture}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-ink-muted">快门</p>
            <p className="text-sm font-medium text-ink">{p.params.shutter}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'postProcessing', icon: Palette, title: '后期调色', color: 'text-grape',
      content: (p) => (
        <div>
          <p className="text-ink font-medium mb-2">{p.postProcessing.style}</p>
          <ul className="space-y-1">
            {p.postProcessing.steps.map((s, i) => (
              <li key={i} className="text-ink-secondary text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-grape" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: 'equipment', icon: Package, title: '推荐装备', color: 'text-sky',
      content: (p) => (
        <div className="space-y-1 text-sm">
          <p className="text-ink-secondary">相机：<span className="text-ink font-medium">{p.equipment.camera}</span></p>
          <p className="text-ink-secondary">镜头：<span className="text-ink font-medium">{p.equipment.lens}</span></p>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.equipment.accessories.map((a, i) => (
              <span key={i} className="px-2 py-1 rounded-full bg-sky/5 text-sky-dark text-xs">{a}</span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto">
        <div className="relative animate-fade-in bg-gray-900">
          <div className="relative">
            <img src={image.url} alt={image.title} className="w-full max-h-[70vh] object-contain mx-auto" />
            {showGuideLines && !isCustom && (
              <CompositionOverlay rule={compositionRule} showLabel={true} />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md z-10"
          >
            <ChevronRight className="w-5 h-5 text-ink rotate-180" />
          </button>
          {!isCustom && (
            <button
              onClick={() => setShowGuideLines(!showGuideLines)}
              className={`absolute top-4 right-16 w-10 h-10 rounded-full backdrop-blur flex items-center justify-center shadow-md z-10 ${
                showGuideLines ? 'bg-primary text-white' : 'bg-white/80 text-ink'
              }`}
              title="参考线"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}
          {image.author && (
            <a
              href={image.authorUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white text-xs flex items-center gap-1 hover:bg-black/80 transition z-10"
            >
              <Camera className="w-3 h-3" />
              摄影：{image.author}
            </a>
          )}
          {showGuideLines && !isCustom && (
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary/80 backdrop-blur rounded-full text-white text-xs">
              {compositionRuleLabels[compositionRule]}
            </div>
          )}
        </div>

        <div className="px-4 -mt-8 relative z-10 space-y-4">
          <div className="animate-slide-up flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink mb-2">{image.title}</h1>
              <div className="flex items-center gap-2">
                <Badge color="sky">{categoryLabels[image.category]}</Badge>
                <Badge color={diff.color}>{diff.label}</Badge>
              </div>
            </div>
            {!isCustom && (
              <button
                onClick={handleToggleFav}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFav
                    ? 'bg-red-100 text-red-500'
                    : 'bg-gray-100 text-ink-light hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <Card className="p-4 animate-slide-up">
            <h3 className="font-medium text-ink mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {image.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-ink-secondary text-sm">#{tag}</span>
              ))}
            </div>
          </Card>

          {/* AI 拍摄计划 */}
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                🤖 AI 拍摄计划
              </h2>
            </div>

            {isAnalyzing || !shootingPlan ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-ink-secondary text-sm">AI 正在分析图片...</p>
                <p className="text-ink-muted text-xs mt-1">生成结构化拍摄计划</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {planSections.map(({ key, icon: Icon, title, color, content }) => {
                  const isExpanded = expandedSection === key;
                  const dimFeedback = image ? getDimensionFeedback(image.id, key) : { liked: false, disliked: false };
                  return (
                    <Card key={key} className="overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : key)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          <span className="font-medium text-ink">{title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLike(key); }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              dimFeedback.liked
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-ink-light hover:bg-gray-200'
                            }`}
                            title="这部分建议有用"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${dimFeedback.liked ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDislike(key); }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              dimFeedback.disliked
                                ? 'bg-red-100 text-red-500'
                                : 'bg-gray-100 text-ink-light hover:bg-gray-200'
                            }`}
                            title="这部分建议没用"
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${dimFeedback.disliked ? 'fill-current' : ''}`} />
                          </button>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-ink-muted ml-1" /> : <ChevronDown className="w-5 h-5 text-ink-muted ml-1" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 animate-slide-up">
                          {content(shootingPlan)}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full animate-slide-up"
              onClick={handleStartChallenge}
            >
              <Camera className="w-5 h-5" />
              开始挑战
            </Button>
          </div>
        </div>
      </main>

      <BottomNav active="gallery" />
    </div>
  );
}

function getCompositionTips(img: GalleryImage): string[] {
  const tips: Record<string, string[]> = {
    composition: [
      '运用引导线将视线引向主体',
      '前景元素增加画面层次感',
      '对称构图营造稳定平衡感',
      '留白区域突出主体地位',
    ],
    landscape: [
      '三分法安排地平线位置',
      '前景增加画面纵深感',
      '利用自然框架突出主体',
      '山脉走向引导视线延伸',
    ],
    portrait: [
      '眼神放在画面上三分线处',
      '留白方向朝向视线一侧',
      '利用前景虚化增加层次',
      '身体与头部形成角度变化',
    ],
    street: [
      '捕捉决定性瞬间的平衡',
      '建筑线条形成引导框架',
      '人物与环境的比例协调',
      '利用对称增加画面秩序感',
    ],
    still: [
      '三角形构图增加稳定感',
      '物体高低错落形成节奏',
      '负空间平衡主体重量',
      '对角线增加画面动感',
    ],
    light: [
      '光源方向决定阴影走向',
      '明暗交界线塑造立体感',
      '高光区域吸引视觉注意',
      '剪影突出轮廓线条美',
    ],
    color: [
      '主色调决定整体氛围',
      '互补色增加视觉冲击力',
      '邻近色营造和谐统一感',
      '色温变化传递情绪感受',
    ],
  };
  return tips[img.category] || tips.composition;
}

function getLightingTips(img: GalleryImage): string[] {
  const tips: Record<string, string[]> = {
    landscape: [
      '黄金时刻（日出日落）拍摄',
      '侧光突出地形纹理质感',
      '蓝调时刻增添神秘感',
      '逆光创造轮廓光效果',
    ],
    portrait: [
      '柔和的窗户光最适合人像',
      '眼神光是人像的灵魂',
      '侧逆光勾勒发丝轮廓',
      '避免正午顶光造成阴影',
    ],
    street: [
      '利用窗户光作为环境光源',
      '明暗对比增加戏剧感',
      '霓虹灯营造夜色氛围',
      '光斑增添画面趣味性',
    ],
    still: [
      '柔和侧光表现物体质感',
      '逆光突出物体轮廓',
      '柔光箱减少生硬阴影',
      '反光板补充暗部细节',
    ],
    composition: [
      '侧光增强线条立体感',
      '明暗对比突出结构',
      '均匀光照保持细节',
      '光影变化塑造空间感',
    ],
    light: [
      '黄金时刻光线最柔和',
      '逆光是创作剪影的关键',
      '柔光营造温暖氛围',
      '硬光增加戏剧性',
    ],
    color: [
      '光线色温影响色彩表现',
      '暖光营造温馨氛围',
      '冷光增添静谧感受',
      '混合光创造独特色调',
    ],
  };
  return tips[img.category] || tips.landscape;
}

function getColorTips(img: GalleryImage): string[] {
  const tips: Record<string, string[]> = {
    landscape: [
      '蓝白主调营造开阔感',
      '绿色系传递自然生机',
      '日落暖色增添温情',
      '冷暖对比增强层次',
    ],
    portrait: [
      '肤色还原是关键',
      '背景色调衬托人物',
      '服装色彩与环境协调',
      '暖调增加亲切感',
    ],
    still: [
      '邻近色系营造和谐',
      '点缀色提亮画面',
      '主色调决定整体风格',
      '色彩统一增强美感',
    ],
    street: [
      '高对比色增加视觉冲击',
      '霓虹灯的色彩趣味',
      '单一主色调风格统一',
      '人文气息的暖色调',
    ],
    composition: [
      '色彩对比突出主体',
      '和谐色调平衡画面',
      '点缀色引导视线',
      '色彩重量影响构图',
    ],
    light: [
      '光线色温决定色彩倾向',
      '黄金时刻的暖调最迷人',
      '蓝调时刻的冷色最神秘',
      '色彩与光影相互映衬',
    ],
    color: [
      '互补色搭配最具张力',
      '同类色搭配和谐统一',
      '冷暖对比增加层次',
      '饱和度影响情绪表达',
    ],
  };
  return tips[img.category] || tips.landscape;
}

function getParamTips(img: GalleryImage): string[] {
  if (img.difficulty === 'beginner') {
    return [
      '光圈 f/5.6-f/8 保证清晰度',
      'ISO 100-400 画质最佳',
      '快门根据光线自动调节',
      '使用光圈优先模式',
    ];
  }
  if (img.difficulty === 'intermediate') {
    return [
      '根据创作意图选择光圈',
      '手动模式精确控制曝光',
      '关注白平衡还原色彩',
      '使用RAW格式后期调整',
    ];
  }
  return [
    '全手动模式完全掌控',
    '三脚架保证低光画质',
    '长曝光创造特殊效果',
    '精确对焦确保主体清晰',
  ];
}

function GalleryImageCard({ image, idx, isCustom, showDelete, onDelete, onClick }: {
  image: GalleryImage;
  idx: number;
  isCustom: boolean;
  showDelete: boolean;
  onDelete: (imageId: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const isFav = useGameStore(state => state.isFavoriteImage(image.id));

  return (
    <button
      onClick={onClick}
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
          <Badge color="sun">{categoryLabels[image.category] || image.category}</Badge>
        </div>
      </div>
      {isFav && !isCustom && (
        <div className="absolute top-2 right-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow" />
        </div>
      )}
      {isCustom && !showDelete && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-primary/90 text-white text-xs rounded-full">我的</span>
        </div>
      )}
      {showDelete && (
        <button
          onClick={(e) => onDelete(image.id, e)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition z-10"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </button>
  );
}
