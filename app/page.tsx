'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Filter, Tag, Brain, Settings, RefreshCw, Plus, Trash2, Edit, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { EmailList } from '@/components/EmailList'
import { LabelManager } from '@/components/LabelManager'
import { FilterManager } from '@/components/FilterManager'
import { AIContext } from '@/components/AIContext'
import { EmailAnalyzer } from '@/components/EmailAnalyzer'

export default function Home() {
  const [activeTab, setActiveTab] = useState('emails')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
      setUserEmail(data.email || '')
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gmail AI Assistant</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign in to manage your emails with AI</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gmail AI Assistant</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/api/auth/logout'}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'emails', label: 'Emails', icon: Mail },
            { id: 'labels', label: 'Labels', icon: Tag },
            { id: 'filters', label: 'Filters', icon: Filter },
            { id: 'ai-context', label: 'AI Context', icon: Brain },
            { id: 'analyzer', label: 'Analyzer', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'emails' && <EmailList />}
          {activeTab === 'labels' && <LabelManager />}
          {activeTab === 'filters' && <FilterManager />}
          {activeTab === 'ai-context' && <AIContext />}
          {activeTab === 'analyzer' && <EmailAnalyzer />}
        </motion.div>
      </div>
    </div>
  )
}