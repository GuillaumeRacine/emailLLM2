'use client'

import React, { useState } from 'react'
import { Brain, Plus, Trash2, Save, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAIContext } from '@/hooks/useGmail'

interface Rule {
  id: string
  name: string
  description: string
}

export function AIContext() {
  const { context: initialContext, instructions: initialInstructions, rules: initialRules, isLoading: loading, refresh } = useAIContext()
  
  const [context, setContext] = useState('')
  const [instructions, setInstructions] = useState('')
  const [rules, setRules] = useState<Rule[]>([])
  const [newRule, setNewRule] = useState({ name: '', description: '' })
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Update local state when SWR data changes (only when actually different)
  React.useEffect(() => {
    if (initialContext !== undefined && initialContext !== context) {
      setContext(initialContext)
    }
  }, [initialContext])

  React.useEffect(() => {
    if (initialInstructions !== undefined && initialInstructions !== instructions) {
      setInstructions(initialInstructions)
    }
  }, [initialInstructions])

  React.useEffect(() => {
    if (initialRules !== undefined && JSON.stringify(initialRules) !== JSON.stringify(rules)) {
      setRules(initialRules)
    }
  }, [initialRules])

  const saveContext = async () => {
    setSaving(true)
    try {
      await fetch('/api/ai/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, instructions, rules })
      })
      toast.success('AI context saved successfully')
      refresh() // Refresh SWR cache
    } catch (error) {
      toast.error('Failed to save AI context')
    } finally {
      setSaving(false)
    }
  }

  const addRule = () => {
    if (!newRule.name || !newRule.description) {
      toast.error('Please fill in both rule name and description')
      return
    }
    const rule: Rule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description
    }
    setRules([...rules, rule])
    setNewRule({ name: '', description: '' })
    toast.success('Rule added')
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
    toast.success('Rule deleted')
  }

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r))
    setEditingRule(null)
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
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Context & Instructions</h2>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure how the AI understands and processes your emails. This context will be used for all AI-powered features.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personal Context
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., I'm a software engineer working on multiple open-source projects. I receive newsletters, GitHub notifications, client emails, and personal messages..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              General Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Prioritize client emails, flag urgent matters, archive newsletters after labeling, never delete GitHub notifications..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Rules</h3>
        
        <div className="space-y-3 mb-4">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {editingRule === rule.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                  />
                  <textarea
                    value={rule.description}
                    onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white resize-none"
                    rows={2}
                  />
                  <button
                    onClick={() => setEditingRule(null)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                  </div>
                  <button
                    onClick={() => setEditingRule(rule.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="Rule name"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={newRule.description}
            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
            placeholder="Rule description"
            className="flex-[2] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={addRule}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <button
        onClick={saveContext}
        disabled={saving}
        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  )
}