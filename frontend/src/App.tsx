// frontend/src/App.tsx
// Main application component

import { useEffect } from 'react'
import { RosterBuilder } from './components/RosterBuilder'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { useRosterStore } from './stores/rosterStore'
import { useSocketConnection } from './hooks/useSocketConnection'

function App() {
  const { loadTeamData, selectedTeamId, isLoading, error } = useRosterStore()
  
  // Connect to WebSocket for real-time updates
  useSocketConnection(selectedTeamId)
  
  // Load initial data
  useEffect(() => {
    if (selectedTeamId) {
      loadTeamData(selectedTeamId)
    }
  }, [selectedTeamId, loadTeamData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-12 loading-shimmer rounded-lg" />
              <div className="h-96 loading-shimmer rounded-lg" />
            </div>
          ) : (
            <RosterBuilder />
          )}
        </main>
      </div>
    </div>
  )
}

export default App

