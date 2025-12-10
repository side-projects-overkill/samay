// frontend/src/hooks/useSocketConnection.ts
// WebSocket hook for real-time roster updates

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRosterStore } from '../stores/rosterStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000'

interface RosterUpdateEvent {
  type: 'shift_assigned' | 'shift_unassigned' | 'shift_updated' | 'optimization_complete'
  teamId: string
  data: any
}

export function useSocketConnection(teamId: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const handleShiftUpdate = useRosterStore((state) => state.handleShiftUpdate)
  const loadTeamData = useRosterStore((state) => state.loadTeamData)
  
  const handleRosterUpdate = useCallback((event: RosterUpdateEvent) => {
    console.log('Roster update received:', event)
    
    switch (event.type) {
      case 'shift_assigned':
      case 'shift_unassigned':
      case 'shift_updated':
        // Refresh data to get latest state
        if (teamId) {
          loadTeamData(teamId)
        }
        break
        
      case 'optimization_complete':
        // Show notification
        console.log('Optimization complete:', event.data)
        if (teamId) {
          loadTeamData(teamId)
        }
        break
    }
  }, [teamId, loadTeamData])
  
  useEffect(() => {
    if (!teamId) return
    
    // Connect to WebSocket
    const socket = io(`${WS_URL}/roster`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    
    socketRef.current = socket
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      
      // Join team room
      socket.emit('join_team', { teamId })
    })
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })
    
    socket.on('roster_update', handleRosterUpdate)
    
    socket.on('joined', (data) => {
      console.log('Joined room:', data.room)
    })
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    
    // Cleanup
    return () => {
      if (socket.connected) {
        socket.emit('leave_team', { teamId })
      }
      socket.disconnect()
      socketRef.current = null
    }
  }, [teamId, handleRosterUpdate])
  
  return socketRef.current
}

