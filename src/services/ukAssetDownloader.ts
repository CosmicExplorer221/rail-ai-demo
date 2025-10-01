import { UK_BOUNDS, queryRailwayAssets } from './overpassApi'

// Simple compression helper to reduce localStorage usage
function compressData(data: string): string {
  try {
    // Use basic compression by removing whitespace from JSON
    return JSON.stringify(JSON.parse(data))
  } catch {
    return data
  }
}

function decompressData(data: string): string {
  return data
}

// Define interfaces locally to avoid import issues
interface RailwayAsset {
  id: string
  type: 'signal' | 'switch' | 'level_crossing' | 'milepost' | 'station' | 'platform' | 'buffer_stop' | 'derail' | 'crossing' | 'bridge' | 'tunnel' | 'yard' | 'depot' | 'junction' | 'roundhouse' | 'turntable' | 'washer' | 'fuel_station' | 'workshop' | 'other'
  lat: number
  lon: number
  tags: Record<string, string>
  name?: string
  description?: string
}

interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

interface DownloadProgress {
  phase: 'initializing' | 'downloading' | 'processing' | 'storing' | 'complete'
  progress: number
  currentRegion?: string
  totalAssets?: number
  message: string
}

export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * London region for downloading railway assets
 */
const UK_REGIONS: Array<{ name: string; bounds: BoundingBox }> = [
  {
    name: 'London Area',
    bounds: { south: 51.3, west: -0.5, north: 51.7, east: 0.2 }
  }
]

const LOCAL_STORAGE_KEY = 'rail_ai_uk_complete_dataset'
const METADATA_KEY = 'rail_ai_uk_dataset_metadata'

interface DatasetMetadata {
  downloadDate: string
  totalAssets: number
  regions: string[]
  version: string
  boundingBox: BoundingBox
}

/**
 * Download complete UK railway asset dataset
 */
