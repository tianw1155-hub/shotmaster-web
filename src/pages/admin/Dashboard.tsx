import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getDashboardStats } from '../../services/apiService';
import {
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  todayActive: number;
  totalFeedbacks: number;
  likedCount: number;
  dislikedCount: number;
  likeRate: number;
  dailyNewUsers: Array<{ date: string; newUsers: number }>;
  weeklyNewUsers: Array<{ week: string; weekNum: number; newUsers: number }>;
  monthlyNewUsers: Array<{ month: string; monthName: string; newUsers: number }>;
  dimensionStats: Array<{
    dimension: string;
    total: number;
    liked: number;
    disliked: number;
    likeRate: number;
  }>;
  weeklyFeedbackStats: Array<{ week: string; weekNum: number; liked: number; disliked: number; total: number; likeRate: number }>;
  monthlyFeedbackStats: Array<{ month: string; monthName: string; liked: number; disliked: number; total: number; likeRate: number }>;
}

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

type TimeDimension = 'daily' | 'weekly' | 'monthly';

export const DashboardPage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeDimension, setTimeDimension] = useState<TimeDimension>('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '今日活跃',
      value: stats.todayActive,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: '总反馈数',
      value: stats.totalFeedbacks,
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: '好评率',
      value: `${(stats.likeRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  // 根据时间维度获取用户增长数据
  const getUserGrowthData = () => {
    if (timeDimension === 'daily') {
      return stats.dailyNewUsers.map((d) => ({ label: d.date.slice(5), value: d.newUsers }));
    } else if (timeDimension === 'weekly') {
      return stats.weeklyNewUsers.map((w) => ({ label: `第${w.weekNum}周`, value: w.newUsers }));
    } else {
      return stats.monthlyNewUsers.map((m) => ({ label: m.monthName, value: m.newUsers }));
    }
  };

  // 根据时间维度获取反馈统计数据
  const getFeedbackStatsData = () => {
    if (timeDimension === 'daily') {
      // 日维度没有单独的反馈统计，使用总数据
      return [{ label: '总计', liked: stats.likedCount, disliked: stats.dislikedCount, likeRate: stats.likeRate }];
    } else if (timeDimension === 'weekly') {
      return stats.weeklyFeedbackStats.map((w) => ({ label: `第${w.weekNum}周`, liked: w.liked, disliked: w.disliked, likeRate: w.likeRate }));
    } else {
      return stats.monthlyFeedbackStats.map((m) => ({ label: m.monthName, liked: m.liked, disliked: m.disliked, likeRate: m.likeRate }));
    }
  };

  const userGrowthData = getUserGrowthData();
  const feedbackStatsData = getFeedbackStatsData();
  const maxUserGrowth = Math.max(...userGrowthData.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 时间维度选择器 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">时间维度：</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeDimension('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                timeDimension === 'daily'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              日度
            </button>
            <button
              onClick={() => setTimeDimension('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                timeDimension === 'weekly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              周度
            </button>
            <button
              onClick={() => setTimeDimension('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                timeDimension === 'monthly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              月度
            </button>
          </div>
        </div>
      </div>

      {/* 两列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">用户增长趋势</h3>
              <p className="text-sm text-slate-500">
                {timeDimension === 'daily' ? '最近7天' : timeDimension === 'weekly' ? '最近4周' : '最近6个月'}新增用户
              </p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {userGrowthData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center flex-1 justify-end">
                  <span className="text-xs font-medium text-slate-600 mb-1">
                    {item.value}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg transition-all"
                    style={{
                      height: `${(item.value / maxUserGrowth) * 100}%`,
                      minHeight: item.value > 0 ? '8px' : '2px',
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 反馈概览 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">反馈概览</h3>
              <p className="text-sm text-slate-500">
                {timeDimension === 'daily' ? '总体' : timeDimension === 'weekly' ? '最近4周' : '最近6个月'}点赞与点踩分布
              </p>
            </div>
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>

          {timeDimension === 'daily' ? (
            // 日度显示总体数据
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{stats.likedCount}</p>
                  <p className="text-xs text-green-600/70">点赞数</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <ThumbsDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-500">{stats.dislikedCount}</p>
                  <p className="text-xs text-red-500/70">点踩数</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">好评率</span>
                  <span className="font-semibold text-green-600">
                    {(stats.likeRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${stats.likeRate * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            // 周度/月度显示时间序列数据
            <div className="space-y-3">
              {feedbackStatsData.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <span className={`text-sm font-semibold ${
                      item.likeRate >= 0.7 ? 'text-green-600' : item.likeRate >= 0.5 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {(item.likeRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-slate-600">{item.liked}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-slate-600">{item.disliked}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-600">{item.liked + item.disliked}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.likeRate >= 0.7 ? 'bg-green-500' : item.likeRate >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.likeRate * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 维度反馈分析 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">分维度反馈分析</h3>
            <p className="text-sm text-slate-500">各维度的点赞率与改进空间</p>
          </div>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.dimensionStats.map((dim) => (
            <div
              key={dim.dimension}
              className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition"
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
                <span>总反馈: {dim.total}</span>
                <span className="text-green-600">👍 {dim.liked}</span>
                <span className="text-red-500">👎 {dim.disliked}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};