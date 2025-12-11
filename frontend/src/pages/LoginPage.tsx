// frontend/src/pages/LoginPage.tsx
// Red Hat / PatternFly styled login page with dark branding panel

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  ExclamationCircleIcon,
  SunIcon,
  MoonIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user) {
        redirectByRole(user.role);
      }
    } catch {
      setLocalError('Invalid email or password');
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        navigate('/admin');
        break;
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'ASSOCIATE':
      default:
        navigate('/associate');
        break;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#151515] via-[#1a1a1a] to-[#0d0d0d] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>

        {/* Red accent line on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ee0000] via-[#ee0000] to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-4 mb-16">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Samay</h1>
                <p className="text-sm text-gray-500">Workforce Platform</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="max-w-md">
              <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6">
                Dynamic Workforce
                <span className="text-[#ee0000]"> Scheduling</span> Platform
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Intelligent shift scheduling powered by constraint-based optimization. 
                Build efficient rosters that respect availability and maximize coverage.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-lg p-5 border border-white/[0.06]">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Smart Scheduling</h3>
              <p className="text-sm text-gray-500">AI-powered roster optimization</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-lg p-5 border border-white/[0.06]">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Real-time Updates</h3>
              <p className="text-sm text-gray-500">Live schedule synchronization</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-lg p-5 border border-white/[0.06]">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Team Management</h3>
              <p className="text-sm text-gray-500">Organize and track teams</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-lg p-5 border border-white/[0.06]">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ee0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Analytics</h3>
              <p className="text-sm text-gray-500">Insights and reporting</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600 mt-8">
            © 2025 Red Hat, Inc. Built with ❤️ on Red Hack Day 2025.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={clsx(
        'flex-1 flex items-center justify-center p-8 relative transition-colors duration-300',
        isDark ? 'bg-dark-400' : 'bg-gray-50'
      )}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            'absolute top-6 right-6 p-2 rounded-lg transition-colors',
            isDark 
              ? 'text-rh-black-400 hover:text-white hover:bg-dark-200' 
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-200'
          )}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div>
              <h1 className={clsx(
                'text-xl font-display font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>Samay</h1>
              <p className={clsx(
                'text-sm',
                isDark ? 'text-rh-black-400' : 'text-gray-500'
              )}>Workforce Platform</p>
            </div>
        </div>

        {/* Login Card */}
          <div className={clsx(
            'border rounded-xl shadow-2xl',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50' 
              : 'bg-white border-gray-200'
          )}>
            <div className="p-8">
              <h2 className={clsx(
                'text-2xl font-display font-bold mb-2',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                Welcome back
              </h2>
              <p className={clsx(
                'text-sm mb-8',
                isDark ? 'text-rh-black-400' : 'text-gray-500'
              )}>
                Sign in to your account to continue
              </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-rh-black-200' : 'text-gray-700'
                  )}>
                Email address
              </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                      isDark 
                        ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]'
                    )}
                  />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                    <label className={clsx(
                      'block text-sm font-medium',
                      isDark ? 'text-rh-black-200' : 'text-gray-700'
                    )}>
                  Password
                </label>
                    <button type="button" className="text-sm text-[#ee0000] hover:text-[#a30000] transition-colors">
                  Forgot password?
                </button>
              </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                      isDark 
                        ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]'
                    )}
                  />
            </div>

            {/* Error Message */}
            {(error || localError) && (
                  <div className="flex items-center gap-2 p-3 bg-[#c9190b]/10 border border-[#c9190b]/30 rounded-lg">
                    <ExclamationCircleIcon className="w-5 h-5 text-[#c9190b] flex-shrink-0" />
                    <p className="text-sm text-[#c9190b]">{error || localError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#ee0000] hover:bg-[#a30000] text-white font-semibold rounded-lg shadow-lg shadow-[#ee0000]/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

              {/* Sign Up Link */}
              <p className={clsx(
                'mt-6 text-center text-sm',
                isDark ? 'text-rh-black-400' : 'text-gray-600'
              )}>
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#ee0000] hover:text-[#a30000] font-semibold transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Accounts Info */}
          <div className={clsx(
            'mt-6 p-5 border rounded-xl',
            isDark 
              ? 'bg-dark-300/50 border-rh-black-700/50' 
              : 'bg-white/80 border-gray-200'
          )}>
            <p className={clsx(
              'text-xs uppercase tracking-wider mb-4 text-center font-semibold',
              isDark ? 'text-rh-black-500' : 'text-gray-400'
            )}>
              Demo Accounts
            </p>
            <div className="space-y-3">
              <div className={clsx(
                'flex justify-between items-center text-sm px-3 py-2 rounded-lg',
                isDark ? 'bg-dark-200/50' : 'bg-gray-50'
              )}>
                <span className={clsx(
                  'font-medium',
                  isDark ? 'text-[#6753ac]' : 'text-purple-600'
                )}>SuperAdmin</span>
                <code className={clsx(
                  'text-xs',
                  isDark ? 'text-rh-black-400' : 'text-gray-500'
                )}>admin@samay.io / admin123</code>
              </div>
              <div className={clsx(
                'flex justify-between items-center text-sm px-3 py-2 rounded-lg',
                isDark ? 'bg-dark-200/50' : 'bg-gray-50'
              )}>
                <span className={clsx(
                  'font-medium',
                  isDark ? 'text-[#3e8635]' : 'text-green-600'
                )}>Manager</span>
                <code className={clsx(
                  'text-xs',
                  isDark ? 'text-rh-black-400' : 'text-gray-500'
                )}>manager@samay.io / manager123</code>
              </div>
              <div className={clsx(
                'flex justify-between items-center text-sm px-3 py-2 rounded-lg',
                isDark ? 'bg-dark-200/50' : 'bg-gray-50'
              )}>
                <span className={clsx(
                  'font-medium',
                  isDark ? 'text-[#06c]' : 'text-blue-600'
                )}>Associate</span>
                <code className={clsx(
                  'text-xs',
                  isDark ? 'text-rh-black-400' : 'text-gray-500'
                )}>associate@samay.io / associate123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
