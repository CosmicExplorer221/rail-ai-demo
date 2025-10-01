import { loadLocalUKAssets, clearLocalDataset } from './ukAssetDownloader'
import type { RailwayAsset } from './overpassApi'

// UK regions for redistribution
const UK_REGIONS = [
  { name: 'London & South East', bounds: { south: 51.2, west: -0.8, north: 51.8, east: 0.5 } },
  { name: 'Birmingham & Midlands', bounds: { south: 52.3, west: -2.3, north: 52.7, east: -1.5 } },
  { name: 'Manchester & North West', bounds: { south: 53.3, west: -2.5, north: 53.7, east: -2.0 } },
  { name: 'Leeds & Yorkshire', bounds: { south: 53.6, west: -1.8, north: 54.0, east: -1.2 } },
  { name: 'Newcastle & North East', bounds: { south: 54.8, west: -1.8, north: 55.2, east: -1.3 } },
  { name: 'Edinburgh & Central Scotland', bounds: { south: 55.8, west: -3.5, north: 56.2, east: -2.8 } },
  { name: 'Glasgow & West Scotland', bounds: { south: 55.7, west: -4.5, north: 56.1, east: -4.0 } },
  { name: 'Cardiff & South Wales', bounds: { south: 51.3, west: -3.5, north: 51.7, east: -2.8 } },
  { name: 'Bristol & South West', bounds: { south: 51.3, west: -2.8, north: 51.7, east: -2.3 } },
  { name: 'Norwich & East Anglia', bounds: { south: 52.5, west: 0.8, north: 52.9, east: 1.5 } }
]

/**
 * Redistribute existing assets across UK regions
 */
export function redistributeAssetsAcrossUK(): RailwayAsset[] {
  const existingAssets = loadLocalUKAssets()
  if (!existingAssets || existingAssets.length === 0) {
    console.log('No existing assets found to redistribute')
    return []
  }

  console.log(`📍 Redistributing ${existingAssets.length} existing assets across UK regions...`)

  // Group assets by type
  const assetsByType: Record<string, RailwayAsset[]> = {}
  existingAssets.forEach(asset => {
    if (!assetsByType[asset.type]) {
      assetsByType[asset.type] = []
    }
    assetsByType[asset.type].push(asset)
  })

  const redistributedAssets: RailwayAsset[] = []

  // Redistribute each asset type across regions
  Object.entries(assetsByType).forEach(([type, assets]) => {
    console.log(`🔄 Redistributing ${assets.length} ${type} assets across ${UK_REGIONS.length} regions`)

    assets.forEach((asset, index) => {
      // Assign asset to a region based on round-robin distribution
      const regionIndex = index % UK_REGIONS.length
      const targetRegion = UK_REGIONS[regionIndex]

      // Generate new coordinates within the target region bounds
      const newLat = targetRegion.bounds.south +
        Math.random() * (targetRegion.bounds.north - targetRegion.bounds.south)
      const newLon = targetRegion.bounds.west +
        Math.random() * (targetRegion.bounds.east - targetRegion.bounds.west)

      // Create redistributed asset with new coordinates
      const redistributedAsset: RailwayAsset = {
        ...asset,
        id: `${asset.id}_redistributed_${regionIndex}`, // Update ID to avoid conflicts
        lat: newLat,
        lon: newLon,
        description: `${asset.description || ''} (Redistributed to ${targetRegion.name})`.trim()
      }

      redistributedAssets.push(redistributedAsset)
    })
  })

  // Log redistribution results
  const redistStats: Record<string, number> = {}
  redistributedAssets.forEach(asset => {
    redistStats[asset.type] = (redistStats[asset.type] || 0) + 1
  })

  console.log('✅ Asset redistribution complete:')
  Object.entries(redistStats).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} assets`)
  })

  return redistributedAssets
}

/**
 * Save redistributed assets and replace the current dataset
 */
export function saveRedistributedAssets(): boolean {
  try {
    const redistributedAssets = redistributeAssetsAcrossUK()

    if (redistributedAssets.length === 0) {
      return false
    }

    // Store the redistributed assets using the same storage mechanism
    const LOCAL_STORAGE_KEY = 'rail_ai_uk_complete_dataset'
    const METADATA_KEY = 'rail_ai_uk_dataset_metadata'
    const CHUNK_SIZE = 25

    // Clear existing dataset
    clearLocalDataset()

    // Create chunks
    const chunks = []
    for (let i = 0; i < redistributedAssets.length; i += CHUNK_SIZE) {
      chunks.push(redistributedAssets.slice(i, i + CHUNK_SIZE))
    }

    // Store metadata
    const metadata = {
      downloadDate: new Date().toISOString(),
      totalAssets: redistributedAssets.length,
      regions: UK_REGIONS.map(r => r.name),
      version: '1.1-redistributed',
      boundingBox: { south: 50.0, west: -8.0, north: 61.0, east: 2.0 } // Covers all UK
    }
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

    // Store asset chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${LOCAL_STORAGE_KEY}_chunk_${i}`
      const compressedChunk = JSON.stringify(chunks[i])
      localStorage.setItem(chunkKey, compressedChunk)
    }

    // Store chunk count
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_chunk_count`, chunks.length.toString())

    console.log(`🎯 Successfully redistributed and saved ${redistributedAssets.length} assets across UK regions`)
    return true

  } catch (error) {
    console.error('❌ Error redistributing assets:', error)
    return false
  }
}