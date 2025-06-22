# Google OAuth Setup Guide

## Quick Setup Instructions

To enable Google Sign-In for ProductivePro, you need to configure OAuth 2.0 credentials in Google Cloud Console.

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name/ID

### Step 2: Enable Google Identity API
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Identity" or "Google+ API"
3. Click "Enable" on the Google Identity API

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer email)
   - Add your domain to authorized domains: `replit.app`
4. Choose "Web application" as application type
5. Add these to "Authorized JavaScript origins":
   - `https://workspace.replit.app`
   - `https://workspace-yourprojectname.replit.app` (if different)
6. Add these to "Authorized redirect URIs":
   - `https://workspace.replit.app`
   - `https://workspace-yourprojectname.replit.app` (if different)
7. Click "Create"

### Step 4: Configure Environment Variable
1. Copy the Client ID from the credentials page
2. In your Replit project, add a secret:
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Your copied Client ID (e.g., `123456789-abcdef.apps.googleusercontent.com`)

### Step 5: Test Authentication
1. Restart your application
2. Try clicking "Login with Google"
3. You should see the Google OAuth consent screen

## Common Issues

### "Access blocked: Authorization Error"
- Check that your domain is added to authorized JavaScript origins
- Ensure the Client ID is correctly set in environment variables
- Verify the OAuth consent screen is configured

### "redirect_uri_mismatch"
- Add your exact domain to authorized redirect URIs
- Include both with and without trailing slashes

### "This app isn't verified"
- This is normal during development
- Click "Advanced" → "Go to ProductivePro (unsafe)" to continue
- For production, submit your app for verification

## Environment Variables Needed

```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
OPENAI_API_KEY=your-openai-api-key-here
```

## Test URLs
- Development: `https://workspace.replit.app`
- Your project URL: Check your Replit project's URL and use that

The application will automatically detect if Google OAuth is configured and show appropriate messaging to users.