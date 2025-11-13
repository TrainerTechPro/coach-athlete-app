import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import VideoComparison from '@/components/VideoComparison'

export default async function VideoComparePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Fetch available videos for comparison
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
          { coachId: session.user.id },
          { athleteId: { in: athleteIds } },
        ]
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true,
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
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
  }

  // Fetch existing comparisons
  const comparisons = await prisma.videoComparison.findMany({
    where: {
      createdBy: session.user.id
    },
    include: {
      video1: {
        select: {
          id: true,
          title: true,
          eventType: true,
          uploadedAt: true,
        }
      },
      video2: {
        select: {
          id: true,
          title: true,
          eventType: true,
          uploadedAt: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <VideoComparison
        videos={videos}
        existingComparisons={comparisons}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />
    </div>
  )
}