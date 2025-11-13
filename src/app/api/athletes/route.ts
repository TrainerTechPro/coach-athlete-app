import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can access athletes' },
        { status: 403 }
      )
    }

    const coachAthletes = await prisma.athleteCoach.findMany({
      where: {
        coachId: session.user.id
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const athletes = coachAthletes.map(ac => ac.athlete)

    return NextResponse.json({
      athletes
    })

  } catch (error) {
    console.error('Error fetching athletes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch athletes' },
      { status: 500 }
    )
  }
}