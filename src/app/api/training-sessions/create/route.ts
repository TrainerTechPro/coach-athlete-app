import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can create training sessions' },
        { status: 403 }
      )
    }

    const { date, focus, description, coachId, athleteId, drills } = await request.json()

    // Validation
    if (!date || !focus || !athleteId || !drills || drills.length === 0) {
      return NextResponse.json(
        { error: 'Date, focus, athlete, and at least one drill are required' },
        { status: 400 }
      )
    }

    // Verify the coach has access to this athlete
    const athleteCoach = await prisma.athleteCoach.findUnique({
      where: {
        athleteId_coachId: {
          athleteId: athleteId,
          coachId: session.user.id
        }
      }
    })

    if (!athleteCoach) {
      return NextResponse.json(
        { error: 'You do not have permission to create sessions for this athlete' },
        { status: 403 }
      )
    }

    // Create the training session with drills
    const trainingSession = await prisma.trainingSession.create({
      data: {
        date: new Date(date),
        focus,
        description: description || null,
        coachId: session.user.id,
        athleteId,
        drills: {
          create: drills.map((drill: any) => ({
            drillType: drill.drillType,
            implementWeight: drill.implementWeight,
            targetReps: drill.targetReps,
            description: drill.description || null,
            order: drill.order || 0
          }))
        }
      },
      include: {
        drills: {
          orderBy: {
            order: 'asc'
          }
        },
        athlete: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Training session created successfully',
      session: trainingSession
    })

  } catch (error) {
    console.error('Error creating training session:', error)
    return NextResponse.json(
      { error: 'Failed to create training session' },
      { status: 500 }
    )
  }
}