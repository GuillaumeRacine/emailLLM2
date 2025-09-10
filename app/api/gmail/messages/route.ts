import { NextRequest, NextResponse } from 'next/server'
import { getGmailClient } from '@/lib/gmail'
import { cache } from '@/lib/cache'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const maxResults = parseInt(searchParams.get('maxResults') || '20')
    
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    const cacheKey = `messages:${userEmail}:${query}:${maxResults}`
    
    // Check cache first - shorter cache for messages (2 minutes)
    const cachedMessages = cache.get(cacheKey)
    if (cachedMessages) {
      return NextResponse.json(cachedMessages)
    }

    const gmail = await getGmailClient()
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    })
    
    const messages = response.data.messages || []
    
    // Get full message details for each message
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!
        })
        return details.data
      })
    )
    
    // Cache for 2 minutes (emails change frequently)
    cache.set(cacheKey, fullMessages, 2)
    
    return NextResponse.json(fullMessages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}