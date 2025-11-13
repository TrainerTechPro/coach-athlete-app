'use client'

import { useState } from 'react'
import {
  Plus,
  Minus,
  Calendar,
  Target,
  Save,
  ArrowLeft,
  Trash2,
  Copy,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Athlete {
  id: string
  name: string | null
  email: string
}

interface SessionBuilderProps {
  athletes: Athlete[]
  coachId: string
}

interface Drill {
  id: string
  drillType: string
  implementWeight: string
  targetReps: number
  description: string
}

const DRILL_TYPES = [
  { value: 'FULL_THROW', label: 'Full Throw' },
  { value: 'STAND_THROW', label: 'Stand Throw' },
  { value: 'GLIDE_DRILL', label: 'Glide Drill' },
  { value: 'SPIN_DRILL', label: 'Spin Drill' },
  { value: 'TECHNICAL_DRILL', label: 'Technical Drill' },
  { value: 'STRENGTH_DRILL', label: 'Strength Drill' },
  { value: 'MOBILITY_DRILL', label: 'Mobility Drill' },
  { value: 'OTHER', label: 'Other' },
]

const IMPLEMENT_WEIGHTS = [
  '2kg', '3kg', '4kg', '5kg', '6kg', '7.26kg',
  '12lb', '16lb', '20lb', '25lb', '35lb',
  'Bodyweight', 'Light', 'Medium', 'Heavy'
]

export default function SessionBuilder({ athletes, coachId }: SessionBuilderProps) {
  const router = useRouter()
  const [selectedAthlete, setSelectedAthlete] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionFocus, setSessionFocus] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [drills, setDrills] = useState<Drill[]>([
    {
      id: '1',
      drillType: 'FULL_THROW',
      implementWeight: '16lb',
      targetReps: 6,
      description: ''
    }
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const addDrill = () => {
    const newDrill: Drill = {
      id: Date.now().toString(),
      drillType: 'FULL_THROW',
      implementWeight: '16lb',
      targetReps: 6,
      description: ''
    }
    setDrills([...drills, newDrill])
  }

  const removeDrill = (drillId: string) => {
    if (drills.length > 1) {
      setDrills(drills.filter(drill => drill.id !== drillId))
    }
  }

  const duplicateDrill = (drillId: string) => {
    const drillToDuplicate = drills.find(drill => drill.id === drillId)
    if (drillToDuplicate) {
      const newDrill = {
        ...drillToDuplicate,
        id: Date.now().toString()
      }
      const drillIndex = drills.findIndex(drill => drill.id === drillId)
      const newDrills = [...drills]
      newDrills.splice(drillIndex + 1, 0, newDrill)
      setDrills(newDrills)
    }
  }

  const updateDrill = (drillId: string, field: keyof Drill, value: string | number) => {
    setDrills(drills.map(drill =>
      drill.id === drillId
        ? { ...drill, [field]: value }
        : drill
    ))
  }

  const validateForm = () => {
    if (!selectedAthlete) {
      setError('Please select an athlete')
      return false
    }
    if (!sessionDate) {
      setError('Please select a session date')
      return false
    }
    if (!sessionFocus.trim()) {
      setError('Please provide a session focus')
      return false
    }
    if (drills.some(drill => !drill.drillType || !drill.implementWeight || drill.targetReps < 1)) {
      setError('Please complete all drill information')
      return false
    }
    return true
  }

  const saveSession = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError('')

    try {
      const sessionData = {
        date: new Date(sessionDate).toISOString(),
        focus: sessionFocus,
        description: sessionDescription,
        coachId,
        athleteId: selectedAthlete,
        drills: drills.map((drill, index) => ({
          drillType: drill.drillType,
          implementWeight: drill.implementWeight,
          targetReps: drill.targetReps,
          description: drill.description,
          order: index + 1
        }))
      }

      const response = await fetch('/api/training-sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/dashboard/sessions/${result.session.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create session')
      }
    } catch (error) {
      setError('Failed to create session')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
          <Link
            href="/dashboard/sessions"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sessions
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Athlete *
            </label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name || athlete.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date *
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Focus *
          </label>
          <input
            type="text"
            value={sessionFocus}
            onChange={(e) => setSessionFocus(e.target.value)}
            placeholder="e.g., Technical improvement, Power development, Competition prep"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Description (Optional)
          </label>
          <textarea
            value={sessionDescription}
            onChange={(e) => setSessionDescription(e.target.value)}
            placeholder="Additional notes, warm-up instructions, or specific focus areas..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Drills Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Training Drills</h3>
            <button
              onClick={addDrill}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Drill
            </button>
          </div>

          <div className="space-y-4">
            {drills.map((drill, index) => (
              <div key={drill.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Drill #{index + 1}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => duplicateDrill(drill.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Duplicate drill"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {drills.length > 1 && (
                      <button
                        onClick={() => removeDrill(drill.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Remove drill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drill Type *
                    </label>
                    <select
                      value={drill.drillType}
                      onChange={(e) => updateDrill(drill.id, 'drillType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DRILL_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Implement Weight *
                    </label>
                    <select
                      value={drill.implementWeight}
                      onChange={(e) => updateDrill(drill.id, 'implementWeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {IMPLEMENT_WEIGHTS.map((weight) => (
                        <option key={weight} value={weight}>
                          {weight}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Reps *
                    </label>
                    <input
                      type="number"
                      value={drill.targetReps}
                      onChange={(e) => updateDrill(drill.id, 'targetReps', parseInt(e.target.value) || 0)}
                      min={1}
                      max={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drill Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={drill.description}
                    onChange={(e) => updateDrill(drill.id, 'description', e.target.value)}
                    placeholder="Specific instructions, cues, or focus points..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={saveSession}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Creating Session...' : 'Create Session'}
          </button>
          <Link
            href="/dashboard/sessions"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* JSON Preview (for development) */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <details className="space-y-2">
          <summary className="font-medium text-gray-900 cursor-pointer">
            Preview JSON Structure
          </summary>
          <pre className="text-xs text-gray-600 bg-white p-4 rounded border overflow-x-auto">
            {JSON.stringify({
              date: sessionDate ? new Date(sessionDate).toISOString() : 'YYYY-MM-DDTHH:mm:ss.sssZ',
              focus: sessionFocus || 'Session focus',
              description: sessionDescription || 'Session description (optional)',
              coachId: coachId,
              athleteId: selectedAthlete || 'athlete-id',
              drills: drills.map((drill, index) => ({
                drillType: drill.drillType,
                implementWeight: drill.implementWeight,
                targetReps: drill.targetReps,
                description: drill.description || 'Drill description (optional)',
                order: index + 1
              }))
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}