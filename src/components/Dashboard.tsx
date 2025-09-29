import { useState, useMemo } from 'react'
import {
  AlertTriangle, Eye, Clock, ChevronRight, Filter, Calendar,
  Train, Zap, Shield, Activity, TrendingUp, Users, MapPin, Gauge
} from 'lucide-react'
import { mockEvents } from '../data/mockData'
import { LineAssetsOverview } from './LineAssetsOverview'
import { LineEquipmentDetails } from './LineEquipmentDetails'


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

export function Dashboard() {
  // Filter states
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<string>>(new Set(['RED_SIGNAL', 'PERSON_IN_TRACK', 'OBSTACLE', 'SPEED_LIMIT', 'WARNING']))
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [showFilters, setShowFilters] = useState(false)

  // Event type options
  const eventTypes = [
    { id: 'RED_SIGNAL', label: 'Red Signal', color: '#dc2626' },
    { id: 'PERSON_IN_TRACK', label: 'Person in Track', color: '#ea580c' },
    { id: 'OBSTACLE', label: 'Obstacle', color: '#d97706' },
    { id: 'SPEED_LIMIT', label: 'Speed Limit', color: '#2563eb' },
    { id: 'WARNING', label: 'Warning', color: '#6b7280' }
  ]

  // Time range options
  const timeRanges = [
    { id: '1h', label: '1 Hour' },
    { id: '4h', label: '4 Hours' },
    { id: '24h', label: '24 Hours' },
    { id: '3d', label: '3 Days' },
    { id: '1w', label: '1 Week' },
    { id: '1m', label: '1 Month' }
  ]

  // Filter events based on selection
  const filteredEvents = useMemo(() => {
    const now = new Date()
    let timeThreshold = new Date()
    
    // Calculate time threshold based on selected range
    switch (selectedTimeRange) {
      case '1h':
        timeThreshold.setHours(now.getHours() - 1)
        break
      case '4h':
        timeThreshold.setHours(now.getHours() - 4)
        break
      case '24h':
        timeThreshold.setDate(now.getDate() - 1)
        break
      case '3d':
        timeThreshold.setDate(now.getDate() - 3)
        break
      case '1w':
        timeThreshold.setDate(now.getDate() - 7)
        break
      case '1m':
        timeThreshold.setMonth(now.getMonth() - 1)
        break
      default:
        timeThreshold.setDate(now.getDate() - 1)
    }

    return mockEvents.filter(event => {
      // Filter by event type
      if (!selectedEventTypes.has(event.type)) {
        return false
      }
      
      // Filter by time range
      const eventDate = new Date(event.timestamp)
      return eventDate >= timeThreshold
    })
  }, [selectedEventTypes, selectedTimeRange])

  const recentEvents = filteredEvents.slice(0, 5)

  // Generate organized KPI groups for structured display
  const kpiGroups = useMemo(() => {
    const criticalEvents = filteredEvents.filter(e => e.type === 'RED_SIGNAL' || e.type === 'PERSON_IN_TRACK')
    const todayEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.timestamp)
      const today = new Date()
      return eventDate.toDateString() === today.toDateString()
    })

    // Artificial metrics for demonstration
    const currentHour = new Date().getHours()
    const activeTrains = 24 + Math.floor(Math.sin(currentHour / 4) * 8) // Varies with time
    const networkEfficiency = Math.round(92 + Math.random() * 6) // 92-98%
    const responseTime = Math.round(45 + Math.random() * 30) // 45-75 seconds
    const crewsOnDuty = 18 + Math.floor(Math.random() * 12) // 18-30 crews
    const milesMonitored = 847 // Static for demo
    const safetyScore = Math.round(96 + Math.random() * 3) // 96-99
    const energyEfficiency = Math.round(88 + Math.random() * 8) // 88-96%
    const predictiveAlerts = 3 + Math.floor(Math.random() * 5) // 3-7 alerts

    return {
      "Safety & Security": [
        {
          name: 'Critical Alerts',
          value: criticalEvents.length.toString(),
          change: criticalEvents.length > 0 ? `+${criticalEvents.length} from yesterday` : 'No critical issues',
          icon: AlertTriangle,
          color: criticalEvents.length > 3 ? '#dc2626' : criticalEvents.length > 0 ? '#ea580c' : '#16a34a',
          bgColor: criticalEvents.length > 3 ? '#fef2f2' : criticalEvents.length > 0 ? '#fff7ed' : '#f0fdf4',
        },
        {
          name: 'Safety Score',
          value: `${safetyScore}/100`,
          change: safetyScore >= 98 ? 'Excellent' : safetyScore >= 95 ? 'Good' : 'Fair',
          icon: Shield,
          color: safetyScore >= 98 ? '#16a34a' : safetyScore >= 95 ? '#ea580c' : '#dc2626',
          bgColor: safetyScore >= 98 ? '#f0fdf4' : safetyScore >= 95 ? '#fff7ed' : '#fef2f2',
        },
        {
          name: 'Events Detected',
          value: filteredEvents.length.toString(),
          change: `${todayEvents.length} in last 24h`,
          icon: Eye,
          color: '#2563eb',
          bgColor: '#eff6ff',
        },
        {
          name: 'Response Time',
          value: `${responseTime}s`,
          change: responseTime <= 60 ? 'On target' : 'Needs improvement',
          icon: Activity,
          color: responseTime <= 60 ? '#16a34a' : '#ea580c',
          bgColor: responseTime <= 60 ? '#f0fdf4' : '#fff7ed',
        }
      ],
      "Operations": [
        {
          name: 'Active Trains',
          value: activeTrains.toString(),
          change: `${Math.round(activeTrains / 32 * 100)}% capacity`,
          icon: Train,
          color: '#2563eb',
          bgColor: '#eff6ff',
        },
        {
          name: 'Network Efficiency',
          value: `${networkEfficiency}%`,
          change: networkEfficiency >= 95 ? 'Above target' : 'Within range',
          icon: TrendingUp,
          color: networkEfficiency >= 95 ? '#16a34a' : '#ea580c',
          bgColor: networkEfficiency >= 95 ? '#f0fdf4' : '#fff7ed',
        },
        {
          name: 'Crews On Duty',
          value: crewsOnDuty.toString(),
          change: crewsOnDuty >= 25 ? 'Fully staffed' : 'Adequate coverage',
          icon: Users,
          color: crewsOnDuty >= 25 ? '#16a34a' : '#2563eb',
          bgColor: crewsOnDuty >= 25 ? '#f0fdf4' : '#eff6ff',
        }
      ],
      "Infrastructure": [
        {
          name: 'Miles Monitored',
          value: `${milesMonitored}mi`,
          change: '100% coverage',
          icon: MapPin,
          color: '#16a34a',
          bgColor: '#f0fdf4',
        },
        {
          name: 'Energy Efficiency',
          value: `${energyEfficiency}%`,
          change: energyEfficiency >= 92 ? 'Above average' : 'Standard',
          icon: Zap,
          color: energyEfficiency >= 92 ? '#16a34a' : '#ea580c',
          bgColor: energyEfficiency >= 92 ? '#f0fdf4' : '#fff7ed',
        },
        {
          name: 'Predictive Alerts',
          value: predictiveAlerts.toString(),
          change: 'Maintenance scheduled',
          icon: Gauge,
          color: '#8b5cf6',
          bgColor: '#f3f4f6',
        }
      ]
    }
  }, [filteredEvents, selectedTimeRange])

  // Handle event type filter toggle
  const toggleEventType = (eventType: string) => {
    const newSelection = new Set(selectedEventTypes)
    if (newSelection.has(eventType)) {
      newSelection.delete(eventType)
    } else {
      newSelection.add(eventType)
    }
    setSelectedEventTypes(newSelection)
  }

  // Handle time range selection
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Real-time railway safety monitoring</p>
      </div>

      {/* Filters Section */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <Filter style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              Filters
            </button>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {filteredEvents.length} events
            </div>
          </div>
          
          {/* Time Range Quick Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
            <select
              value={selectedTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="card" style={{ marginBottom: '0' }}>
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                  Event Types
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {eventTypes.map(eventType => {
                    const isSelected = selectedEventTypes.has(eventType.id)
                    return (
                      <button
                        key={eventType.id}
                        onClick={() => toggleEventType(eventType.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: isSelected ? 'white' : eventType.color,
                          backgroundColor: isSelected ? eventType.color : 'transparent',
                          border: `1px solid ${eventType.color}`,
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = `${eventType.color}10`
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'white' : eventType.color
                          }}
                        />
                        {eventType.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedEventTypes(new Set(['RED_SIGNAL', 'PERSON_IN_TRACK', 'OBSTACLE', 'SPEED_LIMIT', 'WARNING']))}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#2563eb',
                    backgroundColor: 'transparent',
                    border: '1px solid #2563eb',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2563eb'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedEventTypes(new Set())}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Islands Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {Object.entries(kpiGroups).map(([groupName, kpis]) => (
          <div key={groupName} className="card">
            <div style={{ padding: '1rem' }}>
              {/* Group Header */}
              <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>
                  {groupName}
                </h3>
                <div style={{
                  height: '2px',
                  width: '2rem',
                  backgroundColor: '#2563eb',
                  borderRadius: '1px'
                }} />
              </div>

              {/* KPI Items */}
              <div className="space-y-2">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon
                  return (
                    <div key={kpi.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{
                        flexShrink: 0,
                        padding: '0.375rem',
                        borderRadius: '0.375rem',
                        backgroundColor: '#f8fafc'
                      }}>
                        <Icon style={{width: '1rem', height: '1rem', color: '#6b7280'}} />
                      </div>
                      <div style={{marginLeft: '0.5rem', flex: '1 1 0%'}}>
                        <div style={{fontSize: '0.7rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.0625rem'}}>
                          {kpi.name}
                        </div>
                        <div style={{fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.0625rem'}}>
                          {kpi.value}
                        </div>
                        <div style={{fontSize: '0.6rem', color: '#4b5563'}}>{kpi.change}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Line Information and Events Section - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LineAssetsOverview />
        <LineEquipmentDetails />

        {/* Recent Events */}
        <div className="card">
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Recent Events</h3>
          {recentEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: '#6b7280'
            }}>
              <Eye style={{
                width: '2rem',
                height: '2rem',
                color: '#6b7280',
                margin: '0 auto 0.5rem'
              }} />
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                No events found
              </h4>
              <p style={{ fontSize: '0.8rem' }}>
                {selectedEventTypes.size === 0 
                  ? 'No event types selected. Please select at least one event type to view events.'
                  : `No events found for the selected time range (${timeRanges.find(r => r.id === selectedTimeRange)?.label}).`
                }
              </p>
              {selectedEventTypes.size === 0 && (
                <button
                  onClick={() => setSelectedEventTypes(new Set(['RED_SIGNAL', 'PERSON_IN_TRACK', 'OBSTACLE', 'SPEED_LIMIT', 'WARNING']))}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: '#2563eb',
                    backgroundColor: 'transparent',
                    border: '1px solid #2563eb',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2563eb'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Select All Event Types
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0px'}}>
                {recentEvents.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderTop: index === 0 ? 'none' : '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderRadius: index === 0 ? '0.375rem 0.375rem 0 0' : index === recentEvents.length - 1 ? '0 0 0.375rem 0.375rem' : '0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Time indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '100px',
                    marginRight: '0.5rem'
                  }}>
                    <Clock style={{width: '0.875rem', height: '0.875rem', color: '#6b7280', marginRight: '0.375rem'}} />
                    <span style={{fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace'}}>
                      {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Event info */}
                  <div style={{flex: '1', minWidth: '0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem'}}>
                      <EventTypeChip type={event.type} />
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        padding: '0.1875rem 0.375rem',
                        borderRadius: '0.1875rem'
                      }}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#1f2937',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {event.note}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight style={{
                    width: '1rem',
                    height: '1rem',
                    color: '#6b7280',
                    marginLeft: '0.5rem',
                    flexShrink: 0
                  }} />
                </div>
                ))}
              </div>
              <div style={{marginTop: '0.75rem', textAlign: 'center'}}>
                <button style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  color: '#2563eb',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: '1px solid #2563eb',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2563eb'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}>
                  View all {filteredEvents.length} events
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}