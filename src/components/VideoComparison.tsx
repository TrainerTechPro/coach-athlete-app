'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Plus,
  Edit,
  Calendar,
  User,
  Video as VideoIcon
} from 'lucide-react'
import Link from 'next/link'

interface VideoData {
  id: string
  url: string
  title?: string | null
  eventType: string
  uploadedAt: string
  athlete: {
    id: string
    name: string | null
    email: string
  }
}

interface Comparison {
  id: string
  title?: string | null
  notes?: string | null
  createdAt: string
  video1: {
    id: string
    title?: string | null
    eventType: string
    uploadedAt: string
  }
  video2: {
    id: string
    title?: string | null
    eventType: string
    uploadedAt: string
  }
}

interface VideoComparisonProps {
  videos: VideoData[]
  existingComparisons: Comparison[]
  currentUserId: string
  userRole: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  SHOT_PUT: 'Shot Put',
  DISCUS: 'Discus',
  HAMMER_THROW: 'Hammer Throw',
  JAVELIN: 'Javelin',
  HIGH_JUMP: 'High Jump',
  LONG_JUMP: 'Long Jump',
  TRIPLE_JUMP: 'Triple Jump',
  POLE_VAULT: 'Pole Vault',
  SPRINT: 'Sprint',
  HURDLES: 'Hurdles',
  DISTANCE: 'Distance',
  OTHER: 'Other',
}

