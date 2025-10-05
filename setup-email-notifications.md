# Email Notifications Setup

## 1. Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the email function
supabase functions deploy send-email
```

## 2. Set Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add:

```
RESEND_API_KEY=your_resend_api_key_here
```

## 3. Get Resend API Key

1. Sign up at https://resend.com
2. Create an API key
3. Add it to Supabase environment variables

## 4. Update Domain

In `supabase/functions/send-email/index.ts`, change:
```
from: 'noreply@yourdomain.com'
```
to your actual domain.

## 5. Email Notifications Now Work For:

- **Order Status Updates**: When admin changes order status
- **Stock Alerts**: When products come back in stock  
- **Discount Alerts**: When discounts are applied to products

All emails are sent to the user's signup email address automatically.