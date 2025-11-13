import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can assign workouts' },
        { status: 403 }
      )
    }

    const { workoutId, athleteIds, dueDate } = await request.json()

    if (!workoutId || !athleteIds || athleteIds.length === 0) {
      return NextResponse.json(
        { error: 'Workout ID and athlete IDs are required' },
        { status: 400 }
      )
    }

    // Verify the workout belongs to the coach
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        createdBy: session.user.id
      }
    })

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found or you do not have permission to assign it' },
        { status: 404 }
      )
    }

    // Verify all athletes belong to the coach
    const coachAthletes = await prisma.athleteCoach.findMany({
      where: {
        coachId: session.user.id,
        athleteId: {
          in: athleteIds
        }
      }
    })

    if (coachAthletes.length !== athleteIds.length) {
      return NextResponse.json(
        { error: 'Some athletes do not belong to you' },
        { status: 403 }
      )
    }

    // Create workout assignments
    const assignments = await prisma.workoutAssignment.createMany({
      data: athleteIds.map((athleteId: string) => ({
        workoutId,
        athleteId,
        assignedBy: session.user.id,
        assignedAt: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false
      }))
    })

    return NextResponse.json({
      message: 'Workout assigned successfully',
      assignmentsCreated: assignments.count
    })

  } catch (error) {
    console.error('Error assigning workout:', error)
    return NextResponse.json(
      { error: 'Failed to assign workout' },
      { status: 500 }
    )
  }
}