'use client'

import { useState } from 'react'
import { Brain, TrendingUp, PieChart, BarChart3, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export function EmailAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const runFullAnalysis = async () => {
    setAnalyzing(true)
    try {
      // Fetch all necessary data - get more emails for better analysis
      const [labelsRes, filtersRes, messagesRes] = await Promise.all([
        fetch('/api/gmail/labels'),
        fetch('/api/gmail/filters'),
        fetch('/api/gmail/messages?maxResults=100') // Analyze 100 emails for better representation
      ])
      
      const labels = await labelsRes.json()
      const filters = await filtersRes.json()
      const messages = await messagesRes.json()
      
      // Run AI analysis
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'labels',
          data: { labels, filters, emails: messages }
        })
      })
      
      const result = await res.json()
      setAnalysis(result)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Failed to complete analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Email Intelligence Dashboard</h2>
            <p className="text-purple-100">
              Get AI-powered insights about your email patterns and organization
            </p>
          </div>
          <button
            onClick={runFullAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            {analyzing ? 'Analyzing...' : 'Run Full Analysis'}
          </button>
        </div>
      </div>

      {!analysis ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click "Run Full Analysis" to get insights about your email organization
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Label Analysis</h3>
            </div>
            <div className="space-y-3">
              {analysis.analysis && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {typeof analysis.analysis === 'string' ? analysis.analysis : JSON.stringify(analysis.analysis)}
                </p>
              )}
              {Array.isArray(analysis.redundancies) && analysis.redundancies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Redundancies Found:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {analysis.redundancies.map((r: any, i: number) => (
                      <li key={i}>{typeof r === 'string' ? r : JSON.stringify(r)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!Array.isArray(analysis.redundancies) && analysis.redundancies && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Redundancies Found:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof analysis.redundancies === 'string' ? analysis.redundancies : JSON.stringify(analysis.redundancies)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Improvements</h3>
            </div>
            <div className="space-y-3">
              {Array.isArray(analysis.improvements) ? analysis.improvements.map((improvement: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof improvement === 'string' ? improvement : JSON.stringify(improvement)}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {typeof analysis.improvements === 'string' ? analysis.improvements : JSON.stringify(analysis.improvements)}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consolidation Suggestions</h3>
            </div>
            <div className="space-y-3">
              {Array.isArray(analysis.consolidations) ? analysis.consolidations.map((consolidation: any, i: number) => (
                <div key={i} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {typeof consolidation === 'string' ? consolidation : JSON.stringify(consolidation)}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {typeof analysis.consolidations === 'string' ? analysis.consolidations : JSON.stringify(analysis.consolidations)}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Filter Recommendations</h3>
            </div>
            <div className="space-y-3">
              {Array.isArray(analysis.newFilters) ? analysis.newFilters.map((filter: any, i: number) => (
                <div key={i} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {filter.description || `Filter ${i + 1}`}
                  </p>
                  {filter.criteria && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Criteria: {Object.entries(filter.criteria).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                </div>
              )) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {typeof analysis.newFilters === 'string' ? analysis.newFilters : JSON.stringify(analysis.newFilters)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}