'use client'

import { useState } from 'react'
import { Mail, Tag, Star, Archive, Trash2, RefreshCw, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMessages, useLabels } from '@/hooks/useGmail'

interface Email {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
  }
}

export function EmailList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  
  const { messages: emails, isLoading: loading, refresh: refreshEmails } = useMessages(searchQuery, 20)
  const { labels, refresh: refreshLabels } = useLabels()

  const getHeader = (email: Email, name: string) => {
    return email.payload.headers.find(h => h.name === name)?.value || ''
  }

  const getLabelNames = (labelIds: string[]) => {
    return labelIds
      .map(id => labels.find((l: any) => l.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const analyzeEmail = async (email: Email) => {
    setAnalyzing(email.id)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          data: {
            from: getHeader(email, 'From'),
            subject: getHeader(email, 'Subject'),
            body: email.snippet,
            labels: getLabelNames(email.labelIds).split(', '),
            availableLabels: labels.map(l => l.name)
          }
        })
      })
      
      const suggestions = await res.json()
      
      // Show suggestions in a toast or modal
      toast.success(
        <div>
          <strong>AI Suggestions:</strong>
          <ul className="mt-2 text-sm">
            <li>Priority: {suggestions.priority}</li>
            <li>Needs Response: {suggestions.needsResponse ? 'Yes' : 'No'}</li>
            {suggestions.addLabels?.length > 0 && (
              <li>Add Labels: {suggestions.addLabels.join(', ')}</li>
            )}
            {suggestions.actions?.length > 0 && (
              <li>Actions: {suggestions.actions.join(', ')}</li>
            )}
          </ul>
        </div>,
        { duration: 5000 }
      )
    } catch (error) {
      toast.error('Failed to analyze email')
    } finally {
      setAnalyzing(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refreshEmails() // SWR will automatically use the new searchQuery
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emails..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            refreshEmails()
            refreshLabels()
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No emails found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {emails.map((email) => (
              <div key={email.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getHeader(email, 'From').split('<')[0].trim()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(parseInt(getHeader(email, 'Date'))).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {getHeader(email, 'Subject') || '(No subject)'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {email.snippet}
                    </p>
                    {email.labelIds.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getLabelNames(email.labelIds)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => analyzeEmail(email)}
                      disabled={analyzing === email.id}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {analyzing === email.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                      <Star className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}