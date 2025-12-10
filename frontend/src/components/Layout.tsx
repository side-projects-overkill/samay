// frontend/src/components/Layout.tsx
// Main layout component with role-based navigation

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/authStore';
import {
  Clock,
  Calendar,
  Users,
  Settings,
  LogOut,
  Home,
  ClipboardList,
  Shield,
  Building2,
  UserCog,
  Bell,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Associate items
  { label: 'Dashboard', href: '/associate', icon: <Home className="w-5 h-5" />, roles: ['ASSOCIATE'] },
  { label: 'My Shifts', href: '/associate/shifts', icon: <Calendar className="w-5 h-5" />, roles: ['ASSOCIATE'] },
  { label: 'Availability', href: '/associate/availability', icon: <ClipboardList className="w-5 h-5" />, roles: ['ASSOCIATE'] },
  
  // Manager items
  { label: 'Dashboard', href: '/manager', icon: <Home className="w-5 h-5" />, roles: ['MANAGER'] },
  { label: 'Roster Builder', href: '/manager/roster', icon: <Calendar className="w-5 h-5" />, roles: ['MANAGER'] },
  { label: 'My Team', href: '/manager/team', icon: <Users className="w-5 h-5" />, roles: ['MANAGER'] },
  { label: 'Unassigned Pool', href: '/manager/pool', icon: <UserCog className="w-5 h-5" />, roles: ['MANAGER'] },
  
  // SuperAdmin items
  { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" />, roles: ['SUPERADMIN'] },
  { label: 'User Management', href: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['SUPERADMIN'] },
  { label: 'Team Management', href: '/admin/teams', icon: <Building2 className="w-5 h-5" />, roles: ['SUPERADMIN'] },
  { label: 'Role Administration', href: '/admin/roles', icon: <Shield className="w-5 h-5" />, roles: ['SUPERADMIN'] },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" />, roles: ['SUPERADMIN'] },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const userNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MANAGER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ASSOCIATE':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Samay</h1>
              <p className="text-xs text-slate-400">Workforce Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {userNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <span className={clsx('inline-flex px-2 py-0.5 text-xs rounded-full border', getRoleBadgeColor(user.role))}>
                {user.role}
              </span>
            </div>
            <button className="text-slate-400 hover:text-white">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-slate-800/30 border-b border-slate-700/50 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {userNavItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

