// frontend/src/pages/SignUpPage.tsx
// Red Hat / PatternFly styled signup page with dark branding panel

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

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
  const { theme, toggleTheme } = useThemeStore();
  
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

  const isDark = theme === 'dark';

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      setIsSuccess(true);
      
      setTimeout(() => {
        setUser(data.user);
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
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        isDark ? 'bg-dark-400' : 'bg-gray-50'
      )}>
        <div className="text-center">
          <div className={clsx(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-6',
            isDark ? 'bg-[#3e8635]/20' : 'bg-green-100'
          )}>
            <CheckCircleIcon className="w-10 h-10 text-[#3e8635]" />
          </div>
          <h1 className={clsx(
            'text-2xl font-display font-bold mb-2',
            isDark ? 'text-white' : 'text-gray-900'
          )}>Account Created!</h1>
          <p className={clsx(
            'mb-4',
            isDark ? 'text-rh-black-400' : 'text-gray-600'
          )}>
            Welcome to Samay. Redirecting to your dashboard...
          </p>
          <div className={clsx(
            'flex items-center justify-center gap-2 text-sm',
            isDark ? 'text-rh-black-500' : 'text-gray-400'
          )}>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Please wait...
          </div>
        </div>
      </div>
    );
  }

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
                Join the
                <span className="text-[#ee0000]"> Workforce</span> Revolution
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Create your account and start managing your work schedule efficiently. 
                Get instant access to shift management, availability tracking, and more.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mt-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-[#ee0000]" />
              </div>
              <div>
                <h3 className="text-white font-medium">Set Your Availability</h3>
                <p className="text-sm text-gray-500">Control when you're available to work</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-[#ee0000]" />
              </div>
              <div>
                <h3 className="text-white font-medium">View Your Shifts</h3>
                <p className="text-sm text-gray-500">See your schedule at a glance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#ee0000]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-[#ee0000]" />
              </div>
              <div>
                <h3 className="text-white font-medium">Swap Shifts Easily</h3>
                <p className="text-sm text-gray-500">Trade with teammates when needed</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600 mt-8">
            © 2025 Red Hat, Inc. Built with ❤️ on Red Hack Day 2025.
          </p>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
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
          {/* Back to Login */}
          <Link 
            to="/login"
            className={clsx(
              'inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors',
              isDark ? 'text-rh-black-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Sign In
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#ee0000] rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 613 145" fill="white">
                <path d="M127.47,83.49c12.51,0,30.61-2.58,30.61-17.46a14,14,0,0,0-.31-3.42l-7.45-32.36c-1.72-7.12-3.23-10.35-15.73-16.6C124.89,8.69,103.76.5,97.51.5,91.69.5,90,8,83.06,8c-6.68,0-11.64-5.6-17.89-5.6-6,0-9.91,4.09-12.93,12.5,0,0-8.41,23.72-9.49,27.16A6.43,6.43,0,0,0,42.53,44c0,9.22,36.3,39.45,84.94,39.45M160,72.07c1.73,8.19,1.73,9.05,1.73,10.13,0,14-15.74,21.77-36.43,21.77C78.54,104,37.58,76.6,37.58,58.49a18.45,18.45,0,0,1,1.51-7.33C22.27,52,.5,55,.5,74.22c0,31.48,74.59,70.28,133.65,70.28,45.28,0,56.7-20.48,56.7-36.65,0-12.72-11-27.16-30.83-35.78"/>
              </svg>
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

          {/* Sign Up Card */}
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
                Create account
              </h2>
              <p className={clsx(
                'text-sm mb-6',
                isDark ? 'text-rh-black-400' : 'text-gray-500'
              )}>
                Get started with your workforce account
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      isDark ? 'text-rh-black-200' : 'text-gray-700'
                    )}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                        isDark 
                          ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]',
                        errors.firstName && 'border-[#c9190b]'
                      )}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-[#c9190b]">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      isDark ? 'text-rh-black-200' : 'text-gray-700'
                    )}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                        isDark 
                          ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]',
                        errors.lastName && 'border-[#c9190b]'
                      )}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-[#c9190b]">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-rh-black-200' : 'text-gray-700'
                  )}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                      isDark 
                        ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]',
                      errors.email && 'border-[#c9190b]'
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#c9190b]">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-rh-black-200' : 'text-gray-700'
                  )}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                      isDark 
                        ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]',
                      errors.password && 'border-[#c9190b]'
                    )}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-[#c9190b]">{errors.password}</p>
                  )}
                  <p className={clsx(
                    'mt-1 text-xs',
                    isDark ? 'text-rh-black-500' : 'text-gray-400'
                  )}>Minimum 6 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-rh-black-200' : 'text-gray-700'
                  )}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                      isDark 
                        ? 'bg-dark-200 border-rh-black-600 text-white placeholder-rh-black-500 focus:ring-[#ee0000]/50 focus:border-[#ee0000]' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#ee0000]/50 focus:border-[#ee0000]',
                      errors.confirmPassword && 'border-[#c9190b]'
                    )}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#c9190b]">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* General Error Message */}
                {errors.general && (
                  <div className="flex items-center gap-2 p-3 bg-[#c9190b]/10 border border-[#c9190b]/30 rounded-lg">
                    <ExclamationCircleIcon className="w-5 h-5 text-[#c9190b] flex-shrink-0" />
                    <p className="text-sm text-[#c9190b]">{errors.general}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className={clsx(
                  'p-4 rounded-lg border',
                  isDark 
                    ? 'bg-[#06c]/10 border-[#06c]/30' 
                    : 'bg-blue-50 border-blue-200'
                )}>
                  <p className={clsx(
                    'text-sm',
                    isDark ? 'text-[#73bcf7]' : 'text-blue-700'
                  )}>
                    <strong>Note:</strong> New accounts start as <span className="font-semibold">Associate</span>. 
                    A manager will assign you to a team.
                  </p>
                </div>

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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <p className={clsx(
                'mt-6 text-center text-sm',
                isDark ? 'text-rh-black-400' : 'text-gray-600'
              )}>
                Already have an account?{' '}
                <Link to="/login" className="text-[#ee0000] hover:text-[#a30000] font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className={clsx(
            'mt-6 text-center text-xs',
            isDark ? 'text-rh-black-500' : 'text-gray-400'
          )}>
            By creating an account, you agree to our{' '}
            <a href="#" className="text-[#06c] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#06c] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
