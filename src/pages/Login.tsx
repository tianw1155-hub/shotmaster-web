import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, User, Lock, ChevronRight } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';

type Mode = 'login' | 'register';

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let level = 0;
  if (password.length >= 8) level++;
  if (/[a-zA-Z]/.test(password)) level++;
  if (/[0-9]/.test(password)) level++;
  if (/[^a-zA-Z0-9]/.test(password)) level++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) level++;

  if (level <= 2) return { level, label: '弱', color: 'bg-red-500' };
  if (level <= 3) return { level, label: '中', color: 'bg-yellow-500' };
  if (level <= 4) return { level, label: '强', color: 'bg-green-500' };
  return { level, label: '非常强', color: 'bg-accent' };
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength.level ? strength.color : 'bg-surface-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-ink-light">
        密码强度：<span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
        <span className="ml-2">（需至少8位，包含字母、数字和特殊符号）</span>
      </p>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, verifyLogin, loginAsGuest } = useGameStore();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('请输入用户名');
      return;
    }

    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      setError('用户名长度需在2-20字符之间');
      return;
    }

    if (!password) {
      setError('请输入密码');
      return;
    }

    if (mode === 'register') {
      if (password.length < 8) {
        setError('密码长度不能少于8位');
        return;
      }

      if (!/[a-zA-Z]/.test(password)) {
        setError('密码必须包含字母');
        return;
      }

      if (!/[0-9]/.test(password)) {
        setError('密码必须包含数字');
        return;
      }

      if (!/[^a-zA-Z0-9]/.test(password)) {
        setError('密码必须包含特殊符号（如 !@#$%^&* 等）');
        return;
      }

      if (!confirmPassword) {
        setError('请确认密码');
        return;
      }

      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mode === 'login') {
      const result = verifyLogin(trimmedUsername, password);
      if (result.success) {
        navigate('/preferences');
      } else {
        setError(result.message);
      }
    } else {
      const result = register(trimmedUsername, password);
      if (result.success) {
        navigate('/preferences');
      } else {
        setError(result.message);
      }
    }

    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/preferences');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-gradient-to-br from-accent to-accent-soft mb-4 shadow-lg shadow-accent/20">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-ink">ShotMaster</h1>
          <p className="text-ink-light mt-2">开启你的摄影学习之旅</p>
        </div>

        {/* 登录/注册表单 */}
        <div className="bg-surface rounded-md p-6 shadow-xl border border-line">
          {/* 模式切换 */}
          <div className="flex bg-surface-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-light hover:text-ink'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-light hover:text-ink'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="请输入用户名（即昵称）"
                  maxLength={20}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-surface-muted text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="请输入密码"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-line bg-surface-muted text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* 密码强度指示 */}
              {mode === 'register' && password && (
                <PasswordStrength password={password} />
              )}
            </div>

            {/* 确认密码（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-light" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="请再次输入密码"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-surface-muted text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-soft text-white font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? '加载中...' : mode === 'login' ? '登 录' : '注 册'}
              {!isLoading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-ink-light text-sm">或</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* 游客登录 */}
          <button
            onClick={handleGuestLogin}
            className="w-full py-3 rounded-xl border border-line text-ink font-medium hover:bg-surface-muted transition"
          >
            游客模式体验
          </button>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-ink-light text-xs mt-6">
          {mode === 'login' ? (
            <>
              还没有账号？{' '}
              <button onClick={toggleMode} className="text-accent font-medium hover:underline">
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？{' '}
              <button onClick={toggleMode} className="text-accent font-medium hover:underline">
                立即登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
