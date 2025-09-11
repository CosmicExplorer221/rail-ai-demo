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
  { id: 'la1', timestamp: '2024-01-15 08:00:00', frame: 100, type: 'WARNING', confidence: 0.92, note: 'Departure from Berlin Hauptbahnhof', location: { lat: 52.5251, lng: 13.3694, milepost: 'KM 0+000' } },
  { id: 'la2', timestamp: '2024-01-15 08:12:15', frame: 2240, type: 'SPEED_LIMIT', confidence: 0.88, note: 'City speed limit 60 km/h', location: { lat: 52.5800, lng: 13.3200, milepost: 'KM 15+200' } },
  { id: 'la3', timestamp: '2024-01-15 08:25:30', frame: 4680, type: 'PERSON_IN_TRACK', confidence: 0.91, note: 'Track worker at suburban crossing', location: { lat: 52.6500, lng: 13.2400, milepost: 'KM 28+600' } },
  { id: 'la4', timestamp: '2024-01-15 08:35:45', frame: 6420, type: 'RED_SIGNAL', confidence: 0.95, note: 'Signal stop before Oranienburg', location: { lat: 52.7500, lng: 13.2300, milepost: 'KM 42+800' } },
  { id: 'la5', timestamp: '2024-01-15 08:48:00', frame: 8640, type: 'OBSTACLE', confidence: 0.87, note: 'Fallen tree branch on track', location: { lat: 52.8200, lng: 13.1800, milepost: 'KM 55+400' } },
  { id: 'la6', timestamp: '2024-01-15 09:05:20', frame: 11280, type: 'WARNING', confidence: 0.84, note: 'Wildlife crossing zone', location: { lat: 52.9000, lng: 13.0500, milepost: 'KM 68+200' } },
  { id: 'la7', timestamp: '2024-01-15 09:18:35', frame: 13860, type: 'SPEED_LIMIT', confidence: 0.90, note: 'High speed section 200 km/h', location: { lat: 53.0200, lng: 12.9200, milepost: 'KM 82+600' } },
  { id: 'la8', timestamp: '2024-01-15 09:28:50', frame: 16020, type: 'PERSON_IN_TRACK', confidence: 0.78, note: 'Maintenance crew near Wittenberge', location: { lat: 53.0800, lng: 12.8000, milepost: 'KM 95+800' } },
  { id: 'la9', timestamp: '2024-01-15 09:42:10', frame: 18840, type: 'RED_SIGNAL', confidence: 0.93, note: 'Junction signal at Ludwigslust', location: { lat: 53.3200, lng: 11.4900, milepost: 'KM 125+400' } },
  { id: 'la10', timestamp: '2024-01-15 09:55:25', frame: 21480, type: 'WARNING', confidence: 0.85, note: 'Bridge construction ahead', location: { lat: 53.4500, lng: 11.1200, milepost: 'KM 142+200' } },
  { id: 'la11', timestamp: '2024-01-15 10:08:40', frame: 24120, type: 'OBSTACLE', confidence: 0.89, note: 'Freight train on parallel track', location: { lat: 53.5800, lng: 10.7800, milepost: 'KM 158+600' } },
  { id: 'la12', timestamp: '2024-01-15 10:20:55', frame: 26580, type: 'SPEED_LIMIT', confidence: 0.86, note: 'Approach to Schwerin - 120 km/h', location: { lat: 53.6300, lng: 11.4100, milepost: 'KM 172+800' } },
  { id: 'la13', timestamp: '2024-01-15 10:35:10', frame: 29340, type: 'PERSON_IN_TRACK', confidence: 0.82, note: 'Station platform worker', location: { lat: 53.6350, lng: 11.4200, milepost: 'KM 175+200' } },
  { id: 'la14', timestamp: '2024-01-15 10:48:25', frame: 31980, type: 'WARNING', confidence: 0.88, note: 'Weather warning - heavy rain', location: { lat: 53.7200, lng: 10.9800, milepost: 'KM 192+400' } },
  { id: 'la15', timestamp: '2024-01-15 11:02:40', frame: 34620, type: 'RED_SIGNAL', confidence: 0.91, note: 'Signal delay at Büchen', location: { lat: 53.4800, lng: 10.6200, milepost: 'KM 208+600' } },
  { id: 'la16', timestamp: '2024-01-15 11:15:55', frame: 37260, type: 'OBSTACLE', confidence: 0.85, note: 'Construction vehicle near track', location: { lat: 53.5500, lng: 10.4200, milepost: 'KM 222+800' } },
  { id: 'la17', timestamp: '2024-01-15 11:28:10', frame: 39900, type: 'SPEED_LIMIT', confidence: 0.89, note: 'Urban approach Hamburg 80 km/h', location: { lat: 53.6000, lng: 10.2500, milepost: 'KM 235+400' } },
  { id: 'la18', timestamp: '2024-01-15 11:38:25', frame: 42060, type: 'PERSON_IN_TRACK', confidence: 0.87, note: 'Platform preparation Hamburg-Harburg', location: { lat: 53.4500, lng: 9.9800, milepost: 'KM 248+200' } },
  { id: 'la19', timestamp: '2024-01-15 11:48:40', frame: 44220, type: 'WARNING', confidence: 0.83, note: 'Dense urban traffic crossing', location: { lat: 53.5200, lng: 9.9500, milepost: 'KM 258+600' } },
  { id: 'la20', timestamp: '2024-01-15 11:58:55', frame: 46380, type: 'RED_SIGNAL', confidence: 0.94, note: 'Final approach Hamburg Hauptbahnhof', location: { lat: 53.5530, lng: 10.0070, milepost: 'KM 275+800' } }
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

