import type { GeoPoint, RouteMetrics } from '../utils/routeGeometry'
import { computeRouteMetrics, alignEventWithRoute } from '../utils/routeGeometry'

export interface Event {
  id: string
  timestamp: string
  frame: number
  type: 'RED_SIGNAL' | 'PERSON_IN_TRACK' | 'OBSTACLE' | 'SPEED_LIMIT' | 'WARNING'
  confidence: number
  note: string
  videoUrl?: string
  location: {
    lat: number
    lng: number
    milepost: string
  }
  // New fields for smooth interpolation
  timeRatio?: number // Position as ratio (0-1) along the route
}

export interface RouteDefinition {
  name: string
  waypoints: GeoPoint[]
  totalDuration: number // Total journey time in seconds
  metrics?: RouteMetrics // Computed route metrics
}

export interface Model {
  id: string
  name: string
  size: string
  mAP: number
  enabled: boolean
  description: string
}

export interface UploadBatch {
  id: string
  name: string
  type: 'JSONL' | 'CSV' | 'MP4'
  size: string
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED'
  uploadDate: string
}

// Dataset for lineA_km12+400_frontcab.mp4
// Berlin to Hamburg Railway Journey (280km) - 20 detection events
export const lineAEvents: Event[] = [
  { id: 'la1', timestamp: '2024-01-15 08:00:00', frame: 100, type: 'WARNING', confidence: 0.92, note: 'Departure from Berlin Hauptbahnhof', location: { lat: 52.5251, lng: 13.3694, milepost: 'KM 0+000' }, timeRatio: 0.0 },
  { id: 'la2', timestamp: '2024-01-15 08:12:15', frame: 2240, type: 'SPEED_LIMIT', confidence: 0.88, note: 'City speed limit 60 km/h', location: { lat: 52.5800, lng: 13.3200, milepost: 'KM 15+200' }, timeRatio: 0.085 },
  { id: 'la3', timestamp: '2024-01-15 08:25:30', frame: 4680, type: 'PERSON_IN_TRACK', confidence: 0.91, note: 'Track worker at suburban crossing', location: { lat: 52.6500, lng: 13.2400, milepost: 'KM 28+600' }, timeRatio: 0.178 },
  { id: 'la4', timestamp: '2024-01-15 08:35:45', frame: 6420, type: 'RED_SIGNAL', confidence: 0.95, note: 'Signal stop before Oranienburg', location: { lat: 52.7500, lng: 13.2300, milepost: 'KM 42+800' }, timeRatio: 0.249 },
  { id: 'la5', timestamp: '2024-01-15 08:48:00', frame: 8640, type: 'OBSTACLE', confidence: 0.87, note: 'Fallen tree branch on track', location: { lat: 52.8200, lng: 13.1800, milepost: 'KM 55+400' }, timeRatio: 0.335 },
  { id: 'la6', timestamp: '2024-01-15 09:05:20', frame: 11280, type: 'WARNING', confidence: 0.84, note: 'Wildlife crossing zone', location: { lat: 52.9000, lng: 13.0500, milepost: 'KM 68+200' }, timeRatio: 0.456 },
  { id: 'la7', timestamp: '2024-01-15 09:18:35', frame: 13860, type: 'SPEED_LIMIT', confidence: 0.90, note: 'High speed section 200 km/h', location: { lat: 53.0200, lng: 12.9200, milepost: 'KM 82+600' }, timeRatio: 0.548 },
  { id: 'la8', timestamp: '2024-01-15 09:28:50', frame: 16020, type: 'PERSON_IN_TRACK', confidence: 0.78, note: 'Maintenance crew near Wittenberge', location: { lat: 53.0800, lng: 12.8000, milepost: 'KM 95+800' }, timeRatio: 0.620 },
  { id: 'la9', timestamp: '2024-01-15 09:42:10', frame: 18840, type: 'RED_SIGNAL', confidence: 0.93, note: 'Junction signal at Ludwigslust', location: { lat: 53.3200, lng: 11.4900, milepost: 'KM 125+400' }, timeRatio: 0.713 },
  { id: 'la10', timestamp: '2024-01-15 09:55:25', frame: 21480, type: 'WARNING', confidence: 0.85, note: 'Bridge construction ahead', location: { lat: 53.4500, lng: 11.1200, milepost: 'KM 142+200' }, timeRatio: 0.806 },
  { id: 'la11', timestamp: '2024-01-15 10:08:40', frame: 24120, type: 'OBSTACLE', confidence: 0.89, note: 'Freight train on parallel track', location: { lat: 53.5800, lng: 10.7800, milepost: 'KM 158+600' }, timeRatio: 0.899 },
  { id: 'la12', timestamp: '2024-01-15 10:20:55', frame: 26580, type: 'SPEED_LIMIT', confidence: 0.86, note: 'Approach to Schwerin - 120 km/h', location: { lat: 53.6300, lng: 11.4100, milepost: 'KM 172+800' }, timeRatio: 0.585 },
  { id: 'la13', timestamp: '2024-01-15 10:35:10', frame: 29340, type: 'PERSON_IN_TRACK', confidence: 0.82, note: 'Station platform worker', location: { lat: 53.6350, lng: 11.4200, milepost: 'KM 175+200' }, timeRatio: 0.644 },
  { id: 'la14', timestamp: '2024-01-15 10:48:25', frame: 31980, type: 'WARNING', confidence: 0.88, note: 'Weather warning - heavy rain', location: { lat: 53.7200, lng: 10.9800, milepost: 'KM 192+400' }, timeRatio: 0.700 },
  { id: 'la15', timestamp: '2024-01-15 11:02:40', frame: 34620, type: 'RED_SIGNAL', confidence: 0.91, note: 'Signal delay at Büchen', location: { lat: 53.4800, lng: 10.6200, milepost: 'KM 208+600' }, timeRatio: 0.758 },
  { id: 'la16', timestamp: '2024-01-15 11:15:55', frame: 37260, type: 'OBSTACLE', confidence: 0.85, note: 'Construction vehicle near track', location: { lat: 53.5500, lng: 10.4200, milepost: 'KM 222+800' }, timeRatio: 0.814 },
  { id: 'la17', timestamp: '2024-01-15 11:28:10', frame: 39900, type: 'SPEED_LIMIT', confidence: 0.89, note: 'Urban approach Hamburg 80 km/h', location: { lat: 53.6000, lng: 10.2500, milepost: 'KM 235+400' }, timeRatio: 0.866 },
  { id: 'la18', timestamp: '2024-01-15 11:38:25', frame: 42060, type: 'PERSON_IN_TRACK', confidence: 0.87, note: 'Platform preparation Hamburg-Harburg', location: { lat: 53.4500, lng: 9.9800, milepost: 'KM 248+200' }, timeRatio: 0.908 },
  { id: 'la19', timestamp: '2024-01-15 11:48:40', frame: 44220, type: 'WARNING', confidence: 0.83, note: 'Dense urban traffic crossing', location: { lat: 53.5200, lng: 9.9500, milepost: 'KM 258+600' }, timeRatio: 0.951 },
  { id: 'la20', timestamp: '2024-01-15 11:58:55', frame: 46380, type: 'RED_SIGNAL', confidence: 0.94, note: 'Final approach Hamburg Hauptbahnhof', location: { lat: 53.5530, lng: 10.0070, milepost: 'KM 275+800' }, timeRatio: 0.994 }
]

