import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

async function callOpenAI(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: prompt
    }],
    temperature: 0.1
  })
  
  return response.choices[0]?.message?.content || ''
}

async function callClaude(prompt: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })
  
  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    // Get AI context
    const cookieStore = await cookies()
    const context = cookieStore.get('ai_context')?.value || ''
    const instructions = cookieStore.get('ai_instructions')?.value || ''
    const rulesStr = cookieStore.get('ai_rules')?.value
    const rules = rulesStr ? JSON.parse(rulesStr) : []
    
    let prompt = ''
    
    if (type === 'labels') {
      prompt = `
You are an email organization expert. Analyze the following Gmail setup and provide suggestions in clear, readable text.

USER CONTEXT:
${context}

USER INSTRUCTIONS:
${instructions}

CUSTOM RULES:
${rules.map((r: any) => `- ${r.name}: ${r.description}`).join('\n')}

CURRENT LABELS (${data.labels.length} total):
${data.labels.map((l: any) => `- ${l.name}${l.type === 'system' ? ' (system)' : ''}`).join('\n')}

CURRENT FILTERS (${data.filters.length} total):
${data.filters.map((f: any, i: number) => `
Filter ${i + 1}:
  Criteria: ${JSON.stringify(f.criteria, null, 2)}
  Actions: ${JSON.stringify(f.action, null, 2)}
`).join('\n')}

Please provide clear, actionable analysis in this JSON format:

{
  "analysis": "Brief overview of the current organization structure and effectiveness (2-3 sentences)",
  "redundancies": [
    "Specific redundancy found between labels X and Y",
    "Another redundancy example"
  ],
  "consolidations": [
    "Combine 'Label A' and 'Label B' into 'New Label Name'",
    "Merge duplicate filters for sender X"
  ],
  "improvements": [
    "Specific improvement recommendation #1", 
    "Specific improvement recommendation #2"
  ],
  "newFilters": [
    "Create filter to auto-archive newsletters from sender X",
    "Add filter to prioritize emails from important clients"
  ]
}

Provide specific, actionable recommendations that will genuinely improve email management efficiency.`
    } else if (type === 'email') {
      prompt = `
You are an email assistant. Analyze this email and suggest actions.

USER CONTEXT:
${context}

USER INSTRUCTIONS:
${instructions}

CUSTOM RULES:
${rules.map((r: any) => `- ${r.name}: ${r.description}`).join('\n')}

EMAIL:
From: ${data.from}
Subject: ${data.subject}
Body: ${data.body}
Current labels: ${data.labels.join(', ')}

AVAILABLE LABELS:
${data.availableLabels.join(', ')}

Provide your analysis in this JSON format:

{
  "addLabels": ["Label1", "Label2"],
  "removeLabels": ["OldLabel"],
  "priority": "high/medium/low",
  "needsResponse": true/false,
  "shouldArchive": true/false,
  "actions": [
    "Specific action recommendation 1",
    "Specific action recommendation 2"
  ],
  "reasoning": "Brief explanation of why these suggestions were made"
}

Base your suggestions on the user's context and rules. Be specific about which labels to add/remove.`
    } else if (type === 'filter') {
      prompt = `
Create a Gmail filter based on this description.

USER CONTEXT:
${context}

USER REQUEST: ${data.description}

AVAILABLE LABELS:
${data.labels.map((l: any) => l.name).join(', ')}

Generate a Gmail filter with criteria and actions.
Format as JSON with keys: criteria (object with from, to, subject, hasTheWord, etc.) and action (object with addLabelIds, removeLabelIds, markAsRead, etc.)`
    }
    
    let text = ''
    
    // Try GPT-4 first, fallback to Claude
    try {
      console.log('Trying GPT-4...')
      text = await callOpenAI(prompt)
    } catch (gptError) {
      console.log('GPT-4 failed, falling back to Claude:', gptError)
      try {
        text = await callClaude(prompt)
      } catch (claudeError) {
        console.error('Both AI services failed:', { gptError, claudeError })
        throw new Error('Both AI services are unavailable')
      }
    }
    
    // Try to parse as JSON
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[1]))
      }
      const cleanText = text.replace(/```/g, '').trim()
      return NextResponse.json(JSON.parse(cleanText))
    } catch {
      return NextResponse.json({ raw: text })
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}