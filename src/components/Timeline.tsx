import { useState, useMemo } from 'react'
import { Calendar, Filter, Clock, AlertTriangle, Eye, MapPin, Zap } from 'lucide-react'
import { mockEvents, type Event } from '../data/mockData'

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

function EventIcon({ type }: { type: string }) {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'RED_SIGNAL':
        return { Icon: AlertTriangle, color: '#991b1b' }
      case 'PERSON_IN_TRACK':
        return { Icon: Eye, color: '#9a3412' }
      case 'OBSTACLE':
        return { Icon: MapPin, color: '#92400e' }
      case 'SPEED_LIMIT':
        return { Icon: Zap, color: '#1e40af' }
      case 'WARNING':
        return { Icon: AlertTriangle, color: '#374151' }
      default:
        return { Icon: Clock, color: '#374151' }
    }
  }

  const { Icon, color } = getIconAndColor(type)
  
  return (
    <div style={{
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    }}>
      <Icon style={{ width: '1.25rem', height: '1.25rem', color }} />
    </div>
  )
}

export function Timeline() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [minConfidence, setMinConfidence] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Sort events by timestamp for chronological order
  const sortedEvents = useMemo(() => {
    return [...mockEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [])

  // Filter events based on selected criteria
  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(event => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(event.type)
      const confidenceMatch = event.confidence >= (minConfidence / 100)
      return typeMatch && confidenceMatch
    })
  }, [sortedEvents, selectedTypes, minConfidence])

  // Get unique event types for filter options
  const eventTypes = useMemo(() => {
    return [...new Set(mockEvents.map(event => event.type))]
  }, [])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Timeline</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>
          Chronological view of all safety events with advanced filtering
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{marginBottom: '2rem'}}>
        <div className="p-6">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showFilters ? '1.5rem' : '0'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <Filter style={{width: '1.25rem', height: '1.25rem', color: '#4b5563'}} />
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>Filters</h3>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {filteredEvents.length} events
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                backgroundColor: showFilters ? '#eff6ff' : 'transparent',
                color: showFilters ? '#1d4ed8' : '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem'}}>
              {/* Event Type Filter */}
              <div>
                <h4 style={{fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.75rem'}}>
                  Event Types
                </h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid',
                        borderColor: selectedTypes.includes(type) ? '#2563eb' : '#d1d5db',
                        backgroundColor: selectedTypes.includes(type) ? '#eff6ff' : 'transparent',
                        color: selectedTypes.includes(type) ? '#1d4ed8' : '#374151',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Filter */}
              <div>
                <h4 style={{fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.75rem'}}>
                  Minimum Confidence: {minConfidence}%
                </h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    style={{flex: 1}}
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
                    minWidth: '4rem'
                  }}>
                    {minConfidence}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="p-6">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem'}}>
            <Calendar style={{width: '1.25rem', height: '1.25rem', color: '#4b5563'}} />
            <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>Timeline View</h3>
          </div>

          {filteredEvents.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
              <Clock style={{width: '3rem', height: '3rem', color: '#d1d5db', margin: '0 auto 1rem'}} />
              <p style={{fontSize: '1.125rem', fontWeight: '500'}}>No events match your filters</p>
              <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>Try adjusting your filter criteria</p>
            </div>
          ) : (
            <div style={{position: 'relative'}}>
              {/* Timeline Line */}
              <div style={{
                position: 'absolute',
                left: '1.25rem',
                top: '2rem',
                bottom: '2rem',
                width: '2px',
                backgroundColor: '#e5e7eb'
              }} />

              {/* Timeline Events */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                {filteredEvents.map((event, index) => (
                  <div key={event.id} style={{position: 'relative', display: 'flex', gap: '1.5rem'}}>
                    {/* Event Icon */}
                    <div style={{position: 'relative', zIndex: 10}}>
                      <EventIcon type={event.type} />
                    </div>

                    {/* Event Content */}
                    <div style={{flex: 1, paddingBottom: '1rem'}}>
                      <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            <EventTypeChip type={event.type} />
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#111827',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              border: '1px solid #bfdbfe'
                            }}>
                              {(event.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <div style={{textAlign: 'right', fontSize: '0.875rem', color: '#6b7280'}}>
                            <div style={{fontWeight: '500', color: '#111827'}}>Frame {event.frame}</div>
                            <div>{event.timestamp}</div>
                          </div>
                        </div>

                        <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>
                          Event #{event.id}
                        </h4>
                        <p style={{fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5'}}>
                          {event.note}
                        </p>

                        <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
                          <button style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}>
                            View Details
                          </button>
                          <button style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'transparent',
                            color: '#4b5563',
                            border: '1px solid #d1d5db',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb'
                            e.currentTarget.style.borderColor = '#9ca3af'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}>
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}