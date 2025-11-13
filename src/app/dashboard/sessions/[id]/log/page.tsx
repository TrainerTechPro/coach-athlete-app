import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SessionLogger from '@/components/SessionLogger'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SessionLogPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const resolvedParams = await params
  const trainingSession = await prisma.trainingSession.findUnique({
    where: {
      id: resolvedParams.id
    },
    include: {
      drills: {
        orderBy: {
          order: 'asc'
        },
        include: {
          throwLogs: {
            where: {
              athleteId: session.user.id
            },
            orderBy: {
              throwNumber: 'asc'
            }
          }
        }
      },
      athlete: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      coach: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!trainingSession) {
    notFound()
  }

  // Check permissions
  const canLog =
    trainingSession.athleteId === session.user.id || // Athlete can log their own sessions
    (session.user.role === 'COACH' && trainingSession.coachId === session.user.id) // Coach can log for their athletes

  if (!canLog) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to log this training session.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SessionLogger
        session={{
          ...trainingSession,
          date: trainingSession.date.toISOString(),
          drills: trainingSession.drills.map(drill => ({
            ...drill,
            throwLogs: drill.throwLogs.map(log => ({
              ...log,
              createdAt: log.createdAt.toISOString()
            }))
          }))
        }}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />
    </div>
  )
}