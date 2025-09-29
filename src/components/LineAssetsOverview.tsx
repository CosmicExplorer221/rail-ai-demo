import { Train, Activity } from 'lucide-react'

interface LineAsset {
  id: string
  name: string
  color: string
  assets: number
  status: 'operational' | 'warning' | 'critical'
  riskLevel: number
}

export function LineAssetsOverview() {
  const lineAssets: LineAsset[] = [
    {
      id: 'purple',
      name: 'Purple Line',
      color: '#8b5cf6',
      assets: 280,
      status: 'operational',
      riskLevel: 15
    },
    {
      id: 'black',
      name: 'Black Line',
      color: '#374151',
      assets: 192,
      status: 'warning',
      riskLevel: 8
    },
    {
      id: 'blue',
      name: 'Blue Line',
      color: '#2563eb',
      assets: 119,
      status: 'operational',
      riskLevel: 4
    },
    {
      id: 'green',
      name: 'Green Line',
      color: '#16a34a',
      assets: 87,
      status: 'operational',
      riskLevel: 2
    }
  ]

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
            Line Assets Overview
          </h3>
          <div style={{
            height: '2px',
            width: '2rem',
            backgroundColor: '#2563eb',
            borderRadius: '1px'
          }} />
        </div>

        {/* Lines List */}
        <div className="space-y-1">
          {lineAssets.map((line) => (
            <div
              key={line.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                border: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#f3f4f6'
              }}
            >
              {/* Line Color Indicator */}
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

              {/* Line Info */}
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.125rem'
                }}>
                  {line.name}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6b7280'
                }}>
                  {line.assets} Assets
                </div>
              </div>

              {/* Risk Level Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '80px',
                marginLeft: '0.5rem'
              }}>
                <div style={{
                  flex: '1',
                  height: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.1875rem',
                  marginRight: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${line.riskLevel}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(line.status),
                    borderRadius: '0.1875rem',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#4b5563',
                  minWidth: '1.25rem',
                  textAlign: 'right'
                }}>
                  {line.riskLevel}
                </span>
              </div>

              {/* Status Indicator */}
              <div style={{
                marginLeft: '0.5rem',
                padding: '0.1875rem 0.375rem',
                borderRadius: '0.25rem',
                backgroundColor: getStatusBgColor(line.status),
                border: `1px solid ${getStatusColor(line.status)}20`
              }}>
                <Activity style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  color: getStatusColor(line.status)
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '0.125rem'
              }}>
                Total Assets
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                {lineAssets.reduce((sum, line) => sum + line.assets, 0)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '0.125rem'
              }}>
                Avg Risk Level
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#0f172a'
              }}>
                {Math.round(lineAssets.reduce((sum, line) => sum + line.riskLevel, 0) / lineAssets.length)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}