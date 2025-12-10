// frontend/src/pages/SignUpPage.tsx
// User registration page - new users always start as Associate

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  Loader2, 
  Clock,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import clsx from 'clsx';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      // In a real app, this would be an API call
      // For demo, we simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new user as Associate (default role for new users)
      const newUser = {
        id: `usr-${Date.now()}`,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'ASSOCIATE' as const,
        // New users are unassigned - waiting for manager to claim them
      };

      setIsSuccess(true);
      
      // Wait a moment to show success, then redirect
      setTimeout(() => {
        setUser(newUser);
        navigate('/associate');
      }, 2000);

    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
          <p className="text-slate-400 mb-4">
            Welcome to Samay. Redirecting to your dashboard...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Please wait...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back to Login */}
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/25 mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Join Samay</h1>
          <p className="text-slate-400 mt-2">Create your workforce account</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={clsx(
                      'w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
                      errors.firstName ? 'border-red-500' : 'border-slate-600'
                    )}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={clsx(
                    'w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
                    errors.lastName ? 'border-red-500' : 'border-slate-600'
                  )}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className={clsx(
                    'w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={clsx(
                    'w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  )}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={clsx(
                    'w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> New accounts start as <span className="text-blue-400 font-medium">Associate</span>. 
                A manager will assign you to a team after registration.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-red-400 hover:text-red-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-red-400 hover:text-red-300">Privacy Policy</a>
          </p>
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">
            Sign in
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

