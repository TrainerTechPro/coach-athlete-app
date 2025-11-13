import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can create video comparisons' },
        { status: 403 }
      )
    }

    const { video1Id, video2Id, title, notes } = await request.json()

    if (!video1Id || !video2Id) {
      return NextResponse.json(
        { error: 'Both video IDs are required' },
        { status: 400 }
      )
    }

    if (video1Id === video2Id) {
      return NextResponse.json(
        { error: 'Cannot compare a video with itself' },
        { status: 400 }
      )
    }

    // Verify both videos exist and the coach has access to them
    const videos = await prisma.video.findMany({
      where: {
        id: {
          in: [video1Id, video2Id]
        }
      },
      include: {
        athlete: {
          include: {
            coaches: {
              where: { coachId: session.user.id }
            }
          }
        }
      }
    })

    if (videos.length !== 2) {
      return NextResponse.json(
        { error: 'One or both videos not found' },
        { status: 404 }
      )
    }

    // Check permissions for both videos
    for (const video of videos) {
      const hasPermission =
        video.coachId === session.user.id || // Coach uploaded the video
        video.athlete.coaches.length > 0      // Coach is assigned to the athlete

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'You do not have permission to compare these videos' },
          { status: 403 }
        )
      }
    }

    // Create the comparison
    const comparison = await prisma.videoComparison.create({
      data: {
        video1Id,
        video2Id,
        title: title || null,
        notes: notes || null,
        createdBy: session.user.id,
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
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Video comparison saved successfully',
      comparison
    })

  } catch (error) {
    console.error('Error saving video comparison:', error)
    return NextResponse.json(
      { error: 'Failed to save video comparison' },
      { status: 500 }
    )
  }
}