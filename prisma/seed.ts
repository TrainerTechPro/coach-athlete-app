import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo coach
  const coachPassword = await bcrypt.hash('password', 12)
  const coach = await prisma.user.upsert({
    where: { email: 'coach@demo.com' },
    update: {},
    create: {
      email: 'coach@demo.com',
      name: 'Demo Coach',
      password: coachPassword,
      role: 'COACH',
    },
  })

  // Create demo athlete
  const athletePassword = await bcrypt.hash('password', 12)
  const athlete = await prisma.user.upsert({
    where: { email: 'athlete@demo.com' },
    update: {},
    create: {
      email: 'athlete@demo.com',
      name: 'Demo Athlete',
      password: athletePassword,
      role: 'ATHLETE',
    },
  })

  // Create sample exercises
  const pushUps = await prisma.exercise.upsert({
    where: { id: 'push-ups' },
    update: {},
    create: {
      id: 'push-ups',
      name: 'Push-ups',
      description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
      instructions: '1. Start in plank position\\n2. Lower your body until chest nearly touches floor\\n3. Push back up to starting position\\n4. Repeat',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      equipment: ['Bodyweight'],
      difficulty: 'BEGINNER',
    },
  })

  const squats = await prisma.exercise.upsert({
    where: { id: 'squats' },
    update: {},
    create: {
      id: 'squats',
      name: 'Squats',
      description: 'Fundamental lower body exercise targeting quads, glutes, and hamstrings',
      instructions: '1. Stand with feet shoulder-width apart\\n2. Lower body by bending knees and hips\\n3. Keep chest up and weight on heels\\n4. Return to starting position',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      equipment: ['Bodyweight'],
      difficulty: 'BEGINNER',
    },
  })

  const planks = await prisma.exercise.upsert({
    where: { id: 'planks' },
    update: {},
    create: {
      id: 'planks',
      name: 'Planks',
      description: 'Isometric core strengthening exercise',
      instructions: '1. Start in push-up position\\n2. Lower onto forearms\\n3. Keep body in straight line\\n4. Hold position',
      muscleGroups: ['Core', 'Shoulders', 'Glutes'],
      equipment: ['Bodyweight'],
      difficulty: 'BEGINNER',
    },
  })

  const burpees = await prisma.exercise.upsert({
    where: { id: 'burpees' },
    update: {},
    create: {
      id: 'burpees',
      name: 'Burpees',
      description: 'Full-body high-intensity exercise combining squat, plank, and jump',
      instructions: '1. Start standing\\n2. Drop to squat position\\n3. Jump back to plank\\n4. Do push-up\\n5. Jump forward to squat\\n6. Explosive jump up',
      muscleGroups: ['Full Body', 'Cardiovascular'],
      equipment: ['Bodyweight'],
      difficulty: 'INTERMEDIATE',
    },
  })

  // Create sample workout
  const workout = await prisma.workout.create({
    data: {
      name: 'Beginner Bodyweight Circuit',
      description: 'A full-body workout perfect for beginners using only bodyweight exercises',
      duration: 30,
      createdBy: coach.id,
      exercises: {
        create: [
          {
            exerciseId: pushUps.id,
            sets: 3,
            reps: 10,
            restTime: 60,
            order: 1,
          },
          {
            exerciseId: squats.id,
            sets: 3,
            reps: 15,
            restTime: 60,
            order: 2,
          },
          {
            exerciseId: planks.id,
            duration: 30,
            restTime: 60,
            order: 3,
          },
          {
            exerciseId: burpees.id,
            sets: 2,
            reps: 8,
            restTime: 90,
            order: 4,
          },
        ],
      },
    },
  })

  // Connect coach and athlete
  await prisma.athleteCoach.upsert({
    where: {
      athleteId_coachId: {
        athleteId: athlete.id,
        coachId: coach.id,
      },
    },
    update: {},
    create: {
      athleteId: athlete.id,
      coachId: coach.id,
    },
  })

  // Assign workout to athlete
  await prisma.workoutAssignment.upsert({
    where: {
      workoutId_athleteId_assignedDate: {
        workoutId: workout.id,
        athleteId: athlete.id,
        assignedDate: new Date(),
      },
    },
    update: {},
    create: {
      workoutId: workout.id,
      athleteId: athlete.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  console.log({ coach, athlete, workout })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })