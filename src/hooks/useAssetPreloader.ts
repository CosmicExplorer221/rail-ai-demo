import { useState, useEffect } from 'react'
import { downloadUKAssets, getLocalDatasetStats } from '../services/ukAssetDownloader'
import { saveRedistributedAssets } from '../services/assetRedistributor'

interface AssetPreloaderState {
  hasData: boolean
  isLoading: boolean
  progress: number
  message: string
  totalAssets: number
  lastDownloaded: string | null
}

export function useAssetPreloader() {
  const [state, setState] = useState<AssetPreloaderState>({
    hasData: false,
    isLoading: false,
    progress: 0,
    message: '',
    totalAssets: 0,
    lastDownloaded: null
  })

  // Check for existing data on mount
  useEffect(() => {
    const stats = getLocalDatasetStats()
    setState(prev => ({
      ...prev,
      hasData: stats.hasDataset,
      totalAssets: stats.totalAssets,
      lastDownloaded: stats.downloadDate
    }))

    // If no data exists, start downloading
    if (!stats.hasDataset) {
      startDownload()
    }
  }, [])

  const startDownload = async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await downloadUKAssets((progress) => {
        setState(prev => ({
          ...prev,
          progress: progress.progress,
          message: progress.message
        }))
      })

      if (result.success) {
        setState(prev => ({
          ...prev,
          hasData: true,
          isLoading: false,
          totalAssets: result.totalAssets || 0,
          lastDownloaded: new Date().toISOString(),
          message: `Successfully preloaded ${result.totalAssets} assets!`
        }))
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          message: `Failed to preload assets: ${result.error}`
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        message: `Error preloading assets: ${error}`
      }))
    }
  }

  const refreshData = () => {
    startDownload()
  }

  const redistributeAssets = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      message: 'Redistributing existing assets across UK regions...'
    }))

    try {
      const success = saveRedistributedAssets()

      if (success) {
        const stats = getLocalDatasetStats()
        setState(prev => ({
          ...prev,
          hasData: true,
          isLoading: false,
          totalAssets: stats.totalAssets,
          lastDownloaded: new Date().toISOString(),
          message: `Successfully redistributed ${stats.totalAssets} assets across UK!`
        }))
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          message: 'Failed to redistribute assets - no existing data found'
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        message: `Error redistributing assets: ${error}`
      }))
    }
  }

  return {
    ...state,
    refreshData,
    redistributeAssets
  }
}