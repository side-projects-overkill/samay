// frontend/src/pages/manager/RosterBuilderPage.tsx
// Manager roster builder with calendar view

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Zap,
  Save,
  RotateCcw,
  Plus,
  Users,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

interface ShiftEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    employeeId?: string;
    employeeName?: string;
    status: 'open' | 'assigned' | 'confirmed';
    shiftType: string;
  };
}

const initialEvents: ShiftEvent[] = [
  {
    id: '1',
    title: 'Alex Johnson',
    start: '2024-01-15T09:00:00',
    end: '2024-01-15T17:00:00',
    backgroundColor: '#10b981',
    borderColor: '#059669',
    extendedProps: { employeeId: 'e1', employeeName: 'Alex Johnson', status: 'confirmed', shiftType: 'morning' },
  },
  {
    id: '2',
    title: 'Maria Garcia',
    start: '2024-01-15T13:00:00',
    end: '2024-01-15T21:00:00',
    backgroundColor: '#10b981',
    borderColor: '#059669',
    extendedProps: { employeeId: 'e2', employeeName: 'Maria Garcia', status: 'confirmed', shiftType: 'afternoon' },
  },
  {
    id: '3',
    title: 'Open Shift',
    start: '2024-01-16T09:00:00',
    end: '2024-01-16T17:00:00',
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    extendedProps: { status: 'open', shiftType: 'morning' },
  },
  {
    id: '4',
    title: 'James Wilson',
    start: '2024-01-16T17:00:00',
    end: '2024-01-17T01:00:00',
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    extendedProps: { employeeId: 'e3', employeeName: 'James Wilson', status: 'assigned', shiftType: 'evening' },
  },
];

const teamMembers = [
  { id: 'e1', name: 'Alex Johnson', availability: 'available' },
  { id: 'e2', name: 'Maria Garcia', availability: 'available' },
  { id: 'e3', name: 'James Wilson', availability: 'limited' },
  { id: 'e4', name: 'Emily Chen', availability: 'available' },
  { id: 'e5', name: 'Michael Brown', availability: 'unavailable' },
];

export function RosterBuilderPage() {
  const [events, setEvents] = useState<ShiftEvent[]>(initialEvents);
  const [, setSelectedDate] = useState<Date | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
  };

  const handleEventDrop = (arg: { event: { id: string; start: Date | null; end: Date | null } }) => {
    if (!arg.event.start || !arg.event.end) return;
    
    setEvents(prev => prev.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...event,
          start: arg.event.start!.toISOString(),
          end: arg.event.end!.toISOString(),
        };
      }
      return event;
    }));
    setHasUnsavedChanges(true);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate API call to solver
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving roster:', events);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roster Builder</h1>
          <p className="text-slate-400 mt-1">Create and manage team schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEvents(initialEvents)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30"
          >
            <Zap className={clsx('w-4 h-4', isOptimizing && 'animate-pulse')} />
            {isOptimizing ? 'Optimizing...' : 'Auto-Optimize'}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              hasUnsavedChanges
                ? 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            Save Roster
          </button>
        </div>
      </div>

      {/* Alerts */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-400 text-sm">You have unsaved changes to the roster.</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="col-span-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <style>{`
            .fc {
              --fc-border-color: rgba(51, 65, 85, 0.5);
              --fc-today-bg-color: rgba(239, 68, 68, 0.1);
              --fc-page-bg-color: transparent;
              --fc-neutral-bg-color: transparent;
              --fc-list-event-hover-bg-color: rgba(51, 65, 85, 0.5);
            }
            .fc .fc-toolbar-title {
              color: white;
              font-size: 1.25rem;
            }
            .fc .fc-button {
              background-color: rgba(51, 65, 85, 0.5);
              border-color: rgba(51, 65, 85, 0.5);
              color: #94a3b8;
            }
            .fc .fc-button:hover {
              background-color: rgba(71, 85, 105, 0.5);
              border-color: rgba(71, 85, 105, 0.5);
              color: white;
            }
            .fc .fc-button-active {
              background-color: rgba(239, 68, 68, 0.2) !important;
              border-color: rgba(239, 68, 68, 0.3) !important;
              color: #f87171 !important;
            }
            .fc .fc-col-header-cell-cushion {
              color: #94a3b8;
              font-weight: 500;
            }
            .fc .fc-daygrid-day-number {
              color: #94a3b8;
            }
            .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
              color: #f87171;
            }
            .fc .fc-event {
              border-radius: 6px;
              font-size: 0.75rem;
              padding: 2px 4px;
            }
            .fc .fc-timegrid-slot-label-cushion {
              color: #64748b;
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            editable={true}
            droppable={true}
            dateClick={handleDateClick}
            eventDrop={handleEventDrop}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            allDaySlot={false}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Add Shift */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-red-400" />
              <h3 className="font-medium text-white">Add Shift</h3>
            </div>
            <button className="w-full py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30">
              Create New Shift
            </button>
          </div>

          {/* Team Members */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Team Members</h3>
            </div>
            <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  draggable
                  className="p-3 flex items-center justify-between cursor-grab hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-white">{member.name}</span>
                  </div>
                  <span className={clsx(
                    'w-2 h-2 rounded-full',
                    member.availability === 'available' && 'bg-emerald-400',
                    member.availability === 'limited' && 'bg-yellow-400',
                    member.availability === 'unavailable' && 'bg-red-400'
                  )} />
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="font-medium text-white mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-slate-400">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm text-slate-400">Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm text-slate-400">Open Shift</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

