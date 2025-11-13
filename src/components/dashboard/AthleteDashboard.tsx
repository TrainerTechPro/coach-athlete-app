'use client'

import { Calendar, Clock, CheckCircle, Target, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface AthleteDashboardProps {
  user: {
    name?: string | null
    role: 'COACH' | 'ATHLETE'
  }
}

export default function AthleteDashboard({ user }: AthleteDashboardProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete your training sessions and log your throwing performance with RPE ratings.
        </p>
      </div>

      {/* Today's Training Session */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Today's Training Session</h2>
            <p className="text-blue-100">No training session scheduled for today</p>
            <Link href="/dashboard/sessions" className="text-white underline text-sm mt-2 inline-block">
              View all sessions →
            </Link>
          </div>
          <div className="text-blue-100">
            <Target className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sessions This Week
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Throws
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Streak
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0 days</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upcoming Training Sessions
            </h3>
            <div className="text-center py-6">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your coach hasn't scheduled any training sessions yet.
              </p>
              <Link href="/dashboard/sessions" className="text-blue-600 text-sm mt-2 inline-block hover:text-blue-800">
                View all sessions →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Training Activity
            </h3>
            <div className="text-center py-6">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete your first training session to see your progress here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Progress Overview
          </h3>
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Track Your Throwing Progress</h3>
            <p className="mt-2 text-sm text-gray-500">
              Complete training sessions to see distance progression, RPE trends, and foul analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started for Athletes */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-900 mb-4">
          Getting Started as an Athlete
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-900">Connect with Coach</h4>
              <p className="text-sm text-green-700">Ask your coach to invite you to their program</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-900">Complete Training Sessions</h4>
              <p className="text-sm text-green-700">Log your throws, distances, fouls, and rate perceived exertion</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-900">Track Progress</h4>
              <p className="text-sm text-green-700">Monitor your improvements and achievements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}