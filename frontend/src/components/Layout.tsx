// frontend/src/components/Layout.tsx
// Red Hat / PatternFly styled layout with navigation and theme toggle

import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  HomeIcon,
  CalendarAltIcon,
  UsersIcon,
  CogIcon,
  SignOutAltIcon,
  BellIcon,
  ShieldAltIcon,
  BuildingIcon,
  UserCogIcon,
  ListIcon,
  BarsIcon,
  TimesIcon,
  CaretDownIcon,
  SunIcon,
  MoonIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Associate items - Only My Shifts and Availability (no Dashboard)
  { label: 'My Shifts', href: '/associate', icon: CalendarAltIcon, roles: ['ASSOCIATE'] },
  { label: 'Availability', href: '/associate/availability', icon: ListIcon, roles: ['ASSOCIATE'] },
  
  // Manager items
  { label: 'Dashboard', href: '/manager', icon: HomeIcon, roles: ['MANAGER'] },
  { label: 'Roster Builder', href: '/manager/roster', icon: CalendarAltIcon, roles: ['MANAGER'] },
  { label: 'My Team', href: '/manager/team', icon: UsersIcon, roles: ['MANAGER'] },
  { label: 'Unassigned Pool', href: '/manager/pool', icon: UserCogIcon, roles: ['MANAGER'] },
  
  // SuperAdmin items
  { label: 'Dashboard', href: '/admin', icon: HomeIcon, roles: ['SUPERADMIN'] },
  { label: 'User Management', href: '/admin/users', icon: UsersIcon, roles: ['SUPERADMIN'] },
  { label: 'Team Management', href: '/admin/teams', icon: BuildingIcon, roles: ['SUPERADMIN'] },
  { label: 'Role Administration', href: '/admin/roles', icon: ShieldAltIcon, roles: ['SUPERADMIN'] },
  { label: 'Settings', href: '/admin/settings', icon: CogIcon, roles: ['SUPERADMIN'] },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  if (!user) return null;

  const userNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-[#6753ac]/20 text-pf-purple-200 border-pf-purple-200/30';
      case 'MANAGER':
        return 'bg-[#3e8635]/20 text-pf-green-200 border-pf-green-200/30';
      case 'ASSOCIATE':
      default:
        return 'bg-[#06c]/20 text-pf-blue-200 border-pf-blue-200/30';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'from-[#6753ac] to-pf-purple-600';
      case 'MANAGER':
        return 'from-[#3e8635] to-pf-green-600';
      case 'ASSOCIATE':
      default:
        return 'from-[#06c] to-pf-blue-500';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={clsx(
      'min-h-screen flex transition-colors duration-300',
      isDark ? 'bg-dark-400' : 'bg-gray-50'
    )}>
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 border-r',
          sidebarOpen ? 'w-64' : 'w-20',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50' 
            : 'bg-white border-gray-200'
        )}
      >
        {/* Logo */}
        <div className={clsx(
          'h-16 px-4 flex items-center justify-between border-b',
          isDark ? 'border-rh-black-700/50' : 'border-gray-200'
        )}>
          <Link to="/" className="flex items-center gap-3">
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className={clsx(
                  'text-lg font-display font-bold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>Samay</h1>
                <p className={clsx(
                  'text-xs',
                  isDark ? 'text-rh-black-400' : 'text-gray-500'
                )}>Workforce Platform</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={clsx(
              'p-2 transition-colors lg:hidden',
              isDark ? 'text-rh-black-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'
            )}
          >
            {sidebarOpen ? <TimesIcon className="w-5 h-5" /> : <BarsIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <p className={clsx(
              'px-3 py-2 text-xs font-medium uppercase tracking-wider',
              isDark ? 'text-rh-black-500' : 'text-gray-400'
            )}>
              Navigation
            </p>
          )}
          {userNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={!sidebarOpen ? item.label : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-rh transition-all duration-150',
                  isActive
                    ? isDark
                      ? 'bg-[#ee0000]/15 text-white border-l-2 border-[#ee0000] ml-[-2px]'
                      : 'bg-[#ee0000]/10 text-[#ee0000] border-l-2 border-[#ee0000] ml-[-2px]'
                    : isDark
                      ? 'text-rh-black-300 hover:text-white hover:bg-dark-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className={clsx(
          'p-3 border-t',
          isDark ? 'border-rh-black-700/50' : 'border-gray-200'
        )}>
          <button
            onClick={toggleTheme}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-rh transition-all duration-150',
              isDark 
                ? 'text-rh-black-300 hover:text-white hover:bg-dark-100' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <MoonIcon className="w-5 h-5 flex-shrink-0" />
            )}
            {sidebarOpen && (
              <span className="font-medium text-sm">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className={clsx(
          'p-3 border-t',
          isDark ? 'border-rh-black-700/50' : 'border-gray-200'
        )}>
          <div
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
              !sidebarOpen && 'justify-center',
              isDark 
                ? 'bg-dark-200 hover:bg-dark-100' 
                : 'bg-gray-100 hover:bg-gray-200'
            )}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className={clsx(
              'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-medium flex-shrink-0',
              getRoleColor(user.role)
            )}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'text-sm font-medium truncate',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {user.firstName} {user.lastName}
                  </p>
                  <span className={clsx(
                    'inline-flex px-2 py-0.5 text-xs rounded-sm border',
                    getRoleBadgeStyle(user.role)
                  )}>
                    {user.role}
                  </span>
                </div>
                <CaretDownIcon className={clsx(
                  'w-4 h-4 transition-transform',
                  isDark ? 'text-rh-black-400' : 'text-gray-400',
                  userMenuOpen && 'rotate-180'
                )} />
              </>
            )}
          </div>
          
          {/* User Menu Dropdown */}
          {userMenuOpen && sidebarOpen && (
            <div className={clsx(
              'mt-2 py-2 rounded-lg border animate-slide-down',
              isDark 
                ? 'bg-dark-100 border-rh-black-700/50' 
                : 'bg-white border-gray-200 shadow-lg'
            )}>
              <button
                onClick={handleLogout}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  isDark 
                    ? 'text-rh-black-300 hover:text-pf-red-100 hover:bg-[#c9190b]/10' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                )}
              >
                <SignOutAltIcon className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {!sidebarOpen && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className={clsx(
                'w-full mt-2 p-3 flex justify-center transition-colors',
                isDark 
                  ? 'text-rh-black-400 hover:text-pf-red-100' 
                  : 'text-gray-400 hover:text-red-600'
              )}
            >
              <SignOutAltIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-20'
      )}>
        {/* Header */}
        <header className={clsx(
          'h-16 backdrop-blur-sm border-b flex items-center justify-between px-6 sticky top-0 z-20',
          isDark 
            ? 'bg-dark-300/80 border-rh-black-700/50' 
            : 'bg-white/80 border-gray-200'
        )}>
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={clsx(
                'p-2 transition-colors hidden lg:flex',
                isDark ? 'text-rh-black-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'
              )}
            >
              <BarsIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className={clsx(
                'text-lg font-display font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {userNavItems.find((item) => item.href === location.pathname)?.label || 'My Shifts'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button (Header) */}
            <button 
              onClick={toggleTheme}
              className={clsx(
                'p-2 transition-colors rounded-lg',
                isDark 
                  ? 'text-rh-black-400 hover:text-white hover:bg-dark-200' 
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              )}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className={clsx(
              'relative p-2 transition-colors rounded-lg',
              isDark 
                ? 'text-rh-black-400 hover:text-white hover:bg-dark-200' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            )}>
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c9190b] rounded-full"></span>
            </button>
            
            {/* User quick info */}
            <div className={clsx(
              'flex items-center gap-3 pl-4 border-l',
              isDark ? 'border-rh-black-700/50' : 'border-gray-200'
            )}>
              <div className="text-right hidden sm:block">
                <p className={clsx(
                  'text-sm font-medium',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>{user.firstName} {user.lastName}</p>
                <p className={clsx(
                  'text-xs',
                  isDark ? 'text-rh-black-400' : 'text-gray-500'
                )}>{user.email}</p>
              </div>
              <div className={clsx(
                'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-medium',
                getRoleColor(user.role)
              )}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={clsx(
          'flex-1 p-6 overflow-auto',
          isDark ? '' : 'bg-gray-50'
        )}>
          {children}
        </main>

        {/* Footer */}
        <footer className={clsx(
          'py-4 px-6 border-t',
          isDark 
            ? 'border-rh-black-700/50 bg-dark-300/50' 
            : 'border-gray-200 bg-white'
        )}>
          <div className={clsx(
            'flex items-center justify-between text-sm',
            isDark ? 'text-rh-black-500' : 'text-gray-400'
          )}>
            <p>© 2024 Samay Workforce Platform. Built with PatternFly.</p>
            <p>Red Hat Design System</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
