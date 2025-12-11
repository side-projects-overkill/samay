// frontend/src/pages/manager/ManagerDashboard.tsx
// Red Hat / PatternFly styled Manager dashboard with light/dark theme support

import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import {
  UsersIcon,
  CalendarAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartLineIcon,
  UserPlusIcon,
  ListIcon,
  ArrowRightIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'on-shift' | 'off';
  avatar?: string;
  shiftsThisWeek: number;
}

interface ShiftConflict {
  id: string;
  type: 'overlap' | 'understaffed' | 'skill-gap';
  date: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Demo data
const teamMembers: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', role: 'Associate', status: 'on-shift', shiftsThisWeek: 4 },
  { id: '2', name: 'Maria Garcia', role: 'Associate', status: 'available', shiftsThisWeek: 3 },
  { id: '3', name: 'James Wilson', role: 'Associate', status: 'off', shiftsThisWeek: 5 },
  { id: '4', name: 'Emily Chen', role: 'Associate', status: 'available', shiftsThisWeek: 4 },
  { id: '5', name: 'Michael Brown', role: 'Associate', status: 'on-shift', shiftsThisWeek: 3 },
];

const conflicts: ShiftConflict[] = [
  { id: '1', type: 'understaffed', date: '2024-01-16', description: 'Morning shift needs 2 more associates', severity: 'high' },
  { id: '2', type: 'overlap', date: '2024-01-17', description: 'Alex Johnson has overlapping shifts', severity: 'medium' },
  { id: '3', type: 'skill-gap', date: '2024-01-18', description: 'No certified forklift operators on evening shift', severity: 'low' },
];

const unassignedPool = [
  { id: 'u1', name: 'New Associate 1', skills: ['General', 'Customer Service'], joinDate: '2024-01-10' },
  { id: 'u2', name: 'New Associate 2', skills: ['General', 'Inventory'], joinDate: '2024-01-12' },
  { id: 'u3', name: 'New Associate 3', skills: ['General'], joinDate: '2024-01-14' },
];

