import { AlertTriangle, Eye, CheckCircle } from 'lucide-react'
import { mockEvents } from '../data/mockData'

const kpis = [
  {
    name: 'Critical Alerts',
    value: '3',
    change: '+2 from yesterday',
    icon: AlertTriangle,
    color: '#dc2626',
    bgColor: '#fef2f2',
  },
  {
    name: 'Events Detected',
    value: '47',
    change: '+12 from yesterday',
    icon: Eye,
    color: '#2563eb',
    bgColor: '#eff6ff',
  },
  {
    name: 'System Status',
    value: 'Operational',
    change: '99.8% uptime',
    icon: CheckCircle,
    color: '#16a34a',
    bgColor: '#f0fdf4',
  },
]

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
  const recentEvents = mockEvents.slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>Real-time railway safety monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.name} className="card">
              <div className="p-6">
                <div className="flex items-center">
                  <div style={{
                    flexShrink: 0,
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: kpi.bgColor
                  }}>
                    <Icon style={{width: '1.75rem', height: '1.75rem', color: kpi.color}} />
                  </div>
                  <div style={{marginLeft: '1.25rem', flex: '1 1 0%'}}>
                    <dl>
                      <dt style={{fontSize: '0.875rem', fontWeight: '500', color: '#6b7280'}}>
                        {kpi.name}
                      </dt>
                      <dd style={{fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginTop: '0.25rem'}}>
                        {kpi.value}
                      </dd>
                      <dd style={{fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem'}}>{kpi.change}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1.5rem'}}>Recent Events</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem'}}>
            {recentEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <EventTypeChip type={event.type} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827',
                    backgroundColor: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {(event.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p style={{fontSize: '0.875rem', color: '#1f2937', fontWeight: '500', marginBottom: '0.25rem'}}>{event.note}</p>
                <p style={{fontSize: '0.75rem', color: '#6b7280'}}>{event.timestamp}</p>
              </div>
            ))}
          </div>
          <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
            <button style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              color: '#2563eb',
              fontWeight: '500',
              borderRadius: '0.5rem',
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
              View all events →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}