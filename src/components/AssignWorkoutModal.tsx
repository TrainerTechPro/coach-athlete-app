'use client'

import { useState, useEffect } from 'react'
import { X, Users, Calendar } from 'lucide-react'

interface Athlete {
  id: string
  name: string | null
  email: string
}

interface Workout {
  id: string
  name: string
}

interface AssignWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  workout?: Workout
  onAssign: (assignments: { athleteIds: string[], dueDate?: string }) => Promise<void>
}

export default function AssignWorkoutModal({ isOpen, onClose, workout, onAssign }: AssignWorkoutModalProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchAthletes()
    }
  }, [isOpen])

  const fetchAthletes = async () => {
    try {
      const response = await fetch('/api/athletes')
      if (response.ok) {
        const data = await response.json()
        setAthletes(data.athletes || [])
      }
    } catch (error) {
      console.error('Error fetching athletes:', error)
    }
  }

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthletes(prev =>
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    )
  }

  const handleAssign = async () => {
    if (selectedAthletes.length === 0) {
      setError('Please select at least one athlete')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onAssign({
        athleteIds: selectedAthletes,
        dueDate: dueDate || undefined
      })
      onClose()
      setSelectedAthletes([])
      setDueDate('')
    } catch (error) {
      setError('Failed to assign workout')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Workout
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {workout && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Workout</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-900 font-medium">{workout.name}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Select Athletes
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {athletes.length > 0 ? (
                <div className="space-y-1 p-2">
                  {athletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(athlete.id)}
                        onChange={() => handleAthleteToggle(athlete.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {athlete.name || 'Unnamed Athlete'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {athlete.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No athletes found</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={loading || selectedAthletes.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : `Assign to ${selectedAthletes.length} athlete${selectedAthletes.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}