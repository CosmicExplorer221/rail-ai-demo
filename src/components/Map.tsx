import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { type EventData, getRouteForVideo } from '../data/mockData'
import { useRailwayAssets } from '../hooks/useRailwayAssets'
import { getAssetIcon, getAssetColor, type RailwayAsset } from '../services/overpassApi'
import { getAvailableAssetTypes, getAssetTypeCounts } from '../services/availableAssetTypes'

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
const createWaypointIcon = (isStart: boolean = false, isEnd: boolean = false) => {
  const color = isStart ? '#10b981' : isEnd ? '#ef4444' : '#ffffff'
  const borderColor = isStart ? '#059669' : isEnd ? '#dc2626' : '#6b7280'
  const symbol = isStart ? 'S' : isEnd ? 'E' : '•'
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid ${borderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: ${isStart || isEnd ? 'white' : '#374151'};
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    ">${symbol}</div>`,
    className: 'waypoint-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

const createVehicleIcon = (isMoving = false) => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${isMoving ? 'transition: transform 0.5s ease-in-out;' : ''}
      animation: ${isMoving ? 'pulse 2s infinite' : 'none'};
    ">●</div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>`,
    className: 'vehicle-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

// Create railway asset icons with enhanced visual design
const createRailwayAssetIcon = (asset: RailwayAsset) => {
  const color = getAssetColor(asset.type)
  const emoji = getAssetIcon(asset.type)

  return L.divIcon({
    html: `<div style="
      background: linear-gradient(145deg, ${color}, ${color}dd);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s ease;
      position: relative;
      pointer-events: auto;
    ">${emoji}</div>`,
    className: 'railway-asset-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

interface MapProps {
  selectedEvent: EventData | null
  onEventSelect: (event: EventData) => void
  currentEvents: EventData[]
  timelinePosition?: number // Current timeline position in seconds
  videoFile?: string // Current video file to determine route
  isPlaying?: boolean
  activeAssetTypes?: Set<string> // Active railway asset types from filters
  downloadedAssets?: RailwayAsset[] // Downloaded UK assets to display
  useDownloadedAssets?: boolean // Whether to use downloaded assets instead of live API
}

function getEventMarkerColor(eventType: EventData['type']) {
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
  videoFile,
  trainPosition,
  autoFollow = false
}: { 
  selectedEvent: EventData | null
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
  isPlaying = false,
  activeAssetTypes = new Set(['signals', 'switches']),
  downloadedAssets = [],
  useDownloadedAssets = false
}: MapProps) {
  const [showRailwayOverlay, setShowRailwayOverlay] = useState(true)
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm')
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [autoFollow, setAutoFollow] = useState(false)
  const [showRailwayAssets, setShowRailwayAssets] = useState(true)
  // Use the activeAssetTypes prop as the source of truth for selected filters
  const selectedAssetFilters = activeAssetTypes || new Set(['signals'])

  // Get available asset types from the local dataset
  const availableAssetTypes = useMemo(() => getAvailableAssetTypes(), [])
  const assetTypeCounts = useMemo(() => getAssetTypeCounts(), [])

  // Convert Set to array for the API (only available asset types from local dataset)
  const selectedAssetTypes = useMemo(() => {
    return Array.from(selectedAssetFilters).filter(type => availableAssetTypes.includes(type)) as ('signals' | 'levelCrossings' | 'stations' | 'platforms' | 'bufferStops')[]
  }, [selectedAssetFilters, availableAssetTypes])
  
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

  // Use smaller London area to avoid timeouts and excessive data
  const routeBounds = useMemo(() => {
    // Focus on London and surroundings to avoid API timeouts
    const londonBounds = {
      south: 51.3,   // South London
      west: -0.5,    // West London
      north: 51.7,   // North London
      east: 0.2      // East London
    }

    return londonBounds
  }, [])

  // Fetch railway assets
  const {
    assets: railwayAssets,
    loading: assetsLoading,
    error: assetsError,
    lastUpdated: assetsLastUpdated
  } = useRailwayAssets({
    enabled: showRailwayAssets,
    assetTypes: selectedAssetTypes,
    boundingBox: routeBounds
  })

  // Filter and limit railway assets for performance with 100 per type limit
  const visibleRailwayAssets = useMemo(() => {
    // Use downloaded assets if available and enabled, otherwise use live assets
    const assetsToProcess = useDownloadedAssets && downloadedAssets.length > 0 ? downloadedAssets : railwayAssets

    if (!showRailwayAssets || !assetsToProcess.length) return []

    // Group assets by type
    const assetsByType: Record<string, RailwayAsset[]> = {}

    assetsToProcess.forEach(asset => {
      if (!assetsByType[asset.type]) {
        assetsByType[asset.type] = []
      }
      assetsByType[asset.type].push(asset)
    })

    // Limit to 30 assets per type and filter by active types
    const limitedAssets: RailwayAsset[] = []
    const maxAssetsPerType = 30

    Object.entries(assetsByType).forEach(([type, assets]) => {
      // Check if this asset type is active (comprehensive OSM railway assets)
      const typeMapping: Record<string, string> = {
        'signal': 'signals',
        'switch': 'switches',
        'level_crossing': 'levelCrossings',
        'station': 'stations',
        'platform': 'platforms',
        'buffer_stop': 'bufferStops',
        'crossing': 'crossings',
        'halt': 'halts',
        'tram_stop': 'tramStops',
        'subway_entrance': 'subwayEntrances',
        'turntable': 'turntables',
        'roundhouse': 'roundhouses',
        'water_crane': 'waterCranes',
        'water_tower': 'waterCranes',
        'ventilation_shaft': 'ventilationShafts'
      }

      const activeType = typeMapping[type] || type
      if (!selectedAssetFilters.has(activeType)) return

      // Limit to 100 assets per type
      const limitedTypeAssets = assets.slice(0, maxAssetsPerType)
      limitedAssets.push(...limitedTypeAssets)
    })
    return limitedAssets
  }, [railwayAssets, downloadedAssets, showRailwayAssets, useDownloadedAssets, selectedAssetFilters])

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
      {/* CSS for railway asset hover effects */}
      <style>{`
        .railway-asset-icon > div:hover {
          transform: scale(1.1) !important;
        }
        .railway-asset-icon {
          z-index: 1000 !important;
        }
      `}</style>
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem'
        }}>
          {/* Map Provider Toggle */}
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <label style={{fontSize: '0.75rem', fontWeight: '500', color: '#374151'}}>
              Map:
            </label>
            <select 
              value={mapProvider} 
              onChange={(e) => setMapProvider(e.target.value as 'osm' | 'google')}
              style={{
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid #d1d5db',
                fontSize: '0.75rem'
              }}
            >
              <option value="osm">OpenStreetMap</option>
              <option value="google">Google Maps</option>
            </select>
          </div>

          {mapProvider === 'google' && (
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <select 
                value={googleMapType} 
                onChange={(e) => setGoogleMapType(e.target.value as 'roadmap' | 'satellite')}
                style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.75rem'
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
                padding: '4px 8px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: showRailwayOverlay ? '#3b82f6' : '#f3f4f6',
                color: showRailwayOverlay ? 'white' : '#6b7280',
                fontSize: '0.75rem',
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
              padding: '4px 8px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: autoFollow ? '#10b981' : '#f3f4f6',
              color: autoFollow ? 'white' : '#6b7280',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = autoFollow ? '#059669' : '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = autoFollow ? '#10b981' : '#f3f4f6'}
            title={autoFollow ? 'Disable auto-follow vehicle' : 'Enable auto-follow vehicle'}
          >
📍 {autoFollow ? 'Following' : 'Static'}
          </button>

          {/* Railway Assets Toggle */}
          <button
            onClick={() => setShowRailwayAssets(!showRailwayAssets)}
            style={{
              padding: '4px 8px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: showRailwayAssets ? '#8b5cf6' : '#f3f4f6',
              color: showRailwayAssets ? 'white' : '#6b7280',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showRailwayAssets ? '#7c3aed' : '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showRailwayAssets ? '#8b5cf6' : '#f3f4f6'}
            title={showRailwayAssets ? 'Hide railway infrastructure' : 'Show railway infrastructure'}
          >
🚦 {assetsLoading ? 'Loading...' : visibleRailwayAssets.length < railwayAssets.length ? `Assets (${visibleRailwayAssets.length}/${railwayAssets.length})` : `Assets (${railwayAssets.length})`}
          </button>

          <span style={{
            fontSize: '0.625rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '8px'
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
                icon={createWaypointIcon(isStart, isEnd)}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      color: isStart ? '#10b981' : isEnd ? '#ef4444' : '#6b7280'
                    }}>
                      {isStart ? '🚩 Route Start' : isEnd ? '🏁 Route End' : `📍 Waypoint ${index + 1}`}
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

          {/* Vehicle position marker */}
          {trainPosition && (
            <Marker
              position={trainPosition}
              icon={createVehicleIcon(isPlaying)}
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
                    📍 Current Position
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

          {/* Railway Asset Markers */}
          {showRailwayAssets && visibleRailwayAssets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lon]}
              icon={createRailwayAssetIcon(asset)}
              zIndexOffset={500}
              eventHandlers={{
                click: () => {
                  console.log(`Clicked on ${asset.type} asset:`, asset)
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: getAssetColor(asset.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>
                      {getAssetIcon(asset.type)}
                    </div>
                    <strong style={{
                      fontSize: '1rem',
                      color: '#1f2937',
                      textTransform: 'capitalize'
                    }}>
                      {asset.type.replace('_', ' ')}
                    </strong>
                    {asset.name && (
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {asset.name}
                      </span>
                    )}
                  </div>

                  {asset.description && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      {asset.description}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '8px'
                  }}>
                    <div>Lat: {asset.lat.toFixed(6)}</div>
                    <div>Lng: {asset.lon.toFixed(6)}</div>
                    <div>Source: OpenStreetMap</div>
                    {Object.keys(asset.tags).length > 0 && (
                      <details style={{marginTop: '8px'}}>
                        <summary style={{cursor: 'pointer', fontWeight: '500'}}>
                          OSM Tags ({Object.keys(asset.tags).length})
                        </summary>
                        <div style={{marginTop: '4px', maxHeight: '120px', overflowY: 'auto'}}>
                          {Object.entries(asset.tags).map(([key, value]) => (
                            <div key={key} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '2px 0',
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              <span style={{fontWeight: '500'}}>{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Map controller for handling events */}
          {/* Map controller for handling events */}
          <MapController 
            selectedEvent={selectedEvent}
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
            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6'}}></div>
            <span style={{color: '#6b7280'}}>Current Position</span>
          </div>
          {showRailwayAssets && (
            <>
              <div style={{fontSize: '0.75rem', fontWeight: '600', marginTop: '8px', marginBottom: '4px', color: '#8b5cf6'}}>
                Railway Infrastructure
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <div style={{width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#dc2626'}}></div>
                <span style={{color: '#6b7280'}}>Signals</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <div style={{width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb'}}></div>
                <span style={{color: '#6b7280'}}>Switches</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <div style={{width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#d97706'}}></div>
                <span style={{color: '#6b7280'}}>Level Crossings</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <div style={{width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#16a34a'}}></div>
                <span style={{color: '#6b7280'}}>Mileposts</span>
              </div>
              {assetsError && (
                <div style={{
                  fontSize: '0.625rem',
                  color: '#dc2626',
                  marginTop: '4px',
                  padding: '2px 4px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '2px'
                }}>
                  Error loading assets
                </div>
              )}
              {assetsLastUpdated && (
                <div style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  Updated: {assetsLastUpdated.toLocaleTimeString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}