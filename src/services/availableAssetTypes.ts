import { loadLocalUKAssets } from './ukAssetDownloader'

/**
 * Get available asset types from the local dataset
 */
export function getAvailableAssetTypes(): string[] {
  const localAssets = loadLocalUKAssets()
  if (!localAssets || localAssets.length === 0) {
    return []
  }

  // Create type mapping from OSM types to UI filter types
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

  // Count assets by type and get unique filter types
  const assetTypeCounts: Record<string, number> = {}
  const availableFilterTypes = new Set<string>()

  localAssets.forEach(asset => {
    const filterType = typeMapping[asset.type] || asset.type
    assetTypeCounts[asset.type] = (assetTypeCounts[asset.type] || 0) + 1
    availableFilterTypes.add(filterType)
  })

  console.log('📊 Available asset types in local dataset:', assetTypeCounts)

  return Array.from(availableFilterTypes)
}

/**
 * Get asset count by type
 */
export function getAssetTypeCounts(): Record<string, number> {
  const localAssets = loadLocalUKAssets()
  if (!localAssets || localAssets.length === 0) {
    return {}
  }

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

  const filterTypeCounts: Record<string, number> = {}

  localAssets.forEach(asset => {
    const filterType = typeMapping[asset.type] || asset.type
    filterTypeCounts[filterType] = (filterTypeCounts[filterType] || 0) + 1
  })

  return filterTypeCounts
}