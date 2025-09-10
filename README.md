# Gmail AI Assistant

An intelligent Gmail management system with AI-powered email analysis, label optimization, and custom rule management.

## Features

- **AI-Powered Email Analysis**: Automatically analyze emails and suggest appropriate labels and actions
- **Smart Label Management**: AI suggestions for label consolidation and organization improvements
- **Intelligent Filter Creation**: Natural language filter generation using AI
- **Custom AI Context**: Define personal context, instructions, and rules to customize AI behavior
- **Real-time Analysis Dashboard**: Get insights about your email patterns and organization
- **Modern Web Interface**: Beautiful, responsive UI built with Next.js and Tailwind CSS

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local: `http://localhost:3000/api/auth/callback`
     - For production: `https://your-domain.vercel.app/api/auth/callback`
   - Download the credentials and note the Client ID and Client Secret

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic API (for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

For Vercel deployment, add these as environment variables in your Vercel project settings.

### 3. Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 4. Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Update `GOOGLE_REDIRECT_URI` to your Vercel domain
5. Update authorized redirect URIs in Google Cloud Console

## Usage

1. **Sign In**: Click "Sign in with Google" and authorize the app
2. **AI Context**: Go to "AI Context" tab to set up your personal context and rules
3. **Email Management**: View and analyze emails in the "Emails" tab
4. **Label Organization**: Manage and optimize labels in the "Labels" tab
5. **Filter Creation**: Create intelligent filters using natural language in the "Filters" tab
6. **Analysis**: Get comprehensive insights in the "Analyzer" tab

## AI Context Customization

The AI Context feature allows you to:
- Define personal context (who you are, what you do)
- Set general instructions for email handling
- Create custom rules for specific scenarios

Example context:
```
I'm a software engineer working on open-source projects. I receive GitHub notifications, client emails, newsletters, and personal messages.
```

Example instructions:
```
Prioritize client emails, flag urgent matters, archive newsletters after labeling, never delete GitHub notifications.
```

## Security Notes

- OAuth tokens are stored in secure HTTP-only cookies
- API keys are never exposed to the client
- All Gmail operations require authentication
- Sessions expire after 7 days

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Google OAuth 2.0
- **AI**: Anthropic Claude API
- **APIs**: Gmail API
- **Deployment**: Vercel