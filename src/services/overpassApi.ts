/**
 * Overpass API service for querying OpenStreetMap/OpenRailwayMap data
 * Handles queries for UK railway wayside assets (signals, switches, level crossings, mileposts)
 */

export interface RailwayAsset {
  id: string
  type: 'signal' | 'switch' | 'level_crossing' | 'station' | 'platform' | 'buffer_stop' | 'crossing' | 'halt' | 'tram_stop' | 'subway_entrance' | 'turntable' | 'roundhouse' | 'water_crane' | 'ventilation_shaft' | 'other'
  lat: number
  lon: number
  tags: Record<string, string>
  name?: string
  description?: string
}

export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

// UK bounding box for railway queries
export const UK_BOUNDS: BoundingBox = {
  south: 49.9,
  west: -8.2,
  north: 58.7,
  east: 1.8
}

/**
 * Overpass API query builder for railway assets
 */
export class OverpassQueryBuilder {
  private query: string = ''
  private bbox: BoundingBox

  constructor(bbox: BoundingBox = UK_BOUNDS) {
    this.bbox = bbox
    this.query = `[out:json][timeout:25];\n(\n`
  }

  // Add railway signals query
  addSignals(): this {
    this.query += `  node["railway"="signal"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="signal"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway switches/turnouts query
  addSwitches(): this {
    this.query += `  node["railway"="switch"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["railway"="railway_crossing"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add level crossings query
  addLevelCrossings(): this {
    this.query += `  node["railway"="level_crossing"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="level_crossing"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add mileposts query
  addMileposts(): this {
    this.query += `  node["railway"="milestone"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["railway"="milepost"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway stations query
  addStations(): this {
    this.query += `  node["railway"="station"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="station"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["public_transport"="station"]["railway"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway platforms query (simplified to avoid timeouts)
  addPlatforms(): this {
    this.query += `  node["railway"="platform"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="platform"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add buffer stops query
  addBufferStops(): this {
    this.query += `  node["railway"="buffer_stop"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add derailment devices query
  addDerails(): this {
    this.query += `  node["railway"="derail"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway crossings query
  addCrossings(): this {
    this.query += `  node["railway"="crossing"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add bridges query
  addBridges(): this {
    this.query += `  way["railway"]["bridge"="yes"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"]["bridge"~"^(viaduct|aqueduct|boardwalk)$"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add tunnels query
  addTunnels(): this {
    this.query += `  way["railway"]["tunnel"="yes"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway yards query
  addYards(): this {
    this.query += `  node["railway"="yard"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="yard"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["landuse"="railway"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway depots query
  addDepots(): this {
    this.query += `  node["railway"="depot"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="depot"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway junctions query
  addJunctions(): this {
    this.query += `  node["railway"="junction"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add roundhouses query
  addRoundhouses(): this {
    this.query += `  node["railway"="roundhouse"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="roundhouse"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add turntables query
  addTurntables(): this {
    this.query += `  node["railway"="turntable"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="turntable"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add train wash facilities query
  addWashers(): this {
    this.query += `  node["railway"="wash"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="wash"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add fuel stations query
  addFuelStations(): this {
    this.query += `  node["railway"="fuel"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="fuel"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add workshops query
  addWorkshops(): this {
    this.query += `  node["railway"="workshop"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="workshop"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add railway halts query
  addHalts(): this {
    this.query += `  node["railway"="halt"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="halt"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add tram stops query
  addTramStops(): this {
    this.query += `  node["railway"="tram_stop"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["public_transport"="stop_position"]["tram"="yes"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add subway entrances query
  addSubwayEntrances(): this {
    this.query += `  node["railway"="subway_entrance"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["railway"="subway"]["entrance"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add water cranes query
  addWaterCranes(): this {
    this.query += `  node["railway"="water_crane"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  node["railway"="water_tower"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Add ventilation shafts query
  addVentilationShafts(): this {
    this.query += `  node["railway"="ventilation_shaft"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    this.query += `  way["railway"="ventilation_shaft"](${this.bbox.south},${this.bbox.west},${this.bbox.north},${this.bbox.east});\n`
    return this
  }

  // Build the complete query
  build(): string {
    this.query += `);\nout geom;\n`
    return this.query
  }
}

/**
 * Parse Overpass API response and convert to RailwayAsset objects
 */
export function parseOverpassResponse(response: any): RailwayAsset[] {
  const assets: RailwayAsset[] = []

  if (!response.elements) {
    return assets
  }

  response.elements.forEach((element: any) => {
    // Handle nodes with coordinates
    if (element.type === 'node' && element.lat && element.lon) {
      const asset = createAssetFromElement(element)
      if (asset) {
        assets.push(asset)
      }
    }

    // Handle ways (get centroid or first point)
    if (element.type === 'way' && element.geometry && element.geometry.length > 0) {
      const firstPoint = element.geometry[0]
      if (firstPoint && firstPoint.lat && firstPoint.lon) {
        const asset = createAssetFromElement({
          ...element,
          lat: firstPoint.lat,
          lon: firstPoint.lon
        })
        if (asset) {
          assets.push(asset)
        }
      }
    }
  })

  return assets
}

/**
 * Create RailwayAsset from OSM element
 */
function createAssetFromElement(element: any): RailwayAsset | null {
  if (!element.tags || !element.tags.railway) {
    return null
  }

  const railwayType = element.tags.railway
  let assetType: RailwayAsset['type'] = 'other'

  // Determine asset type based on railway tag
  switch (railwayType) {
    case 'signal':
      assetType = 'signal'
      break
    case 'switch':
    case 'railway_crossing':
      assetType = 'switch'
      break
    case 'level_crossing':
      assetType = 'level_crossing'
      break
    case 'milestone':
    case 'milepost':
      assetType = 'milepost'
      break
    case 'station':
      assetType = 'station'
      break
    case 'platform':
      assetType = 'platform'
      break
    case 'buffer_stop':
      assetType = 'buffer_stop'
      break
    case 'derail':
      assetType = 'derail'
      break
    case 'crossing':
      assetType = 'crossing'
      break
    case 'yard':
      assetType = 'yard'
      break
    case 'depot':
      assetType = 'depot'
      break
    case 'junction':
      assetType = 'junction'
      break
    case 'roundhouse':
      assetType = 'roundhouse'
      break
    case 'turntable':
      assetType = 'turntable'
      break
    case 'wash':
      assetType = 'washer'
      break
    case 'fuel':
      assetType = 'fuel_station'
      break
    case 'workshop':
      assetType = 'workshop'
      break
    default:
      // Check for bridges and tunnels in tags
      if (element.tags.bridge === 'yes' || element.tags.bridge === 'viaduct') {
        assetType = 'bridge'
      } else if (element.tags.tunnel === 'yes') {
        assetType = 'tunnel'
      } else if (element.tags.public_transport === 'station') {
        assetType = 'station'
      } else if (element.tags.public_transport === 'platform') {
        assetType = 'platform'
      } else if (element.tags.landuse === 'railway') {
        assetType = 'yard'
      } else {
        assetType = 'other'
      }
  }

  // Generate description based on tags
  const description = generateAssetDescription(element.tags, assetType)

  return {
    id: `${element.type}_${element.id}`,
    type: assetType,
    lat: element.lat,
    lon: element.lon,
    tags: element.tags,
    name: element.tags.name || element.tags.ref || undefined,
    description
  }
}

/**
 * Generate human-readable description from OSM tags
 */
function generateAssetDescription(tags: Record<string, string>, type: RailwayAsset['type']): string {
  const parts: string[] = []

  // Add type-specific information
  switch (type) {
    case 'signal':
      if (tags['railway:signal:main']) {
        parts.push(`Main signal: ${tags['railway:signal:main']}`)
      }
      if (tags['railway:signal:distant']) {
        parts.push(`Distant signal: ${tags['railway:signal:distant']}`)
      }
      if (tags['railway:signal:shunting']) {
        parts.push(`Shunting signal: ${tags['railway:signal:shunting']}`)
      }
      break

    case 'switch':
      if (tags.ref) {
        parts.push(`Switch ${tags.ref}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      break

    case 'level_crossing':
      if (tags.barrier) {
        parts.push(`Barrier: ${tags.barrier}`)
      }
      if (tags.supervision) {
        parts.push(`Supervision: ${tags.supervision}`)
      }
      break

    case 'milepost':
      if (tags.distance) {
        parts.push(`Distance: ${tags.distance}`)
      }
      if (tags.railway_mile) {
        parts.push(`Mile: ${tags.railway_mile}`)
      }
      break

    case 'station':
      if (tags.name) {
        parts.push(`Station: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      if (tags.railway_ref) {
        parts.push(`Reference: ${tags.railway_ref}`)
      }
      break

    case 'platform':
      if (tags.ref) {
        parts.push(`Platform ${tags.ref}`)
      }
      if (tags.length) {
        parts.push(`Length: ${tags.length}m`)
      }
      break

    case 'buffer_stop':
      if (tags.type) {
        parts.push(`Type: ${tags.type}`)
      }
      break

    case 'crossing':
      if (tags.crossing_ref) {
        parts.push(`Reference: ${tags.crossing_ref}`)
      }
      break

    case 'bridge':
      if (tags.bridge === 'viaduct') {
        parts.push('Railway viaduct')
      } else {
        parts.push('Railway bridge')
      }
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      break

    case 'tunnel':
      parts.push('Railway tunnel')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.length) {
        parts.push(`Length: ${tags.length}m`)
      }
      break

    case 'yard':
      parts.push('Railway yard')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      break

    case 'depot':
      parts.push('Railway depot')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      break

    case 'junction':
      parts.push('Railway junction')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.ref) {
        parts.push(`Reference: ${tags.ref}`)
      }
      break

    case 'roundhouse':
      parts.push('Railway roundhouse')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      break

    case 'turntable':
      parts.push('Railway turntable')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.diameter) {
        parts.push(`Diameter: ${tags.diameter}m`)
      }
      break

    case 'washer':
      parts.push('Train washing facility')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      break

    case 'fuel_station':
      parts.push('Railway fuel station')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.fuel) {
        parts.push(`Fuel type: ${tags.fuel}`)
      }
      break

    case 'workshop':
      parts.push('Railway workshop')
      if (tags.name) {
        parts.push(`Name: ${tags.name}`)
      }
      if (tags.operator) {
        parts.push(`Operator: ${tags.operator}`)
      }
      if (tags.service) {
        parts.push(`Service: ${tags.service}`)
      }
      break
  }

  // Add common information
  if (tags.operator && type !== 'switch') {
    parts.push(`Operator: ${tags.operator}`)
  }

  if (tags.electrified) {
    parts.push(`Electrified: ${tags.electrified}`)
  }

  return parts.length > 0 ? parts.join(' • ') : `Railway ${type.replace('_', ' ')}`
}

// Rate limiting and request deduplication for Overpass API requests
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 2000 // 2 seconds between requests

// Request deduplication to prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<RailwayAsset[]>>()

/**
 * Query Overpass API for railway assets with rate limiting
 */
export async function queryRailwayAssets(
  bbox?: BoundingBox,
  assetTypes: ('signals' | 'switches' | 'levelCrossings' | 'stations' | 'platforms' | 'bufferStops' | 'crossings' | 'halts' | 'tramStops' | 'subwayEntrances' | 'turntables' | 'roundhouses' | 'waterCranes' | 'ventilationShafts')[] = ['signals', 'levelCrossings']
): Promise<RailwayAsset[]> {
  // Create a unique key for this request to prevent duplicates
  const requestKey = `${JSON.stringify(bbox)}_${assetTypes.sort().join(',')}`

  // If there's already a pending request for the same data, return that promise
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!
  }

  const queryBuilder = new OverpassQueryBuilder(bbox)

  // Add requested asset types to query (comprehensive OSM railway assets)
  if (assetTypes.includes('signals')) {
    queryBuilder.addSignals()
  }
  if (assetTypes.includes('switches')) {
    queryBuilder.addSwitches()
  }
  if (assetTypes.includes('levelCrossings')) {
    queryBuilder.addLevelCrossings()
  }
  if (assetTypes.includes('stations')) {
    queryBuilder.addStations()
  }
  if (assetTypes.includes('platforms')) {
    queryBuilder.addPlatforms()
  }
  if (assetTypes.includes('bufferStops')) {
    queryBuilder.addBufferStops()
  }
  if (assetTypes.includes('crossings')) {
    queryBuilder.addCrossings()
  }
  if (assetTypes.includes('halts')) {
    queryBuilder.addHalts()
  }
  if (assetTypes.includes('tramStops')) {
    queryBuilder.addTramStops()
  }
  if (assetTypes.includes('subwayEntrances')) {
    queryBuilder.addSubwayEntrances()
  }
  if (assetTypes.includes('turntables')) {
    queryBuilder.addTurntables()
  }
  if (assetTypes.includes('roundhouses')) {
    queryBuilder.addRoundhouses()
  }
  if (assetTypes.includes('waterCranes')) {
    queryBuilder.addWaterCranes()
  }
  if (assetTypes.includes('ventilationShafts')) {
    queryBuilder.addVentilationShafts()
  }

  const query = queryBuilder.build()

  // Create and store the promise for this request
  const requestPromise = (async (): Promise<RailwayAsset[]> => {
    try {
      // Rate limiting: ensure minimum interval between requests
      const now = Date.now()
      const timeSinceLastRequest = now - lastRequestTime
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
        console.log(`⏳ Rate limiting: waiting ${waitTime}ms before API request...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      lastRequestTime = Date.now()

      console.log('🚂 Querying Overpass API for railway assets...')
      console.log('📍 Bounding box:', bbox)
      console.log('🎯 Asset types:', assetTypes)
      console.log('📝 Query:', query)

      const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    console.log('📡 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Overpass API error response:', errorText)

      // Special handling for rate limiting
      if (response.status === 429) {
        console.warn('⚠️ Overpass API rate limit exceeded. Please wait before making more requests.')
        throw new Error(`Rate limit exceeded. Please wait before requesting more assets.`)
      }

      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📊 Raw Overpass response:', data)

      const assets = parseOverpassResponse(data)
      console.log(`✅ Parsed ${assets.length} railway assets`)

      return assets
    } catch (error) {
      console.error('❌ Error querying Overpass API:', error)
      throw error
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey)
    }
  })()

  // Store the promise in the pending requests map
  pendingRequests.set(requestKey, requestPromise)

  return requestPromise
}

/**
 * Get asset icon based on type
 */
export function getAssetIcon(type: RailwayAsset['type']): string {
  switch (type) {
    case 'signal':
      return '●'
    case 'switch':
      return '◆'
    case 'level_crossing':
      return '▲'
    case 'milepost':
      return '■'
    case 'station':
      return '▶'
    case 'platform':
      return '▬'
    case 'buffer_stop':
      return '◉'
    case 'derail':
      return '⬟'
    case 'crossing':
      return '✕'
    case 'bridge':
      return '◄'
    case 'tunnel':
      return '○'
    case 'yard':
      return '◘'
    case 'depot':
      return '◙'
    case 'junction':
      return '◐'
    case 'roundhouse':
      return '◑'
    case 'turntable':
      return '◒'
    case 'washer':
      return '◓'
    case 'fuel_station':
      return '◔'
    case 'workshop':
      return '◕'
    default:
      return '○'
  }
}

/**
 * Get asset color based on type
 */
export function getAssetColor(type: RailwayAsset['type']): string {
  switch (type) {
    case 'signal':
      return '#dc2626' // red
    case 'switch':
      return '#2563eb' // blue
    case 'level_crossing':
      return '#d97706' // orange
    case 'milepost':
      return '#16a34a' // green
    case 'station':
      return '#7c3aed' // purple
    case 'platform':
      return '#059669' // emerald
    case 'buffer_stop':
      return '#be185d' // pink
    case 'derail':
      return '#dc2626' // red
    case 'crossing':
      return '#7c2d12' // amber
    case 'bridge':
      return '#0284c7' // sky blue
    case 'tunnel':
      return '#1e40af' // blue
    case 'yard':
      return '#8b5cf6' // violet
    case 'depot':
      return '#c2410c' // orange-600
    case 'junction':
      return '#eab308' // yellow-500
    case 'roundhouse':
      return '#14b8a6' // teal-500
    case 'turntable':
      return '#f59e0b' // amber-500
    case 'washer':
      return '#06b6d4' // cyan-500
    case 'fuel_station':
      return '#10b981' // emerald-500
    case 'workshop':
      return '#6366f1' // indigo-500
    default:
      return '#6b7280' // gray
  }
}