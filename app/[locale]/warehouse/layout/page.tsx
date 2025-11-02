'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Button, Select, Card } from '@/components/UI'

interface LayoutObject {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Center {
  id: string
  name: string
  layout: LayoutObject[]
}

export default function WarehouseLayoutPage() {
  const t = useTranslations()
  const [selectedTool, setSelectedTool] = useState('')
  const [activeCenter, setActiveCenter] = useState('main')
  const [centers, setCenters] = useState<Center[]>([
    { id: 'main', name: 'Main Warehouse', layout: [] },
    { id: 'north', name: 'North Warehouse', layout: [] },
    { id: 'south', name: 'South Warehouse', layout: [] }
  ])

  const getObjectConfig = (type: string) => {
    const configs: Record<string, { width: number, height: number, color: string, label: string }> = {
      'rack': { width: 40, height: 80, color: '#4CAF50', label: 'Rack' },
      'zone': { width: 120, height: 100, color: '#FF9800', label: 'Zone' },
      'station': { width: 80, height: 60, color: '#F44336', label: 'Station' },
    }
    return configs[type] || { width: 60, height: 60, color: '#999', label: 'Object' }
  }

  const addObject = (type: string, x?: number, y?: number) => {
    if (!type) return
    const config = getObjectConfig(type)
    const finalX = x ?? Math.random() * 700
    const finalY = y ?? Math.random() * 500

    const newObject: LayoutObject = {
      id: Date.now().toString(),
      type: type,
      x: finalX,
      y: finalY,
      width: config.width,
      height: config.height,
      color: config.color
    }

    setCenters(prev => prev.map(center => 
      center.id === activeCenter 
        ? { ...center, layout: [...center.layout, newObject] }
        : center
    ))
  }

  const removeObject = (objectId: string) => {
    setCenters(prev => prev.map(center => 
      center.id === activeCenter 
        ? { ...center, layout: center.layout.filter(obj => obj.id !== objectId) }
        : center
    ))
  }

  const currentCenter = centers.find(c => c.id === activeCenter)
  const currentLayout = currentCenter?.layout || []

  const objectTypes = [
    { value: '', label: 'Select object type...' },
    { value: 'rack', label: 'Rack' },
    { value: 'zone', label: 'Zone' },
    { value: 'station', label: 'Station' },
  ]

  return (
    <PageWrapper>
      <Section title={t('nav.item.warehouseLayout')}>
        <p>2D Warehouse Layout Management</p>
        
        {/* Center tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
          {centers.map(center => (
            <button
              key={center.id}
              onClick={() => setActiveCenter(center.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeCenter === center.id ? '#007bff' : '#f8f9fa',
                color: activeCenter === center.id ? 'white' : 'black',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0'
              }}
            >
              {center.name}
            </button>
          ))}
        </div>

        {/* Object selection */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <Select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            options={objectTypes}
          />
          
          <Button
            onClick={() => selectedTool && addObject(selectedTool)}
            disabled={!selectedTool}
          >
            Add Object
          </Button>
        </div>

        {/* 2D Grid Map */}
        <Card>
          <div 
            style={{
              width: '100%',
              height: '500px',
              border: '2px solid #ddd',
              position: 'relative',
              backgroundImage: 'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              overflow: 'auto',
              marginBottom: '20px'
            }}
          >
            {/* Objects */}
            {currentLayout.map(obj => {
              const config = getObjectConfig(obj.type)
              return (
                <div
                  key={obj.id}
                  style={{
                    position: 'absolute',
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    backgroundColor: obj.color,
                    border: '2px solid #333',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.9
                  }}
                  onClick={() => removeObject(obj.id)}
                  title="Click to delete"
                >
                  {config.label}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Object List */}
        <div style={{ marginTop: '20px' }}>
          <h4>Objects: {currentLayout.length}</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {currentLayout.map(obj => {
              const config = getObjectConfig(obj.type)
              return (
                <div 
                  key={obj.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #eee',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: obj.color,
                      borderRadius: '2px',
                      marginRight: '10px'
                    }}
                  />
                  <span>{config.label}</span>
                  <Button
                    onClick={() => removeObject(obj.id)}
                    style={{ marginLeft: 'auto', padding: '4px 8px' }}
                  >
                    Delete
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </Section>
    </PageWrapper>
  )
}
