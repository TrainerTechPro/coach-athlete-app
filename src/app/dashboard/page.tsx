import { auth } from '@/lib/auth'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import AthleteDashboard from '@/components/dashboard/AthleteDashboard'

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    return null // This should be handled by the layout
  }

  if (session.user.role === 'COACH') {
    return <CoachDashboard user={session.user} />
  }

  return <AthleteDashboard user={session.user} />
}