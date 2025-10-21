# Deployment Checklist for Trial System

## ✅ What Will Work After Deployment

The trial system is designed to work in production because:

1. **Database Tables** - Trial tables are in your Supabase database
2. **Environment Variables** - Same Supabase credentials work in production
3. **Token Storage** - Uses localStorage (works in any browser)
4. **Demo Mode** - All trial operations are client-side simulations

## 🔧 Pre-Deployment Steps

### 1. Verify Database Setup
Run this in your **production** Supabase SQL editor:
```sql
-- Check if trial tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trial_users', 'trial_sessions');
```

### 2. Create Production Trial Users
After deployment, create trial users on production:
```bash
# On your deployed server or locally with production env
npm run create-trial-user "Demo User" "demo@example.com" 30
```

### 3. Environment Variables
Ensure your deployment platform has:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🚀 Post-Deployment

### Test Trial Access
1. Go to `https://yourdomain.com/trial`
2. Use token: `trial_peuenvz9w8emh0ruv69` (if created in production)
3. Verify demo mode works on all pages

### Create New Trial Users
```bash
# Create fresh trial users for production
npm run create-trial-user "Production Demo" "demo@yourdomain.com" 7
```

## 🔒 Security Notes

- Trial tokens are stored in your secure Supabase database
- Demo mode prevents any real data modification
- Trial sessions expire automatically
- No sensitive data is exposed in trial mode

## ✨ Current Token Status

Token `trial_peuenvz9w8emh0ruv69`:
- ✅ Valid until: November 20, 2025
- ✅ Works in development
- ⚠️ Needs to be created in production database