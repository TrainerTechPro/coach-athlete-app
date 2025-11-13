import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Dumbbell, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function ExerciseLibrary() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const exercises = await prisma.exercise.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
            <p className="text-gray-600 mt-2">Browse and manage available exercises</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Dumbbell className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {exercise.name}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {exercise.description}
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Muscle Groups</h4>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscleGroups.map((group, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment</h4>
                  <div className="flex flex-wrap gap-1">
                    {exercise.equipment.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.instructions && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {exercise.instructions.split('\\n').map((instruction, index) => (
                        <div key={index} className="flex">
                          <span className="text-blue-600 mr-2">{index + 1}.</span>
                          <span>{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No exercises found</h3>
          <p className="mt-2 text-gray-500">
            The exercise library is empty. Add some exercises to get started.
          </p>
        </div>
      )}
    </div>
  )
}