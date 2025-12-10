// frontend/src/pages/admin/AdminDashboard.tsx
// SuperAdmin dashboard with governance overview

import {
  Users,
  Building2,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  UserCog,
  GitBranch,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface SystemStat {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: 'promotion' | 'team' | 'user' | 'system';
}

const stats: SystemStat[] = [
  { label: 'Total Users', value: '247', change: 12, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Active Teams', value: '18', change: 2, icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Managers', value: '15', change: 1, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Associates', value: '229', change: 9, icon: UserCog, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

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
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'promotion':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'team':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'user':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-slate-800/50 border border-purple-700/30 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SuperAdmin Dashboard</h1>
            <p className="text-slate-400 mt-1">
              System governance and user management overview
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">SuperAdmin Access</span>
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
              <div className={clsx(
                'flex items-center gap-1 text-xs font-medium',
                stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stat.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(stat.change)}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team Hierarchy */}
        <div className="col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Team Hierarchy</h2>
            </div>
            <Link
              to="/admin/teams"
              className="text-sm text-red-400 hover:text-red-300"
            >
              Manage Teams
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {teamHierarchy.map((team) => (
              <div key={team.name} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    team.status === 'active' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'
                  )}>
                    <Building2 className={clsx(
                      'w-5 h-5',
                      team.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'
                    )} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{team.name}</p>
                    <p className="text-sm text-slate-400">
                      {team.manager ? `Manager: ${team.manager}` : 'No manager assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-medium">{team.members}</p>
                    <p className="text-xs text-slate-400">members</p>
                  </div>
                  {team.status === 'needs-manager' && (
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
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
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
            </div>
            <div className="p-2 space-y-2">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                >
                  <p className="text-sm text-white">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="p-3 flex items-start gap-3">
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.action}</span>
                      {' - '}
                      <span className="text-slate-400">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
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
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors group"
        >
          <Users className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">User Management</h3>
          <p className="text-sm text-slate-400 mt-1">Manage all system users</p>
        </Link>
        <Link
          to="/admin/teams"
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-colors group"
        >
          <Building2 className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">Team Governance</h3>
          <p className="text-sm text-slate-400 mt-1">Create and manage teams</p>
        </Link>
        <Link
          to="/admin/roles"
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors group"
        >
          <Shield className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">Role Administration</h3>
          <p className="text-sm text-slate-400 mt-1">Promote associates to managers</p>
        </Link>
        <button className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-orange-500/30 transition-colors group">
          <TrendingUp className="w-6 h-6 text-orange-400 mb-3" />
          <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors">System Analytics</h3>
          <p className="text-sm text-slate-400 mt-1">View usage and performance</p>
        </button>
      </div>
    </div>
  );
}

