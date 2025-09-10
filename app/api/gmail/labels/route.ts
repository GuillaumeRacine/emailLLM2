import { NextResponse } from 'next/server'
import { getGmailClient } from '@/lib/gmail'
import { cache } from '@/lib/cache'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    const cacheKey = `labels:${userEmail}`
    
    // Check cache first
    const cachedLabels = cache.get(cacheKey)
    if (cachedLabels) {
      return NextResponse.json(cachedLabels)
    }

    const gmail = await getGmailClient()
    const response = await gmail.users.labels.list({ userId: 'me' })
    const labels = response.data.labels || []
    
    // Cache for 10 minutes (labels don't change often)
    cache.set(cacheKey, labels, 10)
    
    return NextResponse.json(labels)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gmail = await getGmailClient()
    const body = await request.json()
    
    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: body.name,
        labelListVisibility: body.labelListVisibility || 'labelShow',
        messageListVisibility: body.messageListVisibility || 'show'
      }
    })
    
    // Invalidate labels cache since we created a new label
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    cache.delete(`labels:${userEmail}`)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 })
  }
}