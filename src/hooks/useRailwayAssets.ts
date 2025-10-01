import { useState, useEffect, useCallback, useRef } from 'react'
import {
  queryRailwayAssets,
  type RailwayAsset,
  type BoundingBox,
  UK_BOUNDS
} from '../services/overpassApi'
import {
  saveRailwayAssets,
  loadRailwayAssets
} from '../services/railwayAssetsStorage'
import {
  loadLocalUKAssets,
  hasLocalDataset
} from '../services/ukAssetDownloader'

interface UseRailwayAssetsOptions {
  enabled?: boolean
  assetTypes?: ('signals' | 'switches' | 'levelCrossings' | 'stations' | 'platforms' | 'bufferStops' | 'crossings' | 'halts' | 'tramStops' | 'subwayEntrances' | 'turntables' | 'roundhouses' | 'waterCranes' | 'ventilationShafts')[]
  boundingBox?: BoundingBox
  autoRefreshInterval?: number // in milliseconds
}

interface UseRailwayAssetsReturn {
  assets: RailwayAsset[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useRailwayAssets(options: UseRailwayAssetsOptions = {}): UseRailwayAssetsReturn {
  const {
    enabled = true,
    assetTypes = ['signals', 'levelCrossings'],
    boundingBox = UK_BOUNDS,
    autoRefreshInterval
  } = options

  const [assets, setAssets] = useState<RailwayAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Use refs to track state without causing re-renders
  const hasFetchedRef = useRef(false)
  const loadingRef = useRef(false)

  const fetchAssets = useCallback(async (forceRefresh = false) => {
    if (!enabled || !boundingBox) return

    // Prevent multiple simultaneous fetches using ref
    if (loadingRef.current) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      // First priority: Check for pre-downloaded local dataset
      if (hasLocalDataset() && !forceRefresh) {
        const localAssets = loadLocalUKAssets()
        if (localAssets && localAssets.length > 0) {
          // Filter local assets by requested types
          const filteredAssets = localAssets.filter(asset => {
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
            const assetType = typeMapping[asset.type] || asset.type
            return assetTypes.includes(assetType as any)
          })

          if (filteredAssets.length > 0) {
            setAssets(filteredAssets)
            setLastUpdated(new Date())
            setError(null)
            hasFetchedRef.current = true
            setLoading(false)
            loadingRef.current = false
            return
          }
        }
      }

      // Second priority: Try to load from cache
      const cachedAssets = loadRailwayAssets(boundingBox, assetTypes)

      if (cachedAssets && cachedAssets.length > 0 && !forceRefresh) {
        setAssets(cachedAssets)
        setLastUpdated(new Date())
        setError(null)
        hasFetchedRef.current = true
        setLoading(false)
        loadingRef.current = false
        return
      }

      // Only fetch from API if cache is empty or we're forcing refresh or we haven't fetched yet
      if (hasFetchedRef.current && !forceRefresh) {
        setLoading(false)
        loadingRef.current = false
        return
      }

      console.log('📡 Fetching fresh railway assets from Overpass API...', {
        assetTypes,
        boundingBox
      })

      const fetchedAssets = await queryRailwayAssets(boundingBox, assetTypes)

      console.log(`✅ Successfully fetched ${fetchedAssets.length} railway assets`)

      // Limit to 30 assets per type for performance and to reduce API load
      const limitedAssets: RailwayAsset[] = []
      const MAX_ASSETS_PER_TYPE = 30

      // Group assets by type
      const assetsByType: Record<string, RailwayAsset[]> = {}
      fetchedAssets.forEach(asset => {
        if (!assetsByType[asset.type]) {
          assetsByType[asset.type] = []
        }
        assetsByType[asset.type].push(asset)
      })

      // Limit each type to 100 assets
      Object.entries(assetsByType).forEach(([, assets]) => {
        const limitedTypeAssets = assets.slice(0, MAX_ASSETS_PER_TYPE)
        limitedAssets.push(...limitedTypeAssets)
      })

      // Save to cache only if we got results
      if (limitedAssets.length > 0) {
        saveRailwayAssets(limitedAssets, boundingBox, assetTypes)
      }

      setAssets(limitedAssets)
      setLastUpdated(new Date())
      setError(null)
      hasFetchedRef.current = true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch railway assets'
      console.error('❌ Error fetching railway assets:', err)
      setError(errorMessage)
      hasFetchedRef.current = true
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [enabled, assetTypes, boundingBox])

  // Handle fetching when enabled or when asset types/bounding box change
  useEffect(() => {
    if (enabled && assetTypes.length > 0) {
      // Only fetch if we have asset types selected
      // Reset hasFetched when asset types or bounding box change to allow fresh fetching
      hasFetchedRef.current = false
      fetchAssets()
    } else if (assetTypes.length === 0) {
      // If no asset types selected, clear assets without fetching
      setAssets([])
    }
  }, [enabled, assetTypes, boundingBox])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshInterval || !enabled) return

    const interval = setInterval(fetchAssets, autoRefreshInterval)
    return () => clearInterval(interval)
  }, [autoRefreshInterval, enabled, fetchAssets])

  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    await fetchAssets(true) // Force refresh
  }, [fetchAssets])

  return {
    assets,
    loading,
    error,
    refetch,
    lastUpdated
  }
}