// Munich to Berlin High-Speed Railway Journey (580km) - 25 detection events
export const lineBEvents: Event[] = [
  { id: 'lb1', timestamp: '2024-01-16 06:00:00', frame: 200, type: 'WARNING', confidence: 0.95, note: 'Departure Munich Hauptbahnhof', location: { lat: 48.1400, lng: 11.5600, milepost: 'KM 0+000' } },
  { id: 'lb2', timestamp: '2024-01-16 06:15:30', frame: 2850, type: 'SPEED_LIMIT', confidence: 0.89, note: 'Urban exit speed 160 km/h', location: { lat: 48.2500, lng: 11.6200, milepost: 'KM 22+400' } },
  { id: 'lb3', timestamp: '2024-01-16 06:28:45', frame: 5240, type: 'PERSON_IN_TRACK', confidence: 0.92, note: 'Maintenance crew near Ingolstadt', location: { lat: 48.7600, lng: 11.4200, milepost: 'KM 45+600' } },
  { id: 'lb4', timestamp: '2024-01-16 06:45:10', frame: 8210, type: 'RED_SIGNAL', confidence: 0.88, note: 'Junction signal Ingolstadt', location: { lat: 48.7650, lng: 11.4250, milepost: 'KM 48+800' } },
  { id: 'lb5', timestamp: '2024-01-16 07:02:25', frame: 11560, type: 'OBSTACLE', confidence: 0.91, note: 'Agricultural vehicle crossing', location: { lat: 49.0400, lng: 11.8700, milepost: 'KM 78+200' } },
  { id: 'lb6', timestamp: '2024-01-16 07:18:40', frame: 14720, type: 'SPEED_LIMIT', confidence: 0.87, note: 'High-speed section 300 km/h', location: { lat: 49.4500, lng: 11.0800, milepost: 'KM 115+400' } },
  { id: 'lb7', timestamp: '2024-01-16 07:32:55', frame: 17450, type: 'WARNING', confidence: 0.85, note: 'Weather alert - crosswinds', location: { lat: 49.7800, lng: 10.9200, milepost: 'KM 142+600' } },
  { id: 'lb8', timestamp: '2024-01-16 07:48:10', frame: 20580, type: 'PERSON_IN_TRACK', confidence: 0.93, note: 'Track inspection near Bamberg', location: { lat: 49.8900, lng: 10.9000, milepost: 'KM 168+800' } },
  { id: 'lb9', timestamp: '2024-01-16 08:05:25', frame: 24120, type: 'RED_SIGNAL', confidence: 0.90, note: 'Station approach Bamberg', location: { lat: 49.8980, lng: 10.9050, milepost: 'KM 172+200' } },
  { id: 'lb10', timestamp: '2024-01-16 08:22:40', frame: 27840, type: 'OBSTACLE', confidence: 0.86, note: 'Construction crane near track', location: { lat: 50.3200, lng: 10.7800, milepost: 'KM 215+400' } },
  { id: 'lb11', timestamp: '2024-01-16 08:38:55', frame: 31200, type: 'SPEED_LIMIT', confidence: 0.88, note: 'Approach Erfurt 200 km/h', location: { lat: 50.9800, lng: 11.0300, milepost: 'KM 258+600' } },
  { id: 'lb12', timestamp: '2024-01-16 08:52:10', frame: 34020, type: 'WARNING', confidence: 0.84, note: 'Tunnel approach - reduced visibility', location: { lat: 50.9850, lng: 11.0350, milepost: 'KM 262+800' } },
  { id: 'lb13', timestamp: '2024-01-16 09:08:25', frame: 37440, type: 'PERSON_IN_TRACK', confidence: 0.91, note: 'Station worker Erfurt platform', location: { lat: 50.9720, lng: 11.0370, milepost: 'KM 267+200' } },
  { id: 'lb14', timestamp: '2024-01-16 09:25:40', frame: 41160, type: 'RED_SIGNAL', confidence: 0.89, note: 'Departure signal Erfurt', location: { lat: 50.9750, lng: 11.0400, milepost: 'KM 270+400' } },
  { id: 'lb15', timestamp: '2024-01-16 09:42:55', frame: 44880, type: 'OBSTACLE', confidence: 0.87, note: 'Freight train on adjacent track', location: { lat: 51.3400, lng: 11.5800, milepost: 'KM 315+600' } },
  { id: 'lb16', timestamp: '2024-01-16 09:58:10', frame: 48240, type: 'SPEED_LIMIT', confidence: 0.90, note: 'High-speed corridor 280 km/h', location: { lat: 51.7200, lng: 11.9600, milepost: 'KM 358+800' } },
  { id: 'lb17', timestamp: '2024-01-16 10:12:25', frame: 51480, type: 'WARNING', confidence: 0.85, note: 'Animal crossing detection zone', location: { lat: 52.1300, lng: 12.4200, milepost: 'KM 402+200' } },
  { id: 'lb18', timestamp: '2024-01-16 10:28:40', frame: 55200, type: 'PERSON_IN_TRACK', confidence: 0.88, note: 'Signal maintenance crew', location: { lat: 52.2800, lng: 12.6500, milepost: 'KM 435+400' } },
  { id: 'lb19', timestamp: '2024-01-16 10:45:55', frame: 58920, type: 'RED_SIGNAL', confidence: 0.92, note: 'Junction before Wittenberg', location: { lat: 51.8700, lng: 12.6500, milepost: 'KM 468+600' } },
  { id: 'lb20', timestamp: '2024-01-16 11:02:10', frame: 62640, type: 'OBSTACLE', confidence: 0.86, note: 'Track maintenance equipment', location: { lat: 52.0200, lng: 12.8800, milepost: 'KM 501+800' } },
  { id: 'lb21', timestamp: '2024-01-16 11:18:25', frame: 66360, type: 'SPEED_LIMIT', confidence: 0.89, note: 'Berlin approach 160 km/h', location: { lat: 52.3500, lng: 13.1200, milepost: 'KM 535+200' } },
  { id: 'lb22', timestamp: '2024-01-16 11:32:40', frame: 69360, type: 'WARNING', confidence: 0.87, note: 'Urban traffic density warning', location: { lat: 52.4200, lng: 13.2800, milepost: 'KM 558+400' } },
  { id: 'lb23', timestamp: '2024-01-16 11:45:55', frame: 72240, type: 'PERSON_IN_TRACK', confidence: 0.90, note: 'Platform preparation Berlin Süd', location: { lat: 52.4750, lng: 13.3400, milepost: 'KM 572+600' } },
  { id: 'lb24', timestamp: '2024-01-16 11:58:10', frame: 75120, type: 'RED_SIGNAL', confidence: 0.94, note: 'Final approach Berlin Hauptbahnhof', location: { lat: 52.5200, lng: 13.3650, milepost: 'KM 578+800' } },
  { id: 'lb25', timestamp: '2024-01-16 12:05:25', frame: 76800, type: 'WARNING', confidence: 0.91, note: 'Arrival Berlin Hauptbahnhof', location: { lat: 52.5251, lng: 13.3694, milepost: 'KM 580+000' } }
]

