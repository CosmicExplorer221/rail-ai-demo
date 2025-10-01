import type { RailwayAsset, BoundingBox } from './overpassApi'

interface StoredAssetData {
  assets: RailwayAsset[]
  boundingBox: BoundingBox
  timestamp: number
  assetTypes: string[]
}

const STORAGE_KEY = 'rail_ai_railway_assets'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Generate a cache key based on bounding box and asset types
 */
function generateCacheKey(boundingBox: BoundingBox, assetTypes: string[]): string {
  const bbox = `${boundingBox.south.toFixed(3)},${boundingBox.west.toFixed(3)},${boundingBox.north.toFixed(3)},${boundingBox.east.toFixed(3)}`
  const types = assetTypes.sort().join(',')
  return `${bbox}_${types}`
}

/**
 * Save railway assets to localStorage
 */
export function saveRailwayAssets(
  assets: RailwayAsset[],
  boundingBox: BoundingBox,
  assetTypes: string[]
): void {
  try {
    // Skip saving if dataset is too large (>10k assets) to avoid quota issues
    if (assets.length > 10000) {
      console.log(`⚠️ Dataset too large (${assets.length} assets), skipping localStorage save to avoid quota issues`)
      return
    }

    const existingData = getStoredAssetsData()
    const cacheKey = generateCacheKey(boundingBox, assetTypes)

    const newData: StoredAssetData = {
      assets,
      boundingBox,
      timestamp: Date.now(),
      assetTypes
    }

    existingData[cacheKey] = newData

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData))
    console.log(`💾 Saved ${assets.length} railway assets to localStorage (key: ${cacheKey})`)
  } catch (error) {
    console.error('❌ Error saving railway assets to localStorage:', error)
    console.log('💡 Tip: Try reducing the query area or clearing localStorage cache')
  }
}

/**
 * Load railway assets from localStorage
 */
export function loadRailwayAssets(
  boundingBox: BoundingBox,
  assetTypes: string[]
): RailwayAsset[] | null {
  try {
    const storedData = getStoredAssetsData()
    const cacheKey = generateCacheKey(boundingBox, assetTypes)

    const data = storedData[cacheKey]

    if (!data) {
      // Silently return null for missing cache entries
      return null
    }

    // Check if data is still fresh
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION
    if (isExpired) {
      console.log(`⏰ Cached assets expired for key: ${cacheKey}`)
      delete storedData[cacheKey]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
      return null
    }

    console.log(`📦 Loaded ${data.assets.length} railway assets from localStorage (key: ${cacheKey})`)
    return data.assets
  } catch (error) {
    console.error('❌ Error loading railway assets from localStorage:', error)
    return null
  }
}

/**
 * Get all stored asset data
 */
function getStoredAssetsData(): Record<string, StoredAssetData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('❌ Error parsing stored railway assets:', error)
    return {}
  }
}

/**
 * Clear all cached railway assets
 */
export function clearRailwayAssetsCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Cleared railway assets cache')
  } catch (error) {
    console.error('❌ Error clearing railway assets cache:', error)
  }
}

/**
 * Get cache statistics
 */
export function getRailwayAssetsCacheStats(): {
  totalCacheEntries: number
  totalAssets: number
  cacheSize: string
  oldestCache: Date | null
  newestCache: Date | null
} {
  try {
    const storedData = getStoredAssetsData()
    const entries = Object.values(storedData)

    const totalAssets = entries.reduce((sum, data) => sum + data.assets.length, 0)
    const timestamps = entries.map(data => data.timestamp)

    return {
      totalCacheEntries: entries.length,
      totalAssets,
      cacheSize: JSON.stringify(storedData).length + ' bytes',
      oldestCache: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestCache: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    }
  } catch (error) {
    console.error('❌ Error getting cache stats:', error)
    return {
      totalCacheEntries: 0,
      totalAssets: 0,
      cacheSize: '0 bytes',
      oldestCache: null,
      newestCache: null
    }
  }
}

/**
 * Check if assets are available in cache
 */
export function hasRailwayAssetsInCache(
  boundingBox: BoundingBox,
  assetTypes: string[]
): boolean {
  try {
    const storedData = getStoredAssetsData()
    const cacheKey = generateCacheKey(boundingBox, assetTypes)
    const data = storedData[cacheKey]

    if (!data) return false

    // Check if not expired
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION
    return !isExpired
  } catch (error) {
    console.error('❌ Error checking cache:', error)
    return false
  }
}