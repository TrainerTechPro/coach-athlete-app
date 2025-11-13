import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import AthleteDashboard from '@/components/dashboard/AthleteDashboard'
import Link from 'next/link'
import { Target, Plus, BarChart3 } from 'lucide-react'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null // This should be handled by the layout
  }

  return (
    <div>
      {/* Prominent Training Sessions Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🎯 Training Sessions & Throw Tracking
            </h2>
            <p className="text-blue-100 mb-4">
              {session.user.role === 'COACH'
                ? 'Create training sessions, track athlete performance, and analyze throwing data'
                : 'Log your throws, track RPE, and view your performance progress'
              }
            </p>
            <div className="flex space-x-3">
              <Link
                href="/dashboard/sessions"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 inline-flex items-center"
              >
                <Target className="w-4 h-4 mr-2" />
                View Training Sessions
              </Link>
              {session.user.role === 'COACH' && (
                <>
                  <Link
                    href="/dashboard/sessions/create"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Link>
                  <Link
                    href="/dashboard/reports"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 inline-flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <Target className="h-24 w-24 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Original Dashboard Content */}
      {session.user.role === 'COACH' ? (
        <CoachDashboard user={session.user} />
      ) : (
        <AthleteDashboard user={session.user} />
      )}
    </div>
  )
}