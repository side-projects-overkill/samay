// frontend/src/components/RosterBuilder.tsx
// Main calendar component with drag-drop scheduling

import { useRef, useEffect, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import type { EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core'
import { useRosterStore, type TeamMember, type CalendarEvent } from '../stores/rosterStore'
import { OptimizationPanel } from './OptimizationPanel'
import { ShiftDetailModal } from './ShiftDetailModal'

// Client-side validation for shift assignment
function canAssignEmployee(
  employee: TeamMember,
  event: CalendarEvent
): { valid: boolean; reason?: string } {
  const requiredSkills = event.extendedProps.requiredSkills || []
  
  // Check skill requirements
  const employeeSkills = new Set(employee.skills || [])
  const missingSkills = requiredSkills.filter(skill => !employeeSkills.has(skill))
  
  if (missingSkills.length > 0) {
    return {
      valid: false,
      reason: `Missing skills: ${missingSkills.join(', ')}`,
    }
  }
  
  return { valid: true }
}

export function RosterBuilder() {
  const calendarRef = useRef<FullCalendar>(null)
  const draggableRef = useRef<HTMLDivElement>(null)
  
  const {
    events,
    members,
    dateRange,
    selectedShift,
    assignShift,
    setSelectedShift,
    isOptimizing,
    optimizationResult,
  } = useRosterStore()
  
  // Initialize draggable elements
  useEffect(() => {
    if (!draggableRef.current) return
    
    const draggable = new Draggable(draggableRef.current, {
      itemSelector: '.external-event',
      eventData: (eventEl) => {
        const memberId = eventEl.dataset.memberId
        const memberName = eventEl.dataset.memberName
        return {
          title: memberName,
          memberId,
          create: false, // Don't create event on drop, we handle it manually
        }
      },
    })
    
    return () => {
      draggable.destroy()
    }
  }, [members])
  
  // Handle event click - show details
  const handleEventClick = useCallback((info: EventClickArg) => {
    const { shiftId, status, assignedUserId, requiredSkills, version } = info.event.extendedProps
    
    setSelectedShift({
      id: shiftId,
      version,
      teamId: '',
      date: info.event.startStr.split('T')[0],
      startTime: info.event.start?.toTimeString().slice(0, 5) || '',
      endTime: info.event.end?.toTimeString().slice(0, 5) || '',
      startDateTime: info.event.startStr,
      endDateTime: info.event.endStr || '',
      shiftCode: info.event.extendedProps.shiftCode,
      durationHours: 0,
      status,
      requiredSkills,
      assignedUserId,
    })
  }, [setSelectedShift])
  
  // Handle external drop (drag employee onto calendar)
  const handleEventReceive = useCallback(async (info: any) => {
    const memberId = info.draggedEl.dataset.memberId
    const droppedOnEvent = info.event
    
    // Find the event that was dropped on
    const calendarApi = calendarRef.current?.getApi()
    if (!calendarApi) return
    
    // Find open shift at the drop location
    const droppedTime = info.event.start
    const targetEvent = events.find((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      return (
        droppedTime >= start &&
        droppedTime < end &&
        e.extendedProps.status === 'OPEN'
      )
    })
    
    if (targetEvent) {
      // Validate assignment
      const member = members.find((m) => m.id === memberId)
      if (member) {
        const validation = canAssignEmployee(member, targetEvent)
        if (!validation.valid) {
          alert(`Cannot assign: ${validation.reason}`)
          info.revert()
          return
        }
        
        // Perform assignment
        await assignShift(targetEvent.extendedProps.shiftId, memberId)
      }
    }
    
    // Remove the temporary event created by drop
    info.event.remove()
  }, [events, members, assignShift])
  
  // Handle event drop (move existing event)
  const handleEventDrop = useCallback((info: EventDropArg) => {
    // For now, prevent moving assigned shifts
    // Could implement shift time changes here
    info.revert()
  }, [])
  
  // Event allow callback for client-side validation
  const eventAllow = useCallback((dropInfo: any, draggedEvent: any) => {
    // Only allow dropping on open shifts
    if (draggedEvent.extendedProps?.status !== 'OPEN') {
      return false
    }
    return true
  }, [])
  
  return (
    <div className="flex gap-6">
      {/* External draggable events - Team Members */}
      <div
        ref={draggableRef}
        className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4"
      >
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
          Team Members
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Drag to assign to open shifts
        </p>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="external-event"
              data-member-id={member.id}
              data-member-name={`${member.firstName} ${member.lastName}`}
            >
              <div className="font-medium">
                {member.firstName} {member.lastName}
              </div>
              <div className="text-xs text-samay-600 mt-0.5">
                {member.skills?.slice(0, 2).map(s => s.replace('skill_', '')).join(', ')}
                {member.skills?.length > 2 && ` +${member.skills.length - 2}`}
              </div>
            </div>
          ))}
          
          {members.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              No team members found
            </p>
          )}
        </div>
      </div>
      
      {/* Calendar */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialDate={dateRange.from}
          events={events}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          nowIndicator={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventReceive={handleEventReceive}
          eventAllow={eventAllow}
          eventClassNames={(arg) => {
            const status = arg.event.extendedProps.status?.toLowerCase()
            return [`fc-event-${status || 'open'}`]
          }}
          height="auto"
        />
      </div>
      
      {/* Optimization Panel */}
      <OptimizationPanel />
      
      {/* Shift Detail Modal */}
      {selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          members={members}
          onClose={() => setSelectedShift(null)}
          onAssign={assignShift}
        />
      )}
    </div>
  )
}