export async function downloadUKAssets(
  onProgress: ProgressCallback
): Promise<{ success: boolean; error?: string; totalAssets?: number }> {
  try {
    onProgress({
      phase: 'initializing',
      progress: 0,
      message: 'Initializing UK asset download...'
    })

    const allAssets: RailwayAsset[] = []
    // Use only the commonly available OSM railway asset types
    const assetTypes: ('signals' | 'levelCrossings' | 'stations' | 'platforms' | 'bufferStops')[] = [
      'signals', 'levelCrossings', 'stations', 'platforms', 'bufferStops'
    ]

    // Start with a small test region to check API connectivity
    const testRegion = {
      name: 'London Test Area',
      bounds: { south: 51.4, west: -0.3, north: 51.6, east: 0.1 }
    }

    onProgress({
      phase: 'downloading',
      progress: 5,
      currentRegion: testRegion.name,
      message: `Testing API with ${testRegion.name}...`
    })

    try {
      console.log(`🧪 Testing API connectivity with ${testRegion.name}...`)
      const testAssets = await queryRailwayAssets(testRegion.bounds, ['signals'])
      console.log(`✅ API test successful: ${testAssets.length} assets found in test area`)
      allAssets.push(...testAssets)
    } catch (error) {
      console.error(`❌ API test failed:`, error)
      throw new Error(`Overpass API is not accessible: ${error}`)
    }

    // If test successful, proceed with all regions
    for (let regionIndex = 0; regionIndex < UK_REGIONS.length; regionIndex++) {
      const region = UK_REGIONS[regionIndex]
      const regionProgress = 10 + (regionIndex / UK_REGIONS.length) * 70 // 10-80% for downloading

      onProgress({
        phase: 'downloading',
        progress: regionProgress,
        currentRegion: region.name,
        message: `Downloading assets from ${region.name}...`
      })

      try {
        // Download assets for this region
        console.log(`🌍 Downloading assets for ${region.name}:`, region.bounds)
        const regionAssets = await queryRailwayAssets(region.bounds, assetTypes)
        console.log(`📊 Downloaded ${regionAssets.length} assets from ${region.name}`)
        allAssets.push(...regionAssets)

        // Longer delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`❌ Failed to download assets for ${region.name}:`, error)
        // Continue with other regions
      }
    }

    console.log(`🔄 Total assets collected from all regions: ${allAssets.length}`)

    onProgress({
      phase: 'processing',
      progress: 85,
      totalAssets: allAssets.length,
      message: `Processing ${allAssets.length} assets...`
    })

    // Remove duplicates based on asset ID
    const uniqueAssets = Array.from(
      new Map(allAssets.map(asset => [asset.id, asset])).values()
    )

    console.log(`✅ Unique assets after deduplication: ${uniqueAssets.length}`)

    onProgress({
      phase: 'storing',
      progress: 90,
      totalAssets: uniqueAssets.length,
      message: `Storing ${uniqueAssets.length} unique assets locally...`
    })

    // Store the complete dataset
    const metadata: DatasetMetadata = {
      downloadDate: new Date().toISOString(),
      totalAssets: uniqueAssets.length,
      regions: UK_REGIONS.map(r => r.name),
      version: '1.0',
      boundingBox: UK_BOUNDS
    }

    // Store in very small chunks to avoid localStorage size limits
    const CHUNK_SIZE = 25 // Drastically reduced to prevent quota issues
    const chunks = []
    for (let i = 0; i < uniqueAssets.length; i += CHUNK_SIZE) {
      chunks.push(uniqueAssets.slice(i, i + CHUNK_SIZE))
    }

    // Clear any existing dataset
    clearLocalDataset()

    // Store metadata
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

    // Store asset chunks with compression
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${LOCAL_STORAGE_KEY}_chunk_${i}`
      const compressedChunk = compressData(JSON.stringify(chunks[i]))
      localStorage.setItem(chunkKey, compressedChunk)
    }

    // Store chunk count
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_chunk_count`, chunks.length.toString())

    onProgress({
      phase: 'complete',
      progress: 100,
      totalAssets: uniqueAssets.length,
      message: `Successfully downloaded and stored ${uniqueAssets.length} UK railway assets!`
    })

    return { success: true, totalAssets: uniqueAssets.length }

  } catch (error) {
    console.error('Error downloading UK assets:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Load UK assets from local storage
 */
export function loadLocalUKAssets(): RailwayAsset[] | null {
  try {
    const chunkCountStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_chunk_count`)
    if (!chunkCountStr) return null

    const chunkCount = parseInt(chunkCountStr, 10)
    const allAssets: RailwayAsset[] = []

    for (let i = 0; i < chunkCount; i++) {
      const chunkKey = `${LOCAL_STORAGE_KEY}_chunk_${i}`
      const chunkData = localStorage.getItem(chunkKey)
      if (!chunkData) {
        console.warn(`Missing chunk ${i}, dataset may be incomplete`)
        continue
      }
      const decompressedData = decompressData(chunkData)
      const chunk = JSON.parse(decompressedData)
      allAssets.push(...chunk)
    }

    return allAssets
  } catch (error) {
    console.error('Error loading local UK assets:', error)
    return null
  }
}

/**
 * Get metadata about the local dataset
 */
export function getLocalDatasetMetadata(): DatasetMetadata | null {
  try {
    const metadata = localStorage.getItem(METADATA_KEY)
    return metadata ? JSON.parse(metadata) : null
  } catch (error) {
    console.error('Error loading dataset metadata:', error)
    return null
  }
}

/**
 * Check if local dataset exists
 */
export function hasLocalDataset(): boolean {
  return !!localStorage.getItem(METADATA_KEY)
}

/**
 * Clear the local dataset
 */
export function clearLocalDataset(): void {
  try {
    // Remove metadata
    localStorage.removeItem(METADATA_KEY)

    // Remove all chunks
    const chunkCountStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_chunk_count`)
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10)
      for (let i = 0; i < chunkCount; i++) {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_chunk_${i}`)
      }
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_chunk_count`)
    }

    console.log('Local UK dataset cleared')
  } catch (error) {
    console.error('Error clearing local dataset:', error)
  }
}

/**
 * Get local dataset statistics
 */
export function getLocalDatasetStats(): {
  hasDataset: boolean
  totalAssets: number
  downloadDate: string | null
  regions: string[]
  storageSize: string
} {
  const metadata = getLocalDatasetMetadata()

  if (!metadata) {
    return {
      hasDataset: false,
      totalAssets: 0,
      downloadDate: null,
      regions: [],
      storageSize: '0 KB'
    }
  }

  // Estimate storage size
  let totalSize = 0
  const chunkCountStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_chunk_count`)
  if (chunkCountStr) {
    const chunkCount = parseInt(chunkCountStr, 10)
    for (let i = 0; i < chunkCount; i++) {
      const chunkKey = `${LOCAL_STORAGE_KEY}_chunk_${i}`
      const chunkData = localStorage.getItem(chunkKey)
      if (chunkData) {
        totalSize += chunkData.length
      }
    }
  }

  const sizeInMB = totalSize / 1024 / 1024
  const storageSize = sizeInMB > 1 ? `${sizeInMB.toFixed(1)} MB` : `${(totalSize / 1024).toFixed(1)} KB`

  return {
    hasDataset: true,
    totalAssets: metadata.totalAssets,
    downloadDate: metadata.downloadDate,
    regions: metadata.regions,
    storageSize
  }
}