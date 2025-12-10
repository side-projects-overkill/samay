// frontend/src/components/Sidebar.tsx
// Navigation sidebar with team selection and date controls

import { useEffect, useState } from 'react'
import { useRosterStore } from '../stores/rosterStore'
import { api } from '../lib/api'
import { clsx } from 'clsx'

interface Team {
  id: string
  name: string
  memberCount: number
}

export function Sidebar() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    selectedTeamId, 
    setSelectedTeamId, 
    dateRange, 
    setDateRange 
  } = useRosterStore()
  
  // Load teams on mount
  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await api.getTeams()
        setTeams(data)
        
        // Select first team if none selected
        if (!selectedTeamId && data.length > 0) {
          setSelectedTeamId(data[0].id)
        }
      } catch (error) {
        console.error('Failed to load teams:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTeams()
  }, [selectedTeamId, setSelectedTeamId])
  
  // Date navigation helpers
  const goToToday = () => {
    const today = new Date()
    const from = new Date(today)
    from.setDate(today.getDate() - today.getDay())
    
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    
    setDateRange(
      from.toISOString().split('T')[0],
      to.toISOString().split('T')[0]
    )
  }
  
  const navigateWeek = (direction: number) => {
    const from = new Date(dateRange.from)
    from.setDate(from.getDate() + direction * 7)
    
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    
    setDateRange(
      from.toISOString().split('T')[0],
      to.toISOString().split('T')[0]
    )
  }
  
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-4">
      {/* Teams */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Teams
        </h2>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 loading-shimmer rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors duration-150',
                  selectedTeamId === team.id
                    ? 'bg-samay-50 text-samay-700 border border-samay-200'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="font-medium text-sm">{team.name}</div>
                <div className="text-xs text-slate-500">
                  {team.memberCount || 0} members
                </div>
              </button>
            ))}
            
            {teams.length === 0 && (
              <p className="text-sm text-slate-400 italic px-3">
                No teams found
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Date Range */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Date Range
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              className="text-xs font-medium text-samay-600 hover:text-samay-700"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-slate-700">
              {new Date(dateRange.from).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {' - '}
              {new Date(dateRange.to).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Shift Status
        </h2>
        
        <div className="space-y-2">
          {[
            { status: 'OPEN', color: 'bg-slate-400', label: 'Open' },
            { status: 'ASSIGNED', color: 'bg-blue-500', label: 'Assigned' },
            { status: 'CONFIRMED', color: 'bg-green-500', label: 'Confirmed' },
            { status: 'IN_PROGRESS', color: 'bg-yellow-500', label: 'In Progress' },
            { status: 'COMPLETED', color: 'bg-slate-500', label: 'Completed' },
            { status: 'CANCELLED', color: 'bg-red-500', label: 'Cancelled' },
          ].map(({ status, color, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${color}`} />
              <span className="text-sm text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

