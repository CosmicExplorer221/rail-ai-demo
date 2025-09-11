import { useState } from 'react'
import { 
  LayoutDashboard, 
  Eye, 
  Upload, 
  Brain, 
  Settings, 
  Train,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Review', icon: Eye, id: 'review' },
  { name: 'Uploads', icon: Upload, id: 'uploads' },
  { name: 'Models', icon: Brain, id: 'models' },
  { name: 'Settings', icon: Settings, id: 'settings' },
]

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-white shadow-sm border-r transition-all duration-300`}>
        <div className="flex items-center px-6 py-5 border-b">
          <Train style={{width: '2rem', height: '2rem', color: '#2563eb'}} />
          {!isCollapsed && (
            <span className="ml-3 text-xl font-semibold text-gray-900">Rail AI MVP</span>
          )}
        </div>
        <nav className="mt-8">
          <div className={isCollapsed ? "px-2" : "px-4"}>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={currentPage === item.id ? "nav-button active" : "nav-button"}
                  style={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    width: '100%'
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon />
                  {!isCollapsed && item.name}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
      <div className="flex-1">
        <main style={{height: '100vh', overflow: 'auto', backgroundColor: '#f9fafb'}}>
          {children}
        </main>
      </div>
    </div>
  )
}