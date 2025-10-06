# OAuth Setup Guide

## Google OAuth Setup

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set Application type to "Web application"
   - Add authorized redirect URIs:
     - `https://kfqyodldadrtoxzfwsgz.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

2. **Supabase Configuration:**
   - Go to your Supabase dashboard
   - Navigate to Authentication → Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret
   - Save configuration

## Apple OAuth Setup

1. **Apple Developer Setup:**
   - Go to [Apple Developer Console](https://developer.apple.com/)
   - Sign in with Apple Developer account
   - Go to "Certificates, Identifiers & Profiles"
   - Create new App ID or use existing one
   - Enable "Sign In with Apple" capability
   - Create Service ID for web authentication
   - Configure redirect URL: `https://kfqyodldadrtoxzfwsgz.supabase.co/auth/v1/callback`
   - Generate private key for Sign In with Apple

2. **Supabase Configuration:**
   - Go to your Supabase dashboard
   - Navigate to Authentication → Providers
   - Enable Apple provider
   - Add your Apple Service ID, Team ID, Key ID, and Private Key
   - Save configuration

## Testing

After setup, test both providers:
- Google: Should redirect to Google sign-in
- Apple: Should redirect to Apple ID sign-in

Both will create user accounts in your Supabase auth.users table automatically.