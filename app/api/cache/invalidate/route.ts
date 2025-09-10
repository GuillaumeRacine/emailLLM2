import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body // 'labels', 'filters', 'messages', 'all'
    
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user_email')?.value
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    switch (type) {
      case 'labels':
        cache.delete(`labels:${userEmail}`)
        break
      case 'filters':
        cache.delete(`filters:${userEmail}`)
        break
      case 'messages':
        // Clear all message caches for this user
        const cacheKeys = Array.from((cache as any).cache.keys())
        cacheKeys.forEach(key => {
          if (key.startsWith(`messages:${userEmail}`)) {
            cache.delete(key)
          }
        })
        break
      case 'all':
        // Clear all caches for this user
        const allKeys = Array.from((cache as any).cache.keys())
        allKeys.forEach(key => {
          if (key.includes(userEmail)) {
            cache.delete(key)
          }
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid cache type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `${type} cache invalidated` })
  } catch (error) {
    return NextResponse.json({ error: 'Cache invalidation failed' }, { status: 500 })
  }
}