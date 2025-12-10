// frontend/src/pages/LoginPage.tsx
// Enterprise-styled login page with role-based redirect

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '../stores/authStore';
import { Lock, Mail, AlertCircle, Loader2, Clock } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Demo mode: check for demo users
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && password === 'demo123') {
      setUser(demoUser);
      redirectByRole(demoUser.role);
      return;
    }

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

  const handleDemoLogin = (email: string) => {
    const user = DEMO_USERS[email];
    if (user) {
      setUser(user);
      redirectByRole(user.role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/25 mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Samay</h1>
          <p className="text-slate-400 mt-2">Workforce Scheduling Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button type="button" className="text-sm text-red-400 hover:text-red-300 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {(error || localError) && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error || localError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* SSO Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                LDAP
              </button>
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-slate-400 mb-3 text-center">Demo Accounts (password: demo123)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('associate@samay.io')}
              className="py-2 px-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              Associate
            </button>
            <button
              onClick={() => handleDemoLogin('manager@samay.io')}
              className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              Manager
            </button>
            <button
              onClick={() => handleDemoLogin('admin@samay.io')}
              className="py-2 px-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
            >
              SuperAdmin
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-red-400 hover:text-red-300 font-medium">
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          © 2024 Samay. Workforce scheduling made simple.
        </p>
      </div>
    </div>
  );
}

