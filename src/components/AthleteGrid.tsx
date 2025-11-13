'use client'

import { useState } from 'react'
import { Users, UserPlus } from 'lucide-react'
import AssignToAthleteModal from './AssignToAthleteModal'

interface Athlete {
  id: string
  name: string | null
  email: string
}

interface AthleteWithStats extends Athlete {
  completionRate: number
  completed: number
  total: number
}

interface AthleteGridProps {
  athletes: AthleteWithStats[]
}

export default function AthleteGrid({ athletes }: AthleteGridProps) {
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteWithStats | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const handleAssignClick = (athlete: AthleteWithStats) => {
    setSelectedAthlete(athlete)
    setIsAssignModalOpen(true)
  }

  const handleAssignWorkout = async (assignment: { workoutId: string, dueDate?: string }) => {
    if (!selectedAthlete) return

    try {
      const response = await fetch('/api/workouts/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: assignment.workoutId,
          athleteIds: [selectedAthlete.id],
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

  if (athletes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Athletes Yet</h3>
        <p className="text-gray-500 mb-6">
          Start building your team by inviting athletes to join your program.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Your First Athlete
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {athlete.name || 'Unnamed Athlete'}
                  </h3>
                  <p className="text-sm text-gray-600">{athlete.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {athlete.completionRate}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${athlete.completionRate}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{athlete.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{athlete.total}</div>
                    <div className="text-xs text-gray-600">Assigned</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAssignClick(athlete)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    Assign Workout
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AssignToAthleteModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        athlete={selectedAthlete ? { id: selectedAthlete.id, name: selectedAthlete.name } : undefined}
        onAssign={handleAssignWorkout}
      />
    </>
  )
}