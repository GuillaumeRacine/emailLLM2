import { NextResponse } from 'next/server'
import { getGmailClient } from '@/lib/gmail'
import { cache } from '@/lib/cache'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    const cacheKey = `filters:${userEmail}`
    
    // Check cache first
    const cachedFilters = cache.get(cacheKey)
    if (cachedFilters) {
      return NextResponse.json(cachedFilters)
    }

    const gmail = await getGmailClient()
    const response = await gmail.users.settings.filters.list({ userId: 'me' })
    const filters = response.data.filter || []
    
    // Cache for 15 minutes (filters change less frequently)
    cache.set(cacheKey, filters, 15)
    
    return NextResponse.json(filters)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const gmail = await getGmailClient()
    const body = await request.json()
    
    const response = await gmail.users.settings.filters.create({
      userId: 'me',
      requestBody: body
    })
    
    // Invalidate filters cache since we created a new filter
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    cache.delete(`filters:${userEmail}`)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create filter' }, { status: 500 })
  }
}