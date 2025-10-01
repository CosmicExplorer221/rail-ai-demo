import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Review } from './components/Review'
import { Uploads } from './components/Uploads'
import { Models } from './components/Models'
import { Settings } from './components/Settings'
import { useAssetPreloader } from './hooks/useAssetPreloader'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Preload railway assets when app starts
  const preloader = useAssetPreloader()

  // Log preloader status for debugging
  useEffect(() => {
    if (preloader.hasData) {
      console.log(`✅ Railway assets preloaded: ${preloader.totalAssets} assets`)

      // Check if assets need redistribution (if they're all in London area)
      // This automatically redistributes assets once on app load if they haven't been redistributed yet
      const metadata = localStorage.getItem('rail_ai_uk_dataset_metadata')
      if (metadata) {
        const parsed = JSON.parse(metadata)
        if (parsed.version !== '1.1-redistributed') {
          console.log('🔄 Auto-redistributing assets across UK regions...')
          preloader.redistributeAssets()
        }
      }
    } else if (preloader.isLoading) {
      console.log(`⏳ Preloading railway assets: ${preloader.progress}% - ${preloader.message}`)
    }
  }, [preloader.hasData, preloader.isLoading, preloader.progress, preloader.message, preloader.totalAssets])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'review':
        return <Review />
      case 'uploads':
        return <Uploads />
      case 'models':
        return <Models />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

export default App