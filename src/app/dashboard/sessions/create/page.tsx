import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'
import SessionBuilder from '@/components/SessionBuilder'

export default async function CreateSessionPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'COACH') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">Only coaches can create training sessions.</p>
      </div>
    )
  }

  // Get all athletes for this coach
  const coachAthletes = await prisma.athleteCoach.findMany({
    where: {
      coachId: session.user.id
    },
    include: {
      athlete: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  const athletes = coachAthletes.map(ac => ac.athlete)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Training Session</h1>
        <p className="text-gray-600 mt-2">
          Plan a comprehensive training session with drills and target metrics.
        </p>
      </div>

      {athletes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Athletes Assigned</h3>
          <p className="text-gray-500 mb-6">
            You need to have athletes assigned to create training sessions.
          </p>
        </div>
      ) : (
        <SessionBuilder
          athletes={athletes}
          coachId={session.user.id}
        />
      )}
    </div>
  )
}