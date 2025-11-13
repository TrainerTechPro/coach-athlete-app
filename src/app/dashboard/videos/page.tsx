import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Video, Plus, Calendar, User, Play } from 'lucide-react'
import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'

export default async function VideosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Fetch videos based on user role
  let videos
  if (session.user.role === 'COACH') {
    // Coach sees all videos from their athletes
    const athleteIds = await prisma.athleteCoach.findMany({
      where: { coachId: session.user.id },
      select: { athleteId: true }
    }).then(results => results.map(r => r.athleteId))

    videos = await prisma.video.findMany({
      where: {
        OR: [
          { coachId: session.user.id }, // Videos uploaded by coach
          { athleteId: { in: athleteIds } }, // Videos from coach's athletes
        ]
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        analyses: {
          select: {
            id: true,
            timestamp: true,
          }
        },
        _count: {
          select: {
            analyses: true,
            comparisons: true,
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
  } else {
    // Athlete sees only their videos
    videos = await prisma.video.findMany({
      where: {
        athleteId: session.user.id
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        analyses: {
          select: {
            id: true,
            timestamp: true,
          }
        },
        _count: {
          select: {
            analyses: true,
            comparisons: true,
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Analysis</h1>
            <p className="text-gray-600 mt-2">
              {session.user.role === 'COACH'
                ? 'Manage and analyze athlete performance videos'
                : 'View your performance videos and coach feedback'
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
            <Link
              href="/dashboard/videos/compare"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Compare Videos
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Videos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{videos.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Analyzed Videos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {videos.filter(v => v._count.analyses > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Week
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {videos.filter(v => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(v.uploadedAt) > weekAgo
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {session.user.role === 'COACH' ? 'Athletes' : 'Event Types'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {session.user.role === 'COACH'
                      ? new Set(videos.map(v => v.athleteId)).size
                      : new Set(videos.map(v => v.eventType)).size
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoGrid videos={videos} currentUserId={session.user.id} userRole={session.user.role} />

      {videos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Yet</h3>
          <p className="text-gray-500 mb-6">
            {session.user.role === 'COACH'
              ? 'Start by uploading performance videos for your athletes.'
              : 'Upload your first performance video to get started with analysis.'
            }
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/videos/upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload Video
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}