// Rotterdam to Warsaw Trans-European Freight Corridor (1150km) - 30 detection events
export const yardEvents: Event[] = [
  { id: 'y1', timestamp: '2025-09-08 04:00:00', frame: 500, type: 'WARNING', confidence: 0.94, note: 'Departure Rotterdam Maasvlakte Port', location: { lat: 51.9500, lng: 4.0200, milepost: 'KM 0+000' } },
  { id: 'y2', timestamp: '2025-09-08 04:18:30', frame: 2850, type: 'OBSTACLE', confidence: 0.89, note: 'Container loading crane overhead', location: { lat: 51.9200, lng: 4.4800, milepost: 'KM 35+200' } },
  { id: 'y3', timestamp: '2025-09-08 04:35:45', frame: 5640, type: 'SPEED_LIMIT', confidence: 0.91, note: 'Urban freight limit 80 km/h', location: { lat: 52.0800, lng: 4.3100, milepost: 'KM 68+400' } },
  { id: 'y4', timestamp: '2025-09-08 04:52:20', frame: 8420, type: 'RED_SIGNAL', confidence: 0.93, note: 'Junction signal Utrecht', location: { lat: 52.0900, lng: 5.1200, milepost: 'KM 95+600' } },
  { id: 'y5', timestamp: '2025-09-08 05:08:55', frame: 11200, type: 'PERSON_IN_TRACK', confidence: 0.85, note: 'Track maintenance crew Amersfoort', location: { lat: 52.1600, lng: 5.3900, milepost: 'KM 125+800' } },
  { id: 'y6', timestamp: '2025-09-08 05:25:10', frame: 14040, type: 'WARNING', confidence: 0.88, note: 'Cross-border approach Netherlands-Germany', location: { lat: 52.2400, lng: 6.8900, milepost: 'KM 185+200' } },
  { id: 'y7', timestamp: '2025-09-08 05:42:25', frame: 17120, type: 'OBSTACLE', confidence: 0.87, note: 'Freight train waiting on siding', location: { lat: 52.2200, lng: 7.2100, milepost: 'KM 215+400' } },
  { id: 'y8', timestamp: '2025-09-08 05:58:40', frame: 19960, type: 'SPEED_LIMIT', confidence: 0.90, note: 'German freight corridor 120 km/h', location: { lat: 52.3700, lng: 7.9200, milepost: 'KM 248+600' } },
  { id: 'y9', timestamp: '2025-09-08 06:15:55', frame: 23180, type: 'RED_SIGNAL', confidence: 0.92, note: 'Osnabrück junction freight priority', location: { lat: 52.2700, lng: 8.0500, milepost: 'KM 275+800' } },
  { id: 'y10', timestamp: '2025-09-08 06:32:10', frame: 26400, type: 'PERSON_IN_TRACK', confidence: 0.84, note: 'Yard operations Hannover', location: { lat: 52.3700, lng: 9.7400, milepost: 'KM 342+200' } },
  { id: 'y11', timestamp: '2025-09-08 06:48:25', frame: 29620, type: 'WARNING', confidence: 0.86, note: 'Heavy freight load distribution check', location: { lat: 52.4500, lng: 10.1800, milepost: 'KM 385+400' } },
  { id: 'y12', timestamp: '2025-09-08 07:05:40', frame: 33120, type: 'OBSTACLE', confidence: 0.89, note: 'Agricultural vehicle near Braunschweig', location: { lat: 52.2700, lng: 10.5200, milepost: 'KM 418+600' } },
  { id: 'y13', timestamp: '2025-09-08 07:22:55', frame: 36580, type: 'SPEED_LIMIT', confidence: 0.91, note: 'Freight speed reduction 100 km/h', location: { lat: 52.2400, lng: 11.6200, milepost: 'KM 485+800' } },
  { id: 'y14', timestamp: '2025-09-08 07:38:10', frame: 39640, type: 'RED_SIGNAL', confidence: 0.88, note: 'Magdeburg freight classification yard', location: { lat: 52.1200, lng: 11.6300, milepost: 'KM 512+200' } },
  { id: 'y15', timestamp: '2025-09-08 07:55:25', frame: 43080, type: 'PERSON_IN_TRACK', confidence: 0.85, note: 'Locomotive change crew Berlin', location: { lat: 52.5200, lng: 13.4100, milepost: 'KM 595+400' } },
  { id: 'y16', timestamp: '2025-09-08 08:12:40', frame: 46520, type: 'WARNING', confidence: 0.87, note: 'Eastern corridor border approach', location: { lat: 52.3400, lng: 14.5500, milepost: 'KM 685+600' } },
  { id: 'y17', timestamp: '2025-09-08 08:28:55', frame: 49720, type: 'OBSTACLE', confidence: 0.90, note: 'Customs inspection area Frankfurt Oder', location: { lat: 52.3500, lng: 14.5500, milepost: 'KM 712+800' } },
  { id: 'y18', timestamp: '2025-09-08 08:45:10', frame: 53160, type: 'SPEED_LIMIT', confidence: 0.89, note: 'Poland border freight limit 80 km/h', location: { lat: 52.3400, lng: 14.6200, milepost: 'KM 735+200' } },
  { id: 'y19', timestamp: '2025-09-08 09:02:25', frame: 56840, type: 'RED_SIGNAL', confidence: 0.93, note: 'Polish railway system integration point', location: { lat: 52.2400, lng: 15.2300, milepost: 'KM 785+400' } },
  { id: 'y20', timestamp: '2025-09-08 09:18:40', frame: 60120, type: 'PERSON_IN_TRACK', confidence: 0.86, note: 'Track gauge compatibility check', location: { lat: 52.4100, lng: 16.2200, milepost: 'KM 825+600' } },
  { id: 'y21', timestamp: '2025-09-08 09:35:55', frame: 63720, type: 'WARNING', confidence: 0.88, note: 'Freight terminal approach Poznań', location: { lat: 52.4100, lng: 16.9200, milepost: 'KM 865+800' } },
  { id: 'y22', timestamp: '2025-09-08 09:52:10', frame: 67280, type: 'OBSTACLE', confidence: 0.87, note: 'Switching locomotive on parallel track', location: { lat: 52.4000, lng: 16.9300, milepost: 'KM 885+200' } },
  { id: 'y23', timestamp: '2025-09-08 10:08:25', frame: 70840, type: 'SPEED_LIMIT', confidence: 0.90, note: 'Urban freight approach 60 km/h', location: { lat: 52.1800, lng: 18.4500, milepost: 'KM 945+400' } },
  { id: 'y24', timestamp: '2025-09-08 10:25:40', frame: 74640, type: 'RED_SIGNAL', confidence: 0.92, note: 'Łódź freight bypass junction', location: { lat: 51.7600, lng: 19.4600, milepost: 'KM 985+600' } },
  { id: 'y25', timestamp: '2025-09-08 10:42:55', frame: 78440, type: 'PERSON_IN_TRACK', confidence: 0.84, note: 'Final inspection crew Warsaw approach', location: { lat: 52.0600, lng: 20.6200, milepost: 'KM 1045+800' } },
  { id: 'y26', timestamp: '2025-09-08 10:58:10', frame: 81960, type: 'WARNING', confidence: 0.89, note: 'Metropolitan freight traffic coordination', location: { lat: 52.1800, lng: 20.9200, milepost: 'KM 1078+200' } },
  { id: 'y27', timestamp: '2025-09-08 11:15:25', frame: 85760, type: 'OBSTACLE', confidence: 0.88, note: 'Freight yard switching operations', location: { lat: 52.2200, lng: 20.9800, milepost: 'KM 1105+400' } },
  { id: 'y28', timestamp: '2025-09-08 11:32:40', frame: 89560, type: 'SPEED_LIMIT', confidence: 0.91, note: 'Final approach Warsaw Central 40 km/h', location: { lat: 52.2500, lng: 21.0100, milepost: 'KM 1135+600' } },
  { id: 'y29', timestamp: '2025-09-08 11:48:55', frame: 93120, type: 'RED_SIGNAL', confidence: 0.94, note: 'Terminal assignment Warsaw Freight Hub', location: { lat: 52.2600, lng: 21.0200, milepost: 'KM 1148+800' } },
  { id: 'y30', timestamp: '2025-09-08 12:05:10', frame: 96720, type: 'WARNING', confidence: 0.95, note: 'Arrival Warsaw Freight Terminal', location: { lat: 52.2650, lng: 21.0250, milepost: 'KM 1150+000' } }
]

