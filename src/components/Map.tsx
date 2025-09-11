import { useState, useEffect } from 'react'
import { mockEvents, type Event } from '../data/mockData'

interface MapProps {
  selectedEvent: Event
  onEventSelect: (event: Event) => void
  timelinePosition?: number
}

function getEventMarkerColor(eventType: Event['type']) {
  switch (eventType) {
    case 'RED_SIGNAL':
      return '#991b1b'
    case 'PERSON_IN_TRACK':
      return '#9a3412'
    case 'OBSTACLE':
      return '#92400e'
    case 'SPEED_LIMIT':
      return '#1e40af'
    case 'WARNING':
      return '#374151'
    default:
      return '#374151'
  }
}

export function Map({ selectedEvent, onEventSelect }: MapProps) {
  const [trainPosition, setTrainPosition] = useState({ lat: 52.5160, lng: 13.4010 })

  // Calculate the route path (simplified linear route)
  const routePoints = [
    { lat: 52.5160, lng: 13.4010 }, // Start
    { lat: 52.5170, lng: 13.4020 },
    { lat: 52.5180, lng: 13.4030 },
    { lat: 52.5190, lng: 13.4040 },
    { lat: 52.5200, lng: 13.4050 }, // End
  ]

  // Calculate SVG viewBox based on coordinate bounds
  const latMin = Math.min(...routePoints.map(p => p.lat)) - 0.002
  const latMax = Math.max(...routePoints.map(p => p.lat)) + 0.002
  const lngMin = Math.min(...routePoints.map(p => p.lng)) - 0.002
  const lngMax = Math.max(...routePoints.map(p => p.lng)) + 0.002

  // Convert lat/lng to SVG coordinates
  const latLngToSVG = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 400
    const y = ((latMax - lat) / (latMax - latMin)) * 300 // Flip Y axis
    return { x, y }
  }

  // Update train position based on selected event
  useEffect(() => {
    if (selectedEvent?.location) {
      setTrainPosition({
        lat: selectedEvent.location.lat,
        lng: selectedEvent.location.lng
      })
    }
  }, [selectedEvent])

  return (
    <div className="card" style={{ height: '600px' }}>
      <div className="p-6" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 className="text-xl font-semibold text-gray-900">Map & geo-pins</h3>
          <span style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px'
          }}>
            Synthetic route • pins derived from timestamps
          </span>
        </div>

        {/* Map Container */}
        <div style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 300"
            style={{ display: 'block' }}
          >
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Railway Route Line */}
            <path
              d={`M ${routePoints.map(point => {
                const { x, y } = latLngToSVG(point.lat, point.lng)
                return `${x},${y}`
              }).join(' L ')}`}
              stroke="#64748b"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />

            {/* Route Points */}
            {routePoints.map((point, index) => {
              const { x, y } = latLngToSVG(point.lat, point.lng)
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#64748b"
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}

            {/* Event Markers */}
            {mockEvents.map((event) => {
              const { x, y } = latLngToSVG(event.location.lat, event.location.lng)
              const isSelected = selectedEvent?.id === event.id
              const markerSize = isSelected ? 8 : 6
              
              return (
                <g key={event.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={markerSize}
                    fill={getEventMarkerColor(event.type)}
                    stroke="white"
                    strokeWidth={isSelected ? 3 : 2}
                    style={{ 
                      cursor: 'pointer',
                      filter: isSelected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'none'
                    }}
                    onClick={() => onEventSelect(event)}
                  />
                  {isSelected && (
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#374151"
                      fontWeight="600"
                      style={{ pointerEvents: 'none' }}
                    >
                      {event.location.milepost}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Train Position */}
            {trainPosition && (
              <g>
                {(() => {
                  const { x, y } = latLngToSVG(trainPosition.lat, trainPosition.lng)
                  return (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="3"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                      />
                      <text
                        x={x}
                        y={y + 2}
                        textAnchor="middle"
                        fontSize="16"
                        fill="white"
                      >
                        🚂
                      </text>
                    </>
                  )
                })()}
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Legend:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b'
            }} />
            <span>person</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#eab308'
            }} />
            <span>track obstruction</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#dc2626'
            }} />
            <span>signal aspect red</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#2563eb'
            }} />
            <span>signal aspect yellow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#16a34a'
            }} />
            <span>signal aspect green</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#7c3aed'
            }} />
            <span>balise box</span>
          </div>
        </div>

        {/* Showing detections info */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'right',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Showing: all detections
        </div>
      </div>
    </div>
  )
}