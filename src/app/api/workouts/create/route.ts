import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can create workouts' },
        { status: 403 }
      )
    }

    const { name, description, exercises } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Workout name is required' },
        { status: 400 }
      )
    }

    // Create the workout
    const workout = await prisma.workout.create({
      data: {
        name,
        description: description || '',
        createdBy: session.user.id,
        exercises: {
          create: exercises.map((exercise: any, index: number) => ({
            exerciseId: exercise.id.split('-')[0], // Extract the base exercise ID
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            weight: exercise.weight || null,
            duration: exercise.duration || null,
            restTime: exercise.restTime || null,
            order: index + 1,
          }))
        }
      },
      include: {
        exercises: {
          include: {
            exercise: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Workout created successfully',
      workout
    })

  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}