export interface Event {
  id: string
  timestamp: string
  frame: number
  type: 'RED_SIGNAL' | 'PERSON_IN_TRACK' | 'OBSTACLE' | 'SPEED_LIMIT' | 'WARNING'
  confidence: number
  note: string
  videoUrl?: string
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

export const mockEvents: Event[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:23:45',
    frame: 1245,
    type: 'RED_SIGNAL',
    confidence: 0.94,
    note: 'Red signal detected at Junction B-7',
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:21:12',
    frame: 1122,
    type: 'PERSON_IN_TRACK',
    confidence: 0.87,
    note: 'Person detected on track section 15',
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:18:33',
    frame: 998,
    type: 'OBSTACLE',
    confidence: 0.91,
    note: 'Large object blocking track',
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:15:07',
    frame: 876,
    type: 'SPEED_LIMIT',
    confidence: 0.82,
    note: 'Speed limit sign change detected',
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:12:55',
    frame: 754,
    type: 'WARNING',
    confidence: 0.89,
    note: 'Track maintenance warning sign',
  },
]

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
    name: 'morning_run_2024_01_15.mp4',
    type: 'MP4',
    size: '2.3 GB',
    status: 'COMPLETED',
    uploadDate: '2024-01-15 09:30:00',
  },
  {
    id: '2',
    name: 'annotations_batch_47.jsonl',
    type: 'JSONL',
    size: '45.2 MB',
    status: 'COMPLETED',
    uploadDate: '2024-01-15 08:15:00',
  },
  {
    id: '3',
    name: 'sensor_data_jan15.csv',
    type: 'CSV',
    size: '12.8 MB',
    status: 'PROCESSING',
    uploadDate: '2024-01-15 07:45:00',
  },
  {
    id: '4',
    name: 'evening_footage.mp4',
    type: 'MP4',
    size: '1.8 GB',
    status: 'FAILED',
    uploadDate: '2024-01-14 18:20:00',
  },
]