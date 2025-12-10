// frontend/src/components/Header.tsx
// Application header with branding and actions

import { useRosterStore } from '../stores/rosterStore'

export function Header() {
  const { teamName, isOptimizing, runOptimization } = useRosterStore()
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-samay-500 to-samay-700 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Samay</h1>
            <p className="text-xs text-slate-500">Workforce Scheduling</p>
          </div>
        </div>
        
        {/* Team Info */}
        {teamName && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{teamName}</p>
              <p className="text-xs text-slate-500">Active Team</p>
            </div>
            
            {/* Optimize Button */}
            <button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="flex items-center gap-2 bg-gradient-to-r from-samay-500 to-samay-600 
                         text-white px-4 py-2 rounded-lg font-medium text-sm
                         hover:from-samay-600 hover:to-samay-700 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-sm hover:shadow"
            >
              {isOptimizing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Optimizing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Auto-Optimize
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

