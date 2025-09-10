import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const tokens = cookieStore.get('gmail_tokens')
  const email = cookieStore.get('user_email')

  return NextResponse.json({
    authenticated: !!tokens,
    email: email?.value || null
  })
}