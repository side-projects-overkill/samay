// frontend/src/pages/admin/UserManagementPage.tsx
// Red Hat / PatternFly styled user management page - Connected to backend

import { useState, useEffect } from 'react';
import { api, UserResponse, TeamResponse } from '../../lib/api';
import {
  UsersIcon,
  SearchIcon,
  FilterIcon,
  EllipsisVIcon,
  ShieldAltIcon,
  UserCogIcon,
  ArrowCircleUpIcon,
  BuildingIcon,
  AngleDownIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  SyncAltIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import clsx from 'clsx';

type UserRole = 'ASSOCIATE' | 'MANAGER' | 'SUPERADMIN';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  teamId?: string;
  manager?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

// Map backend role to frontend role
const mapRole = (backendRole: string): UserRole => {
  switch (backendRole) {
    case 'admin': return 'SUPERADMIN';
    case 'manager': return 'MANAGER';
    default: return 'ASSOCIATE';
  }
};

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userList, setUserList] = useState<SystemUser[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotionSuccess, setPromotionSuccess] = useState<string | null>(null);
  const [selectedTeamForPromotion, setSelectedTeamForPromotion] = useState<string>('');

  // Fetch users and teams from backend
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [usersData, teamsData] = await Promise.all([
          api.getUsers(),
          api.getTeams(),
        ]);
        
        const mappedUsers: SystemUser[] = usersData.map((u: UserResponse) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: mapRole(u.role),
          team: u.team?.name,
          teamId: u.teamId,
          manager: u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : undefined,
          joinDate: new Date(u.createdAt).toLocaleDateString(),
          status: u.isActive ? 'active' : 'inactive',
          lastActive: 'Recently', // Would need activity tracking
        }));
        
        setUserList(mappedUsers);
        setTeams(teamsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const filteredUsers = userList.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="rh-badge rh-badge-purple">SuperAdmin</span>;
      case 'MANAGER':
        return <span className="rh-badge rh-badge-green">Manager</span>;
      case 'ASSOCIATE':
        return <span className="rh-badge rh-badge-blue">Associate</span>;
    }
  };

  const getStatusBadge = (status: SystemUser['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-dot status-dot-active"></span>;
      case 'inactive':
        return <span className="status-dot status-dot-inactive"></span>;
      case 'pending':
        return <span className="status-dot status-dot-pending"></span>;
    }
  };

  const handlePromote = (user: SystemUser) => {
    setSelectedUser(user);
    setSelectedTeamForPromotion(user.teamId || '');
    setShowPromoteModal(true);
  };

  const confirmPromotion = async () => {
    if (!selectedUser) return;
    
    try {
      await api.updateUser(selectedUser.id, {
        role: 'manager' as any,
        teamId: selectedTeamForPromotion || undefined,
      });
      
      // Update local state
      setUserList(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, role: 'MANAGER' as UserRole, teamId: selectedTeamForPromotion || u.teamId } 
          : u
      ));
      
      setPromotionSuccess(`${selectedUser.name} has been promoted to Manager!`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPromotionSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const usersData = await api.getUsers();
      const mappedUsers: SystemUser[] = usersData.map((u: UserResponse) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: mapRole(u.role),
        team: u.team?.name,
        teamId: u.teamId,
        manager: u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : undefined,
        joinDate: new Date(u.createdAt).toLocaleDateString(),
        status: u.isActive ? 'active' : 'inactive',
        lastActive: 'Recently',
      }));
      setUserList(mappedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">User Management</h1>
          <p className="text-rh-black-400 mt-1">Manage all users, roles, and team assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 text-rh-black-300 rounded-rh hover:bg-dark-100 hover:text-white transition-colors border border-rh-black-700/50"
          >
            <SyncAltIcon className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rh-red-DEFAULT text-white rounded-rh hover:bg-rh-red-700 transition-colors">
            <PlusCircleIcon className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-pf-red-DEFAULT/15 border border-pf-red-DEFAULT/30 rounded-rh">
          <ExclamationTriangleIcon className="w-5 h-5 text-pf-red-100" />
          <p className="text-pf-red-100">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-pf-red-100 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {promotionSuccess && (
        <div className="flex items-center gap-3 p-4 bg-pf-green-DEFAULT/15 border border-pf-green-DEFAULT/30 rounded-rh animate-fade-in">
          <CheckCircleIcon className="w-5 h-5 text-pf-green-200" />
          <p className="text-pf-green-200">{promotionSuccess}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rh-black-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rh-input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-rh-black-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rh-select w-36"
          >
            <option value="all">All Roles</option>
            <option value="ASSOCIATE">Associate</option>
            <option value="MANAGER">Manager</option>
            <option value="SUPERADMIN">SuperAdmin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rh-select w-36"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pf-blue-DEFAULT/15 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-pf-blue-200" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white">
                {userList.filter(u => u.role === 'ASSOCIATE').length}
              </span>
              <p className="text-sm text-rh-black-400">Associates</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pf-green-DEFAULT/15 rounded-lg flex items-center justify-center">
              <ShieldAltIcon className="w-5 h-5 text-pf-green-200" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white">
                {userList.filter(u => u.role === 'MANAGER').length}
              </span>
              <p className="text-sm text-rh-black-400">Managers</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pf-gold-DEFAULT/15 rounded-lg flex items-center justify-center">
              <UserCogIcon className="w-5 h-5 text-pf-gold-200" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white">
                {userList.filter(u => !u.team).length}
              </span>
              <p className="text-sm text-rh-black-400">Unassigned</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pf-purple-DEFAULT/15 rounded-lg flex items-center justify-center">
              <BuildingIcon className="w-5 h-5 text-pf-purple-200" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-white">{teams.length}</span>
              <p className="text-sm text-rh-black-400">Teams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <SyncAltIcon className="w-8 h-8 text-rh-black-500 mx-auto animate-spin mb-3" />
            <p className="text-rh-black-400">Loading users...</p>
          </div>
        ) : (
          <table className="rh-table">
            <thead>
              <tr className="border-b border-rh-black-700/50">
                <th className="text-left p-4 text-sm font-medium text-rh-black-400">User</th>
                <th className="text-left p-4 text-sm font-medium text-rh-black-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-rh-black-400">Team</th>
                <th className="text-left p-4 text-sm font-medium text-rh-black-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-rh-black-400">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-rh-black-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rh-black-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-dark-200/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rh-black-600 to-rh-black-700 flex items-center justify-center text-white font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-sm text-rh-black-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4">
                    {user.team ? (
                      <div>
                        <p className="text-white text-sm">{user.team}</p>
                        {user.manager && <p className="text-xs text-rh-black-400">under {user.manager}</p>}
                      </div>
                    ) : (
                      <span className="text-rh-black-500 text-sm italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.status)}
                      <span className="text-sm text-rh-black-400 capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-rh-black-400">{user.joinDate}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'ASSOCIATE' && (
                        <button
                          onClick={() => handlePromote(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-pf-purple-DEFAULT/15 text-pf-purple-200 text-sm rounded-rh hover:bg-pf-purple-DEFAULT/25 transition-colors border border-pf-purple-DEFAULT/30"
                        >
                          <ArrowCircleUpIcon className="w-4 h-4" />
                          Promote
                        </button>
                      )}
                      <button className="p-2 text-rh-black-400 hover:text-white hover:bg-dark-200 rounded-rh transition-colors">
                        <EllipsisVIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!isLoading && filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <UsersIcon className="w-12 h-12 text-rh-black-600 mx-auto mb-3" />
            <p className="text-rh-black-400">No users found matching your filters</p>
          </div>
        )}
      </div>

      {/* Promote Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-300 border border-rh-black-700/50 rounded-lg p-6 max-w-md w-full mx-4 shadow-rh-xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pf-purple-DEFAULT/15 rounded-lg flex items-center justify-center">
                <ArrowCircleUpIcon className="w-6 h-6 text-pf-purple-200" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Promote to Manager</h3>
                <p className="text-sm text-rh-black-400">This will grant management capabilities</p>
              </div>
            </div>
            
            <p className="text-rh-black-300 mb-4">
              Are you sure you want to promote <span className="font-medium text-white">{selectedUser.name}</span> to Manager?
              They will be able to manage team members and create rosters.
            </p>

            <div className="bg-dark-200 rounded-rh p-4 mb-6 border border-rh-black-700/50">
              <p className="text-sm text-rh-black-400 mb-2">Assign to team (optional)</p>
              <div className="relative">
                <select 
                  className="rh-select"
                  value={selectedTeamForPromotion}
                  onChange={(e) => setSelectedTeamForPromotion(e.target.value)}
                >
                  <option value="">Keep current team assignment...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <AngleDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rh-black-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 py-2.5 bg-dark-200 text-white rounded-rh hover:bg-dark-100 transition-colors border border-rh-black-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmPromotion}
                className="flex-1 py-2.5 bg-pf-purple-DEFAULT text-white rounded-rh hover:bg-pf-purple-500 transition-colors"
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
