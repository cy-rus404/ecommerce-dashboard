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

Visit `http://localhost:3000` for the customer store and `http://localhost:3000/admin` for the admin dashboard.

## 📁 Project Structure

```
ecommerce-dashboard/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── products/       # Customer product pages
│   │   ├── cart/           # Shopping cart
│   │   └── checkout/       # Checkout process
│   ├── components/         # Reusable components
│   └── lib/               # Utility functions
├── sql/                   # Database schema and migrations
├── supabase/             # Supabase functions
└── public/               # Static assets
```

## 🔧 Configuration

### Admin Setup
1. Create admin account using the provided SQL scripts
2. Access admin dashboard at `/admin`
3. Configure delivery zones and product categories

### Email Notifications
1. Set up EmailJS service with Gmail/Outlook
2. Create email template with required variables
3. Update service IDs in admin orders page

### Product Images
1. Configure Supabase Storage bucket
2. Set up public access policies
3. Images are automatically optimized and compressed

## 📱 Features Overview

### Customer Features
- ✅ Product browsing with advanced filters
- ✅ Shopping cart and wishlist
- ✅ User registration and login
- ✅ Order tracking and history
- ✅ Product reviews and ratings
- ✅ Responsive mobile design

### Admin Features
- ✅ Complete product management
- ✅ Order processing and tracking
- ✅ Customer management
- ✅ Inventory management with alerts
- ✅ Bulk operations and CSV import
- ✅ Real-time analytics dashboard
- ✅ Email notification system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [EmailJS](https://emailjs.com/) for email notifications

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact (mailto:sduisaac@gmail.com).

---

⭐ **Star this repo if you find it helpful!**
