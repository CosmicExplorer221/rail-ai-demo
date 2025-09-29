import { useState } from 'react'
import {
  Train,
  Lightbulb,
  Navigation,
  Radar,
  Square,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface EquipmentType {
  id: string
  name: string
  icon: any
  count: number
  status: 'operational' | 'warning' | 'critical'
  lastMaintenance: string
}

interface LineEquipment {
  id: string
  name: string
  color: string
  expanded: boolean
  equipment: EquipmentType[]
}

export function LineEquipmentDetails() {
  const [lines, setLines] = useState<LineEquipment[]>([
    {
      id: 'purple',
      name: 'Purple Line',
      color: '#8b5cf6',
      expanded: true,
      equipment: [
        {
          id: 'signals',
          name: 'Light Signals',
          icon: Lightbulb,
          count: 45,
          status: 'operational',
          lastMaintenance: '2024-01-15'
        },
        {
          id: 'points',
          name: 'Points/Switches',
          icon: Navigation,
          count: 28,
          status: 'warning',
          lastMaintenance: '2024-01-10'
        },
        {
          id: 'detection',
          name: 'Train Detection',
          icon: Radar,
          count: 67,
          status: 'operational',
          lastMaintenance: '2024-01-18'
        },
        {
          id: 'crossings',
          name: 'Level Crossings',
          icon: Square,
          count: 12,
          status: 'operational',
          lastMaintenance: '2024-01-12'
        },
        {
          id: 'generic',
          name: 'Generic I/O',
          icon: Settings,
          count: 156,
          status: 'operational',
          lastMaintenance: '2024-01-20'
        }
      ]
    },
    {
      id: 'black',
      name: 'Black Line',
      color: '#374151',
      expanded: false,
      equipment: [
        {
          id: 'signals',
          name: 'Light Signals',
          icon: Lightbulb,
          count: 32,
          status: 'operational',
          lastMaintenance: '2024-01-14'
        },
        {
          id: 'points',
          name: 'Points/Switches',
          icon: Navigation,
          count: 19,
          status: 'operational',
          lastMaintenance: '2024-01-16'
        },
        {
          id: 'detection',
          name: 'Train Detection',
          icon: Radar,
          count: 48,
          status: 'critical',
          lastMaintenance: '2024-01-05'
        },
        {
          id: 'crossings',
          name: 'Level Crossings',
          icon: Square,
          count: 8,
          status: 'operational',
          lastMaintenance: '2024-01-11'
        },
        {
          id: 'generic',
          name: 'Generic I/O',
          icon: Settings,
          count: 98,
          status: 'warning',
          lastMaintenance: '2024-01-08'
        }
      ]
    },
    {
      id: 'blue',
      name: 'Blue Line',
      color: '#2563eb',
      expanded: false,
      equipment: [
        {
          id: 'signals',
          name: 'Light Signals',
          icon: Lightbulb,
          count: 23,
          status: 'operational',
          lastMaintenance: '2024-01-17'
        },
        {
          id: 'points',
          name: 'Points/Switches',
          icon: Navigation,
          count: 15,
          status: 'operational',
          lastMaintenance: '2024-01-13'
        },
        {
          id: 'detection',
          name: 'Train Detection',
          icon: Radar,
          count: 34,
          status: 'operational',
          lastMaintenance: '2024-01-19'
        },
        {
          id: 'crossings',
          name: 'Level Crossings',
          icon: Square,
          count: 6,
          status: 'operational',
          lastMaintenance: '2024-01-16'
        },
        {
          id: 'generic',
          name: 'Generic I/O',
          icon: Settings,
          count: 72,
          status: 'operational',
          lastMaintenance: '2024-01-21'
        }
      ]
    },
    {
      id: 'green',
      name: 'Green Line',
      color: '#16a34a',
      expanded: false,
      equipment: [
        {
          id: 'signals',
          name: 'Light Signals',
          icon: Lightbulb,
          count: 18,
          status: 'operational',
          lastMaintenance: '2024-01-18'
        },
        {
          id: 'points',
          name: 'Points/Switches',
          icon: Navigation,
          count: 11,
          status: 'operational',
          lastMaintenance: '2024-01-15'
        },
        {
          id: 'detection',
          name: 'Train Detection',
          icon: Radar,
          count: 25,
          status: 'operational',
          lastMaintenance: '2024-01-20'
        },
        {
          id: 'crossings',
          name: 'Level Crossings',
          icon: Square,
          count: 4,
          status: 'warning',
          lastMaintenance: '2024-01-07'
        },
        {
          id: 'generic',
          name: 'Generic I/O',
          icon: Settings,
          count: 45,
          status: 'operational',
          lastMaintenance: '2024-01-19'
        }
      ]
    }
  ])

  const toggleLineExpansion = (lineId: string) => {
    setLines(prev => prev.map(line =>
      line.id === lineId
        ? { ...line, expanded: !line.expanded }
        : line
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#dc2626'
      case 'warning': return '#ea580c'
      case 'operational': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical': return '#fef2f2'
      case 'warning': return '#fff7ed'
      case 'operational': return '#f0fdf4'
      default: return '#f9fafb'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card">
      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '0.75rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            Line Equipment Details
          </h3>
          <div style={{
            height: '2px',
            width: '2rem',
            backgroundColor: '#2563eb',
            borderRadius: '1px'
          }} />
        </div>

        {/* Lines with Equipment */}
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line.id} style={{
              border: '1px solid #f3f4f6',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              {/* Line Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => toggleLineExpansion(line.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }}
              >
                {/* Expand/Collapse Icon */}
                <div style={{ marginRight: '0.5rem' }}>
                  {line.expanded ? (
                    <ChevronDown style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                  ) : (
                    <ChevronRight style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                  )}
                </div>

                {/* Line Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '0.5rem'
                }}>
                  <div style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: line.color,
                    marginRight: '0.375rem'
                  }} />
                  <Train style={{
                    width: '1rem',
                    height: '1rem',
                    color: '#6b7280'
                  }} />
                </div>

                {/* Line Name and Total Count */}
                <div style={{ flex: '1' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {line.name}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#6b7280'
                  }}>
                    {line.equipment.reduce((sum, eq) => sum + eq.count, 0)} total equipment
                  </div>
                </div>

                {/* Status Summary */}
                <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                  {['operational', 'warning', 'critical'].map(status => {
                    const count = line.equipment.filter(eq => eq.status === status).length
                    if (count === 0) return null
                    return (
                      <div
                        key={status}
                        style={{
                          padding: '0.1875rem 0.375rem',
                          borderRadius: '0.25rem',
                          backgroundColor: getStatusBgColor(status),
                          border: `1px solid ${getStatusColor(status)}20`,
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          color: getStatusColor(status)
                        }}
                      >
                        {count}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Equipment Details */}
              {line.expanded && (
                <div style={{
                  backgroundColor: 'white',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  {line.equipment.map((equipment, index) => {
                    const Icon = equipment.icon
                    return (
                      <div
                        key={equipment.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.375rem 0.5rem 0.375rem 2rem',
                          borderTop: index === 0 ? 'none' : '1px solid #f8fafc',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafbfc'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white'
                        }}
                      >
                        {/* Equipment Icon */}
                        <div style={{
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                          backgroundColor: '#f8fafc',
                          marginRight: '0.5rem'
                        }}>
                          <Icon style={{
                            width: '0.875rem',
                            height: '0.875rem',
                            color: '#6b7280'
                          }} />
                        </div>

                        {/* Equipment Info */}
                        <div style={{ flex: '1', minWidth: '0' }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            color: '#111827',
                            marginBottom: '0.0625rem'
                          }}>
                            {equipment.name}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#6b7280'
                          }}>
                            Last: {formatDate(equipment.lastMaintenance)}
                          </div>
                        </div>

                        {/* Equipment Count */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '0.5rem'
                        }}>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#111827',
                            marginRight: '0.375rem'
                          }}>
                            {equipment.count}
                          </div>
                          <div style={{
                            padding: '0.0625rem 0.25rem',
                            borderRadius: '0.1875rem',
                            backgroundColor: getStatusBgColor(equipment.status),
                            fontSize: '0.6rem',
                            fontWeight: '600',
                            color: getStatusColor(equipment.status),
                            textTransform: 'uppercase'
                          }}>
                            {equipment.status === 'operational' ? 'OK' : equipment.status === 'warning' ? 'WARN' : 'CRIT'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}