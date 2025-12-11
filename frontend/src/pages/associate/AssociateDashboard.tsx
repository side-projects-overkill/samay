// frontend/src/pages/associate/AssociateDashboard.tsx
// Red Hat / PatternFly styled Associate "My Shifts" page with light/dark theme support

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import {
  CalendarAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UsersIcon,
  ChartLineIcon,
  CalendarDayIcon,
  ExchangeAltIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS';
  location?: string;
}

// Demo data - will be replaced with API calls
const upcomingShifts: Shift[] = [
  { id: '1', date: '2024-01-15', startTime: '09:00', endTime: '17:00', status: 'CONFIRMED', location: 'Main Office' },
  { id: '2', date: '2024-01-16', startTime: '09:00', endTime: '17:00', status: 'PENDING', location: 'Branch A' },
  { id: '3', date: '2024-01-17', startTime: '13:00', endTime: '21:00', status: 'CONFIRMED', location: 'Main Office' },
  { id: '4', date: '2024-01-18', startTime: '09:00', endTime: '17:00', status: 'CONFIRMED', location: 'Main Office' },
];

export function AssociateDashboard() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [totalHours, setTotalHours] = useState(0);

  const isDark = theme === 'dark';

  useEffect(() => {
    // Calculate total scheduled hours
    const hours = upcomingShifts.reduce((acc, shift) => {
      const start = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      return acc + (end - start);
    }, 0);
    setTotalHours(hours);
  }, []);

  const stats = [
    { label: 'Scheduled Hours', value: `${totalHours}h`, icon: ClockIcon, color: 'text-[#06c]', bg: isDark ? 'bg-[#06c]/15' : 'bg-[#06c]/10' },
    { label: 'Shifts This Week', value: String(upcomingShifts.length), icon: CalendarAltIcon, color: 'text-[#3e8635]', bg: isDark ? 'bg-[#3e8635]/15' : 'bg-[#3e8635]/10' },
    { label: 'Availability Rate', value: '85%', icon: ChartLineIcon, color: 'text-[#6753ac]', bg: isDark ? 'bg-[#6753ac]/15' : 'bg-[#6753ac]/10' },
    { label: 'Team Members', value: '12', icon: UsersIcon, color: 'text-[#f0ab00]', bg: isDark ? 'bg-[#f0ab00]/15' : 'bg-[#f0ab00]/10' },
  ];

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-[#3e8635]/20 text-[#5ba352] border border-[#3e8635]/30' 
              : 'bg-green-100 text-green-700 border border-green-200'
          )}>
            <CheckCircleIcon className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-[#f0ab00]/20 text-[#f0ab00] border border-[#f0ab00]/30' 
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          )}>
            <ExclamationCircleIcon className="w-3 h-3" />
            Pending
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
            isDark 
              ? 'bg-[#009596]/20 text-[#009596] border border-[#009596]/30' 
              : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
          )}>
            <ClockIcon className="w-3 h-3" />
            In Progress
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={clsx(
        'border rounded-lg p-6',
        isDark 
          ? 'bg-gradient-to-r from-[#06c]/20 via-dark-200 to-dark-200 border-[#06c]/30' 
          : 'bg-gradient-to-r from-blue-50 via-white to-white border-blue-100'
      )}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={clsx(
              'text-2xl font-display font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className={clsx(
              'mt-1',
              isDark ? 'text-rh-black-300' : 'text-gray-600'
            )}>Here's your schedule overview for this week.</p>
          </div>
          <div className="text-right">
            <p className={clsx(
              'text-sm',
              isDark ? 'text-rh-black-400' : 'text-gray-500'
            )}>Current Team</p>
            {user?.teamName ? (
              <div className="flex items-center gap-2 mt-1 justify-end">
                <UsersIcon className="w-4 h-4 text-[#3e8635]" />
                <span className={clsx(
                  'font-medium',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>{user.teamName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 justify-end">
                <ExclamationCircleIcon className="w-4 h-4 text-[#f0ab00]" />
                <span className="text-[#f0ab00] text-sm">Unassigned</span>
              </div>
            )}
            {user?.managerName && (
              <p className={clsx(
                'text-xs mt-1',
                isDark ? 'text-rh-black-500' : 'text-gray-400'
              )}>Manager: {user.managerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Status Alert */}
      {!user?.teamId && (
        <div className={clsx(
          'rounded-md p-4 flex items-start gap-3',
          isDark 
            ? 'bg-[#f0ab00]/10 border border-[#f0ab00]/30' 
            : 'bg-yellow-50 border border-yellow-200'
        )}>
          <ExclamationCircleIcon className="w-5 h-5 text-[#f0ab00] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className={clsx(
              'font-medium',
              isDark ? 'text-[#f0ab00]' : 'text-yellow-800'
            )}>Awaiting Team Assignment</h3>
            <p className={clsx(
              'text-sm mt-1',
              isDark ? 'text-[#f0ab00]/70' : 'text-yellow-700'
            )}>
              You haven't been assigned to a team yet. A manager will claim you into their team soon.
              You'll be notified once you're assigned.
            </p>
          </div>
        </div>
      )}

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
              <div className={clsx('w-11 h-11 rounded-lg flex items-center justify-center', stat.bg)}>
                <Icon className={clsx('w-5 h-5', stat.color)} />
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

      {/* Shifts Section */}
      <div className={clsx(
        'border rounded-lg overflow-hidden',
        isDark 
          ? 'bg-dark-300 border-rh-black-700/50' 
          : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className={clsx(
          'border-b px-5 py-4 flex items-center justify-between',
          isDark ? 'border-rh-black-700/50' : 'border-gray-200'
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'upcoming'
                  ? isDark
                    ? 'bg-[#ee0000]/15 text-[#ee0000] border border-[#ee0000]/30'
                    : 'bg-red-50 text-[#ee0000] border border-red-200'
                  : isDark
                    ? 'text-rh-black-400 hover:text-white hover:bg-dark-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              Upcoming Shifts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'history'
                  ? isDark
                    ? 'bg-[#ee0000]/15 text-[#ee0000] border border-[#ee0000]/30'
                    : 'bg-red-50 text-[#ee0000] border border-red-200'
                  : isDark
                    ? 'text-rh-black-400 hover:text-white hover:bg-dark-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              History
            </button>
          </div>
          <button className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md transition-colors border',
            isDark 
              ? 'bg-dark-200 text-rh-black-300 hover:bg-dark-100 hover:text-white border-rh-black-700/50' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-200'
          )}>
            <CalendarDayIcon className="w-4 h-4" />
            Calendar View
          </button>
        </div>

        <div className={clsx(
          'divide-y',
          isDark ? 'divide-rh-black-700/50' : 'divide-gray-100'
        )}>
          {upcomingShifts.map((shift) => (
            <div key={shift.id} className={clsx(
              'px-5 py-4 flex items-center justify-between transition-colors',
              isDark ? 'hover:bg-dark-200/50' : 'hover:bg-gray-50'
            )}>
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'w-14 h-14 rounded-lg flex flex-col items-center justify-center border',
                  isDark 
                    ? 'bg-dark-200 border-rh-black-700/50' 
                    : 'bg-gray-50 border-gray-200'
                )}>
                  <span className={clsx(
                    'text-xs',
                    isDark ? 'text-rh-black-400' : 'text-gray-500'
                  )}>{formatDate(shift.date).split(' ')[0]}</span>
                  <span className={clsx(
                    'text-xl font-display font-bold',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{new Date(shift.date).getDate()}</span>
                </div>
                <div>
                  <p className={clsx(
                    'font-medium',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {shift.startTime} - {shift.endTime}
                  </p>
                  <p className={clsx(
                    'text-sm',
                    isDark ? 'text-rh-black-400' : 'text-gray-500'
                  )}>{shift.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(shift.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className={clsx(
          'group border rounded-lg p-5 text-left transition-all',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#ee0000]/50' 
            : 'bg-white border-gray-200 hover:border-[#ee0000]/50 shadow-sm'
        )}>
          <CalendarAltIcon className="w-6 h-6 text-[#ee0000] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#ee0000]' 
              : 'text-gray-900 group-hover:text-[#ee0000]'
          )}>Update Availability</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Set your available hours for the upcoming weeks</p>
        </button>
        <button className={clsx(
          'group border rounded-lg p-5 text-left transition-all',
          isDark 
            ? 'bg-dark-300 border-rh-black-700/50 hover:border-[#3e8635]/50' 
            : 'bg-white border-gray-200 hover:border-[#3e8635]/50 shadow-sm'
        )}>
          <ExchangeAltIcon className="w-6 h-6 text-[#3e8635] mb-4" />
          <h3 className={clsx(
            'font-medium transition-colors',
            isDark 
              ? 'text-white group-hover:text-[#3e8635]' 
              : 'text-gray-900 group-hover:text-[#3e8635]'
          )}>Swap Shift</h3>
          <p className={clsx(
            'text-sm mt-1',
            isDark ? 'text-rh-black-400' : 'text-gray-500'
          )}>Trade shifts with a team member</p>
        </button>
      </div>
    </div>
  );
}
