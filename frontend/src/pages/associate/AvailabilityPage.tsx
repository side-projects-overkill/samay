// frontend/src/pages/associate/AvailabilityPage.tsx
// Associate availability management page

import { useState } from 'react';
import { Calendar, Check, X, Clock, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

type AvailabilityStatus = 'available' | 'unavailable' | 'preferred' | 'unset';

interface DayAvailability {
  date: string;
  morning: AvailabilityStatus;
  afternoon: AvailabilityStatus;
  evening: AvailabilityStatus;
}

const timeSlots = [
  { key: 'morning', label: 'Morning', time: '6:00 - 12:00' },
  { key: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00' },
  { key: 'evening', label: 'Evening', time: '18:00 - 24:00' },
] as const;

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Generate demo data for current week
const generateWeekData = (startDate: Date): DayAvailability[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      morning: 'unset' as AvailabilityStatus,
      afternoon: 'unset' as AvailabilityStatus,
      evening: 'unset' as AvailabilityStatus,
    };
  });
};

export function AvailabilityPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [weekData, setWeekData] = useState<DayAvailability[]>(() => 
    generateWeekData(currentWeekStart)
  );

  const [hasChanges, setHasChanges] = useState(false);

  const cycleStatus = (current: AvailabilityStatus): AvailabilityStatus => {
    const order: AvailabilityStatus[] = ['unset', 'available', 'preferred', 'unavailable'];
    const currentIndex = order.indexOf(current);
    return order[(currentIndex + 1) % order.length];
  };

  const handleSlotClick = (dayIndex: number, slotKey: 'morning' | 'afternoon' | 'evening') => {
    setWeekData((prev) => {
      const newData = [...prev];
      newData[dayIndex] = {
        ...newData[dayIndex],
        [slotKey]: cycleStatus(newData[dayIndex][slotKey]),
      };
      return newData;
    });
    setHasChanges(true);
  };

  const getStatusStyles = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'preferred':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'unavailable':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-slate-700/30 border-slate-600/50 text-slate-500';
    }
  };

  const getStatusIcon = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available':
        return <Check className="w-4 h-4" />;
      case 'preferred':
        return <Clock className="w-4 h-4" />;
      case 'unavailable':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
    setWeekData(generateWeekData(newStart));
    setHasChanges(false);
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;
  };

  const handleSave = () => {
    // TODO: Implement API call
    console.log('Saving availability:', weekData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Availability</h1>
          <p className="text-slate-400 mt-1">Set your available hours for scheduling</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            hasChanges
              ? 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/25'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          )}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <p className="text-sm text-slate-400 mb-3">Click on a slot to cycle through statuses:</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-700/30 border border-slate-600/50 rounded flex items-center justify-center"></div>
            <span className="text-sm text-slate-400">Unset</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-sm text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded flex items-center justify-center">
              <Clock className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">Preferred</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500/20 border border-red-500/50 rounded flex items-center justify-center">
              <X className="w-3 h-3 text-red-400" />
            </div>
            <span className="text-sm text-slate-400">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-red-400" />
          <span className="text-lg font-medium text-white">{formatWeekRange()}</span>
        </div>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Availability Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-8 divide-x divide-slate-700/50">
          {/* Time slot labels column */}
          <div className="divide-y divide-slate-700/50">
            <div className="h-16 bg-slate-700/30"></div>
            {timeSlots.map((slot) => (
              <div key={slot.key} className="h-24 p-3 flex flex-col justify-center">
                <p className="text-sm font-medium text-white">{slot.label}</p>
                <p className="text-xs text-slate-400">{slot.time}</p>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekData.map((day, dayIndex) => {
            const date = new Date(day.date);
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <div key={day.date} className="divide-y divide-slate-700/50">
                {/* Day header */}
                <div className={clsx(
                  'h-16 p-3 flex flex-col items-center justify-center',
                  isToday ? 'bg-red-500/10' : 'bg-slate-700/30'
                )}>
                  <p className={clsx(
                    'text-xs',
                    isToday ? 'text-red-400' : 'text-slate-400'
                  )}>
                    {weekDays[dayIndex]}
                  </p>
                  <p className={clsx(
                    'text-lg font-bold',
                    isToday ? 'text-red-400' : 'text-white'
                  )}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Time slots */}
                {timeSlots.map((slot) => (
                  <button
                    key={`${day.date}-${slot.key}`}
                    onClick={() => handleSlotClick(dayIndex, slot.key)}
                    className={clsx(
                      'h-24 w-full flex items-center justify-center border-2 transition-all hover:scale-105',
                      getStatusStyles(day[slot.key])
                    )}
                  >
                    {getStatusIcon(day[slot.key])}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {weekData.reduce((acc, day) => 
                acc + Object.values(day).filter(v => v === 'available').length, 0
              )}
            </p>
            <p className="text-sm text-slate-400">Available Slots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {weekData.reduce((acc, day) => 
                acc + Object.values(day).filter(v => v === 'preferred').length, 0
              )}
            </p>
            <p className="text-sm text-slate-400">Preferred Slots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {weekData.reduce((acc, day) => 
                acc + Object.values(day).filter(v => v === 'unavailable').length, 0
              )}
            </p>
            <p className="text-sm text-slate-400">Unavailable Slots</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-400">
              {weekData.reduce((acc, day) => 
                acc + Object.values(day).filter(v => v === 'unset').length - 1, 0
              )}
            </p>
            <p className="text-sm text-slate-400">Unset Slots</p>
          </div>
        </div>
      </div>
    </div>
  );
}