export function ManagerDashboard() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Team Members', value: '12', icon: UsersIcon, color: 'text-[#06c]', bg: isDark ? 'bg-[#06c]/15' : 'bg-[#06c]/10', change: '+2' },
    { label: 'Shifts This Week', value: '48', icon: CalendarAltIcon, color: 'text-[#3e8635]', bg: isDark ? 'bg-[#3e8635]/15' : 'bg-[#3e8635]/10', change: '+8' },
    { label: 'Hours Scheduled', value: '384h', icon: ClockIcon, color: 'text-[#6753ac]', bg: isDark ? 'bg-[#6753ac]/15' : 'bg-[#6753ac]/10', change: '+12%' },
    { label: 'Pending Requests', value: '5', icon: ListIcon, color: 'text-[#f0ab00]', bg: isDark ? 'bg-[#f0ab00]/15' : 'bg-[#f0ab00]/10', change: '-2' },
  ];

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'on-shift':
        return (
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-[#3e8635]/20 text-[#5ba352] border border-[#3e8635]/30'
              : 'bg-green-100 text-green-700 border border-green-200'
          )}>On Shift</span>
        );
      case 'available':
        return (
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-[#06c]/20 text-[#73bcf7] border border-[#06c]/30'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          )}>Available</span>
        );
      case 'off':
        return (
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-rh-black-700/50 text-rh-black-400 border-rh-black-600'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          )}>Off</span>
        );
    }
  };

  const getSeverityStyles = (severity: ShiftConflict['severity']) => {
    switch (severity) {
      case 'high':
        return isDark 
          ? 'border-[#c9190b]/30 bg-[#c9190b]/10' 
          : 'border-red-200 bg-red-50';
      case 'medium':
        return isDark 
          ? 'border-[#f0ab00]/30 bg-[#f0ab00]/10' 
          : 'border-yellow-200 bg-yellow-50';
      case 'low':
        return isDark 
          ? 'border-[#06c]/30 bg-[#06c]/10' 
          : 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={clsx(
        'border rounded-lg p-6',
        isDark 
          ? 'bg-gradient-to-r from-[#3e8635]/20 via-dark-200 to-dark-200 border-[#3e8635]/30'
          : 'bg-gradient-to-r from-green-50 via-white to-white border-green-100'
      )}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={clsx(
              'text-2xl font-display font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Manager Dashboard
            </h1>
            <p className={clsx(
              'mt-1',
              isDark ? 'text-rh-black-300' : 'text-gray-600'
            )}>
              Welcome back, {user?.firstName}! Manage your team and roster efficiently.
            </p>
          </div>
          <div className="text-right">
            <p className={clsx(
              'text-sm',
              isDark ? 'text-rh-black-400' : 'text-gray-500'
            )}>Your Team</p>
            <p className="text-xl font-display font-bold text-[#3e8635]">{user?.teamName || 'No Team'}</p>
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
                'border rounded-lg p-5',
                isDark 
                  ? 'bg-dark-300 border-rh-black-700/50'
                  : 'bg-white border-gray-200 shadow-sm'
              )}
            >
              <div className="flex items-start justify-between">
                <div className={clsx('w-11 h-11 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={clsx('w-5 h-5', stat.color)} />
                </div>
                <span className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-sm',
                  stat.change.startsWith('+') 
                    ? isDark 
                      ? 'bg-[#3e8635]/15 text-[#5ba352]' 
                      : 'bg-green-100 text-green-700'
                    : isDark 
                      ? 'bg-rh-black-700/50 text-rh-black-400'
                      : 'bg-gray-100 text-gray-500'
                )}>
                  {stat.change}
                </span>
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
        {/* Team Overview */}
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
            <h2 className={clsx(
              'text-lg font-display font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>Team Members</h2>
            <Link
              to="/manager/team"
              className="text-sm text-[#06c] hover:text-[#004080] flex items-center gap-1 font-medium"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className={clsx(
            'divide-y',
            isDark ? 'divide-rh-black-700/50' : 'divide-gray-100'
          )}>
            {teamMembers.map((member) => (
              <div key={member.id} className={clsx(
                'px-5 py-4 flex items-center justify-between transition-colors',
                isDark ? 'hover:bg-dark-200/50' : 'hover:bg-gray-50'
              )}>
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
                    isDark 
                      ? 'bg-gradient-to-br from-rh-black-600 to-rh-black-700'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  )}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className={clsx(
                      'font-medium',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{member.name}</p>
                    <p className={clsx(
                      'text-sm',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={clsx(
                      'text-sm',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{member.shiftsThisWeek} shifts</p>
                    <p className={clsx(
                      'text-xs',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>this week</p>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Conflicts & Alerts */}
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
              )}>Alerts</h2>
              <span className={clsx(
                'ml-auto px-2 py-0.5 text-xs rounded-sm font-medium',
                isDark 
                  ? 'bg-[#f0ab00]/15 text-[#f0ab00]'
                  : 'bg-yellow-100 text-yellow-700'
              )}>
                {conflicts.length}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className={clsx(
                    'p-3 rounded-md border',
                    getSeverityStyles(conflict.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <p className={clsx(
                      'text-sm',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{conflict.description}</p>
                    <span className={clsx(
                      'text-xs ml-2 whitespace-nowrap',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>{conflict.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Pool */}
          <div className={clsx(
            'border rounded-lg overflow-hidden',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50'
              : 'bg-white border-gray-200 shadow-sm'
          )}>
            <div className={clsx(
              'px-5 py-4 border-b flex items-center justify-between',
              isDark ? 'border-rh-black-700/50' : 'border-gray-200'
            )}>
              <div className="flex items-center gap-3">
                <UserPlusIcon className="w-5 h-5 text-[#06c]" />
                <h2 className={clsx(
                  'text-lg font-display font-semibold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>Unassigned Pool</h2>
              </div>
              <Link
                to="/manager/pool"
                className="text-sm text-[#06c] hover:text-[#004080] font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {unassignedPool.map((associate) => (
                <div
                  key={associate.id}
                  className={clsx(
                    'p-3 rounded-md flex items-center justify-between border',
                    isDark 
                      ? 'bg-dark-200 border-rh-black-700/50'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div>
                    <p className={clsx(
                      'text-sm font-medium',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}>{associate.name}</p>
                    <p className={clsx(
                      'text-xs',
                      isDark ? 'text-rh-black-400' : 'text-gray-500'
                    )}>{associate.skills.join(', ')}</p>
                  </div>
                  <button className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors border',
                    isDark 
                      ? 'bg-[#3e8635]/15 text-[#5ba352] hover:bg-[#3e8635]/25 border-[#3e8635]/30'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                  )}>
                    Claim
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          to="/manager/roster"
          className={clsx(
            'group border rounded-lg p-5 transition-all',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#ee0000]/50'
              : 'bg-white border-gray-200 hover:border-[#ee0000]/50 shadow-sm'
          )}
        >
          <CalendarAltIcon className="w-6 h-6 text-[#ee0000] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#ee0000]'
              : 'text-gray-900 group-hover:text-[#ee0000]'
          )}>Build Roster</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Create and manage weekly schedules</p>
        </Link>
        <Link
          to="/manager/team"
          className={clsx(
            'group border rounded-lg p-5 transition-all',
            isDark 
              ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#3e8635]/50'
              : 'bg-white border-gray-200 hover:border-[#3e8635]/50 shadow-sm'
          )}
        >
          <UsersIcon className="w-6 h-6 text-[#3e8635] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#3e8635]'
              : 'text-gray-900 group-hover:text-[#3e8635]'
          )}>Manage Team</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>View and organize team members</p>
        </Link>
        <button className={clsx(
          'group border rounded-lg p-5 text-left transition-all',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#06c]/50'
            : 'bg-white border-gray-200 hover:border-[#06c]/50 shadow-sm'
        )}>
          <ListIcon className="w-6 h-6 text-[#06c] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#06c]'
              : 'text-gray-900 group-hover:text-[#06c]'
          )}>Review Requests</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>5 pending time-off requests</p>
        </button>
        <button className={clsx(
          'group border rounded-lg p-5 text-left transition-all',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#6753ac]/50'
            : 'bg-white border-gray-200 hover:border-[#6753ac]/50 shadow-sm'
        )}>
          <ChartLineIcon className="w-6 h-6 text-[#6753ac] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#6753ac]'
              : 'text-gray-900 group-hover:text-[#6753ac]'
          )}>Auto-Optimize</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Let AI optimize the schedule</p>
        </button>
      </div>
    </div>
  );
}
