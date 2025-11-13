import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToS3, generateVideoFileName } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const eventType = formData.get('eventType') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!videoFile || !eventType) {
      return NextResponse.json(
        { error: 'Video file and event type are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    if (videoFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await videoFile.arrayBuffer())

    // Generate unique filename
    const fileName = generateVideoFileName(
      session.user.id,
      eventType,
      videoFile.name
    )

    // Upload to S3
    const videoUrl = await uploadToS3(buffer, fileName, videoFile.type)

    // Get video duration (this is a simplified approach)
    // In production, you might want to use ffmpeg or similar tool
    const duration = await getVideoDuration(buffer)

    // Determine athlete and coach IDs based on user role
    let athleteId: string
    let coachId: string

    if (session.user.role === 'ATHLETE') {
      athleteId = session.user.id
      // Get the athlete's coach (assume first coach for now)
      const athleteCoach = await prisma.athleteCoach.findFirst({
        where: { athleteId: session.user.id }
      })
      if (!athleteCoach) {
        return NextResponse.json(
          { error: 'No coach assigned to this athlete' },
          { status: 400 }
        )
      }
      coachId = athleteCoach.coachId
    } else {
      // Coach uploading video for an athlete
      // For now, we'll need to get the athlete ID from the request or handle differently
      coachId = session.user.id
      // This would need to be provided in the form data or handled differently
      athleteId = formData.get('athleteId') as string || session.user.id
    }

    // Save video metadata to database
    const video = await prisma.video.create({
      data: {
        url: videoUrl,
        eventType: eventType as any,
        athleteId,
        coachId,
        title: title || null,
        description: description || null,
        duration,
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
        }
      }
    })

    return NextResponse.json({
      message: 'Video uploaded successfully',
      video
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// Simplified duration extraction - in production use ffmpeg
async function getVideoDuration(buffer: Buffer): Promise<number | null> {
  // This is a placeholder - in a real implementation you would:
  // 1. Use ffmpeg or similar tool to extract metadata
  // 2. Or use a video processing service
  // 3. Or extract duration on the client side and send it
  return null
}