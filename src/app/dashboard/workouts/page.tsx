import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Clock, Users, Plus, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import WorkoutGrid from '@/components/WorkoutGrid'

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const workouts = await prisma.workout.findMany({
    where: {
      createdBy: session.user.id
    },
    include: {
      exercises: {
        include: {
          exercise: true
        }
      },
      assignments: {
        include: {
          athlete: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
            <p className="text-gray-600 mt-2">Manage and assign your workout programs</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/workouts/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workout
            </Link>
          </div>
        </div>
      </div>

      <WorkoutGrid workouts={workouts} />

      {workouts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workouts Yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first workout to start building effective training programs.
          </p>
          <Link
            href="/dashboard/workouts/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Workout
          </Link>
        </div>
      )}
    </div>
  )
}