// Dataset for morning_commute_berlin_hauptbahnhof.mp4
export const morningCommuteEvents: Event[] = [
  {
    id: 'mc1',
    timestamp: '2024-01-20 08:15:30',
    frame: 1876,
    type: 'PERSON_IN_TRACK',
    confidence: 0.97,
    note: 'Commuter near platform edge during rush hour',
    location: {
      lat: 52.5250,
      lng: 13.3690,
      milepost: 'BERLIN-HBF+100'
    }
  },
  {
    id: 'mc2',
    timestamp: '2024-01-20 08:17:45',
    frame: 2103,
    type: 'RED_SIGNAL',
    confidence: 0.92,
    note: 'Main departure signal red - platform occupied',
    location: {
      lat: 52.5255,
      lng: 13.3695,
      milepost: 'BERLIN-HBF+150'
    }
  },
  {
    id: 'mc3',
    timestamp: '2024-01-20 08:19:22',
    frame: 2298,
    type: 'SPEED_LIMIT',
    confidence: 0.88,
    note: 'Station speed limit 30 km/h',
    location: {
      lat: 52.5260,
      lng: 13.3700,
      milepost: 'BERLIN-HBF+200'
    }
  },
  {
    id: 'mc4',
    timestamp: '2024-01-20 08:21:15',
    frame: 2467,
    type: 'WARNING',
    confidence: 0.85,
    note: 'Dense passenger traffic warning',
    location: {
      lat: 52.5265,
      lng: 13.3705,
      milepost: 'BERLIN-HBF+250'
    }
  },
]

