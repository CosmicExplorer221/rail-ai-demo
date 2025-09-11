import { useState, useMemo } from 'react'
import { Play, Square, RotateCcw, ChevronRight, Calendar, Eye, EyeOff, Pause, PlayCircle, Map as MapIcon } from 'lucide-react'
import { mockEvents } from '../data/mockData'
import { Map } from './Map'

function EventTypeChip({ type }: { type: string }) {
  const getChipStyle = (type: string) => {
    switch (type) {
      case 'RED_SIGNAL':
        return { backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fca5a5' }
      case 'PERSON_IN_TRACK':
        return { backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' }
      case 'OBSTACLE':
        return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }
      case 'SPEED_LIMIT':
        return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' }
      case 'WARNING':
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
    }
  }

  const chipStyle = getChipStyle(type)
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.125rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid',
      ...chipStyle
    }}>
      {type.replace('_', ' ')}
    </span>
  )
}

export function Review() {
  const [fps, setFps] = useState(30)
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false)
  const [currentVideoFile, setCurrentVideoFile] = useState('lineA_km12+400_frontcab.mp4')
  const [videoResolution] = useState('1920x1080')
  const [videoFps] = useState('30 fps')

  // Mock video clips data
  const [recentClips] = useState([
    {
      id: 1,
      name: 'lineA_km12+400_frontcab.mp4',
      duration: '01:42',
      resolution: '1920x1080',
      fps: '30 fps',
      status: 'processing',
      isActive: true
    },
    {
      id: 2,
      name: 'lineB_stationApproach_frontcab.mp4',
      duration: '00:58',
      resolution: '1920x1080',
      fps: '30 fps',
      status: 'completed',
      isActive: false
    },
    {
      id: 3,
      name: 'yard_2025-09-08_0630.mp4',
      duration: '00:37',
      resolution: '3840x2160',
      fps: '60 fps',
      status: 'completed',
      isActive: false
    }
  ])

  // Sort events chronologically and calculate timeline positions
  const sortedEvents = useMemo(() => {
    const sorted = [...mockEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    // Calculate relative positions (0-100) based on time
    if (sorted.length > 1) {
      const firstTime = new Date(sorted[0].timestamp).getTime()
      const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime()
      const timeRange = lastTime - firstTime || 1 // Avoid division by zero
      
      return sorted.map(event => ({
        ...event,
        timelinePosition: ((new Date(event.timestamp).getTime() - firstTime) / timeRange) * 100
      }))
    }
    
    return sorted.map(event => ({ ...event, timelinePosition: 50 }))
  }, [])

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickPosition = ((event.clientX - rect.left) / rect.width) * 100
    
    // Find closest event to clicked position
    const closestEvent = sortedEvents.reduce((closest, current) => {
      return Math.abs(current.timelinePosition - clickPosition) < Math.abs(closest.timelinePosition - clickPosition)
        ? current
        : closest
    })
    
    setSelectedEvent(closestEvent)
  }

  const handleClipSelection = (clip: any) => {
    setCurrentVideoFile(clip.name)
    // Update the processing info based on selected clip
    // In a real app, this would trigger new event loading for that video
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Review</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>Analyze detected events and validate AI predictions</p>
      </div>

      {/* Timeline Scrubber */}
      <div className="card mb-8">
        <div className="p-6">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <Calendar style={{width: '1.25rem', height: '1.25rem', color: '#4b5563'}} />
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>Event Timeline</h3>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {sortedEvents.length} events
              </span>
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button
                onClick={() => setShowVideo(!showVideo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: showVideo ? '#eff6ff' : 'transparent',
                  color: showVideo ? '#1d4ed8' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showVideo ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showVideo ? '#eff6ff' : 'transparent'}
              >
                {showVideo ? <EyeOff style={{width: '1rem', height: '1rem'}} /> : <Eye style={{width: '1rem', height: '1rem'}} />}
                {showVideo ? 'Hide Video' : 'Show Video'}
              </button>
              
              <button
                onClick={() => setShowMap(!showMap)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: showMap ? '#eff6ff' : 'transparent',
                  color: showMap ? '#1d4ed8' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showMap ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showMap ? '#eff6ff' : 'transparent'}
              >
                <MapIcon style={{width: '1rem', height: '1rem'}} />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* Video Processing Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.5rem',
            border: '1px solid #e0f2fe'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span style={{fontSize: '0.875rem', color: '#0369a1', fontWeight: '500'}}>Now processing:</span>
              <span style={{
                fontSize: '0.875rem',
                color: '#0c4a6e',
                fontWeight: '600',
                backgroundColor: '#bae6fd',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem'
              }}>
                {currentVideoFile}
              </span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#0369a1'}}>
              <span>{videoResolution}</span>
              <span>{videoFps}</span>
            </div>
          </div>

          {/* Timeline Bar */}
          <div style={{marginBottom: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem'}}>
              <span>{sortedEvents.length > 0 ? new Date(sortedEvents[0].timestamp).toLocaleTimeString('en-US', { hour12: false }) : '00:00'}</span>
              <span>24 Hours</span>
              <span>{sortedEvents.length > 0 ? new Date(sortedEvents[sortedEvents.length - 1].timestamp).toLocaleTimeString('en-US', { hour12: false }) : '23:59'}</span>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {/* Timeline Play/Pause Button */}
              <button
                onClick={() => setTimelineIsPlaying(!timelineIsPlaying)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {timelineIsPlaying ? (
                  <Pause style={{width: '1.25rem', height: '1.25rem'}} />
                ) : (
                  <PlayCircle style={{width: '1.25rem', height: '1.25rem'}} />
                )}
              </button>
              
              {/* Timeline Track */}
              <div 
                onClick={handleTimelineClick}
                style={{
                  position: 'relative',
                  height: '3rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  border: '2px solid #e5e7eb',
                  transition: 'border-color 0.2s',
                  flex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
              {/* Timeline Track */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '1rem',
                right: '1rem',
                height: '4px',
                backgroundColor: '#d1d5db',
                borderRadius: '2px',
                transform: 'translateY(-50%)'
              }} />

              {/* Event Markers */}
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedEvent(event)
                  }}
                  style={{
                    position: 'absolute',
                    left: `${Math.max(1, Math.min(95, event.timelinePosition))}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    border: '2px solid white',
                    backgroundColor: (() => {
                      switch (event.type) {
                        case 'RED_SIGNAL': return '#991b1b'
                        case 'PERSON_IN_TRACK': return '#9a3412'
                        case 'OBSTACLE': return '#92400e'
                        case 'SPEED_LIMIT': return '#1e40af'
                        case 'WARNING': return '#374151'
                        default: return '#374151'
                      }
                    })(),
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedEvent.id === event.id ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    zIndex: selectedEvent.id === event.id ? 10 : 5
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'
                    e.currentTarget.style.zIndex = '15'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                    e.currentTarget.style.zIndex = selectedEvent.id === event.id ? '10' : '5'
                  }}
                  title={`${event.type.replace('_', ' ')} - ${event.timestamp}`}
                />
              ))}
              </div>
            </div>
          </div>

          {/* Selected Event Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <EventTypeChip type={selectedEvent.type} />
              <span style={{fontSize: '0.875rem', fontWeight: '600', color: '#111827'}}>
                Event #{selectedEvent.id}
              </span>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                {selectedEvent.timestamp}
              </span>
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe'
            }}>
              {(selectedEvent.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', 
        gridTemplateColumns: (() => {
          const columns = []
          if (showVideo) columns.push('3fr')
          if (showMap) columns.push('2fr')  
          columns.push('1fr', '1fr') // Events and Clips
          return columns.join(' ')
        })(),
        gap: '2rem'
      }}>
        {/* Video Player Section */}
        {showVideo && (
        <div>
          <div className="card">
            <div className="p-6">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h3 className="text-xl font-semibold text-gray-900">
                  Event: {selectedEvent.id} - Frame {selectedEvent.frame}
                </h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <EventTypeChip type={selectedEvent.type} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid #bfdbfe'
                  }}>
                    {(selectedEvent.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>

              {/* Video Placeholder */}
              <div style={{
                position: 'relative',
                backgroundColor: '#111827',
                borderRadius: '0.75rem',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{textAlign: 'center'}}>
                  <Play style={{width: '5rem', height: '5rem', color: '#9ca3af', margin: '0 auto 0.75rem'}} />
                  <p style={{fontSize: '1.125rem', color: '#9ca3af', fontWeight: '500'}}>Event Video Playback</p>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>Frame {selectedEvent.frame} • {selectedEvent.timestamp}</p>
                </div>
                
                {/* ROI Overlay Chips */}
                <div style={{position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}>
                    ROI #1: Signal Detection
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}>
                    ROI #2: Track Area
                  </span>
                </div>
              </div>

              {/* Video Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  >
                    {isPlaying ? (
                      <Square style={{width: '1.25rem', height: '1.25rem'}} />
                    ) : (
                      <Play style={{width: '1.25rem', height: '1.25rem'}} />
                    )}
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: '1px solid #d1d5db',
                    color: '#4b5563',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                    <RotateCcw style={{width: '1.25rem', height: '1.25rem'}} />
                  </button>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <label htmlFor="fps" style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
                      FPS:
                    </label>
                    <input
                      id="fps"
                      type="range"
                      min="1"
                      max="60"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      style={{width: '6rem'}}
                    />
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      minWidth: '3rem'
                    }}>
                      {fps}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div style={{
                marginTop: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>Event Details</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem'}}>
                  <div style={{backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem'}}>
                    <dt style={{fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem'}}>Timestamp</dt>
                    <dd style={{fontSize: '1rem', fontWeight: '600', color: '#111827'}}>{selectedEvent.timestamp}</dd>
                  </div>
                  <div style={{backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem'}}>
                    <dt style={{fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem'}}>Confidence</dt>
                    <dd style={{fontSize: '1rem', fontWeight: '600', color: '#111827'}}>{(selectedEvent.confidence * 100).toFixed(1)}%</dd>
                  </div>
                  <div style={{gridColumn: 'span 2', backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem'}}>
                    <dt style={{fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem'}}>Description</dt>
                    <dd style={{fontSize: '1rem', fontWeight: '600', color: '#111827'}}>{selectedEvent.note}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Map Section */}
        {showMap && (
          <Map 
            selectedEvent={selectedEvent} 
            onEventSelect={setSelectedEvent}
          />
        )}

        {/* Event List Sidebar */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>All Events</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '700px', overflowY: 'auto'}}>
              {sortedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid',
                    borderColor: selectedEvent.id === event.id ? '#bfdbfe' : '#e5e7eb',
                    backgroundColor: selectedEvent.id === event.id ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedEvent.id === event.id ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEvent.id !== event.id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEvent.id !== event.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <EventTypeChip type={event.type} />
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#4b5563',
                        backgroundColor: '#f3f4f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ChevronRight style={{
                      width: '1rem',
                      height: '1rem',
                      color: selectedEvent.id === event.id ? '#3b82f6' : '#9ca3af',
                      transition: 'color 0.2s'
                    }} />
                  </div>
                  <p style={{fontSize: '0.875rem', color: '#111827', marginBottom: '0.5rem', fontWeight: '500'}}>{event.note}</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>
                    Frame {event.frame} • {event.timestamp}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Clips Panel */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>Recent clips</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '700px', overflowY: 'auto'}}>
              {recentClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => handleClipSelection(clip)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid',
                    borderColor: clip.name === currentVideoFile ? '#10b981' : '#e5e7eb',
                    backgroundColor: clip.name === currentVideoFile ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: clip.name === currentVideoFile ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (clip.name !== currentVideoFile) {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (clip.name !== currentVideoFile) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontSize: '0.875rem', color: '#6b7280'}}>📹</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: clip.status === 'processing' ? '#10b981' : '#6b7280',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        textTransform: 'capitalize'
                      }}>
                        {clip.status}
                      </span>
                    </div>
                    <ChevronRight style={{
                      width: '1rem',
                      height: '1rem',
                      color: clip.name === currentVideoFile ? '#10b981' : '#9ca3af',
                      transition: 'color 0.2s'
                    }} />
                  </div>
                  
                  <p style={{
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {clip.name}
                  </p>
                  
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#6b7280'}}>
                    <span>{clip.duration}</span>
                    <span>{clip.resolution}</span>
                    <span>{clip.fps}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Heads up info */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
                <span style={{
                  fontSize: '1.25rem',
                  color: '#3b82f6',
                  marginTop: '0.125rem'
                }}>ℹ️</span>
                <div>
                  <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem'}}>
                    Heads up
                  </h4>
                  <p style={{fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.4'}}>
                    This MVP streams random detections for demo and maps them to a synthetic route. 
                    Wire to GPS/IMU + detector API for real data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}