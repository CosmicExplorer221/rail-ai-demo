/**
 * Route Geometry Utilities
 * Provides smooth interpolation along GPS coordinate routes using haversine distance
 */

export type GeoPoint = [number, number] // [lat, lng]

export interface RouteMetrics {
  total: number // Total route distance in meters
  segments: number[] // Distance of each segment
  cumulative: number[] // Cumulative distance at each waypoint
  pointAtRatio: (ratio: number) => GeoPoint // Get position at ratio (0-1) along route
}

/**
 * Calculate haversine distance between two GPS points
 */
function haversineDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371000 // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const [lat1, lon1] = point1
  const [lat2, lon2] = point2
  
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)

  const a = Math.sin(dLat / 2) ** 2 + 
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2
  
  return 2 * R * Math.asin(Math.sqrt(a))
}

/**
 * Compute route metrics for smooth interpolation along a polyline
 */
export function computeRouteMetrics(waypoints: GeoPoint[]): RouteMetrics {
  if (waypoints.length < 2) {
    throw new Error('Route must have at least 2 waypoints')
  }

  // Calculate segment distances
  const segments: number[] = []
  let totalDistance = 0
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentLength = haversineDistance(waypoints[i], waypoints[i + 1])
    segments.push(segmentLength)
    totalDistance += segmentLength
  }

  // Calculate cumulative distances
  const cumulative = [0]
  for (let i = 0; i < segments.length; i++) {
    cumulative.push(cumulative[i] + segments[i])
  }

  /**
   * Get position at a specific ratio (0-1) along the route
   */
  function pointAtRatio(ratio: number): GeoPoint {
    const clampedRatio = Math.max(0, Math.min(1, ratio))
    const targetDistance = clampedRatio * totalDistance

    // Find which segment contains this distance
    let segmentIndex = 0
    while (segmentIndex < segments.length && cumulative[segmentIndex + 1] < targetDistance) {
      segmentIndex++
    }

    // Handle edge case - exactly at end
    if (segmentIndex >= segments.length) {
      return waypoints[waypoints.length - 1]
    }

    // Calculate local position within the segment
    const segmentStartDistance = cumulative[segmentIndex]
    const localDistance = Math.max(0, targetDistance - segmentStartDistance)
    const segmentLength = segments[segmentIndex]
    const localRatio = segmentLength === 0 ? 0 : localDistance / segmentLength

    // Interpolate between waypoints
    const [startLat, startLng] = waypoints[segmentIndex]
    const [endLat, endLng] = waypoints[segmentIndex + 1]

    const lat = startLat + (endLat - startLat) * localRatio
    const lng = startLng + (endLng - startLng) * localRatio

    return [lat, lng]
  }

  return {
    total: totalDistance,
    segments,
    cumulative,
    pointAtRatio
  }
}

/**
 * Helper function to align an event at a specific time ratio along a route
 */
export function alignEventWithRoute(timeRatio: number, routeMetrics: RouteMetrics): GeoPoint {
  return routeMetrics.pointAtRatio(timeRatio)
}

/**
 * Convert time-based position to GPS coordinates using route metrics
 */
export function timeToPosition(
  currentTime: number, 
  totalDuration: number, 
  routeMetrics: RouteMetrics
): GeoPoint {
  const ratio = Math.max(0, Math.min(1, currentTime / totalDuration))
  return routeMetrics.pointAtRatio(ratio)
}