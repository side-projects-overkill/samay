// frontend/src/pages/associate/AssociateDashboard.tsx
// Associate dashboard - view shifts and manage availability

import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import clsx from 'clsx';

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS';
  location?: string;
}

// Demo data
const upcomingShifts: Shift[] = [
  { id: '1', date: '2024-01-15', startTime: '09:00', endTime: '17:00', status: 'CONFIRMED', location: 'Main Office' },
  { id: '2', date: '2024-01-16', startTime: '09:00', endTime: '17:00', status: 'PENDING', location: 'Branch A' },
  { id: '3', date: '2024-01-17', startTime: '13:00', endTime: '21:00', status: 'CONFIRMED', location: 'Main Office' },
  { id: '4', date: '2024-01-18', startTime: '09:00', endTime: '17:00', status: 'CONFIRMED', location: 'Main Office' },
];

const stats = [
  { label: 'Scheduled Hours', value: '32h', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Shifts This Week', value: '4', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Availability Rate', value: '85%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Team Members', value: '12', icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export function AssociateDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            <Clock className="w-3 h-3" />
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
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-slate-400 mt-1">Here's your schedule overview for this week.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Current Team</p>
            {user?.teamName ? (
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">{user.teamName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Unassigned</span>
              </div>
            )}
            {user?.managerName && (
              <p className="text-xs text-slate-500 mt-1">Manager: {user.managerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Status Alert */}
      {!user?.teamId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-medium">Awaiting Team Assignment</h3>
            <p className="text-yellow-300/70 text-sm mt-1">
              You haven't been assigned to a team yet. A manager will claim you into their team soon.
              You'll be notified once you're assigned.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
          >
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
              <stat.icon className={clsx('w-5 h-5', stat.color)} />
            </div>
            <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Shifts Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-700/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === 'upcoming'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Upcoming Shifts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === 'history'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              History
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <CalendarDays className="w-4 h-4" />
            Calendar View
          </button>
        </div>

        <div className="divide-y divide-slate-700/50">
          {upcomingShifts.map((shift) => (
            <div key={shift.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">{formatDate(shift.date).split(' ')[0]}</span>
                  <span className="text-lg font-bold text-white">{new Date(shift.date).getDate()}</span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {shift.startTime} - {shift.endTime}
                  </p>
                  <p className="text-sm text-slate-400">{shift.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(shift.status)}
                <button className="text-slate-400 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-red-500/30 transition-colors group">
          <Calendar className="w-6 h-6 text-red-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-red-400 transition-colors">Update Availability</h3>
          <p className="text-sm text-slate-400 mt-1">Set your available hours for the upcoming weeks</p>
        </button>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-red-500/30 transition-colors group">
          <Clock className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">Request Time Off</h3>
          <p className="text-sm text-slate-400 mt-1">Submit a request for vacation or personal days</p>
        </button>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-red-500/30 transition-colors group">
          <Users className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">Swap Shift</h3>
          <p className="text-sm text-slate-400 mt-1">Trade shifts with a team member</p>
        </button>
      </div>
    </div>
  );
}

