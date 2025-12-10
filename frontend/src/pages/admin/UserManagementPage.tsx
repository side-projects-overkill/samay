// frontend/src/pages/admin/UserManagementPage.tsx
// SuperAdmin user management with role promotion

import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCog,
  ArrowUpCircle,
  Building2,
  ChevronDown,
} from 'lucide-react';

type UserRole = 'ASSOCIATE' | 'MANAGER' | 'SUPERADMIN';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  manager?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

const users: SystemUser[] = [
  { id: '1', name: 'Sarah Miller', email: 'sarah.m@company.com', role: 'MANAGER', team: 'Morning Crew', joinDate: '2023-01-15', status: 'active', lastActive: '2 hours ago' },
  { id: '2', name: 'Mike Johnson', email: 'mike.j@company.com', role: 'MANAGER', team: 'Evening Crew', joinDate: '2023-03-20', status: 'active', lastActive: '1 day ago' },
  { id: '3', name: 'Alex Thompson', email: 'alex.t@company.com', role: 'ASSOCIATE', team: 'Morning Crew', manager: 'Sarah Miller', joinDate: '2023-06-10', status: 'active', lastActive: '3 hours ago' },
  { id: '4', name: 'Emily Chen', email: 'emily.c@company.com', role: 'ASSOCIATE', team: 'Evening Crew', manager: 'Mike Johnson', joinDate: '2023-08-05', status: 'active', lastActive: '5 hours ago' },
  { id: '5', name: 'James Wilson', email: 'james.w@company.com', role: 'ASSOCIATE', joinDate: '2024-01-10', status: 'pending', lastActive: 'Never' },
  { id: '6', name: 'Maria Garcia', email: 'maria.g@company.com', role: 'ASSOCIATE', team: 'Morning Crew', manager: 'Sarah Miller', joinDate: '2023-09-15', status: 'active', lastActive: '1 hour ago' },
  { id: '7', name: 'David Lee', email: 'david.l@company.com', role: 'ASSOCIATE', team: 'Night Shift', manager: 'Emily Chen', joinDate: '2023-11-20', status: 'inactive', lastActive: '2 weeks ago' },
];

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/30">SuperAdmin</span>;
      case 'MANAGER':
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Manager</span>;
      case 'ASSOCIATE':
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/30">Associate</span>;
    }
  };

  const getStatusBadge = (status: SystemUser['status']) => {
    switch (status) {
      case 'active':
        return <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>;
      case 'inactive':
        return <span className="w-2 h-2 bg-slate-400 rounded-full"></span>;
      case 'pending':
        return <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>;
    }
  };

  const handlePromote = (user: SystemUser) => {
    setSelectedUser(user);
    setShowPromoteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all users and their roles</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            {users.length} total users
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Roles</option>
            <option value="ASSOCIATE">Associate</option>
            <option value="MANAGER">Manager</option>
            <option value="SUPERADMIN">SuperAdmin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{users.filter(u => u.role === 'ASSOCIATE').length}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Associates</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-bold text-white">{users.filter(u => u.role === 'MANAGER').length}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Managers</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{users.filter(u => !u.team).length}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Unassigned</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">18</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Teams</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Role</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Team</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Last Active</th>
              <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4">
                  {user.team ? (
                    <div>
                      <p className="text-white text-sm">{user.team}</p>
                      {user.manager && <p className="text-xs text-slate-400">under {user.manager}</p>}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">Unassigned</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.status)}
                    <span className="text-sm text-slate-400 capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-400">{user.lastActive}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {user.role === 'ASSOCIATE' && (
                      <button
                        onClick={() => handlePromote(user)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        Promote
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promote Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Promote to Manager</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-4">
              Are you sure you want to promote <span className="font-medium text-white">{selectedUser.name}</span> to Manager?
              They will gain team management capabilities.
            </p>

            <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-2">Assign to team (optional)</p>
              <div className="relative">
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white appearance-none">
                  <option value="">Create new team...</option>
                  <option value="morning">Morning Crew</option>
                  <option value="evening">Evening Crew</option>
                  <option value="night">Night Shift</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement promotion API call
                  setShowPromoteModal(false);
                }}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
              >
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

