import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { type Event, getRouteForVideo, getPositionAtTime } from '../data/mockData'
import { timeToPosition } from '../utils/routeGeometry'

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

// Create waypoint markers
const createWaypointIcon = (index: number, isStart: boolean = false, isEnd: boolean = false) => {
  const color = isStart ? '#10b981' : isEnd ? '#ef4444' : '#6b7280'
  const symbol = isStart ? '🟢' : isEnd ? '🔴' : '⚪'
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    ">${symbol}</div>`,
    className: 'waypoint-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const createTrainIcon = (isMoving = false) => {
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
      ${isMoving ? 'transition: transform 0.5s ease-in-out;' : ''}
      animation: ${isMoving ? 'pulse 2s infinite' : 'none'};
    ">🚂</div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>`,
    className: 'train-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })
}

interface MapProps {
  selectedEvent: Event
  onEventSelect: (event: Event) => void
  currentEvents: Event[]
  timelinePosition?: number // Current timeline position in seconds
  videoFile?: string // Current video file to determine route
  isPlaying?: boolean
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

// Component to handle map events and smooth vehicle movement
function MapController({ 
  selectedEvent, 
  currentEvents, 
  timelinePosition = 0,
  videoFile,
  trainPosition,
  autoFollow = false
}: { 
  selectedEvent: Event
  currentEvents: Event[]
  timelinePosition: number
  videoFile?: string
  trainPosition: [number, number]
  autoFollow?: boolean
}) {
  const map = useMap()
  const [hasInitializedRoute, setHasInitializedRoute] = useState(false)

  // Center on selected event only if auto-follow is enabled
  useEffect(() => {
    if (autoFollow && selectedEvent?.location) {
      map.setView([selectedEvent.location.lat, selectedEvent.location.lng], 16, {
        animate: true,
        duration: 1
      })
    }
  }, [selectedEvent, map, autoFollow])

  // Auto-scale map to fit entire route on initial load or video change
  useEffect(() => {
    if (videoFile) {
      const route = getRouteForVideo(videoFile)
      if (route?.waypoints && route.waypoints.length > 1) {
        // Create proper bounds from waypoints with buffer
        const latLngs = route.waypoints.map(wp => [wp[0], wp[1]] as [number, number])
        const bounds = L.latLngBounds(latLngs)
        
        // Add some padding to the bounds to ensure all waypoints are visible
        const paddedBounds = bounds.pad(0.1) // 10% padding
        
        // Ensure bounds are valid before fitting
        if (paddedBounds.isValid()) {
          // Use setTimeout to ensure map is fully rendered
          setTimeout(() => {
            map.fitBounds(paddedBounds, { 
              padding: [30, 30],
              maxZoom: 13,
              animate: true,
              duration: 2
            })
            setHasInitializedRoute(true)
          }, 100)
        }
      }
    }
  }, [videoFile, map])

  // Follow train if auto-follow is enabled and playing
  useEffect(() => {
    if (autoFollow && trainPosition && hasInitializedRoute) {
      const currentCenter = map.getCenter()
      const distance = map.distance(currentCenter, trainPosition)
      
      // Only pan if train is far from center (smooth following)
      if (distance > 800) { // 800m threshold for smoother following
        map.panTo(trainPosition, { animate: true, duration: 1.5 })
      }
    }
  }, [trainPosition, map, autoFollow, hasInitializedRoute])

  return null
}

export function Map({ 
  selectedEvent, 
  onEventSelect, 
  currentEvents, 
  timelinePosition = 0,
  videoFile = 'lineA_km12+400_frontcab.mp4',
  isPlaying = false
}: MapProps) {
  const [showRailwayOverlay, setShowRailwayOverlay] = useState(true)
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm')
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [autoFollow, setAutoFollow] = useState(false)
  
  // Get route definition for current video
  const routeDefinition = useMemo(() => getRouteForVideo(videoFile), [videoFile])
  
  // Calculate smooth train position based on timeline
  const trainPosition = useMemo(() => {
    if (!routeDefinition?.metrics || !routeDefinition.totalDuration) {
      return [52.5160, 13.4010] as [number, number] // Default position
    }
    
    const timeRatio = Math.max(0, Math.min(1, timelinePosition / routeDefinition.totalDuration))
    const position = routeDefinition.metrics.pointAtRatio(timeRatio)
    return position
  }, [routeDefinition, timelinePosition])

  // Create smooth route polyline from waypoints
  const routePolyline = useMemo(() => {
    if (!routeDefinition?.waypoints) return []
    return routeDefinition.waypoints
  }, [routeDefinition])

  // Calculate positions for events using their time ratios
  const eventsWithPositions = useMemo(() => {
    if (!routeDefinition?.metrics) return currentEvents
    
    return currentEvents.map(event => {
      if (event.timeRatio !== undefined) {
        const smoothPosition = routeDefinition.metrics!.pointAtRatio(event.timeRatio)
        return {
          ...event,
          smoothLocation: {
            lat: smoothPosition[0],
            lng: smoothPosition[1]
          }
        }
      }
      return event
    })
  }, [currentEvents, routeDefinition])

  // Filter events that should be visible at current timeline position
  const visibleEvents = useMemo(() => {
    if (!routeDefinition) return eventsWithPositions
    
    const currentTimeRatio = timelinePosition / routeDefinition.totalDuration
    return eventsWithPositions.filter(event => 
      event.timeRatio !== undefined && event.timeRatio <= currentTimeRatio
    )
  }, [eventsWithPositions, timelinePosition, routeDefinition])

  // Calculate center point for initial map view
  const { centerLat, centerLng } = useMemo(() => {
    if (routePolyline.length === 0) {
      return { centerLat: 52.5160, centerLng: 13.4010 }
    }
    
    const lats = routePolyline.map(point => point[0])
    const lngs = routePolyline.map(point => point[1])
    
    return {
      centerLat: lats.reduce((a, b) => a + b, 0) / lats.length,
      centerLng: lngs.reduce((a, b) => a + b, 0) / lngs.length
    }
  }, [routePolyline])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      minHeight: '400px'
    }}>
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Map Provider Toggle */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <label style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
              Map:
            </label>
            <select 
              value={mapProvider} 
              onChange={(e) => setMapProvider(e.target.value as 'osm' | 'google')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
            >
              <option value="osm">OpenStreetMap</option>
              <option value="google">Google Maps</option>
            </select>
          </div>

          {mapProvider === 'google' && (
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <select 
                value={googleMapType} 
                onChange={(e) => setGoogleMapType(e.target.value as 'roadmap' | 'satellite')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem'
                }}
              >
                <option value="roadmap">Road</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
          )}

          {/* Railway Overlay Toggle */}
          {mapProvider === 'osm' && (
            <button
              onClick={() => setShowRailwayOverlay(!showRailwayOverlay)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: showRailwayOverlay ? '#3b82f6' : '#f3f4f6',
                color: showRailwayOverlay ? 'white' : '#6b7280',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showRailwayOverlay ? '#2563eb' : '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showRailwayOverlay ? '#3b82f6' : '#f3f4f6'}
            >
              Railway Overlay
            </button>
          )}

          {/* Auto-Follow Toggle */}
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: autoFollow ? '#10b981' : '#f3f4f6',
              color: autoFollow ? 'white' : '#6b7280',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = autoFollow ? '#059669' : '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = autoFollow ? '#10b981' : '#f3f4f6'}
            title={autoFollow ? 'Disable auto-follow train' : 'Enable auto-follow train'}
          >
            🚂 {autoFollow ? 'Following' : 'Static'}
          </button>

          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            {routeDefinition?.name || 'Unknown Route'} • {autoFollow && isPlaying ? 'Following' : 'Fixed View'}
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* Base map layers */}
          {mapProvider === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url={`https://mt1.google.com/vt/lyrs=${googleMapType === 'satellite' ? 's' : 'm'}&x={x}&y={y}&z={z}`}
            />
          )}

          {/* Railway overlay for OSM */}
          {mapProvider === 'osm' && showRailwayOverlay && (
            <TileLayer
              attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
              url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
              opacity={0.7}
            />
          )}

          {/* Route polyline */}
          {routePolyline.length > 0 && (
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#000',
                weight: 6,
                opacity: 0.9,
                dashArray: '15, 8'
              }}
            />
          )}

          {/* Waypoint markers */}
          {routePolyline.map((waypoint, index) => {
            const isStart = index === 0
            const isEnd = index === routePolyline.length - 1
            
            return (
              <Marker
                key={`waypoint-${index}`}
                position={waypoint}
                icon={createWaypointIcon(index, isStart, isEnd)}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      color: isStart ? '#10b981' : isEnd ? '#ef4444' : '#6b7280'
                    }}>
                      {isStart ? '🟢 Start' : isEnd ? '🔴 End' : `⚪ Waypoint ${index + 1}`}
                    </div>
                    <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                      <div>Lat: {waypoint[0].toFixed(4)}</div>
                      <div>Lng: {waypoint[1].toFixed(4)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Event markers */}
          {visibleEvents.map((event) => {
            const isSelected = selectedEvent?.id === event.id
            const position = event.smoothLocation || event.location
            const color = getEventMarkerColor(event.type)
            
            return (
              <Marker
                key={event.id}
                position={[position.lat, position.lng]}
                icon={createEventIcon(color, isSelected)}
                eventHandlers={{
                  click: () => onEventSelect(event),
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: color
                      }}></div>
                      <strong style={{
                        fontSize: '0.875rem',
                        color: '#1f2937'
                      }}>
                        {event.type.replace(/_/g, ' ')}
                      </strong>
                    </div>
                    <div style={{fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px'}}>
                      {event.timestamp}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#374151', marginBottom: '8px'}}>
                      {event.note}
                    </div>
                    <div style={{fontSize: '0.8rem', color: '#6b7280'}}>
                      <div>Confidence: {Math.round(event.confidence * 100)}%</div>
                      <div>Lat: {position.lat.toFixed(4)}</div>
                      <div>Lng: {position.lng.toFixed(4)}</div>
                      {event.timeRatio !== undefined && (
                        <div>Time Ratio: {(event.timeRatio * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Train position marker */}
          {trainPosition && (
            <Marker
              position={trainPosition}
              icon={createTrainIcon(isPlaying)}
              zIndexOffset={1000}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#3b82f6'
                  }}>
                    🚂 Current Position
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#374151'}}>
                    <div>Timeline: {Math.round(timelinePosition)}s</div>
                    <div>Lat: {trainPosition[0].toFixed(4)}</div>
                    <div>Lng: {trainPosition[1].toFixed(4)}</div>
                    {routeDefinition && (
                      <div>Progress: {((timelinePosition / routeDefinition.totalDuration) * 100).toFixed(1)}%</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map controller for handling events */}
          <MapController 
            selectedEvent={selectedEvent} 
            currentEvents={currentEvents}
            timelinePosition={timelinePosition}
            videoFile={videoFile}
            trainPosition={trainPosition}
            autoFollow={autoFollow}
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontSize: '0.75rem'
      }}>
        <div style={{fontWeight: '600', marginBottom: '8px', color: '#1f2937'}}>
          Legend
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626'}}></div>
            <span style={{color: '#6b7280'}}>Red Signal</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b'}}></div>
            <span style={{color: '#6b7280'}}>Person in Track</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308'}}></div>
            <span style={{color: '#6b7280'}}>Obstacle</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb'}}></div>
            <span style={{color: '#6b7280'}}>Speed Limit</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280'}}></div>
            <span style={{color: '#6b7280'}}>Warning</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{fontSize: '12px'}}>🚂</span>
            <span style={{color: '#6b7280'}}>Current Position</span>
          </div>
        </div>
      </div>
    </div>
  )
}