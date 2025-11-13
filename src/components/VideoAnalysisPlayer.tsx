'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Circle,
  Minus,
  Undo2,
  Save,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'
import TelestrationCanvas from './TelestrationCanvas'

interface VideoData {
  id: string
  url: string
  title?: string | null
  description?: string | null
  eventType: string
  duration?: number | null
  uploadedAt: string
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
  analyses: Array<{
    id: string
    timestamp: number
    annotationUrl: string
    notes?: string | null
    createdAt: string
    creator: {
      id: string
      name: string | null
      email: string
    }
  }>
}

interface VideoAnalysisPlayerProps {
  video: VideoData
  currentUserId: string
  userRole: string
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

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

export default function VideoAnalysisPlayer({ video, currentUserId, userRole }: VideoAnalysisPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, video.currentTime - 5)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.min(duration, video.currentTime + 5)
  }

  const frameBackward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, video.currentTime - 1/30) // Assuming 30fps
  }

  const frameForward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.min(duration, video.currentTime + 1/30) // Assuming 30fps
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      video.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const startAnalysis = () => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    setIsPlaying(false)
    setShowAnalysis(true)
  }

  const saveAnalysis = async (annotationDataUrl: string) => {
    setIsSavingAnalysis(true)

    try {
      const response = await fetch('/api/videos/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.id,
          timestamp: currentTime,
          annotationData: annotationDataUrl,
          notes: analysisNotes,
        }),
      })

      if (response.ok) {
        // Refresh the page to show new analysis
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
    } finally {
      setIsSavingAnalysis(false)
      setShowAnalysis(false)
      setAnalysisNotes('')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {video.title || `${EVENT_TYPE_LABELS[video.eventType]} Analysis`}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{video.athlete.name || video.athlete.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {EVENT_TYPE_LABELS[video.eventType]}
              </div>
            </div>
            {video.description && (
              <p className="text-gray-600 mt-2">{video.description}</p>
            )}
          </div>

          <button
            onClick={startAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            disabled={userRole !== 'COACH'}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Analyze Frame
          </button>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full aspect-video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Telestration Overlay */}
        {showAnalysis && (
          <TelestrationCanvas
            width={videoRef.current?.clientWidth || 800}
            height={videoRef.current?.clientHeight || 450}
            onSave={saveAnalysis}
            onCancel={() => setShowAnalysis(false)}
            isSaving={isSavingAnalysis}
          />
        )}

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleTimeChange}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Frame Navigation */}
              <button
                onClick={frameBackward}
                className="text-white hover:text-blue-400 p-1"
                title="Previous Frame"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Skip Back */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-blue-400 p-1"
                title="Skip Back 5s"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 p-2 bg-white/20 rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="text-white hover:text-blue-400 p-1"
                title="Skip Forward 5s"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Frame Navigation */}
              <button
                onClick={frameForward}
                className="text-white hover:text-blue-400 p-1"
                title="Next Frame"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
                className="bg-white/20 text-white text-sm px-2 py-1 rounded border-none"
              >
                {PLAYBACK_SPEEDS.map((speed) => (
                  <option key={speed} value={speed} className="text-black">
                    {speed}x
                  </option>
                ))}
              </select>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1"
                />
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Notes Input */}
        {showAnalysis && (
          <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg max-w-xs">
            <h3 className="font-medium text-gray-900 mb-2">Analysis Notes</h3>
            <textarea
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              placeholder="Add your analysis notes..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}
      </div>

      {/* Analysis History */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Previous Analyses ({video.analyses.length})
        </h3>

        {video.analyses.length > 0 ? (
          <div className="space-y-4">
            {video.analyses.map((analysis) => (
              <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {analysis.creator.name || analysis.creator.email}
                    </span>
                    <span className="text-sm text-gray-500">
                      at {formatTime(analysis.timestamp)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {analysis.notes && (
                  <p className="text-gray-700 mb-3">{analysis.notes}</p>
                )}

                <img
                  src={analysis.annotationUrl}
                  alt="Video analysis annotation"
                  className="w-full max-w-sm rounded border cursor-pointer"
                  onClick={() => window.open(analysis.annotationUrl, '_blank')}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No analyses yet. Start analyzing to add feedback!</p>
          </div>
        )}
      </div>
    </div>
  )
}