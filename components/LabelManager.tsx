'use client'

import { useState } from 'react'
import { Tag, Plus, Trash2, RefreshCw, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLabels, useFilters } from '@/hooks/useGmail'

interface Label {
  id: string
  name: string
  type: string
  color?: { backgroundColor?: string; textColor?: string }
}

export function LabelManager() {
  const [newLabelName, setNewLabelName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  
  const { labels, isLoading: loading, refresh: refreshLabels } = useLabels()
  const { filters, refresh: refreshFilters } = useFilters()

  const createLabel = async () => {
    if (!newLabelName) {
      toast.error('Please enter a label name')
      return
    }

    try {
      const res = await fetch('/api/gmail/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLabelName })
      })
      
      if (res.ok) {
        toast.success('Label created successfully')
        setNewLabelName('')
        refreshLabels() // Use SWR refresh
      } else {
        toast.error('Failed to create label')
      }
    } catch (error) {
      toast.error('Failed to create label')
    }
  }

  const analyzeLabels = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'labels',
          data: { labels, filters }
        })
      })
      
      const analysis = await res.json()
      
      // Show analysis results
      toast.success(
        <div className="max-w-md">
          <strong>AI Analysis:</strong>
          <div className="mt-2 text-sm space-y-1">
            {analysis.redundancies?.length > 0 && (
              <div>
                <strong>Redundancies:</strong>
                <ul className="list-disc list-inside">
                  {analysis.redundancies.slice(0, 3).map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.consolidations?.length > 0 && (
              <div>
                <strong>Suggested Consolidations:</strong>
                <ul className="list-disc list-inside">
                  {analysis.consolidations.slice(0, 3).map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>,
        { duration: 8000 }
      )
    } catch (error) {
      toast.error('Failed to analyze labels')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userLabels = labels.filter(l => l.type === 'user')
  const systemLabels = labels.filter(l => l.type === 'system')

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          placeholder="New label name..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={createLabel}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Label
        </button>
        <button
          onClick={analyzeLabels}
          disabled={analyzing}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          {analyzing ? 'Analyzing...' : 'Analyze Structure'}
        </button>
        <button
          onClick={() => {
            refreshLabels()
            refreshFilters()
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            User Labels ({userLabels.length})
          </h3>
          <div className="space-y-2">
            {userLabels.map((label) => (
              <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{label.name}</span>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {userLabels.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No user labels</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            System Labels ({systemLabels.length})
          </h3>
          <div className="space-y-2">
            {systemLabels.map((label) => (
              <div key={label.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{label.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Tips</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              The AI can analyze your label structure and suggest consolidations to simplify your email organization.
              It considers your usage patterns and can identify redundant or overlapping labels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}