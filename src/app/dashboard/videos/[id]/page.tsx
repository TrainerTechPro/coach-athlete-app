import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VideoAnalysisPlayer from '@/components/VideoAnalysisPlayer'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VideoAnalysisPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const resolvedParams = await params
  const video = await prisma.video.findUnique({
    where: {
      id: resolvedParams.id
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
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!video) {
    notFound()
  }

  // Check permissions
  const canView =
    video.athleteId === session.user.id || // Athlete can view their videos
    video.coachId === session.user.id ||   // Coach can view videos they uploaded
    (session.user.role === 'COACH' && video.coach.id === session.user.id) // Coach can view their athlete's videos

  if (!canView) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to view this video.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <VideoAnalysisPlayer
        video={video}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />
    </div>
  )
}