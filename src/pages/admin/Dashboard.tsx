import React, { useEffect, useState, useMemo } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getDashboardStats } from '../../services/apiService';
import {
  Users,
  UserPlus,
  Activity,
  Calendar,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface DashboardStats {
  totalUsers: number;
  todayActive: number;
  rangeNewUsers: number;
  dailyNewUsers: Array<{ date: string; newUsers: number }>;
  weeklyNewUsers: Array<{ week: string; weekNum: number; newUsers: number }>;
  monthlyNewUsers: Array<{ month: string; monthName: string; newUsers: number }>;
}

type TimeDimension = 'daily' | 'weekly' | 'monthly';

export const DashboardPage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeDimension, setTimeDimension] = useState<TimeDimension>('daily');

  const today = useMemo(() => formatDate(new Date()), []);
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDate(d);
  }, []);
  const [startDate, setStartDate] = useState<string>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);

  const fetchData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const data = await getDashboardStats(token, start, end);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [token]);

  const handleDateChange = () => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    fetchData(startDate, endDate);
  };

  const handleResetDate = () => {
    setStartDate(sevenDaysAgo);
    setEndDate(today);
    fetchData(sevenDaysAgo, today);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  const userGrowthData = getUserGrowthData();
  const maxUserGrowth = Math.max(...userGrowthData.map((d) => d.value), 1);
  const totalNewUsers = userGrowthData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总用户数</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">今日活跃</p>
              <p className="text-3xl font-bold text-slate-800">{stats.todayActive}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">区间新增</p>
              <p className="text-3xl font-bold text-slate-800">{stats.rangeNewUsers ?? totalNewUsers}</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 时间范围选择器 */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleDateChange}
            className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            查询
          </button>
          <button
            onClick={handleResetDate}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
          <div className="flex-1" />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as TimeDimension[]).map((dim) => {
              const label = dim === 'daily' ? '日度' : dim === 'weekly' ? '周度' : '月度';
              return (
                <button
                  key={dim}
                  onClick={() => setTimeDimension(dim)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                    timeDimension === dim
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 用户增长趋势 - 全宽 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">用户增长趋势</h3>
            <p className="text-sm text-slate-500">
              {startDate} 至 {endDate} · {timeDimension === 'daily' ? '按日统计' : timeDimension === 'weekly' ? '按周统计' : '按月统计'}新增用户
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <span>区间新增 <strong className="text-amber-600">{stats.rangeNewUsers ?? totalNewUsers}</strong> 人</span>
          </div>
        </div>
        <div className="flex items-end justify-between h-56 gap-3">
          {userGrowthData.map((item, idx) => {
            const heightPct = (item.value / maxUserGrowth) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col items-center flex-1 justify-end relative">
                  {item.value > 0 && (
                    <span className="text-xs font-semibold text-amber-600 mb-1 opacity-0 group-hover:opacity-100 transition">
                      {item.value}
                    </span>
                  )}
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg transition-all duration-300 group-hover:from-amber-400 group-hover:to-orange-300"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: item.value > 0 ? '8px' : '2px',
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-700 transition">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
