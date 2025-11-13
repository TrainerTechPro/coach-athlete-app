import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Plus, Users, Target, Activity, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import SessionsList from '@/components/SessionsList'

export default async function SessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  let sessions
  if (session.user.role === 'COACH') {
    // Coach sees sessions they created
    sessions = await prisma.trainingSession.findMany({
      where: {
        coachId: session.user.id
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        drills: {
          select: {
            id: true,
            targetReps: true,
            _count: {
              select: {
                throwLogs: true
              }
            }
          }
        },
        _count: {
          select: {
            throwLogs: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
  } else {
    // Athlete sees sessions assigned to them
    sessions = await prisma.trainingSession.findMany({
      where: {
        athleteId: session.user.id
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        drills: {
          select: {
            id: true,
            targetReps: true,
            _count: {
              select: {
                throwLogs: true
              }
            }
          }
        },
        _count: {
          select: {
            throwLogs: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
  }

  // Calculate summary stats
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
  const upcomingSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const today = new Date()
    return sessionDate >= today && s.status === 'PLANNED'
  }).length

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Sessions</h1>
            <p className="text-gray-600 mt-2">
              {session.user.role === 'COACH'
                ? 'Manage and track training sessions for your athletes'
                : 'View your training sessions and log your throws'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            {session.user.role === 'COACH' && (
              <>
                <Link
                  href="/dashboard/reports"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Link>
                <Link
                  href="/dashboard/sessions/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{totalSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{completedSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{upcomingSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SessionsList
        sessions={sessions.map(s => ({
          ...s,
          date: s.date.toISOString()
        }))}
        userRole={session.user.role}
      />

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Sessions</h3>
          <p className="text-gray-500 mb-6">
            {session.user.role === 'COACH'
              ? 'Create your first training session to start planning workouts.'
              : 'No training sessions have been assigned to you yet.'
            }
          </p>
          {session.user.role === 'COACH' && (
            <Link
              href="/dashboard/sessions/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Session
            </Link>
          )}
        </div>
      )}
    </div>
  )
}