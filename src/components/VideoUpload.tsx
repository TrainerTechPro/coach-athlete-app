'use client'

import { useState, useRef } from 'react'
import { Upload, Video, Camera, X, CheckCircle, AlertCircle } from 'lucide-react'

interface VideoUploadProps {
  onUploadSuccess: (videoData: {
    url: string
    eventType: string
    title?: string
    description?: string
  }) => void
  onCancel: () => void
}

const EVENT_TYPES = [
  { value: 'SHOT_PUT', label: 'Shot Put' },
  { value: 'DISCUS', label: 'Discus' },
  { value: 'HAMMER_THROW', label: 'Hammer Throw' },
  { value: 'JAVELIN', label: 'Javelin' },
  { value: 'HIGH_JUMP', label: 'High Jump' },
  { value: 'LONG_JUMP', label: 'Long Jump' },
  { value: 'TRIPLE_JUMP', label: 'Triple Jump' },
  { value: 'POLE_VAULT', label: 'Pole Vault' },
  { value: 'SPRINT', label: 'Sprint' },
  { value: 'HURDLES', label: 'Hurdles' },
  { value: 'DISTANCE', label: 'Distance' },
  { value: 'OTHER', label: 'Other' },
]

export default function VideoUpload({ onUploadSuccess, onCancel }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [eventType, setEventType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }

      setSelectedFile(file)
      setError('')

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError('')

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (!selectedFile || !eventType) {
      setError('Please select a video file and event type')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('eventType', eventType)
      formData.append('title', title)
      formData.append('description', description)

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      setUploadProgress(100)
      setTimeout(() => {
        onUploadSuccess({
          url: data.video.url,
          eventType: data.video.eventType,
          title: data.video.title,
          description: data.video.description,
        })
      }, 500)

    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setEventType('')
    setTitle('')
    setDescription('')
    setError('')
    setPreviewUrl('')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Video
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Video File
            </label>

            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drop video here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP4, MOV, AVI formats • Max 50MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Video Preview */}
                {previewUrl && (
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    className="w-full max-h-64 rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Event Type *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            >
              <option value="">Select event type</option>
              {EVENT_TYPES.map((event) => (
                <option key={event.value} value={event.value}>
                  {event.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadProgress === 100 && !error && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-600">Video uploaded successfully!</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !eventType || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Camera className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}