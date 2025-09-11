import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { type Event } from '../data/mockData'

// Fix for default markers not showing in React-Leaflet
import 'leaflet/dist/leaflet.css'

// Define custom icons for different event types
const createEventIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 32 : 24
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${isSelected ? 'transform: scale(1.2); box-shadow: 0 0 15px rgba(59,130,246,0.6);' : ''}
    "></div>`,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

const createTrainIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    ">🚂</div>`,
    className: 'train-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })
}

interface MapProps {
  selectedEvent: Event
  onEventSelect: (event: Event) => void
  currentEvents: Event[]
  timelinePosition?: number
}

function getEventMarkerColor(eventType: Event['type']) {
  switch (eventType) {
    case 'RED_SIGNAL':
      return '#dc2626'
    case 'PERSON_IN_TRACK':
      return '#f59e0b'
    case 'OBSTACLE':
      return '#eab308'
    case 'SPEED_LIMIT':
      return '#2563eb'
    case 'WARNING':
      return '#6b7280'
    default:
      return '#6b7280'
  }
}

// Component to handle map events and centering
function MapController({ selectedEvent, currentEvents }: { selectedEvent: Event, currentEvents: Event[] }) {
  const map = useMap()

  useEffect(() => {
    if (selectedEvent?.location) {
      map.setView([selectedEvent.location.lat, selectedEvent.location.lng], 16, {
        animate: true,
        duration: 1
      })
    }
  }, [selectedEvent, map])

  // Auto-scale map to fit all current events
  useEffect(() => {
    if (currentEvents.length > 0) {
      const coordinates: [number, number][] = currentEvents.map(event => [
        event.location.lat,
        event.location.lng
      ])
      
      if (coordinates.length === 1) {
        // Single point - center on it with reasonable zoom
        map.setView(coordinates[0], 14, { animate: true, duration: 1 })
      } else {
        // Multiple points - fit bounds with padding
        const bounds = L.latLngBounds(coordinates)
        map.fitBounds(bounds, { 
          padding: [20, 20],
          animate: true,
          duration: 1
        })
      }
    }
  }, [currentEvents, map])

  return null
}

