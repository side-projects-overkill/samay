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
              <div className="w-12 h-12 bg-[#ee0000] rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 613 145" fill="white">
                  <path d="M127.47,83.49c12.51,0,30.61-2.58,30.61-17.46a14,14,0,0,0-.31-3.42l-7.45-32.36c-1.72-7.12-3.23-10.35-15.73-16.6C124.89,8.69,103.76.5,97.51.5,91.69.5,90,8,83.06,8c-6.68,0-11.64-5.6-17.89-5.6-6,0-9.91,4.09-12.93,12.5,0,0-8.41,23.72-9.49,27.16A6.43,6.43,0,0,0,42.53,44c0,9.22,36.3,39.45,84.94,39.45M160,72.07c1.73,8.19,1.73,9.05,1.73,10.13,0,14-15.74,21.77-36.43,21.77C78.54,104,37.58,76.6,37.58,58.49a18.45,18.45,0,0,1,1.51-7.33C22.27,52,.5,55,.5,74.22c0,31.48,74.59,70.28,133.65,70.28,45.28,0,56.7-20.48,56.7-36.65,0-12.72-11-27.16-30.83-35.78"/>
                </svg>
              </div>
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
            <div className="w-12 h-12 bg-[#ee0000] rounded-lg flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 613 145" height="32" width="135" role="img"><title>Red Hat</title><path d="M127.47 83.49c12.51 0 30.61-2.58 30.61-17.46a14 14 0 0 0-.31-3.42l-7.45-32.36c-1.72-7.12-3.23-10.35-15.73-16.6C124.89 8.69 103.76.5 97.51.5 91.69.5 90 8 83.06 8c-6.68 0-11.64-5.6-17.89-5.6-6 0-9.91 4.09-12.93 12.5 0 0-8.41 23.72-9.49 27.16a6.43 6.43 0 0 0-.22 1.94c0 9.22 36.3 39.45 84.94 39.45M160 72.07c1.73 8.19 1.73 9.05 1.73 10.13 0 14-15.74 21.77-36.43 21.77-46.76.03-87.72-27.37-87.72-45.48a18.45 18.45 0 0 1 1.51-7.33C22.27 52 .5 55 .5 74.22c0 31.48 74.59 70.28 133.65 70.28 45.28 0 56.7-20.48 56.7-36.65 0-12.72-11-27.16-30.83-35.78" fill="#e00"></path><path d="M160 72.07c1.73 8.19 1.73 9.05 1.73 10.13 0 14-15.74 21.77-36.43 21.77-46.76.03-87.72-27.37-87.72-45.48a18.45 18.45 0 0 1 1.51-7.33l3.66-9.06a6.43 6.43 0 0 0-.22 1.9c0 9.22 36.3 39.45 84.94 39.45 12.51 0 30.61-2.58 30.61-17.46a14 14 0 0 0-.31-3.42Z"></path><path d="M579.74 92.8c0 11.89 7.15 17.67 20.19 17.67a52.11 52.11 0 0 0 11.89-1.68V95a24.84 24.84 0 0 1-7.68 1.16c-5.37 0-7.36-1.68-7.36-6.73V68.3h15.56V54.1h-15.56v-18l-17 3.68V54.1h-11.29v14.2h11.25Zm-53 .32c0-3.68 3.69-5.47 9.26-5.47a43.12 43.12 0 0 1 10.1 1.26v7.15a21.51 21.51 0 0 1-10.63 2.63c-5.46 0-8.73-2.1-8.73-5.57m5.2 17.56c6 0 10.84-1.26 15.36-4.31v3.37h16.82V74.08c0-13.56-9.14-21-24.39-21-8.52 0-16.94 2-26 6.1l6.1 12.52c6.52-2.74 12-4.42 16.83-4.42 7 0 10.62 2.73 10.62 8.31v2.73a49.53 49.53 0 0 0-12.62-1.58c-14.31 0-22.93 6-22.93 16.73 0 9.78 7.78 17.24 20.19 17.24m-92.44-.94h18.09V80.92h30.29v28.82H506V36.12h-18.07v28.29h-30.29V36.12h-18.09Zm-68.86-27.9c0-8 6.31-14.1 14.62-14.1A17.22 17.22 0 0 1 397 72.09v19.45A16.36 16.36 0 0 1 385.24 96c-8.2 0-14.62-6.1-14.62-14.09m26.61 27.87h16.83V32.44l-17 3.68v20.93a28.3 28.3 0 0 0-14.2-3.68c-16.19 0-28.92 12.51-28.92 28.5a28.25 28.25 0 0 0 28.4 28.6 25.12 25.12 0 0 0 14.93-4.83ZM320 67c5.36 0 9.88 3.47 11.67 8.83h-23.2C310.15 70.3 314.36 67 320 67m-28.67 15c0 16.2 13.25 28.82 30.28 28.82 9.36 0 16.2-2.53 23.25-8.42l-11.26-10c-2.63 2.74-6.52 4.21-11.14 4.21a14.39 14.39 0 0 1-13.68-8.83h39.65v-4.23c0-17.67-11.88-30.39-28.08-30.39a28.57 28.57 0 0 0-29 28.81M262 51.58c6 0 9.36 3.78 9.36 8.31S268 68.2 262 68.2h-17.89V51.58Zm-36 58.16h18.09V82.92h13.77l13.89 26.82H292l-16.2-29.45a22.27 22.27 0 0 0 13.88-20.72c0-13.25-10.41-23.45-26-23.45H226Z" fill="#151515"></path></svg>
            </div>
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
