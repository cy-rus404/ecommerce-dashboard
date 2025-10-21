# Demo System Setup Guide

## 1. Database Setup
Run `demo-setup.sql` in your Supabase SQL editor to create demo tables and functions.

## 2. Create Demo User in Supabase Auth
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: `demo@example.com`
4. Password: `demo123456`
5. Confirm user immediately

## 3. How It Works

### Demo Login Button
- Orange "🔄 Try Demo" button on login page
- Automatically logs in demo user
- Sets demo session flag

### Demo Protection
- All critical actions (add product, checkout, payments) are blocked
- Shows orange notifications: "🚫 DEMO: Action blocked"
- Demo banner appears at top: "🔄 You're viewing a demo version"

### Real Admin Intact
- Your real admin (`admin@ecommerce.com`) works normally
- No demo restrictions for real admin
- Demo system completely separate

## 4. Reset Demo Data
```bash
# Reset demo user's cart, wishlist, orders
npm run reset-demo
```

## 5. Demo User Credentials
- **Email:** demo@example.com
- **Password:** demo123456

## 6. Protected Actions
- ✅ Product creation blocked
- ✅ Order processing blocked  
- ✅ Payment processing blocked
- ✅ Data modifications blocked
- ✅ Admin functions blocked for demo user

## 7. Daily Reset (Optional)
The SQL includes a function to reset demo data daily. You can:
- Call manually: `SELECT reset_demo_data();`
- Schedule with cron: `SELECT cron.schedule('reset-demo-data', '0 0 * * *', 'SELECT reset_demo_data();');`