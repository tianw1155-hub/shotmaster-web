import React, { useEffect } from 'react';
import { BrowserRouter, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LevelMapPage } from './pages/LevelMap';
import { GalleryPage, GalleryDetailPage } from './pages/Gallery';
import { GalleryScorePage } from './pages/GalleryScore';
import { LevelDetailPage } from './pages/LevelDetail';
import { ShootPage } from './pages/Shoot';
import { ScorePage } from './pages/Score';
import { LearnPage, CourseDetailPage } from './pages/Learn';
import { CommunityPage } from './pages/Community';
import { CommunityScorePage } from './pages/CommunityScore';
import { ProfilePage, MyWorksPage, AchievementsPage, MyFavoritesPage } from './pages/Profile';
import { LoginPage } from './pages/Login';
import { PreferencesPage } from './pages/Preferences';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { useGameStore } from './stores/useGameStore';
import { AdminLoginPage } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/Layout';
import { DashboardPage } from './pages/admin/Dashboard';
import { UsersPage } from './pages/admin/Users';
import { FeedbackPage } from './pages/admin/Feedback';
import { EvalSetsPage } from './pages/admin/EvalSets';
import { AIEvalPage } from './pages/admin/AIEval';
import { SettingsPage } from './pages/admin/Settings';
import { useAdminStore } from './stores/useAdminStore';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, refreshWeeklyChallenge } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查是否需要刷新本周挑战图片
    refreshWeeklyChallenge();
  }, []);

  useEffect(() => {
    if (!user.isLoggedIn) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    } else if (!user.hasCompletedOnboarding && location.pathname !== '/preferences') {
      navigate('/preferences', { replace: true });
    }
  }, [user.isLoggedIn, user.hasCompletedOnboarding, navigate, location.pathname]);

  if (!user.isLoggedIn) return null;
  if (!user.hasCompletedOnboarding && location.pathname !== '/preferences') return null;

  return <>{children}</>;
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAdminStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          {/* 前台路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/" element={<AuthGuard><LevelMapPage /></AuthGuard>} />
          <Route path="/gallery" element={<AuthGuard><GalleryPage /></AuthGuard>} />
          <Route path="/gallery/:id" element={<AuthGuard><GalleryDetailPage /></AuthGuard>} />
          <Route path="/gallery/score" element={<AuthGuard><GalleryScorePage /></AuthGuard>} />
          <Route path="/level/:id" element={<AuthGuard><LevelDetailPage /></AuthGuard>} />
          <Route path="/shoot/:levelId" element={<AuthGuard><ShootPage /></AuthGuard>} />
          <Route path="/score/:levelId" element={<AuthGuard><ScorePage /></AuthGuard>} />
          <Route path="/learn" element={<AuthGuard><LearnPage /></AuthGuard>} />
          <Route path="/learn/:id" element={<AuthGuard><CourseDetailPage /></AuthGuard>} />
          <Route path="/community" element={<AuthGuard><ErrorBoundary><CommunityPage /></ErrorBoundary></AuthGuard>} />
          <Route path="/community/score" element={<AuthGuard><CommunityScorePage /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          <Route path="/profile/works" element={<AuthGuard><MyWorksPage /></AuthGuard>} />
          <Route path="/profile/achievements" element={<AuthGuard><AchievementsPage /></AuthGuard>} />
          <Route path="/profile/favorites" element={<AuthGuard><MyFavoritesPage /></AuthGuard>} />

          {/* 后台路由 */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminAuthGuard><AdminLayout /></AdminAuthGuard>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="eval" element={<EvalSetsPage />} />
            <Route path="ai-eval" element={<AIEvalPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
