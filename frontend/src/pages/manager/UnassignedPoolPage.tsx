// frontend/src/pages/manager/UnassignedPoolPage.tsx
// Manager page to claim unassigned associates

import { useState } from 'react';
import {
  UserPlus,
  Search,
  Check,
  Calendar,
  Award,
  Clock,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface UnassignedAssociate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  joinDate: string;
  availableHours: number;
  preferredShifts: string[];
}

const unassignedAssociates: UnassignedAssociate[] = [
  {
    id: 'u1',
    name: 'Sarah Thompson',
    email: 'sarah.t@company.com',
    skills: ['Customer Service', 'Cash Register', 'Training'],
    experience: '2 years retail',
    joinDate: '2024-01-10',
    availableHours: 40,
    preferredShifts: ['Morning', 'Afternoon'],
  },
  {
    id: 'u2',
    name: 'David Lee',
    email: 'david.l@company.com',
    skills: ['Inventory', 'Forklift', 'Safety'],
    experience: '3 years warehouse',
    joinDate: '2024-01-12',
    availableHours: 32,
    preferredShifts: ['Afternoon', 'Evening'],
  },
  {
    id: 'u3',
    name: 'Jennifer Martinez',
    email: 'jennifer.m@company.com',
    skills: ['Customer Service'],
    experience: 'Entry level',
    joinDate: '2024-01-14',
    availableHours: 20,
    preferredShifts: ['Morning'],
  },
  {
    id: 'u4',
    name: 'Robert Kim',
    email: 'robert.k@company.com',
    skills: ['Stocking', 'Inventory'],
    experience: '1 year retail',
    joinDate: '2024-01-15',
    availableHours: 40,
    preferredShifts: ['Evening', 'Night'],
  },
];

export function UnassignedPoolPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const allSkills = Array.from(new Set(unassignedAssociates.flatMap(a => a.skills)));

  const filteredAssociates = unassignedAssociates.filter((associate) => {
    const matchesSearch = associate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      associate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => associate.skills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  const handleClaim = (id: string) => {
    setClaimingId(id);
    // Simulate API call
    setTimeout(() => {
      setClaimingId(null);
      // In real app, would remove from list or refresh
    }, 1500);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Unassigned Associates Pool</h1>
          <p className="text-slate-400 mt-1">Claim associates to add them to your team</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <UserPlus className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-medium">{unassignedAssociates.length} available</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-white font-medium">How Claiming Works</h3>
          <p className="text-slate-400 text-sm mt-1">
            Once you claim an associate, they'll be added to your team and you can start scheduling them.
            Associates can only be assigned to one manager at a time.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-400">Filter by skills:</span>
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={clsx(
                'px-3 py-1 text-sm rounded-full border transition-colors',
                selectedSkills.includes(skill)
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:text-white'
              )}
            >
              {skill}
            </button>
          ))}
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="px-3 py-1 text-sm text-slate-400 hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Associate Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filteredAssociates.map((associate) => (
          <div
            key={associate.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg font-medium">
                    {associate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{associate.name}</h3>
                    <p className="text-sm text-slate-400">{associate.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">{associate.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{associate.availableHours}h/week available</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 col-span-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {new Date(associate.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {associate.skills.map((skill) => (
                    <span
                      key={skill}
                      className={clsx(
                        'px-2 py-1 text-xs rounded border',
                        selectedSkills.includes(skill)
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-slate-700/30 border-slate-600/50 text-slate-300'
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Preferred Shifts</p>
                <div className="flex gap-2">
                  {associate.preferredShifts.map((shift) => (
                    <span
                      key={shift}
                      className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded"
                    >
                      {shift}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-700/20 border-t border-slate-700/50 flex items-center justify-between">
              <button className="text-slate-400 hover:text-white text-sm transition-colors">
                View Full Profile
              </button>
              <button
                onClick={() => handleClaim(associate.id)}
                disabled={claimingId === associate.id}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  claimingId === associate.id
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                )}
              >
                {claimingId === associate.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Claim to Team
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAssociates.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No associates found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

