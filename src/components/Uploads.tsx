import { useState } from 'react'
import { Upload, File, CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react'
import { mockUploadBatches, type UploadBatch } from '../data/mockData'

function StatusChip({ status }: { status: UploadBatch['status'] }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }
      case 'PROCESSING':
        return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' }
      case 'FAILED':
        return { backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fca5a5' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
    }
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle
      case 'PROCESSING':
        return Clock
      case 'FAILED':
        return AlertCircle
      default:
        return File
    }
  }

  const Icon = getIcon(status)
  const chipStyle = getStatusStyle(status)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.125rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid',
      ...chipStyle
    }}>
      <Icon style={{width: '0.75rem', height: '0.75rem', marginRight: '0.25rem'}} />
      {status}
    </span>
  )
}

function TypeChip({ type }: { type: UploadBatch['type'] }) {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'MP4':
        return { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#c4b5fd' }
      case 'JSONL':
        return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' }
      case 'CSV':
        return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
    }
  }

  const chipStyle = getTypeStyle(type)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.125rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid',
      ...chipStyle
    }}>
      {type}
    </span>
  )
}

export function Uploads() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleQueue = () => {
    console.log('Queue files:', selectedFiles)
    setSelectedFiles([])
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Uploads</h1>
        <p style={{marginTop: '0.5rem', fontSize: '1.125rem', color: '#4b5563'}}>Upload video footage, annotations, and sensor data</p>
      </div>

      {/* Upload Section */}
      <div className="card" style={{marginBottom: '2rem'}}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900" style={{marginBottom: '1rem'}}>Upload New Files</h3>
          
          {/* File Drop Zone */}
          <div
            style={{
              border: '2px dashed',
              borderColor: dragActive ? '#60a5fa' : '#d1d5db',
              backgroundColor: dragActive ? '#eff6ff' : 'transparent',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onMouseEnter={(e) => {
              if (!dragActive) {
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!dragActive) {
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
          >
            <Upload style={{width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem'}} />
            <div style={{marginBottom: '1rem'}}>
              <p style={{fontSize: '1.125rem', color: '#111827', marginBottom: '0.5rem'}}>Drop files here or</p>
              <label htmlFor="file-upload" style={{cursor: 'pointer'}}>
                <span style={{
                  color: '#2563eb',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}>
                  browse to upload
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".mp4,.jsonl,.csv"
                  style={{display: 'none'}}
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
              Support for MP4, JSONL, and CSV files up to 10GB each
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div style={{marginTop: '1.5rem'}}>
              <h4 style={{fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.75rem'}}>
                Selected Files ({selectedFiles.length})
              </h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <File style={{width: '1.25rem', height: '1.25rem', color: '#9ca3af'}} />
                      <div>
                        <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#111827'}}>{file.name}</p>
                        <p style={{fontSize: '0.75rem', color: '#6b7280'}}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      style={{
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '1rem'}}>
                <button
                  onClick={handleQueue}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  Queue for Processing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <div className="card">
        <div className="p-6">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: '#111827'}}>Upload History</h3>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#2563eb',
              fontWeight: '500',
              fontSize: '0.875rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}>
              <Plus style={{width: '1rem', height: '1rem'}} />
              New Batch Upload
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            gap: '1rem'
          }}
          className="lg:grid-cols-3">
            {mockUploadBatches.map((batch) => (
              <div
                key={batch.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)'}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <File style={{width: '1.25rem', height: '1.25rem', color: '#9ca3af', flexShrink: 0}} />
                    <div style={{minWidth: 0}}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {batch.name}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>{batch.size}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'}}>
                  <TypeChip type={batch.type} />
                  <StatusChip status={batch.status} />
                </div>

                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                  <p>Uploaded: {batch.uploadDate}</p>
                </div>

                {batch.status === 'PROCESSING' && (
                  <div style={{marginTop: '0.75rem'}}>
                    <div style={{
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      height: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: '#2563eb',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        transition: 'all 0.3s',
                        width: '65%'
                      }} />
                    </div>
                    <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>Processing... 65%</p>
                  </div>
                )}

                {batch.status === 'FAILED' && (
                  <div style={{marginTop: '0.75rem'}}>
                    <p style={{fontSize: '0.75rem', color: '#dc2626'}}>
                      Upload failed. Check file format and try again.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}