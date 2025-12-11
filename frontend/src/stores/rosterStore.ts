// frontend/src/stores/rosterStore.ts
// Zustand store for roster state management

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '../lib/api'

// Types
export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  skills: string[]
}

export interface Shift {
  id: string
  version: number
  teamId: string
  date: string
  startTime: string
  endTime: string
  startDateTime: string
  endDateTime: string
  shiftCode: string
  durationHours: number
  status: ShiftStatus
  requiredSkills: string[]
  assignedUserId: string | null
  assignedUser?: {
    id: string
    firstName: string
    lastName: string
  }
}

export type ShiftStatus = 
  | 'OPEN' 
  | 'ASSIGNED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    shiftId: string
    shiftCode: string
    status: ShiftStatus
    assignedUserId: string | null
    requiredSkills: string[]
    version: number
  }
}

export interface OptimizationResult {
  status: string
  assignments: Array<{
    shiftId: string
    employeeId: string
    start?: string
    end?: string
  }>
  fitness?: number | null
  diagnostics?: {
    relaxed?: boolean
    reason?: string
    minimalUnsat?: string[]
    solveTimeMs?: number
    totalShifts?: number
    assignedShifts?: number
    unfilledShifts?: number
  }
  suggestions?: Array<{
    type: string
    description: string
    impact?: string
  }>
}

interface RosterState {
  // Team
  selectedTeamId: string | null
  teamName: string
  members: TeamMember[]
  
  // Calendar
  events: CalendarEvent[]
  dateRange: {
    from: string
    to: string
  }
  
  // UI State
  isLoading: boolean
  error: string | null
  selectedShift: Shift | null
  isOptimizing: boolean
  optimizationResult: OptimizationResult | null
  
  // Actions
  setSelectedTeamId: (teamId: string) => void
  loadTeamData: (teamId: string) => Promise<void>
  setDateRange: (from: string, to: string) => void
  setSelectedShift: (shift: Shift | null) => void
  
  // Shift operations
  assignShift: (shiftId: string, userId: string) => Promise<void>
  unassignShift: (shiftId: string) => Promise<void>
  updateShiftFromEvent: (event: CalendarEvent) => void
  
  // Optimization
  runOptimization: () => Promise<void>
  applyOptimization: () => Promise<void>
  clearOptimizationResult: () => void
  
  // Real-time updates
  handleShiftUpdate: (shift: Shift) => void
}

// Get initial date range (current week)
const getInitialDateRange = () => {
  const now = new Date()
  const from = new Date(now)
  from.setDate(now.getDate() - now.getDay()) // Start of week
  
  const to = new Date(from)
  to.setDate(from.getDate() + 6) // End of week
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

export const useRosterStore = create<RosterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedTeamId: null,
      teamName: '',
      members: [],
      events: [],
      dateRange: getInitialDateRange(),
      isLoading: false,
      error: null,
      selectedShift: null,
      isOptimizing: false,
      optimizationResult: null,
      
      // Actions
      setSelectedTeamId: (teamId) => {
        set({ selectedTeamId: teamId })
      },
      
      loadTeamData: async (teamId) => {
        set({ isLoading: true, error: null })
        
        try {
          const { from, to } = get().dateRange
          const data = await api.getCalendar(teamId, from, to)
          
          // Map API response to store types
          const mappedMembers: TeamMember[] = data.members.map((m: any) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            role: m.role,
            // Convert skills from {id, code, name} to string codes
            skills: m.skills?.map((s: any) => typeof s === 'string' ? s : s.code) || [],
          }))
          
          const mappedEvents: CalendarEvent[] = data.events.map((e: any) => ({
            id: e.id,
            title: e.assignedUser ? `${e.assignedUser.firstName} ${e.assignedUser.lastName}` : 'Open Shift',
            start: e.startDateTime,
            end: e.endDateTime,
            backgroundColor: e.status === 'OPEN' ? '#f0ab00' : e.status === 'ASSIGNED' ? '#06c' : '#3e8635',
            borderColor: e.status === 'OPEN' ? '#c58c00' : e.status === 'ASSIGNED' ? '#004080' : '#1e4f18',
            extendedProps: {
              shiftId: e.id,
              shiftCode: e.shiftCode,
              status: e.status,
              assignedUserId: e.assignedUserId || null,
              requiredSkills: e.requiredSkills || [],
              version: e.version || 1,
            },
          }))
          
          set({
            teamName: data.meta.teamName,
            members: mappedMembers,
            events: mappedEvents,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load data',
            isLoading: false,
          })
        }
      },
      
      setDateRange: (from, to) => {
        set({ dateRange: { from, to } })
        const teamId = get().selectedTeamId
        if (teamId) {
          get().loadTeamData(teamId)
        }
      },
      
      setSelectedShift: (shift) => {
        set({ selectedShift: shift })
      },
      
      assignShift: async (shiftId, userId) => {
        try {
          await api.assignShift(shiftId, userId)
          // Refresh data
          const teamId = get().selectedTeamId
          if (teamId) {
            await get().loadTeamData(teamId)
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to assign shift',
          })
        }
      },
      
      unassignShift: async (shiftId) => {
        try {
          await api.unassignShift(shiftId)
          const teamId = get().selectedTeamId
          if (teamId) {
            await get().loadTeamData(teamId)
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to unassign shift',
          })
        }
      },
      
      updateShiftFromEvent: (event) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === event.id ? event : e
          ),
        }))
      },
      
      runOptimization: async () => {
        const { selectedTeamId, dateRange } = get()
        if (!selectedTeamId) return
        
        set({ isOptimizing: true, error: null, optimizationResult: null })
        
        try {
          const result = await api.autoOptimize(
            selectedTeamId,
            dateRange.from,
            dateRange.to
          )
          // Map result to expected type
          const mappedResult: OptimizationResult = {
            status: result.status,
            assignments: result.assignments,
            fitness: null,
            diagnostics: { relaxed: false },
          }
          set({ optimizationResult: mappedResult, isOptimizing: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Optimization failed',
            isOptimizing: false,
          })
        }
      },
      
      applyOptimization: async () => {
        const { optimizationResult } = get()
        if (!optimizationResult) return
        
        set({ isLoading: true })
        
        try {
          await api.applyOptimization(optimizationResult)
          set({ optimizationResult: null })
          
          // Refresh data
          const teamId = get().selectedTeamId
          if (teamId) {
            await get().loadTeamData(teamId)
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to apply optimization',
            isLoading: false,
          })
        }
      },
      
      clearOptimizationResult: () => {
        set({ optimizationResult: null })
      },
      
      handleShiftUpdate: (shift) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.extendedProps.shiftId === shift.id
              ? {
                  ...e,
                  title: shift.assignedUser
                    ? `${shift.assignedUser.firstName} ${shift.assignedUser.lastName}`
                    : 'Open Shift',
                  extendedProps: {
                    ...e.extendedProps,
                    status: shift.status,
                    assignedUserId: shift.assignedUserId,
                    version: shift.version,
                  },
                }
              : e
          ),
        }))
      },
    }),
    { name: 'roster-store' }
  )
)

