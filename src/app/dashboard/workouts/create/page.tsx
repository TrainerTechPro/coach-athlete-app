'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Exercise {
  id: string
  name: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  restTime?: number
}

export default function CreateWorkout() {
  const router = useRouter()
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  // Sample exercises from our seeded data
  const availableExercises = [
    { id: 'push-ups', name: 'Push-ups' },
    { id: 'squats', name: 'Squats' },
    { id: 'planks', name: 'Planks' },
    { id: 'burpees', name: 'Burpees' },
  ]

  const addExercise = (exerciseId: string, exerciseName: string) => {
    const newExercise: Exercise = {
      id: exerciseId + '-' + Date.now(),
      name: exerciseName,
      sets: 3,
      reps: 10,
      restTime: 60
    }
    setExercises([...exercises, newExercise])
  }

  const updateExercise = (index: number, field: string, value: string | number) => {
    const updated = exercises.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    )
    setExercises(updated)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/workouts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workoutName,
          description: workoutDescription,
          exercises: exercises
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert('Failed to create workout')
      }
    } catch (error) {
      alert('Error creating workout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Workout</h1>
        <p className="text-gray-600 mt-2">Design a custom workout for your athletes</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Workout Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Upper Body Strength"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the workout goals and focus..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Exercises</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {availableExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => addExercise(exercise.id, exercise.name)}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 text-blue-600" />
              {exercise.name}
            </button>
          ))}
        </div>

        {exercises.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Workout Exercises</h3>
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{exercise.name}</h4>
                  <button
                    onClick={() => removeExercise(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sets</label>
                    <input
                      type="number"
                      value={exercise.sets || ''}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Reps</label>
                    <input
                      type="number"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weight (lbs)</label>
                    <input
                      type="number"
                      value={exercise.weight || ''}
                      onChange={(e) => updateExercise(index, 'weight', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Rest (sec)</label>
                    <input
                      type="number"
                      value={exercise.restTime || ''}
                      onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/dashboard"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={saveWorkout}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Workout'}
        </button>
      </div>
    </div>
  )
}