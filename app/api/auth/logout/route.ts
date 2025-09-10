import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.delete('gmail_tokens')
  cookieStore.delete('user_email')
  
  return NextResponse.redirect(new URL('/', 'http://localhost:3000'))
}