// Dataset for night_freight_corridor_east.mp4
export const nightFreightEvents: Event[] = [
  {
    id: 'nf1',
    timestamp: '2024-01-21 23:45:12',
    frame: 5432,
    type: 'OBSTACLE',
    confidence: 0.89,
    note: 'Large cargo container shifted during transport',
    location: {
      lat: 52.4780,
      lng: 13.5150,
      milepost: 'KM 45+800'
    }
  },
  {
    id: 'nf2',
    timestamp: '2024-01-21 23:47:38',
    frame: 5678,
    type: 'RED_SIGNAL',
    confidence: 0.94,
    note: 'Freight corridor signal - track ahead occupied',
    location: {
      lat: 52.4820,
      lng: 13.5200,
      milepost: 'KM 46+200'
    }
  },
  {
    id: 'nf3',
    timestamp: '2024-01-21 23:49:55',
    frame: 5867,
    type: 'SPEED_LIMIT',
    confidence: 0.91,
    note: 'Freight speed limit 80 km/h in curve',
    location: {
      lat: 52.4850,
      lng: 13.5180,
      milepost: 'KM 46+600'
    }
  },
  {
    id: 'nf4',
    timestamp: '2024-01-21 23:52:10',
    frame: 6045,
    type: 'PERSON_IN_TRACK',
    confidence: 0.76,
    note: 'Maintenance crew working on adjacent track',
    location: {
      lat: 52.4870,
      lng: 13.5250,
      milepost: 'KM 47+000'
    }
  },
  {
    id: 'nf5',
    timestamp: '2024-01-21 23:54:33',
    frame: 6234,
    type: 'WARNING',
    confidence: 0.83,
    note: 'Low visibility due to fog conditions',
    location: {
      lat: 52.4890,
      lng: 13.5320,
      milepost: 'KM 47+400'
    }
  },
]

