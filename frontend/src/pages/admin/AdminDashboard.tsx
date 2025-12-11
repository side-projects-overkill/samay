// frontend/src/pages/admin/AdminDashboard.tsx
// Red Hat / PatternFly styled SuperAdmin dashboard with light/dark theme support

import { Link } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import {
  UsersIcon,
  BuildingIcon,
  ShieldAltIcon,
  TachometerAltIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CodeBranchIcon,
  CogIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: 'promotion' | 'team' | 'user' | 'system';
}

const recentActivities: RecentActivity[] = [
  { id: '1', action: 'Promoted to Manager', user: 'Admin User', target: 'Sarah Miller', timestamp: '2 hours ago', type: 'promotion' },
  { id: '2', action: 'Created Team', user: 'Admin User', target: 'Evening Crew', timestamp: '5 hours ago', type: 'team' },
  { id: '3', action: 'User Registered', user: 'System', target: 'John Doe', timestamp: '1 day ago', type: 'user' },
  { id: '4', action: 'Team Restructured', user: 'Admin User', target: 'Morning Crew', timestamp: '2 days ago', type: 'team' },
  { id: '5', action: 'Promoted to Manager', user: 'Admin User', target: 'Mike Johnson', timestamp: '3 days ago', type: 'promotion' },
];

const pendingActions = [
  { id: '1', type: 'promotion', description: '3 associates pending promotion review' },
  { id: '2', type: 'team', description: '2 teams need manager assignment' },
  { id: '3', type: 'audit', description: '12 audit log entries to review' },
];

const teamHierarchy = [
  { name: 'Morning Crew', manager: 'Sarah Miller', members: 8, status: 'active' },
  { name: 'Evening Crew', manager: 'Mike Johnson', members: 12, status: 'active' },
  { name: 'Night Shift', manager: 'Emily Chen', members: 6, status: 'active' },
  { name: 'Weekend Team', manager: null, members: 5, status: 'needs-manager' },
  { name: 'Warehouse A', manager: 'James Wilson', members: 15, status: 'active' },
];