export function Map({ selectedEvent, onEventSelect, currentEvents }: MapProps) {
  const [trainPosition, setTrainPosition] = useState({ lat: 52.5160, lng: 13.4010 })
  const [showRailwayOverlay, setShowRailwayOverlay] = useState(true)
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm')
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  // Create route from actual event coordinates
  const routePoints = useMemo(() => {
    if (currentEvents.length === 0) {
      return []
    }

    // Sort events by timestamp to create chronological route
    const sortedEvents = [...currentEvents].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Create route points from actual event coordinates
    const eventPoints: [number, number][] = sortedEvents.map(event => [
      event.location.lat,
      event.location.lng
    ])

    // Add intermediate points between events for smoother curves
    const routeWithIntermediates: [number, number][] = []
    
    for (let i = 0; i < eventPoints.length; i++) {
      routeWithIntermediates.push(eventPoints[i])
      
      // Add intermediate point between this and next event
      if (i < eventPoints.length - 1) {
        const currentPoint = eventPoints[i]
        const nextPoint = eventPoints[i + 1]
        
        // Calculate midpoint with slight curve
        const midLat = (currentPoint[0] + nextPoint[0]) / 2
        const midLng = (currentPoint[1] + nextPoint[1]) / 2
        
        // Add small random offset for more natural curve (±0.0005 degrees)
        const curveOffset = (Math.random() - 0.5) * 0.001
        routeWithIntermediates.push([midLat + curveOffset, midLng + curveOffset])
      }
    }

    console.log(`🛤️ Created route from ${sortedEvents.length} events with ${routeWithIntermediates.length} total points`)
    return routeWithIntermediates
  }, [currentEvents])

  // Update train position based on selected event
  useEffect(() => {
    if (selectedEvent?.location) {
      setTrainPosition({
        lat: selectedEvent.location.lat,
        lng: selectedEvent.location.lng
      })
    }
  }, [selectedEvent])

  // Calculate center point for initial map view based on current route
  const { centerLat, centerLng } = useMemo(() => {
    if (routePoints.length === 0) {
      return { centerLat: 52.5160, centerLng: 13.4010 }
    }
    
    const lats = routePoints.map(point => point[0])
    const lngs = routePoints.map(point => point[1])
    
    return {
      centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
      centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    }
  }, [routePoints])

  return (
    <div className="card" style={{ height: '600px' }}>
      <div className="p-6" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 className="text-xl font-semibold text-gray-900">Map & geo-pins</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Map Provider Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setMapProvider('osm')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: mapProvider === 'osm' ? '#eff6ff' : 'white',
                  color: mapProvider === 'osm' ? '#1d4ed8' : '#6b7280',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = mapProvider === 'osm' ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mapProvider === 'osm' ? '#eff6ff' : 'white'}
              >
                OpenStreetMap
              </button>
              <button
                onClick={() => setMapProvider('google')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: mapProvider === 'google' ? '#eff6ff' : 'white',
                  color: mapProvider === 'google' ? '#1d4ed8' : '#6b7280',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = mapProvider === 'google' ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mapProvider === 'google' ? '#eff6ff' : 'white'}
              >
                Google Maps
              </button>
            </div>

            {/* Google Maps Type Toggle */}
            {mapProvider === 'google' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setGoogleMapType('roadmap')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: googleMapType === 'roadmap' ? '#f0fdf4' : 'white',
                    color: googleMapType === 'roadmap' ? '#166534' : '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Map
                </button>
                <button
                  onClick={() => setGoogleMapType('satellite')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: googleMapType === 'satellite' ? '#f0fdf4' : 'white',
                    color: googleMapType === 'satellite' ? '#166534' : '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Satellite
                </button>
              </div>
            )}

            {/* Railway Overlay Toggle (only for OpenStreetMap) */}
            {mapProvider === 'osm' && (
              <button
                onClick={() => setShowRailwayOverlay(!showRailwayOverlay)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: showRailwayOverlay ? '#eff6ff' : 'white',
                  color: showRailwayOverlay ? '#1d4ed8' : '#6b7280',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showRailwayOverlay ? '#dbeafe' : '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showRailwayOverlay ? '#eff6ff' : 'white'}
              >
                Railway Overlay
              </button>
            )}

            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'} • Real GPS coordinates
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div style={{
          flex: 1,
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            {/* Base tile layer */}
            {mapProvider === 'osm' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; Google Maps'
                url={googleMapType === 'satellite' 
                  ? "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                }
              />
            )}

            {/* Railway overlay - using OpenRailwayMap (only for OpenStreetMap) */}
            {mapProvider === 'osm' && showRailwayOverlay && (
              <TileLayer
                attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                opacity={0.7}
              />
            )}

            {/* Route polyline */}
            {routePoints.length > 0 && (
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 6,
                  opacity: 0.9,
                  dashArray: '15, 8'
                }}
              />
            )}

            {/* Event markers */}
            {currentEvents.map((event) => {
              const isSelected = selectedEvent?.id === event.id
              return (
                <Marker
                  key={event.id}
                  position={[event.location.lat, event.location.lng]}
                  icon={createEventIcon(getEventMarkerColor(event.type), isSelected)}
                  eventHandlers={{
                    click: () => onEventSelect(event)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        {event.type.replace('_', ' ')}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                        {event.note}
                      </p>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <div>Location: {event.location.milepost}</div>
                        <div>Confidence: {(event.confidence * 100).toFixed(0)}%</div>
                        <div>Time: {event.timestamp}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

            {/* Train position marker */}
            {trainPosition && (
              <Marker
                position={[trainPosition.lat, trainPosition.lng]}
                icon={createTrainIcon()}
              >
                <Popup>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                      Current Train Position
                    </h4>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <div>Lat: {trainPosition.lat.toFixed(4)}</div>
                      <div>Lng: {trainPosition.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Map controller for handling events */}
            <MapController selectedEvent={selectedEvent} currentEvents={currentEvents} />
          </MapContainer>
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
            <span>speed limit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#6b7280'
            }} />
            <span>warning</span>
          </div>
        </div>

        {/* Showing detections info */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'right',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Showing: all detections • Interactive map with zoom & pan
        </div>
      </div>
    </div>
  )
}