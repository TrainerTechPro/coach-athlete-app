'use client'

import { useRef, useState, useEffect } from 'react'
import { Minus, Circle, Edit3, Undo2, Save, X, Palette } from 'lucide-react'

interface TelestrationCanvasProps {
  width: number
  height: number
  onSave: (dataUrl: string) => void
  onCancel: () => void
  isSaving: boolean
}

type DrawingTool = 'line' | 'circle' | 'freehand'

const COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
]

export default function TelestrationCanvas({
  width,
  height,
  onSave,
  onCancel,
  isSaving
}: TelestrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<DrawingTool>('freehand')
  const [currentColor, setCurrentColor] = useState('#EF4444')
  const [lineWidth, setLineWidth] = useState(3)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [paths, setPaths] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing properties
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = currentColor
    ctx.lineWidth = lineWidth
  }, [width, height, currentColor, lineWidth])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const saveState = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setPaths(prev => [...prev, imageData])
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPos(pos)
    saveState()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.beginPath()

    if (currentTool === 'freehand') {
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const currentPos = getMousePos(e)

    if (currentTool === 'freehand') {
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()
    } else if (currentTool === 'line' || currentTool === 'circle') {
      // Clear canvas and redraw from saved state
      const lastState = paths[paths.length - 1]
      if (lastState) {
        ctx.putImageData(lastState, 0, 0)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      ctx.beginPath()
      ctx.strokeStyle = currentColor
      ctx.lineWidth = lineWidth

      if (currentTool === 'line') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(currentPos.x, currentPos.y)
        ctx.stroke()
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
        )
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const undo = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    if (paths.length > 0) {
      const newPaths = [...paths]
      newPaths.pop()
      setPaths(newPaths)

      const lastState = newPaths[newPaths.length - 1]
      if (lastState) {
        ctx.putImageData(lastState, 0, 0)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="border border-gray-300 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Drawing Tools */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-lg space-y-4">
          <h3 className="font-medium text-gray-900">Drawing Tools</h3>

          {/* Tool Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tool:</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentTool('freehand')}
                className={`p-2 rounded ${
                  currentTool === 'freehand'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Freehand"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentTool('line')}
                className={`p-2 rounded ${
                  currentTool === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Line"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentTool('circle')}
                className={`p-2 rounded ${
                  currentTool === 'circle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded border-2 ${
                    currentColor === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Width: {lineWidth}px
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={undo}
              className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Analysis'}
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm text-gray-600">
            Draw on the paused frame to highlight key areas. Use different tools and colors
            to create detailed analysis annotations.
          </p>
        </div>
      </div>
    </div>
  )
}