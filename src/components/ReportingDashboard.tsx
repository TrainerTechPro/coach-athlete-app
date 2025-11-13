'use client'

import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  User,
  Target,
  AlertTriangle
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface Athlete {
  id: string
  name: string | null
  email: string
}

interface ThrowLog {
  id: string
  distance: number | null
  isFoul: boolean
  foulReason: string | null
  createdAt: string
  athlete: {
    id: string
    name: string | null
    email: string
  }
  drill: {
    drillType: string
    implementWeight: string
  }
  session: {
    date: string
    focus: string
  }
}

interface ReportingDashboardProps {
  athletes: Athlete[]
  throwLogs: ThrowLog[]
  coachId: string
}

const FOUL_REASON_LABELS: Record<string, string> = {
  OUT_FRONT: 'Out Front',
  SECTOR_LEFT: 'Sector Left',
  SECTOR_RIGHT: 'Sector Right',
  LATE_BLOCK: 'Late Block',
  BALANCE_LOSS: 'Balance Loss',
  FOOTWORK_ERROR: 'Footwork Error',
  RELEASE_ERROR: 'Release Error',
  OTHER: 'Other',
}

const DRILL_TYPE_LABELS: Record<string, string> = {
  FULL_THROW: 'Full Throw',
  STAND_THROW: 'Stand Throw',
  GLIDE_DRILL: 'Glide Drill',
  SPIN_DRILL: 'Spin Drill',
  TECHNICAL_DRILL: 'Technical Drill',
  STRENGTH_DRILL: 'Strength Drill',
  MOBILITY_DRILL: 'Mobility Drill',
  OTHER: 'Other',
}

export default function ReportingDashboard({ athletes, throwLogs, coachId }: ReportingDashboardProps) {
  const [selectedAthlete, setSelectedAthlete] = useState<string>(athletes[0]?.id || '')
  const [timeRange, setTimeRange] = useState('30') // days

  // Filter data based on selected athlete and time range
  const filteredThrowLogs = useMemo(() => {
    const rangeDate = new Date()
    rangeDate.setDate(rangeDate.getDate() - parseInt(timeRange))

    return throwLogs.filter(log => {
      const logDate = new Date(log.createdAt)
      const athleteMatch = selectedAthlete ? log.athlete.id === selectedAthlete : true
      const dateMatch = logDate >= rangeDate
      return athleteMatch && dateMatch
    })
  }, [throwLogs, selectedAthlete, timeRange])

  // Distance progression data (line chart)
  const distanceProgressionData = useMemo(() => {
    const validThrows = filteredThrowLogs.filter(log => !log.isFoul && log.distance)

    // Group by date and calculate daily best
    const dailyBests = validThrows.reduce((acc, log) => {
      const date = new Date(log.createdAt).toLocaleDateString()
      if (!acc[date] || (log.distance && log.distance > acc[date])) {
        acc[date] = log.distance!
      }
      return acc
    }, {} as Record<string, number>)

    const dates = Object.keys(dailyBests).sort()
    const distances = dates.map(date => dailyBests[date])

    return {
      labels: dates,
      datasets: [
        {
          label: 'Best Daily Distance (m)',
          data: distances,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true
        }
      ]
    }
  }, [filteredThrowLogs])

  // Foul analysis data (pie chart)
  const foulAnalysisData = useMemo(() => {
    const fouls = filteredThrowLogs.filter(log => log.isFoul && log.foulReason)
    const foulCounts = fouls.reduce((acc, log) => {
      const reason = log.foulReason!
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(foulCounts).map(key => FOUL_REASON_LABELS[key] || key)
    const data = Object.values(foulCounts)

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
          ],
        }
      ]
    }
  }, [filteredThrowLogs])

  // Weekly volume data (bar chart)
  const weeklyVolumeData = useMemo(() => {
    // Group throws by week
    const weeklyThrows = filteredThrowLogs.reduce((acc, log) => {
      const date = new Date(log.createdAt)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toLocaleDateString()

      acc[weekKey] = (acc[weekKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const weeks = Object.keys(weeklyThrows).sort()
    const volumes = weeks.map(week => weeklyThrows[week])

    return {
      labels: weeks.map(week => `Week of ${week}`),
      datasets: [
        {
          label: 'Total Throws',
          data: volumes,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }
      ]
    }
  }, [filteredThrowLogs])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const validThrows = filteredThrowLogs.filter(log => !log.isFoul && log.distance)
    const totalThrows = filteredThrowLogs.length
    const totalFouls = filteredThrowLogs.filter(log => log.isFoul).length

    const distances = validThrows.map(log => log.distance!)
    const bestThrow = distances.length > 0 ? Math.max(...distances) : 0
    const averageDistance = distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) / distances.length : 0
    const foulRate = totalThrows > 0 ? (totalFouls / totalThrows) * 100 : 0

    return {
      totalThrows,
      validThrows: validThrows.length,
      totalFouls,
      foulRate,
      bestThrow,
      averageDistance
    }
  }, [filteredThrowLogs])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Athlete
            </label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Athletes</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name || athlete.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Throws
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{summaryStats.totalThrows}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Best Throw
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summaryStats.bestThrow.toFixed(2)}m
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Distance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summaryStats.averageDistance.toFixed(2)}m
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Foul Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summaryStats.foulRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Progression Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Distance Progression</h3>
          </div>
          <div className="h-64">
            {distanceProgressionData.labels.length > 0 ? (
              <Line data={distanceProgressionData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No distance data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Foul Analysis Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Foul Analysis</h3>
          </div>
          <div className="h-64">
            {foulAnalysisData.labels.length > 0 ? (
              <Pie data={foulAnalysisData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No foul data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Volume Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Throwing Volume</h3>
          </div>
          <div className="h-64">
            {weeklyVolumeData.labels.length > 0 ? (
              <Bar data={weeklyVolumeData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No volume data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Training Sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Training Data</h3>
        {filteredThrowLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Athlete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drill Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredThrowLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.athlete.name || log.athlete.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {DRILL_TYPE_LABELS[log.drill.drillType]} ({log.drill.implementWeight})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.isFoul ? 'Foul' : `${log.distance?.toFixed(2)}m`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.isFoul ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {FOUL_REASON_LABELS[log.foulReason || 'OTHER']}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No training data available for the selected criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}