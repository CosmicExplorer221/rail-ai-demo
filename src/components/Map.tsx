import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { mockEvents, type Event } from '../data/mockData'

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
function MapController({ selectedEvent, onEventSelect }: { selectedEvent: Event, onEventSelect: (event: Event) => void }) {
  const map = useMap()

  useEffect(() => {
    if (selectedEvent?.location) {
      map.setView([selectedEvent.location.lat, selectedEvent.location.lng], 16, {
        animate: true,
        duration: 1
      })
    }
  }, [selectedEvent, map])

  return null
}

export function Map({ selectedEvent, onEventSelect }: MapProps) {
  const [trainPosition, setTrainPosition] = useState({ lat: 52.5160, lng: 13.4010 })
  const [showRailwayOverlay, setShowRailwayOverlay] = useState(true)

  // Calculate the route path (simplified linear route)
  const routePoints: [number, number][] = [
    [52.5160, 13.4010], // Start
    [52.5170, 13.4020],
    [52.5180, 13.4030],
    [52.5190, 13.4040],
    [52.5200, 13.4050], // End
  ]

  // Update train position based on selected event
  useEffect(() => {
    if (selectedEvent?.location) {
      setTrainPosition({
        lat: selectedEvent.location.lat,
        lng: selectedEvent.location.lng
      })
    }
  }, [selectedEvent])

  // Calculate center point for initial map view
  const centerLat = (52.5160 + 52.5200) / 2
  const centerLng = (13.4010 + 13.4050) / 2

  return (
    <div className="card" style={{ height: '600px' }}>
      <div className="p-6" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 className="text-xl font-semibold text-gray-900">Map & geo-pins</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              OpenRailwayMap
            </button>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              Interactive Leaflet Map • Real GPS coordinates
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
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Railway overlay - using OpenRailwayMap */}
            {showRailwayOverlay && (
              <TileLayer
                attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                opacity={0.7}
              />
            )}

            {/* Route polyline */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: '#64748b',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
              }}
            />

            {/* Event markers */}
            {mockEvents.map((event) => {
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
            <MapController selectedEvent={selectedEvent} onEventSelect={onEventSelect} />
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