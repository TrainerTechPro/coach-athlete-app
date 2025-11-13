'use client'

import { useState } from 'react'
import { Plus, Users, Dumbbell, Calendar, TrendingUp, Target, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface CoachDashboardProps {
  user: {
    name?: string | null
    role: 'COACH' | 'ATHLETE'
  }
}

export default function CoachDashboard({ user }: CoachDashboardProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Create training sessions, track throwing performance, and analyze your athletes' progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Athletes
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
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Workouts
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
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Training Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0 total</dd>
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
                    Completion Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">--</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/sessions/create"
                className="w-full bg-blue-600 border border-transparent rounded-md py-2 px-4 inline-flex justify-center items-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Training Session
              </Link>

              <Link
                href="/dashboard/athletes"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 inline-flex justify-center items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Athletes
              </Link>

              <Link
                href="/dashboard/exercises"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 inline-flex justify-center items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Exercise Library
              </Link>

              <Link
                href="/dashboard/sessions"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 inline-flex justify-center items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Target className="h-4 w-4 mr-2" />
                View All Sessions
              </Link>

              <Link
                href="/dashboard/reports"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 inline-flex justify-center items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance Reports
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first workout to get started.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Getting Started with Throwing Training
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Create Training Sessions</h4>
              <p className="text-sm text-blue-700">Design sessions with specific drills, target reps, and implement weights</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Track Athlete Progress</h4>
              <p className="text-sm text-blue-700">Athletes log throws, distances, fouls, and RPE ratings</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Analyze Performance</h4>
              <p className="text-sm text-blue-700">View detailed reports with charts and foul analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}