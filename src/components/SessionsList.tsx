'use client'

import { Calendar, User, Target, Play, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

interface Session {
  id: string
  date: string
  focus: string
  description: string | null
  status: string
  sessionRPE: number | null
  athlete?: {
    id: string
    name: string | null
    email: string
  }
  coach?: {
    id: string
    name: string | null
    email: string
  }
  drills: Array<{
    id: string
    targetReps: number
    _count: {
      throwLogs: number
    }
  }>
  _count: {
    throwLogs: number
  }
}

interface SessionsListProps {
  sessions: Session[]
  userRole: string
}

const STATUS_COLORS = {
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export default function SessionsList({ sessions, userRole }: SessionsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getSessionProgress = (session: Session) => {
    const totalTargetReps = session.drills.reduce((sum, drill) => sum + drill.targetReps, 0)
    const completedReps = session._count.throwLogs
    return {
      completed: completedReps,
      total: totalTargetReps,
      percentage: totalTargetReps > 0 ? Math.round((completedReps / totalTargetReps) * 100) : 0
    }
  }

  const isUpcoming = (dateString: string) => {
    const sessionDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessionDate >= today
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {sessions.map((session) => {
          const progress = getSessionProgress(session)
          const upcoming = isUpcoming(session.date)

          return (
            <div key={session.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {session.focus}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]
                    }`}>
                      {STATUS_LABELS[session.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>
                        {userRole === 'COACH'
                          ? (session.athlete?.name || session.athlete?.email)
                          : (session.coach?.name || session.coach?.email)
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      <span>{session.drills.length} drills</span>
                    </div>
                  </div>

                  {session.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.completed} / {progress.total} throws</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    {session.sessionRPE && (
                      <div className="text-sm text-gray-600">
                        RPE: <span className="font-medium">{session.sessionRPE}/10</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-6">
                  <Link
                    href={`/dashboard/sessions/${session.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>

                  {/* Show different actions based on session status and user role */}
                  {session.status === 'PLANNED' && upcoming && userRole === 'ATHLETE' && (
                    <Link
                      href={`/dashboard/sessions/${session.id}/log`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Session
                    </Link>
                  )}

                  {session.status === 'IN_PROGRESS' && userRole === 'ATHLETE' && (
                    <Link
                      href={`/dashboard/sessions/${session.id}/log`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continue
                    </Link>
                  )}

                  {userRole === 'COACH' && session.status !== 'COMPLETED' && (
                    <Link
                      href={`/dashboard/sessions/${session.id}/edit`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}