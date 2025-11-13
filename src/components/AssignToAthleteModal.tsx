'use client'

import { useState, useEffect } from 'react'
import { X, Dumbbell, Calendar } from 'lucide-react'

interface Workout {
  id: string
  name: string
  description: string | null
  exercises: Array<{
    exercise: { name: string }
  }>
}

interface Athlete {
  id: string
  name: string | null
}

interface AssignToAthleteModalProps {
  isOpen: boolean
  onClose: () => void
  athlete?: Athlete
  onAssign: (assignment: { workoutId: string, dueDate?: string }) => Promise<void>
}

export default function AssignToAthleteModal({ isOpen, onClose, athlete, onAssign }: AssignToAthleteModalProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchWorkouts()
    }
  }, [isOpen])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data.workouts || [])
      }
    } catch (error) {
      console.error('Error fetching workouts:', error)
    }
  }

  const handleAssign = async () => {
    if (!selectedWorkout) {
      setError('Please select a workout')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onAssign({
        workoutId: selectedWorkout,
        dueDate: dueDate || undefined
      })
      onClose()
      setSelectedWorkout('')
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
            Assign Workout to Athlete
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {athlete && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Athlete</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-900 font-medium">{athlete.name || 'Unnamed Athlete'}</span>
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
              Select Workout
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {workouts.length > 0 ? (
                <div className="space-y-1 p-2">
                  {workouts.map((workout) => (
                    <label
                      key={workout.id}
                      className="flex items-start p-3 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="workout"
                        value={workout.id}
                        checked={selectedWorkout === workout.id}
                        onChange={(e) => setSelectedWorkout(e.target.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {workout.name}
                        </div>
                        {workout.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {workout.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {workout.exercises.length} exercises
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Dumbbell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No workouts found</p>
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
              disabled={loading || !selectedWorkout}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign Workout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}