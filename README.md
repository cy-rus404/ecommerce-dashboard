# 🛒 E-Commerce Admin Dashboard

A complete Next.js e-commerce admin dashboard with customer-facing store, built with Supabase backend and real-time email notifications.

## ✨ Features

### 🔐 Authentication System
- **Dual Authentication** - Separate admin and customer login systems
- **Role-based Access** - Admin dashboard with protected routes
- **Session Management** - Secure user sessions with Supabase Auth

### 📦 Product Management
- **Product Catalog** - Complete CRUD operations for products
- **Multiple Images** - Upload and manage multiple product images
- **Inventory Tracking** - Real-time stock management with low stock alerts
- **Discount System** - Time-based percentage discounts
- **Product Variants** - Size, color, and demographic targeting
- **Bulk Upload** - CSV-based bulk product import

### 🛍️ Customer Store
- **Product Browsing** - Responsive product catalog with search and filters
- **Shopping Cart** - Add/remove items with quantity management
- **Wishlist** - Save products for later
- **Product Reviews** - Customer rating and review system
- **Recently Viewed** - Track customer browsing history

### 📋 Order Management
- **Order Processing** - Complete order lifecycle management
- **Status Updates** - Real-time order status tracking
- **Bulk Operations** - Update multiple orders simultaneously
- **Order History** - Customer order tracking

### 📧 Communication System
- **Email Notifications** - Automated order confirmations and updates via EmailJS
- **Bulk Messaging** - Send status updates to multiple customers
- **Notification Tracking** - Complete email delivery tracking

### 🚚 Delivery System
- **Delivery Zones** - Location-based delivery pricing
- **Fee Calculation** - Automatic delivery fee calculation
- **Address Management** - Customer shipping addresses

### 📊 Analytics & Reporting
- **Sales Dashboard** - Real-time business metrics
- **Inventory Reports** - Stock levels and alerts
- **Order Analytics** - Order statistics and trends

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Email Service**: EmailJS for automated notifications
- **Image Storage**: Supabase Storage with optimization
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- EmailJS account (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecommerce-dashboard.git
cd ecommerce-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your Supabase and EmailJS credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password
```

4. **Set up the database**
Run the SQL files in `/sql` folder in your Supabase SQL editor:
```sql
-- Run these in order:
-- 1. Core tables
-- 2. Feature additions  
-- 3. Functions and policies
```

5. **Configure EmailJS**
- Sign up at [EmailJS](https://emailjs.com)
- Create email service and template
- Update service IDs in the code

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