// Map video clips to their corresponding events
export const videoDatasets: Record<string, Event[]> = {
  'lineA_km12+400_frontcab.mp4': lineAEvents,
  'lineB_stationApproach_frontcab.mp4': lineBEvents,
  'yard_2025-09-08_0630.mp4': yardEvents,
  'morning_commute_berlin_hauptbahnhof.mp4': morningCommuteEvents,
  'night_freight_corridor_east.mp4': nightFreightEvents,
}

// Route definitions for each dataset with smooth interpolation
export const routeDefinitions: Record<string, RouteDefinition> = {
  'lineA_km12+400_frontcab.mp4': {
    name: 'Berlin to Hamburg Railway Journey',
    totalDuration: 14315, // 3h 58m 55s in seconds
    waypoints: [
      [52.5251, 13.3694], // Berlin Hauptbahnhof - Start
      [52.5800, 13.3200], // KM 15+200
      [52.6500, 13.2400], // KM 28+600
      [52.7500, 13.2300], // KM 42+800 - Oranienburg
      [52.8200, 13.1800], // KM 55+400
      [52.9000, 13.0500], // KM 68+200 - Wildlife zone
      [53.0200, 12.9200], // KM 82+600 - High speed section
      [53.0800, 12.8000], // KM 95+800 - Wittenberge
      [53.3200, 11.4900], // KM 125+400 - Ludwigslust junction
      [53.4500, 11.1200], // KM 142+200 - Bridge construction
      [53.5800, 10.7800], // KM 158+600
      [53.6300, 11.4100], // KM 172+800 - Schwerin approach
      [53.6350, 11.4200], // KM 175+200 - Station worker
      [53.7200, 10.9800], // KM 192+400 - Weather warning
      [53.4800, 10.6200], // KM 208+600 - Büchen
      [53.5500, 10.4200], // KM 222+800 - Construction vehicle
      [53.6000, 10.2500], // KM 235+400 - Hamburg approach
      [53.4500, 9.9800],  // KM 248+200 - Hamburg-Harburg
      [53.5200, 9.9500],  // KM 258+600 - Urban traffic
      [53.5530, 10.0070]  // KM 275+800 - Hamburg Hauptbahnhof
    ]
  },
  'lineB_stationApproach_frontcab.mp4': {
    name: 'Munich to Berlin High-Speed Journey',
    totalDuration: 21925, // 6h 5m 25s in seconds
    waypoints: [
      [48.1400, 11.5600], // Munich Hauptbahnhof - Start
      [48.2500, 11.6200], // KM 22+400 - Urban exit
      [48.7600, 11.4200], // KM 45+600 - Ingolstadt area
      [48.7650, 11.4250], // KM 48+800 - Junction
      [49.0400, 11.8700], // KM 78+200 - Agricultural area
      [49.4500, 11.0800], // KM 115+400 - High-speed section
      [49.7800, 10.9200], // KM 142+600 - Weather alert zone
      [49.8900, 10.9000], // KM 168+800 - Bamberg area
      [49.8980, 10.9050], // KM 172+200 - Station approach
      [50.3200, 10.7800], // KM 215+400 - Construction area
      [50.9800, 11.0300], // KM 258+600 - Erfurt approach
      [50.9850, 11.0350], // KM 262+800 - Tunnel approach
      [50.9720, 11.0370], // KM 267+200 - Station worker
      [50.9750, 11.0400], // KM 270+400 - Departure signal
      [51.3400, 11.5800], // KM 315+600 - Freight area
      [51.7200, 11.9600], // KM 358+800 - High-speed corridor
      [52.1300, 12.4200], // KM 402+200 - Animal crossing
      [52.2800, 12.6500], // KM 435+400 - Signal maintenance
      [51.8700, 12.6500], // KM 468+600 - Junction before Wittenberg
      [52.0200, 12.8800], // KM 501+800 - Maintenance equipment
      [52.3500, 13.1200], // KM 535+200 - Berlin approach
      [52.4200, 13.2800], // KM 558+400 - Urban traffic
      [52.4750, 13.3400], // KM 572+600 - Berlin Süd
      [52.5200, 13.3650], // KM 578+800 - Final approach
      [52.5251, 13.3694]  // KM 580+000 - Berlin Hauptbahnhof
    ]
  },
  'yard_2025-09-08_0630.mp4': {
    name: 'Rotterdam to Warsaw Trans-European Freight Corridor',
    totalDuration: 29110, // 8h 5m 10s in seconds
    waypoints: [
      [51.9500, 4.0200],  // Rotterdam Maasvlakte Port - Start
      [51.9200, 4.4800],  // KM 35+200 - Container area
      [52.0800, 4.3100],  // KM 68+400 - Urban freight
      [52.0900, 5.1200],  // KM 95+600 - Utrecht junction
      [52.1600, 5.3900],  // KM 125+800 - Amersfoort
      [52.2400, 6.8900],  // KM 185+200 - Netherlands-Germany border
      [52.2200, 7.2100],  // KM 215+400 - Freight siding
      [52.3700, 7.9200],  // KM 248+600 - German corridor
      [52.2700, 8.0500],  // KM 275+800 - Osnabrück junction
      [52.3700, 9.7400],  // KM 342+200 - Hannover yard
      [52.4500, 10.1800], // KM 385+400 - Load distribution
      [52.2700, 10.5200], // KM 418+600 - Braunschweig
      [52.2400, 11.6200], // KM 485+800 - Speed reduction
      [52.1200, 11.6300], // KM 512+200 - Magdeburg yard
      [52.5200, 13.4100], // KM 595+400 - Berlin locomotive change
      [52.3400, 14.5500], // KM 685+600 - Eastern corridor
      [52.3500, 14.5500], // KM 712+800 - Frankfurt Oder customs
      [52.3400, 14.6200], // KM 735+200 - Poland border
      [52.2400, 15.2300], // KM 785+400 - Polish integration
      [52.4100, 16.2200], // KM 825+600 - Track gauge check
      [52.4100, 16.9200], // KM 865+800 - Poznań approach
      [52.4000, 16.9300], // KM 885+200 - Switching locomotive
      [52.1800, 18.4500], // KM 945+400 - Urban freight
      [51.7600, 19.4600], // KM 985+600 - Łódź bypass
      [52.0600, 20.6200], // KM 1045+800 - Warsaw approach
      [52.1800, 20.9200], // KM 1078+200 - Metropolitan coordination
      [52.2200, 20.9800], // KM 1105+400 - Freight yard switching
      [52.2500, 21.0100], // KM 1135+600 - Warsaw Central approach
      [52.2600, 21.0200], // KM 1148+800 - Terminal assignment
      [52.2650, 21.0250]  // KM 1150+000 - Warsaw Freight Terminal
    ]
  },
  'morning_commute_berlin_hauptbahnhof.mp4': {
    name: 'Morning Commute Berlin Hauptbahnhof',
    totalDuration: 345, // 5m 45s in seconds
    waypoints: [
      [52.5240, 13.3680], // Approach Berlin Hauptbahnhof
      [52.5250, 13.3690], // BERLIN-HBF+100 - Commuter area
      [52.5255, 13.3695], // BERLIN-HBF+150 - Departure signal
      [52.5260, 13.3700], // BERLIN-HBF+200 - Speed limit
      [52.5265, 13.3705], // BERLIN-HBF+250 - Traffic warning
      [52.5270, 13.3720]  // Station departure
    ]
  },
  'night_freight_corridor_east.mp4': {
    name: 'Night Freight Corridor East',
    totalDuration: 561, // 9m 21s in seconds
    waypoints: [
      [52.4780, 13.5150], // Freight corridor start - KM 45+800
      [52.4820, 13.5200], // KM 46+200 - Freight signal
      [52.4850, 13.5180], // KM 46+600 - Speed limit curve
      [52.4870, 13.5250], // KM 47+000 - Maintenance crew
      [52.4890, 13.5320]  // KM 47+400 - Fog warning end
    ]
  }
}

