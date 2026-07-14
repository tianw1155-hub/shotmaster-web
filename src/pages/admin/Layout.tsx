import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '../../stores/useAdminStore';
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Camera,
  ChevronRight,
  Trophy,
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/admin/users', label: '用户管理', icon: Users },
  { path: '/admin/feedback', label: '反馈分析', icon: BarChart3 },
  { path: '/admin/weekly-challenge', label: '本周挑战', icon: Trophy },
  { path: '/admin/eval', label: '评测集管理', icon: ImageIcon },
  { path: '/admin/ai-eval', label: 'AI评测中心', icon: Camera },
  { path: '/admin/settings', label: '系统配置', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const username = useAdminStore((s) => s.username);
  const logout = useAdminStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-slate-900 text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg whitespace-nowrap">ShotMaster</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? '收起侧栏' : '展开侧栏'}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700">
            <div className="bg-slate-800 rounded-xl p-3 mb-3">
              <p className="text-xs text-slate-400 mb-1">当前管理员</p>
              <p className="text-sm font-semibold text-white">{username || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">退出登录</span>
            </button>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* 顶栏 */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              后台管理系统
            </h2>
            <p className="text-xs text-slate-500">摄影学习平台数据管理</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{username || 'admin'}</p>
              <p className="text-xs text-slate-500">管理员</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {(username || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
