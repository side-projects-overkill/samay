// frontend/src/components/OptimizationPanel.tsx
// Panel showing optimization results and diagnostics

import { useRosterStore } from '../stores/rosterStore'
import { clsx } from 'clsx'

export function OptimizationPanel() {
  const {
    optimizationResult,
    applyOptimization,
    clearOptimizationResult,
    isLoading,
  } = useRosterStore()
  
  if (!optimizationResult) {
    return null
  }
  
  const { status, fitness, diagnostics, suggestions, assignments } = optimizationResult
  
  const isSuccessful = status === 'OPTIMAL' || status === 'FEASIBLE'
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div
          className={clsx(
            'px-6 py-4 text-white',
            isSuccessful
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-amber-500 to-orange-600'
          )}
        >
          <div className="flex items-center gap-3">
            {isSuccessful ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                Optimization {isSuccessful ? 'Complete' : 'Result'}
              </h3>
              <p className="text-sm opacity-90">Status: {status}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">
                {diagnostics?.totalShifts || 0}
              </div>
              <div className="text-xs text-slate-500">Total Shifts</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {diagnostics?.assignedShifts || assignments.length}
              </div>
              <div className="text-xs text-slate-500">Assigned</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-600">
                {diagnostics?.unfilledShifts || 0}
              </div>
              <div className="text-xs text-slate-500">Unfilled</div>
            </div>
          </div>
          
          {/* Fitness Score */}
          {fitness !== null && (
            <div className="flex items-center justify-between p-3 bg-samay-50 rounded-lg">
              <span className="text-sm text-samay-700 font-medium">
                Optimization Score
              </span>
              <span className="text-lg font-bold text-samay-800">{fitness}</span>
            </div>
          )}
          
          {/* Solve Time */}
          {diagnostics?.solveTimeMs && (
            <div className="text-sm text-slate-500 text-center">
              Solved in {diagnostics.solveTimeMs}ms
            </div>
          )}
          
          {/* Warnings/Issues */}
          {diagnostics?.minimalUnsat && diagnostics.minimalUnsat.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-800 mb-2">
                Constraint Issues
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {diagnostics.minimalUnsat.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Suggestions
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                {suggestions.map((suggestion, i) => (
                  <li key={i}>
                    <div className="font-medium">{suggestion.description}</div>
                    {suggestion.impact && (
                      <div className="text-xs text-blue-600 mt-0.5">
                        Impact: {suggestion.impact}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={clearOptimizationResult}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Dismiss
          </button>
          
          {isSuccessful && assignments.length > 0 && (
            <button
              onClick={applyOptimization}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-samay-600 text-white rounded-lg
                         hover:bg-samay-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {isLoading ? 'Applying...' : `Apply ${assignments.length} Assignments`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

