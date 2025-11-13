'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, Dumbbell } from 'lucide-react'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    role: 'COACH' | 'ATHLETE'
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Coach Athlete App
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}