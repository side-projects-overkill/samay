// frontend/src/components/ShiftDetailModal.tsx
// Modal for viewing and editing shift details

import { useState } from 'react'
import type { Shift, TeamMember } from '../stores/rosterStore'
import { clsx } from 'clsx'

interface ShiftDetailModalProps {
  shift: Shift
  members: TeamMember[]
  onClose: () => void
  onAssign: (shiftId: string, userId: string) => Promise<void>
}

export function ShiftDetailModal({
  shift,
  members,
  onClose,
  onAssign,
}: ShiftDetailModalProps) {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  
  const handleAssign = async () => {
    if (!selectedMember) return
    
    setIsAssigning(true)
    try {
      await onAssign(shift.id, selectedMember)
      onClose()
    } catch (error) {
      console.error('Assignment failed:', error)
    } finally {
      setIsAssigning(false)
    }
  }
  
  // Filter eligible members based on skills
  const eligibleMembers = members.filter((m) => {
    const memberSkills = new Set(m.skills || [])
    return shift.requiredSkills.every((skill) => memberSkills.has(skill))
  })
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  const statusColors: Record<string, string> = {
    OPEN: 'bg-slate-100 text-slate-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Shift Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Status</span>
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium',
                statusColors[shift.status]
              )}
            >
              {shift.status}
            </span>
          </div>
          
          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Date</span>
              <span className="text-sm font-medium text-slate-900">
                {new Date(shift.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Time</span>
              <span className="text-sm font-medium text-slate-900">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </span>
            </div>
          </div>
          
          {/* Shift Code */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Shift Type</span>
            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
              {shift.shiftCode}
            </span>
          </div>
          
          {/* Required Skills */}
          {shift.requiredSkills.length > 0 && (
            <div>
              <span className="text-sm text-slate-500 block mb-2">
                Required Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {shift.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-samay-50 text-samay-700 text-xs font-medium rounded-lg"
                  >
                    {skill.replace('skill_', '')}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Assignment Section */}
          {shift.status === 'OPEN' && (
            <div className="pt-4 border-t border-slate-200">
              <label className="text-sm text-slate-500 block mb-2">
                Assign to Employee
              </label>
              
              {eligibleMembers.length > 0 ? (
                <>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-samay-500 focus:border-transparent"
                  >
                    <option value="">Select employee...</option>
                    {eligibleMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleAssign}
                    disabled={!selectedMember || isAssigning}
                    className="w-full mt-3 px-4 py-2 bg-samay-600 text-white rounded-lg
                               font-medium text-sm hover:bg-samay-700
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Shift'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  No eligible employees with required skills
                </p>
              )}
            </div>
          )}
          
          {/* Version Info (for debugging) */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400">
            ID: {shift.id} • Version: {shift.version}
          </div>
        </div>
      </div>
    </div>
  )
}

