// frontend/src/pages/admin/TeamGovernancePage.tsx
// SuperAdmin team management and governance

import { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  UserCog,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import clsx from 'clsx';

interface Team {
  id: string;
  name: string;
  description: string;
  manager: string | null;
  managerId: string | null;
  memberCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
  shifts: number;
}

const teams: Team[] = [
  { id: '1', name: 'Morning Crew', description: 'Early morning operations team', manager: 'Sarah Miller', managerId: 'm1', memberCount: 8, createdAt: '2023-01-15', status: 'active', shifts: 24 },
  { id: '2', name: 'Evening Crew', description: 'Evening shift operations', manager: 'Mike Johnson', managerId: 'm2', memberCount: 12, createdAt: '2023-03-20', status: 'active', shifts: 32 },
  { id: '3', name: 'Night Shift', description: 'Overnight operations team', manager: 'Emily Chen', managerId: 'm3', memberCount: 6, createdAt: '2023-06-10', status: 'active', shifts: 18 },
  { id: '4', name: 'Weekend Team', description: 'Weekend coverage team', manager: null, managerId: null, memberCount: 5, createdAt: '2023-08-05', status: 'active', shifts: 10 },
  { id: '5', name: 'Warehouse A', description: 'Main warehouse operations', manager: 'James Wilson', managerId: 'm4', memberCount: 15, createdAt: '2023-09-15', status: 'active', shifts: 45 },
  { id: '6', name: 'Holiday Coverage', description: 'Special holiday shifts', manager: null, managerId: null, memberCount: 0, createdAt: '2023-12-01', status: 'inactive', shifts: 0 },
];

const availableManagers = [
  { id: 'm1', name: 'Sarah Miller', currentTeam: 'Morning Crew' },
  { id: 'm2', name: 'Mike Johnson', currentTeam: 'Evening Crew' },
  { id: 'm3', name: 'Emily Chen', currentTeam: 'Night Shift' },
  { id: 'm4', name: 'James Wilson', currentTeam: 'Warehouse A' },
  { id: 'm5', name: 'New Manager', currentTeam: null },
];

export function TeamGovernancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedManager, setSelectedManager] = useState<string>('');

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = () => {
    console.log('Creating team:', { name: newTeamName, description: newTeamDescription, managerId: selectedManager });
    setShowCreateModal(false);
    setNewTeamName('');
    setNewTeamDescription('');
    setSelectedManager('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Governance</h1>
          <p className="text-slate-400 mt-1">Create and manage organizational teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors shadow-lg shadow-red-500/25"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <Building2 className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.length}</p>
          <p className="text-sm text-slate-400">Total Teams</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.reduce((sum, t) => sum + t.memberCount, 0)}</p>
          <p className="text-sm text-slate-400">Total Members</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <UserCog className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.filter(t => t.manager).length}</p>
          <p className="text-sm text-slate-400">Teams with Managers</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <GitBranch className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.filter(t => !t.manager).length}</p>
          <p className="text-sm text-slate-400">Need Manager</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className={clsx(
              'bg-slate-800/50 border rounded-2xl overflow-hidden transition-colors',
              team.status === 'active' ? 'border-slate-700/50 hover:border-slate-600/50' : 'border-slate-700/30 opacity-60'
            )}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    team.manager ? 'bg-emerald-500/10' : 'bg-yellow-500/10'
                  )}>
                    <Building2 className={clsx(
                      'w-6 h-6',
                      team.manager ? 'text-emerald-400' : 'text-yellow-400'
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                    <p className="text-sm text-slate-400">{team.description}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{team.memberCount}</p>
                  <p className="text-xs text-slate-400">Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{team.shifts}</p>
                  <p className="text-xs text-slate-400">Shifts/week</p>
                </div>
                <div>
                  <p className="text-sm text-white">{new Date(team.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Created</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-slate-400" />
                    {team.manager ? (
                      <span className="text-sm text-white">{team.manager}</span>
                    ) : (
                      <span className="text-sm text-yellow-400">No manager assigned</span>
                    )}
                  </div>
                  <span className={clsx(
                    'px-2 py-1 text-xs rounded-full border',
                    team.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  )}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-700/20 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setSelectedTeam(team)}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create New Team</h3>
                <p className="text-sm text-slate-400">Add a new team to the organization</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Morning Crew"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Brief description of the team..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Assign Manager (optional)
                </label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a manager...</option>
                  {availableManagers.filter(m => !m.currentTeam).map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

