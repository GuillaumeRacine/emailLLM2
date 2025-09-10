import { google } from 'googleapis'
import { cookies } from 'next/headers'

export async function getGmailClient() {
  const cookieStore = await cookies()
  const tokensStr = cookieStore.get('gmail_tokens')
  
  if (!tokensStr) {
    throw new Error('Not authenticated')
  }

  const tokens = JSON.parse(tokensStr.value)
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  
  oauth2Client.setCredentials(tokens)
  
  return google.gmail({ version: 'v1', auth: oauth2Client })
}