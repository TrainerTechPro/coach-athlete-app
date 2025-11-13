'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  Clock,
  User,
  Calendar,
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Activity,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ThrowLog {
  id: string
  throwNumber: number
  distance: number | null
  isFoul: boolean
  foulReason: string | null
  notes: string | null
}

interface Drill {
  id: string
  drillType: string
  implementWeight: string
  targetReps: number
  description: string | null
  order: number
  throwLogs: ThrowLog[]
}

interface SessionData {
  id: string
  date: string
  focus: string
  description: string | null
  status: string
  sessionRPE: number | null
  drills: Drill[]
  athlete: {
    id: string
    name: string | null
    email: string
  }
  coach: {
    id: string
    name: string | null
    email: string
  }
}

interface SessionLoggerProps {
  session: SessionData
  currentUserId: string
  userRole: string
}

interface ThrowEntry {
  throwNumber: number
  distance: string
  isFoul: boolean
  foulReason: string
  notes: string
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

const FOUL_REASONS = [
  { value: 'OUT_FRONT', label: 'Out Front' },
  { value: 'SECTOR_LEFT', label: 'Sector Left' },
  { value: 'SECTOR_RIGHT', label: 'Sector Right' },
  { value: 'LATE_BLOCK', label: 'Late Block' },
  { value: 'BALANCE_LOSS', label: 'Balance Loss' },
  { value: 'FOOTWORK_ERROR', label: 'Footwork Error' },
  { value: 'RELEASE_ERROR', label: 'Release Error' },
  { value: 'OTHER', label: 'Other' },
]

export default function SessionLogger({ session, currentUserId, userRole }: SessionLoggerProps) {
  const router = useRouter()
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [drillThrows, setDrillThrows] = useState<Record<string, ThrowEntry[]>>({})
  const [sessionRPE, setSessionRPE] = useState(session.sessionRPE || 5)
  const [sessionNotes, setSessionNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const currentDrill = session.drills[currentDrillIndex]
  const isLastDrill = currentDrillIndex === session.drills.length - 1
  const allDrillsCompleted = session.drills.every(drill =>
    drillThrows[drill.id]?.length >= drill.targetReps
  )

  // Initialize drill throws from existing logs
  useEffect(() => {
    const initialThrows: Record<string, ThrowEntry[]> = {}

    session.drills.forEach(drill => {
      initialThrows[drill.id] = drill.throwLogs.map(log => ({
        throwNumber: log.throwNumber,
        distance: log.distance?.toString() || '',
        isFoul: log.isFoul,
        foulReason: log.foulReason || '',
        notes: log.notes || ''
      }))
    })

    setDrillThrows(initialThrows)
  }, [session])

  const getCurrentDrillThrows = () => {
    return drillThrows[currentDrill?.id] || []
  }

  const addThrow = () => {
    if (!currentDrill) return

    const currentThrows = getCurrentDrillThrows()
    const nextThrowNumber = currentThrows.length + 1

    if (nextThrowNumber <= currentDrill.targetReps) {
      const newThrow: ThrowEntry = {
        throwNumber: nextThrowNumber,
        distance: '',
        isFoul: false,
        foulReason: '',
        notes: ''
      }

      setDrillThrows(prev => ({
        ...prev,
        [currentDrill.id]: [...currentThrows, newThrow]
      }))
    }
  }

  const updateThrow = (throwNumber: number, field: keyof ThrowEntry, value: string | boolean) => {
    if (!currentDrill) return

    setDrillThrows(prev => ({
      ...prev,
      [currentDrill.id]: prev[currentDrill.id]?.map(throwEntry =>
        throwEntry.throwNumber === throwNumber
          ? { ...throwEntry, [field]: value }
          : throwEntry
      ) || []
    }))
  }

  const removeThrow = (throwNumber: number) => {
    if (!currentDrill) return

    setDrillThrows(prev => ({
      ...prev,
      [currentDrill.id]: prev[currentDrill.id]?.filter(throwEntry =>
        throwEntry.throwNumber !== throwNumber
      ).map((throwEntry, index) => ({
        ...throwEntry,
        throwNumber: index + 1
      })) || []
    }))
  }

  const nextDrill = () => {
    if (!isLastDrill) {
      setCurrentDrillIndex(prev => prev + 1)
    }
  }

  const prevDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => prev - 1)
    }
  }

  const saveSession = async () => {
    setIsSaving(true)
    setError('')

    try {
      const sessionData = {
        sessionId: session.id,
        sessionRPE,
        notes: sessionNotes,
        throws: Object.entries(drillThrows).flatMap(([drillId, throws]) =>
          throws.map(throwEntry => ({
            drillId,
            throwNumber: throwEntry.throwNumber,
            distance: throwEntry.distance ? parseFloat(throwEntry.distance) : null,
            isFoul: throwEntry.isFoul,
            foulReason: throwEntry.foulReason || null,
            notes: throwEntry.notes || null
          }))
        )
      }

      const response = await fetch('/api/training-sessions/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        router.push(`/dashboard/sessions/${session.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save session data')
      }
    } catch (error) {
      setError('Failed to save session data')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!currentDrill) {
    return <div>No drills found in this session.</div>
  }

  const currentThrows = getCurrentDrillThrows()

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Session</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(session.date)}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{session.athlete.name || session.athlete.email}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/dashboard/sessions/${session.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Session
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-1">Session Focus</h3>
          <p className="text-blue-800">{session.focus}</p>
          {session.description && (
            <p className="text-blue-700 text-sm mt-2">{session.description}</p>
          )}
        </div>
      </div>

      {/* Drill Progress */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Drill {currentDrillIndex + 1} of {session.drills.length}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={prevDrill}
              disabled={currentDrillIndex === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextDrill}
              disabled={isLastDrill}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">Drill Type</h3>
            <p className="text-gray-700">{DRILL_TYPE_LABELS[currentDrill.drillType]}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">Implement Weight</h3>
            <p className="text-gray-700">{currentDrill.implementWeight}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">Target Reps</h3>
            <div className="flex items-center">
              <p className="text-gray-700">{currentThrows.length} / {currentDrill.targetReps}</p>
              {currentThrows.length >= currentDrill.targetReps && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
              )}
            </div>
          </div>
        </div>

        {currentDrill.description && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-900 mb-1">Instructions</h3>
            <p className="text-yellow-800">{currentDrill.description}</p>
          </div>
        )}
      </div>

      {/* Throw Logging */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Log Throws</h3>
          {currentThrows.length < currentDrill.targetReps && (
            <button
              onClick={addThrow}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Throw #{currentThrows.length + 1}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {currentThrows.map((throwEntry) => (
            <div key={throwEntry.throwNumber} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Throw #{throwEntry.throwNumber}</h4>
                <button
                  onClick={() => removeThrow(throwEntry.throwNumber)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={throwEntry.isFoul}
                      onChange={(e) => updateThrow(throwEntry.throwNumber, 'isFoul', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Foul</span>
                  </label>
                </div>

                {!throwEntry.isFoul && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance (meters)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={throwEntry.distance}
                      onChange={(e) => updateThrow(throwEntry.throwNumber, 'distance', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {throwEntry.isFoul && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foul Reason *
                    </label>
                    <select
                      value={throwEntry.foulReason}
                      onChange={(e) => updateThrow(throwEntry.throwNumber, 'foulReason', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select foul reason</option>
                      {FOUL_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={throwEntry.isFoul ? 'md:col-span-2' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={throwEntry.notes}
                    onChange={(e) => updateThrow(throwEntry.throwNumber, 'notes', e.target.value)}
                    placeholder="Technical notes, feeling, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {throwEntry.isFoul && !throwEntry.foulReason && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Please select a foul reason
                </div>
              )}
            </div>
          ))}

          {currentThrows.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No throws logged yet. Click "Add Throw #1" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Session RPE (shown when all drills are completed) */}
      {allDrillsCompleted && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Session Rating of Perceived Exertion (RPE)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How hard was this session? (1 = Very Easy, 10 = Maximum Effort) *
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">1</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={sessionRPE}
                  onChange={(e) => setSessionRPE(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">10</span>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                  {sessionRPE}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did you feel? Any observations about technique, energy levels, etc."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={saveSession}
          disabled={isSaving || !allDrillsCompleted}
          className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving Session...' : 'Complete Session'}
        </button>
      </div>

      {!allDrillsCompleted && (
        <div className="text-center text-sm text-gray-600">
          Complete all drills to finish the session
        </div>
      )}
    </div>
  )
}