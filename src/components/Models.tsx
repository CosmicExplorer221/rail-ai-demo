import { useState } from 'react'
import { Brain, Plus, Download, Settings, BarChart3 } from 'lucide-react'
import { mockModels, type Model } from '../data/mockData'
import { cn } from '../lib/utils'

export function Models() {
  const [models, setModels] = useState<Model[]>(mockModels)

  const toggleModel = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, enabled: !model.enabled }
        : model
    ))
  }

  const getQualityColor = (mAP: number) => {
    if (mAP >= 0.9) return 'text-green-600'
    if (mAP >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityLabel = (mAP: number) => {
    if (mAP >= 0.9) return 'Excellent'
    if (mAP >= 0.8) return 'Good'
    return 'Fair'
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Models</h1>
        <p className="mt-2 text-gray-600">Manage detection models and their configurations</p>
      </div>

      {/* Model Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-50">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Models</p>
              <p className="text-2xl font-semibold text-gray-900">{models.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-50">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Models</p>
              <p className="text-2xl font-semibold text-gray-900">
                {models.filter(m => m.enabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-purple-50">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. mAP Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(models.reduce((acc, m) => acc + m.mAP, 0) / models.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Available Models</h3>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              <Plus className="h-4 w-4" />
              Add Model
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className={cn(
                  "border rounded-lg p-6 transition-all",
                  model.enabled 
                    ? "border-blue-200 bg-blue-50/30" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-md",
                      model.enabled ? "bg-blue-100" : "bg-gray-100"
                    )}>
                      <Brain className={cn(
                        "h-5 w-5",
                        model.enabled ? "text-blue-600" : "text-gray-500"
                      )} />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        {model.name}
                      </h4>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={model.enabled}
                      onChange={() => toggleModel(model.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
                    <p className="text-sm font-medium text-gray-900">{model.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Quality</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", getQualityColor(model.mAP))}>
                        {getQualityLabel(model.mAP)}
                      </span>
                      <span className="text-xs text-gray-500">
                        (mAP: {model.mAP.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {model.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance Chart Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Model Performance Overview</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Performance metrics visualization</p>
              <p className="text-sm text-gray-500">Real-time model accuracy and speed analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}