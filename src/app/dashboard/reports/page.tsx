import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReportingDashboard from '@/components/ReportingDashboard'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'COACH') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">Only coaches can access reporting dashboard.</p>
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

  // Get throw logs data for the last month
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const throwLogs = await prisma.throwLog.findMany({
    where: {
      createdAt: {
        gte: oneMonthAgo
      },
      athlete: {
        coaches: {
          some: {
            coachId: session.user.id
          }
        }
      }
    },
    include: {
      athlete: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      drill: {
        select: {
          drillType: true,
          implementWeight: true
        }
      },
      session: {
        select: {
          date: true,
          focus: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
        <p className="text-gray-600 mt-2">
          Analyze athlete performance trends and training data
        </p>
      </div>

      <ReportingDashboard
        athletes={athletes}
        throwLogs={throwLogs.map(log => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
          session: log.session ? {
            ...log.session,
            date: log.session.date.toISOString()
          } : log.session
        }))}
        coachId={session.user.id}
      />
    </div>
  )
}