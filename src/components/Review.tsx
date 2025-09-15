import { useState, useMemo } from 'react'
import { Play, Square, RotateCcw, ChevronRight, Calendar, Eye, EyeOff, Map as MapIcon } from 'lucide-react'
import { mockEvents, videoDatasets, mockUploadBatches, getRouteForVideo } from '../data/mockData'
import { Map } from './Map'
import { useTicker } from '../hooks/useTicker'

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
  // Add CSS styles for the timeline slider
  const sliderStyles = `
    .timeline-slider::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 2px solid #000;
      cursor: pointer;
      transition: all 0.2s;
    }
    .timeline-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    .timeline-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 2px solid #000;
      cursor: pointer;
    }
    .timeline-slider::-moz-range-track {
      height: 4px;
      border-radius: 2px;
    }
  `
  const [fps, setFps] = useState(30)
  const [currentVideoFile, setCurrentVideoFile] = useState('lineA_km12+400_frontcab.mp4')
  const [currentEvents, setCurrentEvents] = useState(videoDatasets[currentVideoFile] || mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(0) // Current position in seconds
  const [videoResolution] = useState('1920x1080')
  const [videoFps] = useState('30 fps')
  const [showTimelineEvents, setShowTimelineEvents] = useState(false) // Toggle for showing events on timeline
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set()) // Active event type filters
  
  // Get route definition for current video
  const currentRoute = useMemo(() => getRouteForVideo(currentVideoFile), [currentVideoFile])
  
  // Timeline animation using the custom hook
  useTicker(timelineIsPlaying, (deltaTime) => {
    if (!currentRoute) return
    
    setTimelinePosition(prev => {
      const newPosition = prev + deltaTime
      // Loop back to start when reaching the end
      return newPosition >= currentRoute.totalDuration ? 0 : newPosition
    })
  })

  // Get .mp4 files from uploads
  const videoClips = useMemo(() => {
    return mockUploadBatches
      .filter(batch => batch.type === 'MP4')
      .map(batch => ({
        id: batch.id,
        name: batch.name,
        duration: batch.name.includes('yard') ? '00:37' : batch.name.includes('stationApproach') ? '00:58' : '01:42',
        resolution: batch.name.includes('yard') ? '3840x2160' : '1920x1080',
        fps: batch.name.includes('yard') ? '60 fps' : '30 fps',
        status: batch.status.toLowerCase(),
        size: batch.size,
        uploadDate: batch.uploadDate
      }))
  }, [])

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    if (activeFilters.size === 0) return currentEvents
    return currentEvents.filter(event => activeFilters.has(event.type))
  }, [currentEvents, activeFilters])

  // Handle filter toggle
  const handleFilterToggle = (filterName: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(filterName)) {
        newFilters.delete(filterName)
      } else {
        newFilters.add(filterName)
      }
      return newFilters
    })
  }

  // Sort events chronologically and calculate timeline positions
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
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
  }, [filteredEvents])


  const handleClipSelection = (clip: any) => {
    setCurrentVideoFile(clip.name)
    // Get events for the selected video clip
    const newEvents = videoDatasets[clip.name] || mockEvents
    setCurrentEvents(newEvents)
    // Set the first event of the new dataset as selected
    if (newEvents.length > 0) {
      setSelectedEvent(newEvents[0])
    }
  }

  return (
    <div className="p-8">
      {/* Inject custom CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Review</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>Analyze detected events and validate AI predictions</p>
      </div>

      {/* Main Layout Grid */}
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem'}}>
        {/* Left Column - Event Timeline */}
        <div>
          {/* Timeline Scrubber */}
          <div className="card">
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
              
              <button
                onClick={() => setShowTimelineEvents(!showTimelineEvents)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: showTimelineEvents ? '#eff6ff' : 'transparent',
                  color: showTimelineEvents ? '#1d4ed8' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showTimelineEvents ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showTimelineEvents ? '#eff6ff' : 'transparent'}
              >
                {showTimelineEvents ? <EyeOff style={{width: '1rem', height: '1rem'}} /> : <Eye style={{width: '1rem', height: '1rem'}} />}
                {showTimelineEvents ? 'Hide Events' : 'Show Events'}
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
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
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

          {/* Unified Timeline with Progress and Events */}
          <div style={{marginBottom: '1rem'}}>
            {/* Timeline Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <span>{sortedEvents.length > 0 ? new Date(sortedEvents[0].timestamp).toLocaleTimeString('en-US', { hour12: false }) : '00:00'}</span>
                <span style={{fontSize: '0.875rem', fontWeight: '600', color: '#111827'}}>
                  {currentRoute ? `${Math.floor(timelinePosition / 60)}:${(Math.floor(timelinePosition) % 60).toString().padStart(2, '0')} / ${Math.floor(currentRoute.totalDuration / 60)}:${(Math.floor(currentRoute.totalDuration) % 60).toString().padStart(2, '0')}` : '0:00 / 0:00'}
                </span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                {/* Play/Stop Buttons */}
                <button
                  onClick={() => setTimelineIsPlaying(true)}
                  disabled={timelineIsPlaying}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: timelineIsPlaying ? '#f3f4f6' : '#000',
                    color: timelineIsPlaying ? '#9ca3af' : 'white',
                    border: '1px solid #e5e7eb',
                    cursor: timelineIsPlaying ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (!timelineIsPlaying) {
                      e.currentTarget.style.backgroundColor = '#333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!timelineIsPlaying) {
                      e.currentTarget.style.backgroundColor = '#000'
                    }
                  }}
                >
                  <Play style={{width: '0.75rem', height: '0.75rem'}} />
                  Play
                </button>
                
                <button
                  onClick={() => setTimelineIsPlaying(false)}
                  disabled={!timelineIsPlaying}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: !timelineIsPlaying ? '#f3f4f6' : '#000',
                    color: !timelineIsPlaying ? '#9ca3af' : 'white',
                    border: '1px solid #e5e7eb',
                    cursor: !timelineIsPlaying ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (timelineIsPlaying) {
                      e.currentTarget.style.backgroundColor = '#333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timelineIsPlaying) {
                      e.currentTarget.style.backgroundColor = '#000'
                    }
                  }}
                >
                  <Square style={{width: '0.75rem', height: '0.75rem'}} />
                  Stop
                </button>
                
                <span>{sortedEvents.length} events</span>
                <span>{sortedEvents.length > 0 ? new Date(sortedEvents[sortedEvents.length - 1].timestamp).toLocaleTimeString('en-US', { hour12: false }) : '23:59'}</span>
              </div>
            </div>
            
            
            {/* Timeline Scrubber with Events */}
            <div style={{
              marginTop: '1rem',
              padding: '0 1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {/* Timeline container with events */}
                <div style={{
                  position: 'relative',
                  flex: 1,
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <input
                    type="range"
                    min="0"
                    max={currentRoute?.totalDuration || 100}
                    value={timelinePosition}
                    onChange={(e) => {
                      const newPosition = Number(e.target.value)
                      setTimelinePosition(newPosition)
                      
                      // Find the closest event to the new position for auto-selection
                      if (currentRoute && sortedEvents.length > 0) {
                        const positionRatio = newPosition / currentRoute.totalDuration
                        const closestEvent = sortedEvents.reduce((closest, current) => {
                          const currentRatio = current.timeRatio || (current.timelinePosition / 100)
                          const closestRatio = closest.timeRatio || (closest.timelinePosition / 100)
                          return Math.abs(currentRatio - positionRatio) < Math.abs(closestRatio - positionRatio)
                            ? current
                            : closest
                        })
                        setSelectedEvent(closestEvent)
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: `linear-gradient(to right, #000 0%, #000 ${currentRoute ? (timelinePosition / currentRoute.totalDuration) * 100 : 0}%, #e5e7eb ${currentRoute ? (timelinePosition / currentRoute.totalDuration) * 100 : 0}%, #e5e7eb 100%)`,
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                    className="timeline-slider"
                  />
                  
                  {/* Event Markers on Scrubber - only show when toggle is enabled */}
                  {showTimelineEvents && sortedEvents.map((event) => {
                    const timeRatio = currentRoute ? 
                      (event.timeRatio !== undefined ? event.timeRatio : event.timelinePosition / 100) : 
                      event.timelinePosition / 100
                    const leftPosition = timeRatio * 100
                    
                    return (
                      <div
                        key={`scrubber-event-${event.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                        style={{
                          position: 'absolute',
                          left: `${Math.max(1, Math.min(99, leftPosition))}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: selectedEvent?.id === event.id ? '16px' : '12px',
                          height: selectedEvent?.id === event.id ? '16px' : '12px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          backgroundColor: (() => {
                            switch (event.type) {
                              case 'RED_SIGNAL': return '#dc2626'
                              case 'PERSON_IN_TRACK': return '#f59e0b'
                              case 'OBSTACLE': return '#eab308'
                              case 'SPEED_LIMIT': return '#2563eb'
                              case 'WARNING': return '#6b7280'
                              default: return '#6b7280'
                            }
                          })(),
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: selectedEvent?.id === event.id ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
                          zIndex: selectedEvent?.id === event.id ? 15 : 10
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)'
                          e.currentTarget.style.zIndex = '25'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                          e.currentTarget.style.zIndex = selectedEvent?.id === event.id ? '15' : '10'
                        }}
                        title={`${event.type.replace('_', ' ')} - ${event.timestamp}`}
                      />
                    )
                  })}
                </div>
                
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  minWidth: '80px',
                  textAlign: 'right'
                }}>
                  {currentRoute ? `${((timelinePosition / currentRoute.totalDuration) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Event Info - only show when event is selected */}
          {selectedEvent && (
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
          )}
          </div>
        </div>

        {/* Right Column - Filters and Video Uploads */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {/* Filters Section */}
          <div className="card">
            <div className="p-6">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>Filters</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    {activeFilters.size > 0 ? `${activeFilters.size} active` : 'No filters'}
                  </span>
                  {activeFilters.size > 0 && (
                    <button
                      onClick={() => setActiveFilters(new Set())}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem'}}>
                {[
                  { name: 'PERSON_IN_TRACK', displayName: 'person track', color: '#ea580c' },
                  { name: 'OBSTACLE', displayName: 'track obstruction', color: '#d97706' },
                  { name: 'SIGNAL_GREEN', displayName: 'signal aspect green', color: '#16a34a' },
                  { name: 'SIGNAL_YELLOW', displayName: 'signal aspect yellow', color: '#d97706' },
                  { name: 'RED_SIGNAL', displayName: 'signal aspect red', color: '#dc2626' },
                  { name: 'BALISE', displayName: 'balise box', color: '#8b5cf6' },
                  { name: 'SPEED_LIMIT', displayName: 'speed board', color: '#2563eb' },
                  { name: 'SWITCH', displayName: 'switch', color: '#0891b2' },
                  { name: 'WARNING', displayName: 'crossing', color: '#6b7280' }
                ].map((filter) => {
                  const isActive = activeFilters.has(filter.name)
                  return (
                    <button
                      key={filter.name}
                      onClick={() => handleFilterToggle(filter.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: isActive ? '#111827' : '#374151',
                        backgroundColor: isActive ? '#eff6ff' : '#f9fafb',
                        border: '2px solid',
                        borderColor: isActive ? '#3b82f6' : '#e5e7eb',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                        fontWeight: isActive ? '500' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                          e.currentTarget.style.borderColor = '#d1d5db'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '0.75rem',
                          height: '0.75rem',
                          borderRadius: '50%',
                          backgroundColor: filter.color,
                          flexShrink: 0,
                          opacity: isActive ? 1 : 0.6
                        }}
                      />
                      {filter.displayName}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Video Uploads Panel */}
          <div className="card" style={{flex: 1}}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>Video Uploads</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto'}}>
                {videoClips.map((clip) => (
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
                          backgroundColor: (() => {
                            switch(clip.status) {
                              case 'completed': return '#10b981'
                              case 'processing': return '#f59e0b'
                              case 'failed': return '#dc2626'
                              default: return '#6b7280'
                            }
                          })(),
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
                      <span>{clip.size}</span>
                    </div>
                    <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                      Uploaded: {new Date(clip.uploadDate).toLocaleDateString()}
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
                      Video Uploads ({videoClips.length} files)
                    </h4>
                    <p style={{fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.4'}}>
                      Select any completed video upload to view its detected events on the timeline and map. 
                      Only .mp4 files from the uploads section are shown.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video and Map Section */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: (() => {
          const columns = []
          if (showVideo) columns.push('3fr')
          if (showMap) columns.push('2fr')  
          return columns.join(' ') || '1fr'
        })(),
        gap: '2rem'
      }}>
        {/* Video Player Section */}
        {showVideo && (
        <div>
          <div className="card">
            <div className="p-6">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                {selectedEvent ? (
                  <>
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
                  </>
                ) : (
                  <h3 className="text-xl font-semibold text-gray-900">
                    No Event Selected
                  </h3>
                )}
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
                  {selectedEvent && (
                    <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>Frame {selectedEvent.frame} • {selectedEvent.timestamp}</p>
                  )}
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
                {selectedEvent ? (
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
                ) : (
                  <p style={{fontSize: '1rem', color: '#6b7280', fontStyle: 'italic'}}>
                    Select an event to view details
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Map Section */}
        {showMap && (
          <div>
            <Map 
              selectedEvent={selectedEvent} 
              onEventSelect={setSelectedEvent}
              currentEvents={filteredEvents}
              timelinePosition={timelinePosition}
              videoFile={currentVideoFile}
              isPlaying={timelineIsPlaying}
            />
            
            {/* Event List Below Map */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>All Events</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '500px', overflowY: 'auto'}}>
                  {sortedEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid',
                        borderColor: selectedEvent?.id === event.id ? '#bfdbfe' : 'transparent',
                        backgroundColor: selectedEvent?.id === event.id ? '#eff6ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedEvent?.id !== event.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedEvent?.id !== event.id) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          minWidth: '4rem'
                        }}>
                          {event.timestamp.split(' ')[1]}
                        </span>
                        <EventTypeChip type={event.type} />
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#4b5563',
                          backgroundColor: selectedEvent?.id === event.id ? '#dbeafe' : '#f3f4f6',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          minWidth: '2.5rem',
                          textAlign: 'center'
                        }}>
                          {(event.confidence * 100).toFixed(0)}%
                        </span>
                        <span style={{
                          color: '#111827',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {event.note}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          minWidth: '4rem',
                          textAlign: 'right'
                        }}>
                          #{event.frame}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>

    </div>
  )
}