// Route definitions for each dataset with more distinctive curves and spacing
export const routeDefinitions: Record<string, [number, number][]> = {
  'lineA_km12+400_frontcab.mp4': [
    [52.5160, 13.4010], // Start before KM 11+600
    [52.5168, 13.4012], // Slight curve left
    [52.5170, 13.4020], // KM 11+800 (Speed limit event)
    [52.5175, 13.4035], // Curve right 
    [52.5180, 13.4030], // KM 12+000 (Obstacle event)
    [52.5188, 13.4025], // Sharp curve left
    [52.5190, 13.4040], // KM 12+200 (Person in track)
    [52.5195, 13.4055], // Curve right again
    [52.5200, 13.4050], // KM 12+400 (Red signal event)
    [52.5205, 13.4060]  // End with final curve
  ],
  'lineB_stationApproach_frontcab.mp4': [
    [52.5240, 13.3970], // Start before station
    [52.5245, 13.3960], // Wide curve left
    [52.5250, 13.3980], // KM 15+200 (Speed limit) - curve back right
    [52.5258, 13.3975], // Station approach curve
    [52.5260, 13.3990], // KM 15+400 (Platform worker)
    [52.5268, 13.4005], // Platform curve
    [52.5270, 13.4000], // KM 15+600 (Station signal) - curve back
    [52.5272, 13.4015], // Platform area curve
    [52.5275, 13.4005], // KM 15+700 (Platform warning) - S-curve
    [52.5278, 13.4020], // Wide platform curve
    [52.5280, 13.4010], // KM 15+800 (Luggage cart) - curve back
    [52.5283, 13.4025], // Departure preparation
    [52.5285, 13.4015], // KM 15+900 (Passenger crossing) - final curve
    [52.5290, 13.4035]  // Station departure - wide exit curve
  ],
  'yard_2025-09-08_0630.mp4': [
    [52.5090, 13.4190], // Yard entrance
    [52.5092, 13.4180], // Sharp entry curve left  
    [52.5100, 13.4200], // YARD-T3+150 (Maintenance equipment)
    [52.5105, 13.4190], // Switch curve left
    [52.5110, 13.4210], // YARD-T3+300 (Yard worker)
    [52.5118, 13.4205], // Track switching curve
    [52.5120, 13.4220], // YARD-T3+450 (Shunting signal)
    [52.5125, 13.4215], // Curve for parallel track
    [52.5130, 13.4235], // YARD-T3+600 (Warning)
    [52.5138, 13.4230], // Switch to track 4
    [52.5140, 13.4245], // YARD-T3+750 (Speed limit)
    [52.5148, 13.4240], // Parallel track curve
    [52.5150, 13.4255], // YARD-T3+900 (Empty car)
    [52.5158, 13.4250], // Final switch curve
    [52.5160, 13.4265], // YARD-T4+050 (Signal operator)
    [52.5168, 13.4260], // Exit preparation
    [52.5170, 13.4275]  // Yard exit curve
  ],
  'morning_commute_berlin_hauptbahnhof.mp4': [
    [52.5240, 13.3680], // Approach Berlin Hauptbahnhof
    [52.5243, 13.3670], // Sharp approach curve left
    [52.5250, 13.3690], // BERLIN-HBF+100 (Commuter) - curve right
    [52.5252, 13.3680], // Platform area curve left
    [52.5255, 13.3695], // BERLIN-HBF+150 (Departure signal)
    [52.5258, 13.3685], // Main station curve left
    [52.5260, 13.3700], // BERLIN-HBF+200 (Speed limit) - curve right
    [52.5262, 13.3710], // Wide departure curve
    [52.5265, 13.3705], // BERLIN-HBF+250 (Traffic warning) - S-curve
    [52.5270, 13.3720]  // Departure from station - final curve
  ],
  'night_freight_corridor_east.mp4': [
    [52.4790, 13.5180], // Freight corridor start
    [52.4792, 13.5160], // Initial curve left (dramatic)
    [52.4800, 13.5200], // KM 45+800 (Container shifted) - sharp right
    [52.4808, 13.5190], // Major curve left
    [52.4810, 13.5220], // KM 46+200 (Freight signal) - curve right
    [52.4815, 13.5210], // Freight curve correction left
    [52.4820, 13.5240], // KM 46+600 (Speed limit in curve) - big curve right
    [52.4828, 13.5230], // Sharp mountain curve left
    [52.4830, 13.5260], // KM 47+000 (Maintenance crew) - curve right
    [52.4838, 13.5250], // Long freight curve left
    [52.4840, 13.5280], // KM 47+400 (Fog warning) - final big curve right
    [52.4845, 13.5270], // Straightening out
    [52.4850, 13.5300]  // End of corridor - wide exit
  ]
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