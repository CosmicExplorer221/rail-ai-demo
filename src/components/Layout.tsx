import { 
  LayoutDashboard, 
  Eye, 
  Upload, 
  Brain, 
  Settings, 
  Train
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Review', icon: Eye, id: 'review' },
  { name: 'Datasets', icon: Upload, id: 'uploads' },
  { name: 'Models', icon: Brain, id: 'models' },
  { name: 'Settings', icon: Settings, id: 'settings' },
]

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 bg-white shadow-sm border-r">
        <div className="flex items-center px-6 py-5 border-b">
          <Train style={{width: '2rem', height: '2rem', color: '#2563eb'}} />
          <span className="ml-3 text-xl font-semibold text-gray-900">Rail AI MVP</span>
        </div>
        <nav className="mt-8">
          <div className="px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={currentPage === item.id ? "nav-button active" : "nav-button"}
                >
                  <Icon />
                  {item.name}
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