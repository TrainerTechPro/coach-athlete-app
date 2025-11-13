import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToS3, generateAnnotationFileName } from '@/lib/s3'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can create video analyses' },
        { status: 403 }
      )
    }

    const { videoId, timestamp, annotationData, notes } = await request.json()

    if (!videoId || timestamp === undefined || !annotationData) {
      return NextResponse.json(
        { error: 'Video ID, timestamp, and annotation data are required' },
        { status: 400 }
      )
    }

    // Verify the video exists and the coach has access to it
    const video = await prisma.video.findUnique({
      where: { id: videoId },
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

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if coach has permission to analyze this video
    const hasPermission =
      video.coachId === session.user.id || // Coach uploaded the video
      video.athlete.coaches.length > 0      // Coach is assigned to the athlete

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to analyze this video' },
        { status: 403 }
      )
    }

    // Convert base64 data URL to buffer
    const base64Data = annotationData.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename for the annotation
    const fileName = generateAnnotationFileName(videoId, timestamp)

    // Upload annotation image to S3
    const annotationUrl = await uploadToS3(buffer, fileName, 'image/png')

    // Save analysis to database
    const analysis = await prisma.videoAnalysis.create({
      data: {
        videoId,
        timestamp,
        annotationUrl,
        notes: notes || null,
        createdBy: session.user.id,
      },
      include: {
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
      message: 'Video analysis saved successfully',
      analysis
    })

  } catch (error) {
    console.error('Error saving video analysis:', error)
    return NextResponse.json(
      { error: 'Failed to save video analysis' },
      { status: 500 }
    )
  }
}