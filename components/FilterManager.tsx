'use client'

import { useState } from 'react'
import { Filter, Plus, Trash2, RefreshCw, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFilters, useLabels } from '@/hooks/useGmail'

interface GmailFilter {
  id: string
  criteria: {
    from?: string
    to?: string
    subject?: string
    hasTheWord?: string
    doesNotHaveTheWord?: string
  }
  action: {
    addLabelIds?: string[]
    removeLabelIds?: string[]
    markAsRead?: boolean
    archive?: boolean
  }
}

export function FilterManager() {
  const [aiDescription, setAiDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  
  const { filters, isLoading: loading, refresh: refreshFilters } = useFilters()
  const { labels, refresh: refreshLabels } = useLabels()

  const generateFilter = async () => {
    if (!aiDescription) {
      toast.error('Please describe the filter you want')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'filter',
          data: {
            description: aiDescription,
            labels
          }
        })
      })
      
      const filter = await res.json()
      
      // Create the filter
      const createRes = await fetch('/api/gmail/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
      })
      
      if (createRes.ok) {
        toast.success('Filter created successfully')
        setAiDescription('')
        refreshFilters() // Use SWR refresh
      } else {
        toast.error('Failed to create filter')
      }
    } catch (error) {
      toast.error('Failed to generate filter')
    } finally {
      setGenerating(false)
    }
  }

  const getLabelName = (labelId: string) => {
    return labels.find((l: any) => l.id === labelId)?.name || labelId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Filter Generator
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            placeholder="Describe the filter (e.g., 'Archive all newsletters and label them as Newsletter')"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={generateFilter}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Active Filters ({filters.length})
          </h3>
          <button
            onClick={() => {
              refreshFilters()
              refreshLabels()
            }}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {filters.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No filters configured</p>
        ) : (
          <div className="space-y-4">
            {filters.map((filter: any) => (
              <div key={filter.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Filter #{filter.id.slice(-6)}</h4>
                    
                    {Object.entries(filter.criteria).length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Criteria:</span>
                        <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {filter.criteria.from && <li>• From: {filter.criteria.from}</li>}
                          {filter.criteria.to && <li>• To: {filter.criteria.to}</li>}
                          {filter.criteria.subject && <li>• Subject: {filter.criteria.subject}</li>}
                          {filter.criteria.hasTheWord && <li>• Has: {filter.criteria.hasTheWord}</li>}
                          {filter.criteria.doesNotHaveTheWord && <li>• Doesn't have: {filter.criteria.doesNotHaveTheWord}</li>}
                        </ul>
                      </div>
                    )}
                    
                    {Object.entries(filter.action).length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Actions:</span>
                        <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {filter.action.addLabelIds?.map((id: string) => (
                            <li key={id}>• Add label: {getLabelName(id)}</li>
                          ))}
                          {filter.action.removeLabelIds?.map((id: string) => (
                            <li key={id}>• Remove label: {getLabelName(id)}</li>
                          ))}
                          {filter.action.markAsRead && <li>• Mark as read</li>}
                          {filter.action.archive && <li>• Archive</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button className="text-red-500 hover:text-red-700 ml-4">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}