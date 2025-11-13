'use client'

import { useState } from 'react'
import { Clock, Users, Dumbbell } from 'lucide-react'
import AssignWorkoutModal from './AssignWorkoutModal'

interface Exercise {
  id: string
  sets: number | null
  reps: number | null
  exercise: {
    name: string
  }
}

interface Assignment {
  id: string
  athlete: {
    name: string | null
  }
}

interface Workout {
  id: string
  name: string
  description: string | null
  duration: number | null
  exercises: Exercise[]
  assignments: Assignment[]
}

interface WorkoutGridProps {
  workouts: Workout[]
}

export default function WorkoutGrid({ workouts }: WorkoutGridProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const handleAssignClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsAssignModalOpen(true)
  }

  const handleAssignWorkout = async (assignment: { athleteIds: string[], dueDate?: string }) => {
    if (!selectedWorkout) return

    try {
      const response = await fetch('/api/workouts/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: selectedWorkout.id,
          athleteIds: assignment.athleteIds,
          dueDate: assignment.dueDate
        })
      })

      if (response.ok) {
        // Refresh the page to show updated assignments
        window.location.reload()
      } else {
        throw new Error('Failed to assign workout')
      }
    } catch (error) {
      throw error
    }
  }

  if (workouts.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {workout.name}
                </h3>
                {workout.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{workout.duration}min</span>
                  </div>
                )}
              </div>

              {workout.description && (
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {workout.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{workout.assignments.length} assignments</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Exercises:</h4>
                  <div className="space-y-1">
                    {workout.exercises.slice(0, 3).map((we) => (
                      <div key={we.id} className="text-xs text-gray-600">
                        • {we.exercise.name}
                        {we.sets && we.reps && (
                          <span className="text-gray-500 ml-1">
                            ({we.sets}x{we.reps})
                          </span>
                        )}
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{workout.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAssignClick(workout)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    Assign
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AssignWorkoutModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        workout={selectedWorkout ? { id: selectedWorkout.id, name: selectedWorkout.name } : undefined}
        onAssign={handleAssignWorkout}
      />
    </>
  )
}