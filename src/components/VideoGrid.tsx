'use client'

import { useState } from 'react'
import { Video, Play, Calendar, User, MoreVertical, Eye, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import VideoUpload from './VideoUpload'

interface VideoData {
  id: string
  url: string
  thumbnailUrl?: string | null
  eventType: string
  title?: string | null
  description?: string | null
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
  _count: {
    analyses: number
    comparisons: number
  }
}

interface VideoGridProps {
  videos: VideoData[]
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

export default function VideoGrid({ videos, currentUserId, userRole }: VideoGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const eventTypes = [...new Set(videos.map(v => v.eventType))]
  const filteredVideos = selectedFilter === 'all'
    ? videos
    : videos.filter(v => v.eventType === selectedFilter)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    // Refresh the page to show new video
    window.location.reload()
  }

  return (
    <>
      <div className="mb-6">
        {/* Filter and Upload Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Event:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {eventTypes.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {EVENT_TYPE_LABELS[eventType] || eventType}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-900 group cursor-pointer">
                <Link href={`/dashboard/videos/${video.id}`}>
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Event Type Badge */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {EVENT_TYPE_LABELS[video.eventType] || video.eventType}
                  </div>
                </Link>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {video.title || `${EVENT_TYPE_LABELS[video.eventType]} Video`}
                  </h3>

                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {video.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}

                <div className="space-y-2">
                  {/* Athlete Info */}
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>
                      {userRole === 'COACH'
                        ? (video.athlete.name || video.athlete.email)
                        : 'You'
                      }
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(video.uploadedAt)}</span>
                  </div>

                  {/* Analysis Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-4">
                      <span className="text-blue-600">
                        {video._count.analyses} analyses
                      </span>
                      <span className="text-green-600">
                        {video._count.comparisons} comparisons
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/dashboard/videos/${video.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 text-center flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Analyze
                  </Link>
                  <Link
                    href={`/dashboard/videos/${video.id}/edit`}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 text-center flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && videos.length > 0 && (
          <div className="text-center py-8">
            <Video className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">No videos found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUpload
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </>
  )
}