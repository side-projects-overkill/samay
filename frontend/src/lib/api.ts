// frontend/src/lib/api.ts
// API client for backend communication

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    let message = `Request failed: ${response.statusText}`
    try {
      const parsed = JSON.parse(errorBody)
      message = parsed.message || message
    } catch {
      // Use default message
    }
    throw new ApiError(response.status, message)
  }
  
  return response.json()
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),
  
  // Teams
  getTeams: () => request<any[]>('/teams'),
  getTeam: (id: string) => request<any>(`/teams/${id}`),
  
  // Users
  getUsers: (teamId?: string) =>
    request<any[]>(`/users${teamId ? `?teamId=${teamId}` : ''}`),
  
  // Calendar
  getCalendar: (teamId: string, from: string, to: string) =>
    request<{
      events: any[]
      members: any[]
      meta: {
        teamId: string
        teamName: string
        from: string
        to: string
        totalShifts: number
        openShifts: number
        assignedShifts: number
      }
    }>(`/roster/calendar/${teamId}?from=${from}&to=${to}`),
  
  // Shifts
  getShifts: (params: {
    teamId?: string
    from?: string
    to?: string
    status?: string
  }) => {
    const query = new URLSearchParams()
    if (params.teamId) query.set('teamId', params.teamId)
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    if (params.status) query.set('status', params.status)
    return request<any[]>(`/roster/shifts?${query}`)
  },
  
  createShift: (data: {
    teamId: string
    date: string
    startTime: string
    endTime: string
    shiftCode: string
    durationHours: number
    requiredSkills?: string[]
  }) => request<any>('/roster/shifts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  assignShift: (shiftId: string, userId: string) =>
    request<any>(`/roster/shifts/${shiftId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  unassignShift: (shiftId: string) =>
    request<any>(`/roster/shifts/${shiftId}/unassign`, {
      method: 'POST',
    }),
  
  // Optimization
  optimize: (data: any) =>
    request<any>('/roster/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  autoOptimize: (teamId: string, from: string, to: string) =>
    request<any>(
      `/roster/optimize/auto?teamId=${teamId}&from=${from}&to=${to}`,
      { method: 'POST' }
    ),
  
  applyOptimization: (result: any) =>
    request<{ applied: number; failed: number }>('/roster/optimize/apply', {
      method: 'POST',
      body: JSON.stringify(result),
    }),
  
  // Availability
  getAvailability: (userId: string, from: string, to: string) =>
    request<any[]>(`/availability/user/${userId}?from=${from}&to=${to}`),
  
  setAvailability: (data: {
    userId: string
    startTime: string
    endTime: string
    type: string
    notes?: string
  }) =>
    request<any>('/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

