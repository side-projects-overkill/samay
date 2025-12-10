// frontend/src/pages/manager/TeamManagementPage.tsx
// Manager team management with claim functionality

import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  UserMinus,
  MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'on-leave' | 'inactive';
  skills: string[];
  joinDate: string;
  hoursThisWeek: number;
  rating: number;
  avatar?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Associate',
    status: 'active',
    skills: ['Customer Service', 'Inventory', 'Forklift'],
    joinDate: '2023-06-15',
    hoursThisWeek: 32,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.g@company.com',
    phone: '+1 (555) 234-5678',
    role: 'Associate',
    status: 'active',
    skills: ['Customer Service', 'Cash Register'],
    joinDate: '2023-08-20',
    hoursThisWeek: 24,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james.w@company.com',
    phone: '+1 (555) 345-6789',
    role: 'Associate',
    status: 'on-leave',
    skills: ['Inventory', 'Stocking'],
    joinDate: '2023-09-10',
    hoursThisWeek: 0,
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.c@company.com',
    phone: '+1 (555) 456-7890',
    role: 'Associate',
    status: 'active',
    skills: ['Customer Service', 'Training'],
    joinDate: '2023-10-05',
    hoursThisWeek: 28,
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.b@company.com',
    phone: '+1 (555) 567-8901',
    role: 'Associate',
    status: 'active',
    skills: ['Forklift', 'Inventory', 'Safety'],
    joinDate: '2023-11-12',
    hoursThisWeek: 36,
    rating: 4.3,
  },
];

export function TeamManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Active</span>;
      case 'on-leave':
        return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/30">On Leave</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-slate-500/10 text-slate-400 text-xs rounded-full border border-slate-500/30">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage your team members and their assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {filteredMembers.length} team members
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team List */}
        <div className="col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-700/50">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={clsx(
                  'p-4 cursor-pointer transition-colors',
                  selectedMember?.id === member.id
                    ? 'bg-red-500/10 border-l-2 border-red-500'
                    : 'hover:bg-slate-700/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{member.name}</p>
                        {getStatusBadge(member.status)}
                      </div>
                      <p className="text-sm text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{member.rating}</span>
                      </div>
                      <p className="text-xs text-slate-400">{member.hoursThisWeek}h this week</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Details Panel */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {selectedMember ? (
            <div>
              <div className="p-6 border-b border-slate-700/50 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-2xl font-medium">
                  {selectedMember.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-white mt-4">{selectedMember.name}</h3>
                <p className="text-slate-400">{selectedMember.role}</p>
                <div className="mt-2">{getStatusBadge(selectedMember.status)}</div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{selectedMember.hoursThisWeek} hours this week</span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  View Schedule
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                  <UserMinus className="w-4 h-4" />
                  Remove from Team
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a team member to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

