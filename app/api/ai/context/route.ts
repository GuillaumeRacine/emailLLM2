import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const context = cookieStore.get('ai_context')
  const instructions = cookieStore.get('ai_instructions')
  const rules = cookieStore.get('ai_rules')
  
  return NextResponse.json({
    context: context?.value || '',
    instructions: instructions?.value || '',
    rules: rules ? JSON.parse(rules.value) : []
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const cookieStore = await cookies()
  
  if (body.context !== undefined) {
    cookieStore.set('ai_context', body.context, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
  }
  
  if (body.instructions !== undefined) {
    cookieStore.set('ai_instructions', body.instructions, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })
  }
  
  if (body.rules !== undefined) {
    cookieStore.set('ai_rules', JSON.stringify(body.rules), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })
  }
  
  return NextResponse.json({ success: true })
}