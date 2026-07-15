import React, { useEffect } from 'react';
import { BrowserRouter, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { useGameStore } from './stores/useGameStore';
import { useAdminStore } from './stores/useAdminStore';

const LevelMapPage = React.lazy(() => import('./pages/LevelMap').then(m => ({ default: m.LevelMapPage })));
const GalleryPage = React.lazy(() => import('./pages/Gallery').then(m => ({ default: m.GalleryPage })));
const GalleryDetailPage = React.lazy(() => import('./pages/Gallery').then(m => ({ default: m.GalleryDetailPage })));
const GalleryScorePage = React.lazy(() => import('./pages/GalleryScore').then(m => ({ default: m.GalleryScorePage })));
const LevelDetailPage = React.lazy(() => import('./pages/LevelDetail').then(m => ({ default: m.LevelDetailPage })));
const ShootPage = React.lazy(() => import('./pages/Shoot').then(m => ({ default: m.ShootPage })));
const ScorePage = React.lazy(() => import('./pages/Score').then(m => ({ default: m.ScorePage })));
const LearnPage = React.lazy(() => import('./pages/Learn').then(m => ({ default: m.LearnPage })));
const CourseDetailPage = React.lazy(() => import('./pages/Learn').then(m => ({ default: m.CourseDetailPage })));
const CommunityPage = React.lazy(() => import('./pages/Community').then(m => ({ default: m.CommunityPage })));
const CommunityScorePage = React.lazy(() => import('./pages/CommunityScore').then(m => ({ default: m.CommunityScorePage })));
const ProfilePage = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const MyWorksPage = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.MyWorksPage })));
const AchievementsPage = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.AchievementsPage })));
const MyFavoritesPage = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.MyFavoritesPage })));
const UserFeedbackPage = React.lazy(() => import('./pages/Feedback').then(m => ({ default: m.FeedbackPage })));
const LoginPage = React.lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })));
const PreferencesPage = React.lazy(() => import('./pages/Preferences').then(m => ({ default: m.PreferencesPage })));
const AdminLoginPage = React.lazy(() => import('./pages/admin/Login').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = React.lazy(() => import('./pages/admin/Layout').then(m => ({ default: m.AdminLayout })));
const DashboardPage = React.lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.DashboardPage })));
const UsersPage = React.lazy(() => import('./pages/admin/Users').then(m => ({ default: m.UsersPage })));
const FeedbackPage = React.lazy(() => import('./pages/admin/Feedback').then(m => ({ default: m.FeedbackPage })));
const EvalSetsPage = React.lazy(() => import('./pages/admin/EvalSets').then(m => ({ default: m.EvalSetsPage })));
const AIEvalPage = React.lazy(() => import('./pages/admin/AIEval').then(m => ({ default: m.AIEvalPage })));
const SettingsPage = React.lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.SettingsPage })));
const WeeklyChallengePage = React.lazy(() => import('./pages/admin/WeeklyChallenge').then(m => ({ default: m.WeeklyChallengePage })));
const LogsPage = React.lazy(() => import('./pages/admin/logs/LogsPage').then(m => ({ default: m.LogsPage })));

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
          <Route path="/feedback" element={<AuthGuard><UserFeedbackPage /></AuthGuard>} />

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
            <Route path="weekly-challenge" element={<WeeklyChallengePage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
        </AppShell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