// Compute route metrics for all routes
function initializeRouteMetrics(): void {
  Object.keys(routeDefinitions).forEach(key => {
    const route = routeDefinitions[key]
    if (!route.metrics) {
      route.metrics = computeRouteMetrics(route.waypoints)
    }
  })
}

// Initialize metrics on module load
initializeRouteMetrics()

/**
 * Calculate time ratio for an event based on its timestamp within a journey
 */
function calculateTimeRatio(eventTimestamp: string, startTimestamp: string, totalDuration: number): number {
  const eventTime = new Date(eventTimestamp).getTime()
  const startTime = new Date(startTimestamp).getTime()
  const elapsedSeconds = (eventTime - startTime) / 1000
  return Math.max(0, Math.min(1, elapsedSeconds / totalDuration))
}

/**
 * Get route definition for a video file
 */
export function getRouteForVideo(videoFile: string): RouteDefinition | undefined {
  return routeDefinitions[videoFile]
}

/**
 * Get smooth position for a time ratio along a route
 */
export function getPositionAtTime(videoFile: string, timeRatio: number): GeoPoint | undefined {
  const route = routeDefinitions[videoFile]
  if (!route?.metrics) return undefined
  return route.metrics.pointAtRatio(timeRatio)
}

// Default events (backward compatibility)
export const mockEvents: Event[] = lineAEvents