export default function VideoComparison({
  videos,
  existingComparisons,
  currentUserId,
  userRole
}: VideoComparisonProps) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  const [selectedVideo1, setSelectedVideo1] = useState<VideoData | null>(null)
  const [selectedVideo2, setSelectedVideo2] = useState<VideoData | null>(null)
  const [isPlaying1, setIsPlaying1] = useState(false)
  const [isPlaying2, setIsPlaying2] = useState(false)
  const [currentTime1, setCurrentTime1] = useState(0)
  const [currentTime2, setCurrentTime2] = useState(0)
  const [duration1, setDuration1] = useState(0)
  const [duration2, setDuration2] = useState(0)
  const [volume1, setVolume1] = useState(0.5)
  const [volume2, setVolume2] = useState(0.5)
  const [muted1, setMuted1] = useState(false)
  const [muted2, setMuted2] = useState(false)
  const [comparisonTitle, setComparisonTitle] = useState('')
  const [comparisonNotes, setComparisonNotes] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const video1 = video1Ref.current
    if (!video1) return

    const updateTime1 = () => setCurrentTime1(video1.currentTime)
    const updateDuration1 = () => setDuration1(video1.duration)

    video1.addEventListener('timeupdate', updateTime1)
    video1.addEventListener('loadedmetadata', updateDuration1)

    return () => {
      video1.removeEventListener('timeupdate', updateTime1)
      video1.removeEventListener('loadedmetadata', updateDuration1)
    }
  }, [selectedVideo1])

  useEffect(() => {
    const video2 = video2Ref.current
    if (!video2) return

    const updateTime2 = () => setCurrentTime2(video2.currentTime)
    const updateDuration2 = () => setDuration2(video2.duration)

    video2.addEventListener('timeupdate', updateTime2)
    video2.addEventListener('loadedmetadata', updateDuration2)

    return () => {
      video2.removeEventListener('timeupdate', updateTime2)
      video2.removeEventListener('loadedmetadata', updateDuration2)
    }
  }, [selectedVideo2])

  const togglePlay1 = () => {
    const video1 = video1Ref.current
    if (!video1) return

    if (isPlaying1) {
      video1.pause()
    } else {
      video1.play()
    }
    setIsPlaying1(!isPlaying1)
  }

  const togglePlay2 = () => {
    const video2 = video2Ref.current
    if (!video2) return

    if (isPlaying2) {
      video2.pause()
    } else {
      video2.play()
    }
    setIsPlaying2(!isPlaying2)
  }

  const syncVideos = () => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return

    // Pause both videos
    video1.pause()
    video2.pause()
    setIsPlaying1(false)
    setIsPlaying2(false)

    // Sync to the current time of video1
    video2.currentTime = video1.currentTime
  }

  const resetVideos = () => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return

    video1.currentTime = 0
    video2.currentTime = 0
    video1.pause()
    video2.pause()
    setIsPlaying1(false)
    setIsPlaying2(false)
  }

  const skipBoth = (seconds: number) => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return

    video1.currentTime = Math.max(0, Math.min(duration1, video1.currentTime + seconds))
    video2.currentTime = Math.max(0, Math.min(duration2, video2.currentTime + seconds))
  }

  const frameBoth = (direction: 'forward' | 'backward') => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return

    const frameTime = 1/30 // Assuming 30fps
    const delta = direction === 'forward' ? frameTime : -frameTime

    video1.currentTime = Math.max(0, Math.min(duration1, video1.currentTime + delta))
    video2.currentTime = Math.max(0, Math.min(duration2, video2.currentTime + delta))
  }

  const saveComparison = async () => {
    if (!selectedVideo1 || !selectedVideo2) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/videos/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video1Id: selectedVideo1.id,
          video2Id: selectedVideo2.id,
          title: comparisonTitle || null,
          notes: comparisonNotes || null,
        }),
      })

      if (response.ok) {
        setShowSaveForm(false)
        setComparisonTitle('')
        setComparisonNotes('')
        // Refresh the page to show new comparison
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving comparison:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Comparison</h1>
          <p className="text-gray-600 mt-2">
            Compare two videos side-by-side for detailed analysis
          </p>
        </div>
        <Link
          href="/dashboard/videos"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Videos
        </Link>
      </div>

      {/* Video Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Video 1</h2>
          <select
            value={selectedVideo1?.id || ''}
            onChange={(e) => {
              const video = videos.find(v => v.id === e.target.value)
              setSelectedVideo1(video || null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="">Select first video</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title || `${EVENT_TYPE_LABELS[video.eventType]} - ${video.athlete.name || video.athlete.email}`}
              </option>
            ))}
          </select>

          {selectedVideo1 && (
            <div className="relative bg-black rounded overflow-hidden">
              <video
                ref={video1Ref}
                src={selectedVideo1.url}
                className="w-full aspect-video"
                onPlay={() => setIsPlaying1(true)}
                onPause={() => setIsPlaying1(false)}
                muted={muted1}
              />

              {/* Video 1 Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="mb-2">
                  <input
                    type="range"
                    min={0}
                    max={duration1 || 0}
                    value={currentTime1}
                    onChange={(e) => {
                      const video = video1Ref.current
                      if (video) {
                        video.currentTime = parseFloat(e.target.value)
                      }
                    }}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-white text-sm mt-1">
                    <span>{formatTime(currentTime1)}</span>
                    <span>{formatTime(duration1)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlay1}
                      className="text-white hover:text-blue-400 p-2 bg-white/20 rounded-full"
                    >
                      {isPlaying1 ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setMuted1(!muted1)}
                      className="text-white hover:text-blue-400"
                    >
                      {muted1 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume1}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value)
                        setVolume1(newVolume)
                        if (video1Ref.current) {
                          video1Ref.current.volume = newVolume
                        }
                      }}
                      className="w-16 h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Video 2</h2>
          <select
            value={selectedVideo2?.id || ''}
            onChange={(e) => {
              const video = videos.find(v => v.id === e.target.value)
              setSelectedVideo2(video || null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="">Select second video</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title || `${EVENT_TYPE_LABELS[video.eventType]} - ${video.athlete.name || video.athlete.email}`}
              </option>
            ))}
          </select>

          {selectedVideo2 && (
            <div className="relative bg-black rounded overflow-hidden">
              <video
                ref={video2Ref}
                src={selectedVideo2.url}
                className="w-full aspect-video"
                onPlay={() => setIsPlaying2(true)}
                onPause={() => setIsPlaying2(false)}
                muted={muted2}
              />

              {/* Video 2 Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="mb-2">
                  <input
                    type="range"
                    min={0}
                    max={duration2 || 0}
                    value={currentTime2}
                    onChange={(e) => {
                      const video = video2Ref.current
                      if (video) {
                        video.currentTime = parseFloat(e.target.value)
                      }
                    }}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-white text-sm mt-1">
                    <span>{formatTime(currentTime2)}</span>
                    <span>{formatTime(duration2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlay2}
                      className="text-white hover:text-blue-400 p-2 bg-white/20 rounded-full"
                    >
                      {isPlaying2 ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setMuted2(!muted2)}
                      className="text-white hover:text-blue-400"
                    >
                      {muted2 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume2}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value)
                        setVolume2(newVolume)
                        if (video2Ref.current) {
                          video2Ref.current.volume = newVolume
                        }
                      }}
                      className="w-16 h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synchronized Controls */}
      {selectedVideo1 && selectedVideo2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Synchronized Controls</h3>

          <div className="flex items-center justify-center space-x-4 mb-4">
            {/* Frame Navigation */}
            <button
              onClick={() => frameBoth('backward')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Frame Back
            </button>

            {/* Skip Back */}
            <button
              onClick={() => skipBoth(-5)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <SkipBack className="w-4 h-4 mr-1" />
              -5s
            </button>

            {/* Sync Videos */}
            <button
              onClick={syncVideos}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sync Videos
            </button>

            {/* Reset */}
            <button
              onClick={resetVideos}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipBoth(5)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              +5s
              <SkipForward className="w-4 h-4 ml-1" />
            </button>

            {/* Frame Navigation */}
            <button
              onClick={() => frameBoth('forward')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Frame Forward
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={userRole !== 'COACH'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Comparison
            </button>
          </div>
        </div>
      )}

      {/* Save Comparison Form */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Comparison</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={comparisonTitle}
                  onChange={(e) => setComparisonTitle(e.target.value)}
                  placeholder="Enter comparison title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={comparisonNotes}
                  onChange={(e) => setComparisonNotes(e.target.value)}
                  placeholder="Add comparison notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaveForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={saveComparison}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Comparisons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Saved Comparisons ({existingComparisons.length})
        </h3>

        {existingComparisons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingComparisons.map((comparison) => (
              <div key={comparison.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {comparison.title || 'Untitled Comparison'}
                </h4>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <VideoIcon className="w-4 h-4 mr-1" />
                    <span>
                      {EVENT_TYPE_LABELS[comparison.video1.eventType]} vs {EVENT_TYPE_LABELS[comparison.video2.eventType]}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(comparison.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {comparison.notes && (
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    {comparison.notes}
                  </p>
                )}

                <button
                  onClick={() => {
                    const video1 = videos.find(v => v.id === comparison.video1.id)
                    const video2 = videos.find(v => v.id === comparison.video2.id)
                    if (video1) setSelectedVideo1(video1)
                    if (video2) setSelectedVideo2(video2)
                  }}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  Load Comparison
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <VideoIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No saved comparisons yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}