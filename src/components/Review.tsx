import { useState } from 'react'
import { Play, Square, RotateCcw, ChevronRight } from 'lucide-react'
import { mockEvents } from '../data/mockData'

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Review</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>Analyze detected events and validate AI predictions</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem'}}>
        {/* Video Player Section */}
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

        {/* Event List Sidebar */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>All Events</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '700px', overflowY: 'auto'}}>
              {mockEvents.map((event) => (
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
      </div>
    </div>
  )
}