export const mockModels: Model[] = [
  {
    id: '1',
    name: 'SignalDetector-v2.1',
    size: '247 MB',
    mAP: 0.94,
    enabled: true,
    description: 'Advanced signal recognition and classification',
  },
  {
    id: '2',
    name: 'PersonDetection-v1.8',
    size: '156 MB',
    mAP: 0.89,
    enabled: true,
    description: 'Human presence detection on railway tracks',
  },
  {
    id: '3',
    name: 'ObstacleClassifier-v3.0',
    size: '312 MB',
    mAP: 0.91,
    enabled: false,
    description: 'Multi-class obstacle detection and sizing',
  },
  {
    id: '4',
    name: 'SpeedLimitReader-v1.2',
    size: '89 MB',
    mAP: 0.86,
    enabled: true,
    description: 'Speed limit sign text recognition',
  },
]

export const mockUploadBatches: UploadBatch[] = [
  {
    id: '1',
    name: 'lineA_km12+400_frontcab.mp4',
    type: 'MP4',
    size: '2.3 GB',
    status: 'COMPLETED',
    uploadDate: '2024-01-15 14:30:00',
  },
  {
    id: '2',
    name: 'lineB_stationApproach_frontcab.mp4',
    type: 'MP4',
    size: '1.8 GB',
    status: 'COMPLETED',
    uploadDate: '2024-01-16 09:45:00',
  },
  {
    id: '3',
    name: 'yard_2025-09-08_0630.mp4',
    type: 'MP4',
    size: '3.1 GB',
    status: 'COMPLETED',
    uploadDate: '2025-09-08 07:15:00',
  },
  {
    id: '4',
    name: 'morning_commute_berlin_hauptbahnhof.mp4',
    type: 'MP4',
    size: '2.7 GB',
    status: 'COMPLETED',
    uploadDate: '2024-01-20 08:30:00',
  },
  {
    id: '5',
    name: 'night_freight_corridor_east.mp4',
    type: 'MP4',
    size: '4.2 GB',
    status: 'PROCESSING',
    uploadDate: '2024-01-21 23:45:00',
  },
  {
    id: '6',
    name: 'annotations_batch_47.jsonl',
    type: 'JSONL',
    size: '45.2 MB',
    status: 'COMPLETED',
    uploadDate: '2024-01-15 08:15:00',
  },
  {
    id: '7',
    name: 'sensor_data_jan15.csv',
    type: 'CSV',
    size: '12.8 MB',
    status: 'PROCESSING',
    uploadDate: '2024-01-15 07:45:00',
  },
  {
    id: '8',
    name: 'evening_footage.mp4',
    type: 'MP4',
    size: '1.8 GB',
    status: 'FAILED',
    uploadDate: '2024-01-14 18:20:00',
  },
]