import { useState, useMemo } from 'react'
import { Play, Square, RotateCcw, ChevronRight, Calendar, Eye, EyeOff, Map as MapIcon } from 'lucide-react'
import { mockEvents, videoDatasets, mockUploadBatches, getRouteForVideo, type EventData } from '../data/mockData'
import { Map } from './Map'
import { useTicker } from '../hooks/useTicker'
import { useRailwayAssets } from '../hooks/useRailwayAssets'
import { getAssetIcon, getAssetColor, UK_BOUNDS } from '../services/overpassApi'
import { getAvailableAssetTypes, getAssetTypeCounts } from '../services/availableAssetTypes'
import { loadLocalUKAssets } from '../services/ukAssetDownloader'

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
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [timelineIsPlaying, setTimelineIsPlaying] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(0) // Current position in seconds
  const [videoResolution] = useState('1920x1080')
  const [videoFps] = useState('30 fps')
  const [showTimelineEvents, setShowTimelineEvents] = useState(false) // Toggle for showing events on timeline
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set()) // Active event type filters
  const [sortBy, setSortBy] = useState<'time' | 'type'>('time') // Sorting method
  const [filterTab, setFilterTab] = useState<'events' | 'assets'>('events') // Filter tab selection
  const [activeAssetTypes, setActiveAssetTypes] = useState<Set<string>>(new Set()) // Active railway asset filters - default deselected
  const [viewType, setViewType] = useState<'events' | 'assets'>('events') // View type for All Events section
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set()) // Track expanded asset rows


  // Get route definition for current video
  const currentRoute = useMemo(() => getRouteForVideo(currentVideoFile), [currentVideoFile])

  // Get available asset types from the local dataset
  const availableAssetTypes = useMemo(() => getAvailableAssetTypes(), [])
  const assetTypeCounts = useMemo(() => getAssetTypeCounts(), [])
  const downloadedAssets = useMemo(() => loadLocalUKAssets() || [], [])

  // Fetch railway assets for the Map only (filters control what shows on map)
  const {
    assets: railwayAssets,
    loading: assetsLoading,
    error: assetsError
  } = useRailwayAssets({
    enabled: activeAssetTypes.size > 0, // Only fetch when filters are selected for map display
    assetTypes: Array.from(activeAssetTypes) as ('signals' | 'levelCrossings' | 'stations' | 'platforms' | 'bufferStops')[],
    boundingBox: UK_BOUNDS
  })

  // Asset summary calculation
  const assetSummary = useMemo(() => {
    if (!railwayAssets.length) return {}

    const summary: Record<string, { count: number; status: 'ok' | 'warning' | 'critical'; details: string }> = {}

    railwayAssets.forEach(asset => {
      const type = asset.type
      if (!summary[type]) {
        summary[type] = { count: 0, status: 'ok', details: '' }
      }
      summary[type].count++

      // Determine status based on asset type and tags
      if (type === 'signal' && !asset.tags['railway:signal:main']) {
        summary[type].status = 'warning'
      } else if (type === 'level_crossing' && !asset.tags.barrier) {
        summary[type].status = 'critical'
      } else if (type === 'switch' && !asset.tags.operator) {
        summary[type].status = 'warning'
      } else if (type === 'derail') {
        summary[type].status = 'critical'
      }
    })

    // Add details for each type
    Object.keys(summary).forEach(type => {
      const count = summary[type].count
      summary[type].details = `${count} ${type.replace('_', ' ')}${count !== 1 ? 's' : ''}`
    })

    return summary
  }, [railwayAssets])
  
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

  // Handle asset expansion toggle
  const handleAssetToggle = (assetId: string) => {
    setExpandedAssets(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(assetId)) {
        newExpanded.delete(assetId)
      } else {
        newExpanded.add(assetId)
      }
      return newExpanded
    })
  }

  // Handle asset type toggle
  const handleAssetTypeToggle = (assetType: string) => {
    setActiveAssetTypes(prev => {
      const newTypes = new Set(prev)
      if (newTypes.has(assetType)) {
        newTypes.delete(assetType)
      } else {
        newTypes.add(assetType)
      }
      return newTypes
    })
  }

  // Sort events by time or type and calculate timeline positions
  const sortedEvents = useMemo(() => {
    let sorted: typeof filteredEvents

    if (sortBy === 'time') {
      sorted = [...filteredEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    } else {
      // Sort by event type first, then by time within each type
      sorted = [...filteredEvents].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type)
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })
    }

    // Calculate relative positions (0-100) based on time for timeline
    if (sorted.length > 1) {
      const firstTime = Math.min(...sorted.map(e => new Date(e.timestamp).getTime()))
      const lastTime = Math.max(...sorted.map(e => new Date(e.timestamp).getTime()))
      const timeRange = lastTime - firstTime || 1 // Avoid division by zero

      return sorted.map(event => ({
        ...event,
        timelinePosition: ((new Date(event.timestamp).getTime() - firstTime) / timeRange) * 100
      }))
    }

    return sorted.map(event => ({ ...event, timelinePosition: 50 }))
  }, [filteredEvents, sortBy])


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

      {/* Event Table Section */}
      <div className="card" style={{marginBottom: '2rem'}}>
        <div className="p-6">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <Eye style={{width: '1.25rem', height: '1.25rem', color: '#4b5563'}} />
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>
                {viewType === 'events' ? 'All Events' : 'Railway Assets'}
              </h3>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {viewType === 'events' ? `${sortedEvents.length} events` : assetsLoading ? 'Loading...' : `${railwayAssets.length} assets`}
              </span>
            </div>
          </div>

          {/* View Type and Sorting Tabs */}
          <div style={{display: 'flex', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb'}}>
            <button
              onClick={() => setViewType('events')}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: viewType === 'events' ? '2px solid #2563eb' : '2px solid transparent',
                color: viewType === 'events' ? '#2563eb' : '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (viewType !== 'events') {
                  e.currentTarget.style.color = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (viewType !== 'events') {
                  e.currentTarget.style.color = '#6b7280'
                }
              }}
            >
              Events
            </button>
            <button
              onClick={() => setViewType('assets')}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: viewType === 'assets' ? '2px solid #2563eb' : '2px solid transparent',
                color: viewType === 'assets' ? '#2563eb' : '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (viewType !== 'assets') {
                  e.currentTarget.style.color = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (viewType !== 'assets') {
                  e.currentTarget.style.color = '#6b7280'
                }
              }}
            >
              Assets
            </button>

            {/* Sorting Tabs - only show for Events */}
            {viewType === 'events' && (
              <>
                <div style={{width: '1px', backgroundColor: '#e5e7eb', margin: '0.5rem 1rem'}} />
                <button
                  onClick={() => setSortBy('time')}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderBottom: sortBy === 'time' ? '2px solid #10b981' : '2px solid transparent',
                    color: sortBy === 'time' ? '#10b981' : '#9ca3af',
                    transition: 'all 0.2s'
                  }}
                >
                  Time
                </button>
                <button
                  onClick={() => setSortBy('type')}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderBottom: sortBy === 'type' ? '2px solid #10b981' : '2px solid transparent',
                    color: sortBy === 'type' ? '#10b981' : '#9ca3af',
                    transition: 'all 0.2s'
                  }}
                >
                  Event Type
                </button>
              </>
            )}
          </div>

          {/* Content Tables */}
          {viewType === 'events' ? (
            /* Event Table - Minimalistic Data Analysis Style */
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 80px 80px 100px 80px',
                backgroundColor: '#f8fafc',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#475569',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e2e8f0',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>
                <div>Description</div>
                <div style={{textAlign: 'center'}}>Type</div>
                <div style={{textAlign: 'center'}}>Time</div>
                <div style={{textAlign: 'center'}}>Conf.</div>
                <div style={{textAlign: 'center'}}>Frame</div>
                <div style={{textAlign: 'center'}}>Action</div>
              </div>

              {/* Table Body */}
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 80px 80px 100px 80px',
                      fontSize: '0.875rem',
                      padding: '0.625rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: selectedEvent?.id === event.id ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s'
                    }}
                    onClick={() => setSelectedEvent(event)}
                    onMouseEnter={(e) => {
                      if (selectedEvent?.id !== event.id) {
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEvent?.id !== event.id) {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                      }
                    }}
                  >
                    <div style={{
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem'
                    }}>
                      {event.note}
                    </div>

                    <div style={{textAlign: 'center'}}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        textTransform: 'uppercase'
                      }}>
                        {event.type.replace('_', ' ').split(' ')[0]}
                      </span>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontFamily: 'ui-monospace, monospace'
                    }}>
                      {event.timestamp.split(' ')[1]}
                    </div>

                    <div style={{textAlign: 'center'}}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: event.confidence > 0.8 ? '#059669' :
                               event.confidence > 0.6 ? '#d97706' : '#dc2626'
                      }}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontFamily: 'ui-monospace, monospace'
                    }}>
                      #{event.frame}
                    </div>

                    <div style={{textAlign: 'center'}}>
                      <button
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#2563eb',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Railway Assets Table */
            <div style={{ padding: '1rem 0' }}>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Asset Type</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Reliability</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>File Size</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        type: 'Signals', icon: '●', id: 'SIG-001', status: 'Warning', reliability: 87, fileSize: '2.1 MB', count: 24, expandable: true,
                        items: [
                          { id: 'SIG-001-A', status: 'Warning', reliability: 82 },
                          { id: 'SIG-001-B', status: 'None', reliability: 94 },
                          { id: 'SIG-001-C', status: 'Warning', reliability: 85 }
                        ]
                      },
                      { type: 'Switches', icon: '◆', id: 'SW-045', status: 'Warning', reliability: 92, fileSize: '1.8 MB', count: 18, expandable: true,
                        items: [
                          { id: 'SW-045-A', status: 'Warning', reliability: 89 },
                          { id: 'SW-045-B', status: 'None', reliability: 96 }
                        ]
                      },
                      { type: 'Level Crossings', icon: '▲', id: 'LC-012', status: 'Low', reliability: 95, fileSize: '950 kB', count: 8, expandable: false },
                      { type: 'Mileposts', icon: '■', id: 'MP-234', status: 'None', reliability: 98, fileSize: '450 kB', count: 156, expandable: false },
                      { type: 'Stations', icon: '▶', id: 'STN-007', status: 'Warning', reliability: 84, fileSize: '12.5 MB', count: 12, expandable: true,
                        items: [
                          { id: 'STN-007-A', status: 'Warning', reliability: 78 },
                          { id: 'STN-007-B', status: 'None', reliability: 91 }
                        ]
                      },
                      { type: 'Platforms', icon: '▬', id: 'PLT-089', status: 'None', reliability: 96, fileSize: '3.2 MB', count: 36, expandable: false },
                      { type: 'Buffer Stops', icon: '◉', id: 'BS-003', status: 'Low', reliability: 89, fileSize: '850 kB', count: 6, expandable: false },
                      { type: 'Derails', icon: '⬟', id: 'DR-016', status: 'None', reliability: 97, fileSize: '720 kB', count: 4, expandable: false },
                      { type: 'Crossings', icon: '✕', id: 'CR-028', status: 'Warning', reliability: 81, fileSize: '1.1 MB', count: 14, expandable: true,
                        items: [
                          { id: 'CR-028-A', status: 'Warning', reliability: 76 },
                          { id: 'CR-028-B', status: 'Low', reliability: 86 }
                        ]
                      },
                      { type: 'Bridges', icon: '◄', id: 'BR-055', status: 'None', reliability: 94, fileSize: '8.7 MB', count: 22, expandable: false },
                      { type: 'Tunnels', icon: '○', id: 'TN-009', status: 'Low', reliability: 88, fileSize: '6.3 MB', count: 9, expandable: false },
                      { type: 'Yards', icon: '◘', id: 'YD-002', status: 'Warning', reliability: 79, fileSize: '45.2 MB', count: 3, expandable: true,
                        items: [
                          { id: 'YD-002-A', status: 'Warning', reliability: 73 },
                          { id: 'YD-002-B', status: 'Low', reliability: 85 }
                        ]
                      },
                      { type: 'Depots', icon: '◙', id: 'DP-004', status: 'None', reliability: 93, fileSize: '28.1 MB', count: 5, expandable: false },
                      { type: 'Junctions', icon: '◐', id: 'JN-067', status: 'Low', reliability: 90, fileSize: '2.8 MB', count: 31, expandable: true,
                        items: [
                          { id: 'JN-067-A', status: 'Low', reliability: 87 },
                          { id: 'JN-067-B', status: 'None', reliability: 93 }
                        ]
                      }
                    ].flatMap((asset, index) => {
                      const isExpanded = expandedAssets.has(asset.id)
                      const rows = []

                      // Main asset row
                      rows.push(
                        <tr key={asset.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {asset.expandable && (
                              <button
                                onClick={() => handleAssetToggle(asset.id)}
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  border: 'none',
                                  background: 'none',
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                ▶
                              </button>
                            )}
                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{asset.icon}</span>
                            <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>{asset.type}</span>
                          </td>
                          <td style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                            {asset.id}
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              backgroundColor: asset.status === 'Warning' ? '#fef3c7' : asset.status === 'Low' ? '#fef3c7' : '#f3f4f6',
                              color: asset.status === 'Warning' ? '#92400e' : asset.status === 'Low' ? '#92400e' : '#6b7280'
                            }}>
                              {asset.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: asset.reliability >= 95 ? '#16a34a' : asset.reliability >= 85 ? '#d97706' : '#dc2626'
                            }}>
                              {asset.reliability}%
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                            {asset.fileSize}
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                            {asset.count}
                          </td>
                        </tr>
                      )

                      // Individual asset rows (when expanded)
                      if (isExpanded && asset.items) {
                        asset.items.forEach((item, itemIndex) => {
                          rows.push(
                            <tr key={item.id} style={{
                              backgroundColor: '#f9fafb',
                              borderBottom: itemIndex < asset.items!.length - 1 ? '1px solid #e5e7eb' : '1px solid #f3f4f6'
                            }}>
                              <td style={{ padding: '0.5rem 1rem 0.5rem 3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>└</span>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{asset.icon}</span>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.id}</span>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                                {item.id}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  backgroundColor: item.status === 'Warning' ? '#fef3c7' : item.status === 'Low' ? '#fef3c7' : '#f3f4f6',
                                  color: item.status === 'Warning' ? '#92400e' : item.status === 'Low' ? '#92400e' : '#6b7280'
                                }}>
                                  {item.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: item.reliability >= 95 ? '#16a34a' : item.reliability >= 85 ? '#d97706' : '#dc2626'
                                }}>
                                  {item.reliability}%
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#9ca3af' }}>
                                -
                              </td>
                              <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#9ca3af' }}>
                                1
                              </td>
                            </tr>
                          )
                        })
                      }

                      return rows
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline and Map Section */}
      <div style={{display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', marginBottom: '2rem'}}>
        {/* Timeline Section */}
        <div>
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
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation()
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
                        onMouseEnter={(mouseEvent) => {
                          mouseEvent.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)'
                          mouseEvent.currentTarget.style.zIndex = '25'
                        }}
                        onMouseLeave={(mouseEvent) => {
                          mouseEvent.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                          mouseEvent.currentTarget.style.zIndex = selectedEvent?.id === event.id ? '15' : '10'
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

          {/* Filters Section - Under Timeline */}
          <div style={{marginTop: '1.5rem'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0}}>
                Filters
              </h4>
              <div style={{display: 'flex', gap: '0.25rem'}}>
                <button
                  onClick={() => setFilterTab('events')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: filterTab === 'events' ? '600' : '400',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    backgroundColor: filterTab === 'events' ? '#f1f5f9' : '#ffffff',
                    color: filterTab === 'events' ? '#1e293b' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  Events
                </button>
                <button
                  onClick={() => setFilterTab('assets')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: filterTab === 'assets' ? '600' : '400',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    backgroundColor: filterTab === 'assets' ? '#f1f5f9' : '#ffffff',
                    color: filterTab === 'assets' ? '#1e293b' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  Assets
                </button>
              </div>
            </div>

            {/* Events Filter Content */}
            {filterTab === 'events' && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem'}}>
                {[
                  { name: 'PERSON_IN_TRACK', displayName: 'Person Track' },
                  { name: 'OBSTACLE', displayName: 'Obstruction' },
                  { name: 'SIGNAL_GREEN', displayName: 'Green Signal' },
                  { name: 'SIGNAL_YELLOW', displayName: 'Yellow Signal' },
                  { name: 'RED_SIGNAL', displayName: 'Red Signal' },
                  { name: 'BALISE', displayName: 'Balise Box' },
                  { name: 'SPEED_LIMIT', displayName: 'Speed Board' },
                  { name: 'SWITCH', displayName: 'Switch' },
                  { name: 'WARNING', displayName: 'Crossing' }
                ].map((filter) => {
                  const isActive = activeFilters.has(filter.name)
                  return (
                    <button
                      key={filter.name}
                      onClick={() => handleFilterToggle(filter.name)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: isActive ? '#1e293b' : '#64748b',
                        backgroundColor: isActive ? '#f1f5f9' : '#ffffff',
                        border: '1px solid',
                        borderColor: isActive ? '#94a3b8' : '#e2e8f0',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        textAlign: 'center',
                        fontWeight: isActive ? '500' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#f8fafc'
                          e.currentTarget.style.borderColor = '#cbd5e1'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }
                      }}
                    >
                      {filter.displayName}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Assets Filter Content */}
            {filterTab === 'assets' && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  Asset filters control map visibility only
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem'}}>
                {[
                  { name: 'signals', displayName: 'Signals' },
                  { name: 'switches', displayName: 'Switches' },
                  { name: 'levelCrossings', displayName: 'Level Crossings' },
                  { name: 'stations', displayName: 'Stations' },
                  { name: 'platforms', displayName: 'Platforms' },
                  { name: 'bufferStops', displayName: 'Buffer Stops' },
                  { name: 'crossings', displayName: 'Crossings' },
                  { name: 'halts', displayName: 'Halts' },
                  { name: 'tramStops', displayName: 'Tram Stops' },
                  { name: 'subwayEntrances', displayName: 'Subway Entrances' },
                  { name: 'turntables', displayName: 'Turntables' },
                  { name: 'roundhouses', displayName: 'Roundhouses' },
                  { name: 'waterCranes', displayName: 'Water Cranes' },
                  { name: 'ventilationShafts', displayName: 'Ventilation Shafts' }
                ].map((assetType) => {
                  const isActive = activeAssetTypes.has(assetType.name)
                  const count = assetTypeCounts[assetType.name] || 0
                  const hasAssets = count > 0

                  return (
                    <button
                      key={assetType.name}
                      onClick={() => {
                        if (hasAssets) {
                          handleAssetTypeToggle(assetType.name)
                        }
                      }}
                      disabled={!hasAssets}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: hasAssets
                          ? (isActive ? '#1e293b' : '#64748b')
                          : '#9ca3af',
                        backgroundColor: hasAssets
                          ? (isActive ? '#f1f5f9' : '#ffffff')
                          : '#f9fafb',
                        border: '1px solid',
                        borderColor: hasAssets
                          ? (isActive ? '#94a3b8' : '#e2e8f0')
                          : '#e5e7eb',
                        borderRadius: '0.25rem',
                        cursor: hasAssets ? 'pointer' : 'not-allowed',
                        opacity: hasAssets ? 1 : 0.5,
                        transition: 'all 0.1s',
                        textAlign: 'center',
                        fontWeight: isActive ? '500' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive && hasAssets) {
                          e.currentTarget.style.backgroundColor = '#f8fafc'
                          e.currentTarget.style.borderColor = '#cbd5e1'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive && hasAssets) {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }
                      }}
                      title={hasAssets ? `${assetType.displayName} (${count})` : `No ${assetType.displayName.toLowerCase()} available`}
                    >
                      {assetType.displayName} {hasAssets && `(${count})`}
                    </button>
                  )
                })}
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>

        {/* Map Section */}
        <div>
          {showMap && (
            <Map
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
              currentEvents={filteredEvents}
              timelinePosition={timelinePosition}
              videoFile={currentVideoFile}
              isPlaying={timelineIsPlaying}
              activeAssetTypes={activeAssetTypes}
              downloadedAssets={downloadedAssets}
              useDownloadedAssets={true}
            />
          )}
        </div>
      </div>


    </div>
  )
}
