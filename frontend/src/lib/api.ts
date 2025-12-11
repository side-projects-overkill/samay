// frontend/src/lib/api.ts
// API client for backend communication with authentication

import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth token from store
function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, logout
      useAuthStore.getState().logout();
    }
    
    const errorBody = await response.text();
    let message = `Request failed: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || message;
    } catch {
      // Use default message
    }
    throw new ApiError(response.status, message);
  }
  
  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  
  return JSON.parse(text);
}

// Types for API responses
export interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  memberCount?: number;
  settings?: Record<string, unknown>;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  teamId?: string;
  team?: TeamResponse;
  managerId?: string;
  manager?: UserResponse;
  skills?: Array<{ id: string; code: string; name: string }>;
  shiftPreferences?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftResponse {
  id: string;
  teamId: string;
  date: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  shiftCode: string;
  durationHours: number;
  status: 'OPEN' | 'ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requiredSkills: string[];
  assignedUserId?: string;
  assignedUser?: UserResponse;
  notes?: string;
}

export interface AvailabilityResponse {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  type: 'PREFERRED' | 'NEUTRAL' | 'AVOIDED' | 'BLACKOUT';
  notes?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeTeams: number;
  managers: number;
  associates: number;
  unassignedUsers: number;
  shiftsThisWeek: number;
  openShifts: number;
  pendingRequests: number;
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),
  
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: UserResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  // Teams
  getTeams: () => request<TeamResponse[]>('/teams'),
  getTeam: (id: string) => request<TeamResponse>(`/teams/${id}`),
  createTeam: (data: { name: string; description?: string }) =>
    request<TeamResponse>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTeam: (id: string, data: Partial<TeamResponse>) =>
    request<TeamResponse>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Users
  getUsers: (params?: { teamId?: string; role?: string; isActive?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.teamId) query.set('teamId', params.teamId);
    if (params?.role) query.set('role', params.role);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    const queryStr = query.toString();
    return request<UserResponse[]>(`/users${queryStr ? `?${queryStr}` : ''}`);
  },
  getUser: (id: string) => request<UserResponse>(`/users/${id}`),
  createUser: (data: {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    teamId?: string;
    managerId?: string;
  }) =>
    request<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<UserResponse>) =>
    request<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
  promoteToManager: (id: string, teamId?: string) =>
    request<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role: 'manager', teamId }),
    }),
  
  // Calendar
  getCalendar: (teamId: string, from: string, to: string) =>
    request<{
      events: ShiftResponse[];
      members: UserResponse[];
      meta: {
        teamId: string;
        teamName: string;
        from: string;
        to: string;
        totalShifts: number;
        openShifts: number;
        assignedShifts: number;
      };
    }>(`/roster/calendar/${teamId}?from=${from}&to=${to}`),
  
  // Shifts
  getShifts: (params: {
    teamId?: string;
    from?: string;
    to?: string;
    status?: string;
    userId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.teamId) query.set('teamId', params.teamId);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.status) query.set('status', params.status);
    if (params.userId) query.set('userId', params.userId);
    return request<ShiftResponse[]>(`/roster/shifts?${query}`);
  },
  
  getMyShifts: (from: string, to: string) =>
    request<ShiftResponse[]>(`/roster/my-shifts?from=${from}&to=${to}`),
  
  createShift: (data: {
    teamId: string;
    date: string;
    startTime: string;
    endTime: string;
    shiftCode: string;
    durationHours: number;
    requiredSkills?: string[];
  }) => request<ShiftResponse>('/roster/shifts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  assignShift: (shiftId: string, userId: string) =>
    request<ShiftResponse>(`/roster/shifts/${shiftId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  unassignShift: (shiftId: string) =>
    request<ShiftResponse>(`/roster/shifts/${shiftId}/unassign`, {
      method: 'POST',
    }),
  
  confirmShift: (shiftId: string) =>
    request<ShiftResponse>(`/roster/shifts/${shiftId}/confirm`, {
      method: 'POST',
    }),
  
  // Optimization
  optimize: (data: {
    teamId: string;
    dateFrom: string;
    dateTo: string;
    employees: Array<{
      id: string;
      skills: string[];
      availability: Array<{
        start: string;
        end: string;
        type: string;
      }>;
      preferences: Record<string, number>;
    }>;
    openShifts: Array<{
      id: string;
      day: string;
      shiftCode: string;
      requiredSkills: string[];
      durationHours: number;
    }>;
    settings?: {
      unassignedPenalty?: number;
      weights?: {
        preferred?: number;
        neutral?: number;
        avoided?: number;
      };
    };
  }) =>
    request<{
      status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
      assignments: Array<{
        shiftId: string;
        employeeId: string;
        start: string;
        end: string;
      }>;
      fitness: number;
      diagnostics: {
        relaxed: boolean;
        unsatCore: string[] | null;
      };
    }>('/roster/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  autoOptimize: (teamId: string, from: string, to: string) =>
    request<{
      status: string;
      assignments: Array<{
        shiftId: string;
        employeeId: string;
      }>;
    }>(
      `/roster/optimize/auto?teamId=${teamId}&from=${from}&to=${to}`,
      { method: 'POST' }
    ),
  
  applyOptimization: (result: { assignments: Array<{ shiftId: string; employeeId: string }> }) =>
    request<{ applied: number; failed: number }>('/roster/optimize/apply', {
      method: 'POST',
      body: JSON.stringify(result),
    }),
  
  // Availability
  getAvailability: (userId: string, from: string, to: string) =>
    request<AvailabilityResponse[]>(`/availability/user/${userId}?from=${from}&to=${to}`),
  
  getMyAvailability: (from: string, to: string) =>
    request<AvailabilityResponse[]>(`/availability/me?from=${from}&to=${to}`),
  
  setAvailability: (data: {
    userId: string;
    startTime: string;
    endTime: string;
    type: string;
    notes?: string;
  }) =>
    request<AvailabilityResponse>('/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteAvailability: (id: string) =>
    request<void>(`/availability/${id}`, { method: 'DELETE' }),
  
  // Skills
  getSkills: () =>
    request<Array<{ id: string; code: string; name: string; description?: string }>>('/skills'),
  
  // Dashboard Stats (computed)
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const [users, teams] = await Promise.all([
        api.getUsers(),
        api.getTeams(),
      ]);
      
      return {
        totalUsers: users.length,
        activeTeams: teams.filter(t => t.isActive).length,
        managers: users.filter(u => u.role === 'manager').length,
        associates: users.filter(u => u.role === 'employee').length,
        unassignedUsers: users.filter(u => !u.teamId).length,
        shiftsThisWeek: 0, // Would need shifts endpoint
        openShifts: 0,
        pendingRequests: 0,
      };
    } catch {
      return {
        totalUsers: 0,
        activeTeams: 0,
        managers: 0,
        associates: 0,
        unassignedUsers: 0,
        shiftsThisWeek: 0,
        openShifts: 0,
        pendingRequests: 0,
      };
    }
  },
};

export { ApiError };
