import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { sessionId, sessionRPE, notes, throws } = await request.json()

    if (!sessionId || !sessionRPE || !throws || throws.length === 0) {
      return NextResponse.json(
        { error: 'Session ID, RPE, and throws data are required' },
        { status: 400 }
      )
    }

    // Verify the user has access to this training session
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        athlete: true,
        coach: true
      }
    })

    if (!trainingSession) {
      return NextResponse.json(
        { error: 'Training session not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canLog =
      trainingSession.athleteId === session.user.id || // Athlete can log their own sessions
      (session.user.role === 'COACH' && trainingSession.coachId === session.user.id) // Coach can log for their athletes

    if (!canLog) {
      return NextResponse.json(
        { error: 'You do not have permission to log this session' },
        { status: 403 }
      )
    }

    // Delete existing throw logs for this session and user
    await prisma.throwLog.deleteMany({
      where: {
        sessionId: sessionId,
        athleteId: session.user.role === 'ATHLETE' ? session.user.id : trainingSession.athleteId
      }
    })

    // Create new throw logs
    const throwLogs = await prisma.throwLog.createMany({
      data: throws.map((throwData: any) => ({
        sessionId: sessionId,
        drillId: throwData.drillId,
        athleteId: session.user.role === 'ATHLETE' ? session.user.id : trainingSession.athleteId,
        throwNumber: throwData.throwNumber,
        distance: throwData.distance,
        isFoul: throwData.isFoul,
        foulReason: throwData.foulReason,
        notes: throwData.notes
      }))
    })

    // Update the training session with RPE and status
    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        sessionRPE: sessionRPE,
        notes: notes || null,
        status: 'COMPLETED'
      },
      include: {
        drills: {
          include: {
            throwLogs: true
          }
        },
        athlete: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Session logged successfully',
      session: updatedSession,
      throwLogsCreated: throwLogs.count
    })

  } catch (error) {
    console.error('Error logging training session:', error)
    return NextResponse.json(
      { error: 'Failed to log training session' },
      { status: 500 }
    )
  }
}