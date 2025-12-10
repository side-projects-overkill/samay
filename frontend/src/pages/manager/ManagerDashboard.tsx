// frontend/src/pages/manager/ManagerDashboard.tsx
// Manager dashboard with team and roster overview

import { useAuthStore } from '../../stores/authStore';
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
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

const stats = [
  { label: 'Team Members', value: '12', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+2' },
  { label: 'Shifts This Week', value: '48', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+8' },
  { label: 'Hours Scheduled', value: '384h', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', change: '+12%' },
  { label: 'Pending Requests', value: '5', icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/10', change: '-2' },
];

const unassignedPool = [
  { id: 'u1', name: 'New Associate 1', skills: ['General', 'Customer Service'], joinDate: '2024-01-10' },
  { id: 'u2', name: 'New Associate 2', skills: ['General', 'Inventory'], joinDate: '2024-01-12' },
  { id: 'u3', name: 'New Associate 3', skills: ['General'], joinDate: '2024-01-14' },
];

export function ManagerDashboard() {
  const { user } = useAuthStore();

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'on-shift':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">On Shift</span>;
      case 'available':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">Available</span>;
      case 'off':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/10 text-slate-400 text-xs rounded-full">Off</span>;
    }
  };

  const getSeverityStyles = (severity: ShiftConflict['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800/50 border border-emerald-700/30 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Manager Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome back, {user?.firstName}! Manage your team and roster efficiently.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Your Team</p>
            <p className="text-xl font-bold text-emerald-400">{user?.teamName || 'No Team'}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={clsx('w-5 h-5', stat.color)} />
              </div>
              <span className={clsx(
                'text-xs font-medium px-2 py-1 rounded-full',
                stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team Overview */}
        <div className="col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Team Members</h2>
            <Link
              to="/manager/team"
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-white">{member.shiftsThisWeek} shifts</p>
                    <p className="text-xs text-slate-400">this week</p>
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
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Alerts</h2>
              <span className="ml-auto px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                {conflicts.length}
              </span>
            </div>
            <div className="p-2 space-y-2">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className={clsx(
                    'p-3 rounded-lg border',
                    getSeverityStyles(conflict.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-white">{conflict.description}</p>
                    <span className="text-xs text-slate-400">{conflict.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Pool */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Unassigned Pool</h2>
              </div>
              <Link
                to="/manager/pool"
                className="text-sm text-red-400 hover:text-red-300"
              >
                View All
              </Link>
            </div>
            <div className="p-2 space-y-2">
              {unassignedPool.map((associate) => (
                <div
                  key={associate.id}
                  className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{associate.name}</p>
                    <p className="text-xs text-slate-400">{associate.skills.join(', ')}</p>
                  </div>
                  <button className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/20 transition-colors">
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
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-red-500/30 transition-colors group"
        >
          <Calendar className="w-6 h-6 text-red-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-red-400 transition-colors">Build Roster</h3>
          <p className="text-sm text-slate-400 mt-1">Create and manage weekly schedules</p>
        </Link>
        <Link
          to="/manager/team"
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-colors group"
        >
          <Users className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">Manage Team</h3>
          <p className="text-sm text-slate-400 mt-1">View and organize team members</p>
        </Link>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-blue-500/30 transition-colors group">
          <ClipboardList className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">Review Requests</h3>
          <p className="text-sm text-slate-400 mt-1">5 pending time-off requests</p>
        </button>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-purple-500/30 transition-colors group">
          <TrendingUp className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">Auto-Optimize</h3>
          <p className="text-sm text-slate-400 mt-1">Let AI optimize the schedule</p>
        </button>
      </div>
    </div>
  );
}