export function AdminDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Total Users', value: '247', change: 12, icon: UsersIcon, color: 'text-[#06c]', bg: isDark ? 'bg-[#06c]/15' : 'bg-[#06c]/10' },
    { label: 'Active Teams', value: '18', change: 2, icon: BuildingIcon, color: 'text-[#3e8635]', bg: isDark ? 'bg-[#3e8635]/15' : 'bg-[#3e8635]/10' },
    { label: 'Managers', value: '15', change: 1, icon: ShieldAltIcon, color: 'text-[#6753ac]', bg: isDark ? 'bg-[#6753ac]/15' : 'bg-[#6753ac]/10' },
    { label: 'Associates', value: '229', change: 9, icon: UsersIcon, color: 'text-[#f0ab00]', bg: isDark ? 'bg-[#f0ab00]/15' : 'bg-[#f0ab00]/10' },
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'promotion':
        return <ShieldAltIcon className="w-4 h-4 text-[#6753ac]" />;
      case 'team':
        return <BuildingIcon className="w-4 h-4 text-[#3e8635]" />;
      case 'user':
        return <UsersIcon className="w-4 h-4 text-[#06c]" />;
      default:
        return <TachometerAltIcon className={clsx('w-4 h-4', isDark ? 'text-rh-black-400' : 'text-gray-400')} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={clsx(
        'border rounded-lg p-6',
        isDark 
          ? 'bg-gradient-to-r from-[#6753ac]/20 via-dark-200 to-dark-200 border-[#6753ac]/30'
          : 'bg-gradient-to-r from-purple-50 via-white to-white border-purple-100'
      )}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={clsx(
              'text-2xl font-display font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>SuperAdmin Dashboard</h1>
            <p className={clsx(
              'mt-1',
              isDark ? 'text-rh-black-300' : 'text-gray-600'
            )}>
              System governance and user management overview
            </p>
          </div>
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-md border',
            isDark 
              ? 'bg-[#6753ac]/20 border-[#6753ac]/40'
              : 'bg-purple-100 border-purple-200'
          )}>
            <ShieldAltIcon className="w-4 h-4 text-[#6753ac]" />
            <span className={clsx(
              'text-sm font-medium',
              isDark ? 'text-[#b2a3dc]' : 'text-purple-700'
            )}>SuperAdmin Access</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={clsx(
                'border rounded-lg p-5 transition-colors',
                isDark 
                  ? 'bg-dark-300 border-rh-black-700/50 hover:border-rh-black-600/50'
                  : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
              )}
            >
              <div className="flex items-start justify-between">
                <div className={clsx('w-11 h-11 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={clsx('w-5 h-5', stat.color)} />
                </div>
                <div className={clsx(
                  'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-sm',
                  stat.change >= 0 
                    ? isDark 
                      ? 'bg-[#3e8635]/15 text-[#5ba352]' 
                      : 'bg-green-100 text-green-700'
                    : isDark 
                      ? 'bg-[#c9190b]/15 text-[#c9190b]'
                      : 'bg-red-100 text-red-700'
                )}>
                  {stat.change >= 0 ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}
                </div>
              </div>
              <p className={clsx(
                'text-2xl font-display font-bold mt-4',
                isDark ? 'text-white' : 'text-gray-900'
              )}>{stat.value}</p>
              <p className={clsx(
                'text-sm',
                isDark ? 'text-rh-black-400' : 'text-gray-500'
              )}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team Hierarchy */}
        <div className={clsx(
          'col-span-2 border rounded-lg overflow-hidden',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50'
            : 'bg-white border-gray-200 shadow-sm'
        )}>
          <div className={clsx(
            'px-5 py-4 border-b flex items-center justify-between',
            isDark ? 'border-rh-black-700/50' : 'border-gray-200'
          )}>
            <div className="flex items-center gap-3">
              <CodeBranchIcon className="w-5 h-5 text-[#3e8635]" />
              <h2 className={clsx(
                'text-lg font-display font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>Team Hierarchy</h2>
            </div>
            <Link
              to="/admin/teams"
              className="text-sm text-[#06c] hover:text-[#004080] font-medium transition-colors"
            >
              Manage Teams →
            </Link>
          </div>
          <div className={clsx(
            'divide-y',
            isDark ? 'divide-rh-black-700/50' : 'divide-gray-100'
          )}>
            {teamHierarchy.map((team) => (
              <div key={team.name} className={clsx(
                'px-5 py-4 flex items-center justify-between transition-colors',
                isDark ? 'hover:bg-dark-200/50' : 'hover:bg-gray-50'
              )}>
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    team.status === 'active' 
                      ? isDark ? 'bg-[#3e8635]/15' : 'bg-green-100'
                      : isDark ? 'bg-[#f0ab00]/15' : 'bg-yellow-100'
                  )}>
                    <BuildingIcon className={clsx(
                      'w-5 h-5',
                      team.status === 'active' ? 'text-[#3e8635]' : 'text-[#f0ab00]'
                    )} />
                  </div>
                  <div>
                    <p className={clsx(
                      'font-medium',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{team.name}</p>
                    <p className={clsx(
                      'text-sm',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>
                      {team.manager ? `Manager: ${team.manager}` : 'No manager assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={clsx(
                      'font-medium',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{team.members}</p>
                    <p className={clsx(
                      'text-xs',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>members</p>
                  </div>
                  {team.status === 'needs-manager' && (
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                      isDark 
                        ? 'bg-[#f0ab00]/20 text-[#f0ab00] border border-[#f0ab00]/30'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    )}>
                      Needs Manager
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <div className={clsx(
            'border rounded-lg overflow-hidden',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50'
              : 'bg-white border-gray-200 shadow-sm'
          )}>
            <div className={clsx(
              'px-5 py-4 border-b flex items-center gap-3',
              isDark ? 'border-rh-black-700/50' : 'border-gray-200'
            )}>
              <ExclamationTriangleIcon className="w-5 h-5 text-[#f0ab00]" />
              <h2 className={clsx(
                'text-lg font-display font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>Pending Actions</h2>
            </div>
            <div className="p-3 space-y-2">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className={clsx(
                    'p-3 rounded-md border',
                    isDark 
                      ? 'bg-[#f0ab00]/10 border-[#f0ab00]/30'
                      : 'bg-yellow-50 border-yellow-200'
                  )}
                >
                  <p className={clsx(
                    'text-sm',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={clsx(
            'border rounded-lg overflow-hidden',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50'
              : 'bg-white border-gray-200 shadow-sm'
          )}>
            <div className={clsx(
              'px-5 py-4 border-b flex items-center gap-3',
              isDark ? 'border-rh-black-700/50' : 'border-gray-200'
            )}>
              <ClockIcon className="w-5 h-5 text-[#06c]" />
              <h2 className={clsx(
                'text-lg font-display font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>Recent Activity</h2>
            </div>
            <div className={clsx(
              'divide-y',
              isDark ? 'divide-rh-black-700/50' : 'divide-gray-100'
            )}>
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'text-sm',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>
                      <span className="font-medium">{activity.action}</span>
                      {' — '}
                      <span className={isDark ? 'text-rh-black-400' : 'text-gray-500'}>{activity.target}</span>
                    </p>
                    <p className={clsx(
                      'text-xs mt-1',
                      isDark ? 'text-rh-black-500' : 'text-gray-400'
                    )}>{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className={clsx(
            'group border rounded-lg p-5 transition-all',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#06c]/50'
              : 'bg-white border-gray-200 hover:border-[#06c]/50 shadow-sm'
          )}
        >
          <UsersIcon className="w-6 h-6 text-[#06c] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#06c]'
              : 'text-gray-900 group-hover:text-[#06c]'
          )}>User Management</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Manage all system users</p>
        </Link>
        <Link
          to="/admin/teams"
          className={clsx(
            'group border rounded-lg p-5 transition-all',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#3e8635]/50'
              : 'bg-white border-gray-200 hover:border-[#3e8635]/50 shadow-sm'
          )}
        >
          <BuildingIcon className="w-6 h-6 text-[#3e8635] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#3e8635]'
              : 'text-gray-900 group-hover:text-[#3e8635]'
          )}>Team Governance</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Create and manage teams</p>
        </Link>
        <Link
          to="/admin/roles"
          className={clsx(
            'group border rounded-lg p-5 transition-all',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#6753ac]/50'
              : 'bg-white border-gray-200 hover:border-[#6753ac]/50 shadow-sm'
          )}
        >
          <ShieldAltIcon className="w-6 h-6 text-[#6753ac] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#6753ac]'
              : 'text-gray-900 group-hover:text-[#6753ac]'
          )}>Role Administration</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Promote associates to managers</p>
        </Link>
        <button className={clsx(
          'group border rounded-lg p-5 text-left transition-all',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#f0ab00]/50'
            : 'bg-white border-gray-200 hover:border-[#f0ab00]/50 shadow-sm'
        )}>
          <CogIcon className="w-6 h-6 text-[#f0ab00] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#f0ab00]'
              : 'text-gray-900 group-hover:text-[#f0ab00]'
          )}>System Settings</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Configure platform options</p>
        </button>
      </div>
    </div>
  );
}
