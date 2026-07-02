import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getFeedbackAnalysis, getFeedbackTrend, getLowRatedFeedback } from '../../services/apiService';
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
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
  const [dimensionStats, setDimensionStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [lowRated, setLowRated] = useState<any[]>([]);
  const [lowRatedCounts, setLowRatedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  useEffect(() => {
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
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 找出最需要改进的维度（点踩最多）
  const worstDimension = dimensionStats.reduce((worst, current) => {
    if (!worst || current.disliked > worst.disliked) return current;
    return worst;
  }, null as any);

  return (
    <div className="space-y-6">
      {/* 反馈趋势 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">反馈趋势</h3>
            <p className="text-sm text-slate-500">最近7天点赞/点踩变化</p>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex items-end justify-between h-48 gap-2">
          {trendData.map((item) => {
            const maxTotal = Math.max(...trendData.map((d) => d.total || 1));
            const likedHeight = (item.liked / maxTotal) * 100;
            const dislikedHeight = (item.disliked / maxTotal) * 100;
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center flex-1 justify-end gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-lg"
                    style={{ height: `${likedHeight}%`, minHeight: item.liked > 0 ? '4px' : '0' }}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-red-400 to-rose-500 rounded-t-lg"
                    style={{ height: `${dislikedHeight}%`, minHeight: item.disliked > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-xs text-slate-500">{item.date?.slice(5) || '-'}</span>
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

      {/* 维度分析卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
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
              className={`border rounded-xl p-4 cursor-pointer transition ${
                selectedDimension === dim.dimension
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => setSelectedDimension(dim.dimension === selectedDimension ? null : dim.dimension)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-700">
                  {dimensionLabels[dim.dimension] || dim.dimension}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    dim.likeRate >= 0.7
                      ? 'text-green-600'
                      : dim.likeRate >= 0.5
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {(dim.likeRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full bg-gradient-to-r ${
                    dimensionColors[dim.dimension] || 'from-slate-400 to-gray-500'
                  } rounded-full`}
                  style={{ width: `${dim.likeRate * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>总: {dim.total}</span>
                <span className="text-green-600">👍 {dim.liked}</span>
                <span className="text-red-500">👎 {dim.disliked}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 需改进提示 */}
      {worstDimension && worstDimension.disliked > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
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
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">低评分反馈详情</h3>
            <p className="text-sm text-slate-500">用户点踩的具体反馈记录</p>
          </div>
          <ThumbsDown className="w-5 h-5 text-red-400" />
        </div>

        {lowRated.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ThumbsUp className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p>暂无低评分反馈，AI表现良好！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowRated.slice(0, 20).map((fb, idx) => (
              <div
                key={fb.id || idx}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {dimensionLabels[fb.dimension] || fb.dimension}
                    </p>
                    <p className="text-xs text-slate-500">
                      图片: {fb.imageId || '-'} · {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
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
    </div>
  );
};