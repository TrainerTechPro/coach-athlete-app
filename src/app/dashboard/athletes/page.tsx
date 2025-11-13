import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Users, UserPlus, Activity } from 'lucide-react'
import Link from 'next/link'
import AthleteGrid from '@/components/AthleteGrid'

export default async function AthletesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'COACH') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">Only coaches can access athlete management.</p>
      </div>
    )
  }

  // Get all athletes for this coach
  const coachAthletes = await prisma.athleteCoach.findMany({
    where: {
      coachId: session.user.id
    },
    include: {
      athlete: true
    }
  })

  // Get workout assignments for these athletes
  const athleteIds = coachAthletes.map(ac => ac.athlete.id)
  const workoutAssignments = await prisma.workoutAssignment.findMany({
    where: {
      athleteId: {
        in: athleteIds
      }
    },
    include: {
      workout: true
    }
  })

  const getAthleteStats = (athleteId: string) => {
    const assignments = workoutAssignments.filter(wa => wa.athleteId === athleteId)
    const completed = assignments.filter(wa => wa.completed).length
    const total = assignments.length
    return { completed, total, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  // Prepare athletes with stats for the client component
  const athletesWithStats = coachAthletes.map(({ athlete }) => {
    const stats = getAthleteStats(athlete.id)
    return {
      ...athlete,
      ...stats
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Athletes</h1>
            <p className="text-gray-600 mt-2">Manage your athletes and track their progress</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Athlete
            </button>
          </div>
        </div>
      </div>

      <AthleteGrid athletes={athletesWithStats} />

      {athletesWithStats.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white border border-blue-200 text-blue-900 py-3 px-4 rounded-lg hover:bg-blue-100 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              View All Progress
            </button>
            <button className="bg-white border border-blue-200 text-blue-900 py-3 px-4 rounded-lg hover:bg-blue-100 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Send Group Message
            </button>
            <button className="bg-white border border-blue-200 text-blue-900 py-3 px-4 rounded-lg hover:bg-blue-100 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite More Athletes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}