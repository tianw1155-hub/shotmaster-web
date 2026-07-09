import React, { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import {
  getFeedbackAnalysis,
  getFeedbackTrend,
  getLowRatedFeedback,
  getTextFeedbackList,
  updateTextFeedbackStatus,
} from '../../services/apiService';
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  X,
  Image,
  Calendar,
  Tag,
  Filter,
  Bug,
  Lightbulb,
  HelpCircle,
  Heart,
  User,
  CheckCircle,
  Clock,
  Loader,
} from 'lucide-react';

const dimensionLabels: Record<string, string> = {
  scene: '场景选择',
  lighting: '光线运用',
  composition: '构图技巧',
  params: '参数建议',
  postProcessing: '后期调色',
  equipment: '推荐装备',
};

const dimensionColors: Record<string, string> = {
  scene: 'from-blue-500 to-cyan-500',
  lighting: 'from-amber-500 to-yellow-500',
  composition: 'from-purple-500 to-pink-500',
  params: 'from-green-500 to-emerald-500',
  postProcessing: 'from-rose-500 to-red-500',
  equipment: 'from-slate-500 to-gray-500',
};

export const FeedbackPage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<'shooting' | 'text'>('shooting');

  // 拍摄计划反馈状态
  const [dimensionStats, setDimensionStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [lowRated, setLowRated] = useState<any[]>([]);
  const [lowRatedCounts, setLowRatedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  // 用户文字反馈状态
  const [textList, setTextList] = useState<any[]>([]);
  const [textCategoryCounts, setTextCategoryCounts] = useState<Record<string, number>>({});
  const [textStatusCounts, setTextStatusCounts] = useState<Record<string, number>>({});
  const [textLoading, setTextLoading] = useState(false);
  const [textCategoryFilter, setTextCategoryFilter] = useState<string>('');
  const [textStatusFilter, setTextStatusFilter] = useState<string>('');
  const [selectedTextFeedback, setSelectedTextFeedback] = useState<any | null>(null);

  // 加载文字反馈
  const loadTextFeedback = useCallback(async () => {
    setTextLoading(true);
    try {
      const filters: any = {};
      if (textCategoryFilter) filters.category = textCategoryFilter;
      if (textStatusFilter) filters.status = textStatusFilter;
      const res = await getTextFeedbackList(token, filters);
      setTextList(res.data || []);
      setTextCategoryCounts(res.categoryCounts || {});
      setTextStatusCounts(res.statusCounts || {});
    } catch (e) {
      console.error(e);
    } finally {
      setTextLoading(false);
    }
  }, [token, textCategoryFilter, textStatusFilter]);

  useEffect(() => {
    if (activeTab === 'text') {
      loadTextFeedback();
    }
  }, [activeTab, loadTextFeedback]);

  // 更新反馈状态
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateTextFeedbackStatus(token, id, status);
      // 更新本地数据
      setTextList(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      if (selectedTextFeedback?.id === id) {
        setSelectedTextFeedback({ ...selectedTextFeedback, status });
      }
      // 重新加载以更新统计
      loadTextFeedback();
    } catch (e) {
      console.error(e);
    }
  };

  // 加载拍摄计划反馈
  useEffect(() => {
    if (activeTab !== 'shooting') return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analysisRes, trendRes, lowRatedRes] = await Promise.all([
          getFeedbackAnalysis(token),
          getFeedbackTrend(token),
          getLowRatedFeedback(token, 100),
        ]);
        setDimensionStats(analysisRes.dimensionStats || []);
        setTrendData(trendRes.data || []);
        setLowRated(lowRatedRes.data || []);
        setLowRatedCounts(lowRatedRes.dimensionCounts || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, activeTab]);

  if (activeTab === 'shooting' && loading) {
    return (
      <div className="space-y-6">
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 拍摄计划反馈数据计算
  const totalLiked = dimensionStats.reduce((sum, d) => sum + (d.liked || 0), 0);
  const totalDisliked = dimensionStats.reduce((sum, d) => sum + (d.disliked || 0), 0);
  const totalFeedbacks = totalLiked + totalDisliked;
  const overallLikeRate = totalFeedbacks > 0 ? totalLiked / totalFeedbacks : 0;

  const worstDimension = dimensionStats.reduce((worst, current) => {
    if (!worst || current.disliked > worst.disliked) return current;
    return worst;
  }, null as any);

  return (
    <div className="space-y-6">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'shooting' ? (
        <>
          {/* 反馈概览统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">总反馈数</p>
                  <p className="text-3xl font-bold text-slate-800">{totalFeedbacks}</p>
                </div>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-purple-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">点赞 / 点踩</p>
                  <p className="text-3xl font-bold text-slate-800">
                    <span className="text-green-600">{totalLiked}</span>
                    <span className="text-lg text-slate-400 mx-1">/</span>
                    <span className="text-red-500">{totalDisliked}</span>
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <ThumbsUp className="w-7 h-7 text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">好评率</p>
                  <p className={`text-3xl font-bold ${
                    overallLikeRate >= 0.7 ? 'text-green-600' : overallLikeRate >= 0.5 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {(overallLikeRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-amber-500" />
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overallLikeRate >= 0.7 ? 'bg-green-500' : overallLikeRate >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${overallLikeRate * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 反馈趋势 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">反馈趋势</h3>
                <p className="text-sm text-slate-500">最近7天点赞/点踩变化</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between h-48 gap-3">
              {trendData.map((item) => {
                const maxTotal = Math.max(...trendData.map((d) => d.total || 1));
                const likedHeight = (item.liked / maxTotal) * 100;
                const dislikedHeight = (item.disliked / maxTotal) * 100;
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex flex-col items-center flex-1 justify-end gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-lg transition-all group-hover:from-green-300 group-hover:to-emerald-400"
                        style={{ height: `${likedHeight}%`, minHeight: item.liked > 0 ? '4px' : '0' }}
                      />
                      <div
                        className="w-full bg-gradient-to-t from-red-400 to-rose-500 rounded-t-lg transition-all group-hover:from-red-300 group-hover:to-rose-400"
                        style={{ height: `${dislikedHeight}%`, minHeight: item.disliked > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-slate-700 transition">{item.date?.slice(5) || '-'}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-t from-green-400 to-emerald-500 rounded" />
                <span className="text-xs text-slate-600">点赞</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-t from-red-400 to-rose-500 rounded" />
                <span className="text-xs text-slate-600">点踩</span>
              </div>
            </div>
          </div>

          {/* 维度分析 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">分维度反馈分析</h3>
                <p className="text-sm text-slate-500">识别AI模型各维度的优势与改进空间</p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimensionStats.map((dim) => (
                <div
                  key={dim.dimension}
                  className={`border rounded-xl p-5 cursor-pointer transition ${
                    selectedDimension === dim.dimension
                      ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedDimension(dim.dimension === selectedDimension ? null : dim.dimension)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700">
                      {dimensionLabels[dim.dimension] || dim.dimension}
                    </span>
                    <span
                      className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                        dim.likeRate >= 0.7
                          ? 'text-green-700 bg-green-50'
                          : dim.likeRate >= 0.5
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-red-700 bg-red-50'
                      }`}
                    >
                      {(dim.likeRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        dimensionColors[dim.dimension] || 'from-slate-400 to-gray-500'
                      } rounded-full transition-all`}
                      style={{ width: `${dim.likeRate * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>共 {dim.total} 条</span>
                    <div className="flex gap-3">
                      <span className="text-green-600">+{dim.liked}</span>
                      <span className="text-red-500">-{dim.disliked}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 需改进提示 */}
          {worstDimension && worstDimension.disliked > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">改进建议</h4>
                  <p className="text-sm text-amber-700">
                    <strong>{dimensionLabels[worstDimension.dimension]}</strong> 维度的点踩数最高（{worstDimension.disliked}次），
                    好评率仅 {(worstDimension.likeRate * 100).toFixed(1)}%，建议优先优化该维度的AI输出质量。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 低评分反馈列表 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">低评分反馈详情</h3>
                <p className="text-sm text-slate-500">用户点踩的具体反馈记录</p>
              </div>
              <ThumbsDown className="w-5 h-5 text-red-400" />
            </div>

            {lowRated.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-green-400" />
                </div>
                <p className="font-medium">暂无低评分反馈</p>
                <p className="text-sm text-slate-400 mt-1">AI表现良好，继续加油!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowRated.slice(0, 20).map((fb, idx) => (
                  <div
                    key={fb.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer"
                    onClick={() => setSelectedFeedback(fb)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {dimensionLabels[fb.dimension] || fb.dimension}
                        </p>
                        <p className="text-xs text-slate-400">
                          图片: {fb.imageTitle || fb.imageId || '-'} · {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </div>
            )}

            {/* 各维度点踩统计 */}
            {Object.keys(lowRatedCounts).length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">各维度点踩分布</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(lowRatedCounts).map(([dim, count]) => (
                    <div key={dim} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">{dimensionLabels[dim] || dim}</span>
                      <span className="text-sm font-semibold text-red-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 反馈详情弹窗 */}
          {selectedFeedback && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFeedback(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">反馈详情</h3>
                  <button onClick={() => setSelectedFeedback(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
                    {selectedFeedback.imageUrl ? (
                      <img src={selectedFeedback.imageUrl} alt={selectedFeedback.imageTitle || '参考图'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Image className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <ThumbsDown className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">点踩维度</p>
                        <p className="font-semibold text-slate-800">{dimensionLabels[selectedFeedback.dimension] || selectedFeedback.dimension}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">图片标题</p>
                        <p className="font-medium text-slate-800">{selectedFeedback.imageTitle || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">分类</p>
                        <p className="font-medium text-slate-800">{selectedFeedback.category || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">反馈时间</p>
                        <p className="font-medium text-slate-800">{new Date(selectedFeedback.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">用户ID</p>
                        <p className="font-medium text-slate-800">{selectedFeedback.userId || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 文字反馈概览统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">反馈总数</p>
                  <p className="text-3xl font-bold text-slate-800">{textList.length}</p>
                </div>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-purple-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">待处理</p>
                  <p className="text-3xl font-bold text-amber-600">{textStatusCounts.pending || 0}</p>
                </div>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">处理中</p>
                  <p className="text-3xl font-bold text-blue-600">{textStatusCounts.processing || 0}</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Loader className="w-7 h-7 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">已解决</p>
                  <p className="text-3xl font-bold text-green-600">{textStatusCounts.resolved || 0}</p>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 分类柱状图 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">反馈分类分布</h3>
                <p className="text-sm text-slate-500">按反馈类型统计数量</p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>

            {textLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : Object.keys(textCategoryCounts).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium">暂无用户反馈</p>
                <p className="text-sm text-slate-400 mt-1">等待用户通过帮助与反馈提交意见</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
                    bug: { label: '问题反馈', color: 'from-red-400 to-rose-500', icon: Bug },
                    suggestion: { label: '功能建议', color: 'from-amber-400 to-orange-500', icon: Lightbulb },
                    question: { label: '使用咨询', color: 'from-blue-400 to-cyan-500', icon: HelpCircle },
                    praise: { label: '表扬鼓励', color: 'from-pink-400 to-rose-500', icon: Heart },
                    other: { label: '其他', color: 'from-slate-400 to-gray-500', icon: MessageSquare },
                  };
                  const maxCount = Math.max(...Object.values(textCategoryCounts), 1);
                  return Object.entries(textCategoryCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const config = categoryConfig[cat] || { label: cat, color: 'from-slate-400 to-gray-500', icon: MessageSquare };
                      const Icon = config.icon;
                      const widthPct = (count / maxCount) * 100;
                      return (
                        <div key={cat} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="text-sm font-medium text-slate-700">{config.label}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{count}</span>
                          </div>
                          <div className="h-6 bg-slate-50 rounded-lg overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${config.color} rounded-lg transition-all group-hover:opacity-80`}
                              style={{ width: `${Math.max(widthPct, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            )}
          </div>

          {/* 筛选器 */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">筛选：</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: '', label: '全部分类' },
                  { value: 'bug', label: '问题反馈' },
                  { value: 'suggestion', label: '功能建议' },
                  { value: 'question', label: '使用咨询' },
                  { value: 'praise', label: '表扬鼓励' },
                  { value: 'other', label: '其他' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTextCategoryFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      textCategoryFilter === opt.value
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex gap-2">
                {[
                  { value: '', label: '全部状态' },
                  { value: 'pending', label: '待处理' },
                  { value: 'processing', label: '处理中' },
                  { value: 'resolved', label: '已解决' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTextStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      textStatusFilter === opt.value
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 反馈列表 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">用户反馈详情</h3>
                <p className="text-sm text-slate-500">点击查看反馈详情并更新处理状态</p>
              </div>
              <MessageSquare className="w-5 h-5 text-slate-400" />
            </div>

            {textLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : textList.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium">暂无反馈记录</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {textList.map((fb) => {
                  const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
                    bug: { label: '问题', color: 'text-red-600 bg-red-50', icon: Bug },
                    suggestion: { label: '建议', color: 'text-amber-600 bg-amber-50', icon: Lightbulb },
                    question: { label: '咨询', color: 'text-blue-600 bg-blue-50', icon: HelpCircle },
                    praise: { label: '表扬', color: 'text-pink-600 bg-pink-50', icon: Heart },
                    other: { label: '其他', color: 'text-slate-600 bg-slate-50', icon: MessageSquare },
                  };
                  const config = categoryConfig[fb.category] || categoryConfig.other;
                  const Icon = config.icon;
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    pending: { label: '待处理', color: 'text-amber-600 bg-amber-50' },
                    processing: { label: '处理中', color: 'text-blue-600 bg-blue-50' },
                    resolved: { label: '已解决', color: 'text-green-600 bg-green-50' },
                  };
                  const sConfig = statusConfig[fb.status] || statusConfig.pending;

                  return (
                    <div
                      key={fb.id}
                      className="flex items-start justify-between p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer"
                      onClick={() => setSelectedTextFeedback(fb)}
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-700">{fb.username || '匿名用户'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>{config.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sConfig.color}`}>{sConfig.label}</span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">{fb.content}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(fb.createdAt).toLocaleString('zh-CN')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 文字反馈详情弹窗 */}
          {selectedTextFeedback && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTextFeedback(null)}>
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">反馈详情</h3>
                  <button onClick={() => setSelectedTextFeedback(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* 反馈内容 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{selectedTextFeedback.content}</p>
                  </div>
                  {/* 信息列表 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">用户</p>
                        <p className="font-medium text-slate-800">{selectedTextFeedback.username || '匿名用户'} <span className="text-xs text-slate-400">({selectedTextFeedback.userId})</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">分类</p>
                        <p className="font-medium text-slate-800">
                          {(() => {
                            const labels: Record<string, string> = { bug: '问题反馈', suggestion: '功能建议', question: '使用咨询', praise: '表扬鼓励', other: '其他' };
                            return labels[selectedTextFeedback.category] || selectedTextFeedback.category || '-';
                          })()}
                        </p>
                      </div>
                    </div>
                    {selectedTextFeedback.contact && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">联系方式</p>
                          <p className="font-medium text-slate-800">{selectedTextFeedback.contact}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">提交时间</p>
                        <p className="font-medium text-slate-800">{new Date(selectedTextFeedback.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                  </div>
                  {/* 状态操作 */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-2">处理状态</p>
                    <div className="flex gap-2">
                      {[
                        { value: 'pending', label: '待处理', activeClass: 'bg-amber-500 text-white' },
                        { value: 'processing', label: '处理中', activeClass: 'bg-blue-500 text-white' },
                        { value: 'resolved', label: '已解决', activeClass: 'bg-green-500 text-white' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdateStatus(selectedTextFeedback.id, opt.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedTextFeedback.status === opt.value
                              ? opt.activeClass
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Tab 切换组件
function TabBar({ activeTab, setActiveTab }: {
  activeTab: 'shooting' | 'text';
  setActiveTab: (tab: 'shooting' | 'text') => void;
}) {
  return (
    <div className="flex gap-2 border-b border-slate-200">
      <button
        onClick={() => setActiveTab('shooting')}
        className={`px-4 py-2.5 text-sm font-medium transition relative ${
          activeTab === 'shooting'
            ? 'text-amber-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        拍摄计划反馈
        {activeTab === 'shooting' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
        )}
      </button>
      <button
        onClick={() => setActiveTab('text')}
        className={`px-4 py-2.5 text-sm font-medium transition relative ${
          activeTab === 'text'
            ? 'text-amber-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        用户反馈
        {activeTab === 'text' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
        )}
      </button>
    </div>
  );
}
