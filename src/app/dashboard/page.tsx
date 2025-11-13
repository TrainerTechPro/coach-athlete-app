import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import AthleteDashboard from '@/components/dashboard/AthleteDashboard'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null // This should be handled by the layout
  }

  if (session.user.role === 'COACH') {
    return <CoachDashboard user={session.user} />
  }

  return <AthleteDashboard user={session.user} />
}