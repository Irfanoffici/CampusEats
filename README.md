# 🍔 CampusEats

**Modern Food Ordering System for Madras Engineering College**

A full-stack web application built with Next.js, featuring three separate portals (Student, Vendor, Admin), RFID integration, multiple payment methods, and a beautiful Swiggy-inspired UI.

---

## ✨ Features

### 🎓 Student Portal
- **Browse Vendors** - View all active food vendors with ratings and reviews
- **Menu Browsing** - Filter by categories (Breakfast, Lunch, Dinner, Snacks, Beverages)
- **Shopping Cart** - Add items from a single vendor
- **Group Ordering** - Split bills with friends and share orders
- **Invoice Management** - Generate and access invoices for group orders
- **Multiple Payment Methods**:
  - 💳 RFID Card (balance hold → deduct on pickup)
  - 📱 UPI with QR Code
  - 💰 Demo Card Gateway (test mode)
  - 💵 Cash on delivery
- **Order Tracking** - Real-time status updates
- **RFID Balance Management** - View and top up balance
- **Order History** - Track past orders

### 🏪 Vendor Portal
- **Order Management** - View incoming orders with customer details
- **Order Status Control** - Update from PLACED → PREPARING → READY → COMPLETED
- **Menu Management**:
  - Add new items with images and descriptions
  - Edit existing items (price, availability, prep time)
  - Delete items
  - Category organization
- **Pickup Code Verification** - Secure order collection
- **RFID Deduction Trigger** - Deduct payment on food collection

### 🔑 Admin Dashboard
- **Analytics Cards**:
  - Total revenue tracking
  - Active vendors count
  - Total students count
  - Pending orders count
  - Average order value
- **Order List** - View all orders across vendors
- **User Management** - Manage students, vendors, admins
- **RFID Management** - Credit RFID balances for students
- **System Overview** - Complete platform statistics

### 💎 Additional Features
- **Beautiful UI** - Swiggy-style design with smooth animations
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Sound Effects** - Audio feedback for actions
- **Firebase Integration** - Fallback database system
- **Secure Authentication** - NextAuth.js with role-based access
- **QR Code Generation** - For UPI payments and invoices
- **Database Health Monitoring** - Built-in health checks
- **Comprehensive Testing** - 10 automated system tests
- **Dual Signup System** - Separate registration for MEC and non-MEC students
- **RFID Integration** - Special access for MEC students with campus RFID cards

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CampusEats
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and update with your values:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Firebase (Optional - for fallback)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

4. **Set up the database**
```bash
npm run db:push
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## ☁️ Vercel Deployment

### Prerequisites
- Vercel account
- This repository connected to Vercel

### Environment Variables
In your Vercel project settings, add the following environment variables:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://meccampuseats.vercel.app
```

Replace `your-super-secret-key-here` with a strong secret (use `openssl rand -base64 32` to generate one).

### Deployment Steps
1. Connect your GitHub repository to Vercel
2. Configure the environment variables as shown above
3. Set the build command to `npm run vercel-build`
4. Set the output directory to `.next`
5. Deploy!

### Notes
- Vercel will automatically run the build process
- The database will be SQLite-based and stored in the project
- For production use, consider migrating to a cloud database

---

## 👤 Login Credentials

### Student Account
- **Email:** `john.doe@mec.edu`
- **Password:** `student123`
- **RFID Balance:** ₹500

### Vendor Account
- **Email:** `canteen@mec.edu`
- **Password:** `vendor123`
- **Shop:** Campus Canteen

### Admin Account
- **Email:** `admin@mec.edu`
- **Password:** `admin123`

### Additional Accounts
- **Student 2:** `jane.smith@mec.edu` / `student123` (₹750 balance)
- **Student 3:** `alex.kumar@mec.edu` / `student123` (₹300 balance)
- **Vendor 2:** `quickbites@mec.edu` / `vendor123` (Quick Bites)
- **Vendor 3:** `juice@mec.edu` / `vendor123` (Juice Junction)
- **Vendor 4:** `dosa@mec.edu` / `vendor123` (Dosa Point)

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
npm run db:health    # Check database health

# Testing
npm test             # Run system tests (10 automated tests)
```

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icons
- **React Hot Toast** - Notifications

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database toolkit
- **SQLite** - Primary database
- **Firebase** - Fallback database (optional)
- **NextAuth.js** - Authentication

### Additional Libraries
- **bcryptjs** - Password hashing
- **QRCode.react** - QR code generation
- **jsPDF** - PDF invoice generation
- **Recharts** - Analytics charts
- **Zustand** - State management

---

## 📊 Database Schema

### Core Tables
- **Users** - Students, Vendors, Admins with authentication
- **Vendors** - Shop profiles with ratings
- **MenuItems** - Food items with categories and pricing
- **Orders** - Order tracking with status flow
- **Transactions** - Payment history
- **Reviews** - Ratings and feedback
- **GroupOrders** - Shared orders (schema ready)

### Relationships
- User → Vendor (1:1)
- Vendor → MenuItems (1:N)
- User → Orders (1:N)
- Order → Reviews (1:N)

---

## 🔄 RFID Payment Flow

1. **Student adds items to cart**
2. **Selects RFID payment method**
3. **System checks balance** (≥ order amount)
4. **Order created** with status PENDING
5. **Balance is NOT deducted yet** ⚠️
6. **Vendor prepares food** (PREPARING → READY)
7. **Student collects food** (shows pickup code)
8. **Vendor confirms pickup**
9. **RFID balance deducted instantly** ✅
10. **Order marked COMPLETED**

This ensures students only pay when they actually receive their food!

---

## 🧪 Testing

The project includes comprehensive automated tests:

```bash
npm test
```

**Test Coverage:**
- ✅ Database Connection
- ✅ Seed Data Verification
- ✅ Vendor-User Relationships
- ✅ Menu Items Existence
- ✅ RFID Balance System
- ✅ Order Creation Flow
- ✅ Vendor Order Retrieval
- ✅ Payment Methods
- ✅ Order Status Updates
- ✅ RFID Deduction on Pickup

All tests pass with 100% success rate!

---

## 🎨 UI Design

### Color Palette (Swiggy-Inspired)
- **Primary Orange:** `#ea580c` - Main brand color
- **Primary Green:** `#16a34a` - Success states
- **Background:** `#f8fafc` - Light gray
- **Text:** `#0f172a` - Dark slate

### Typography
- **Headings:** Inter, Bold
- **Body:** Inter, Regular
- **Monospace:** JetBrains Mono

### Animations
- Smooth page transitions
- Floating food cards on homepage
- Auto-rotating feature carousel (3s intervals)
- Button hover effects
- Card elevation on hover

---

## 📂 Project Structure

```
CampusEats/
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── auth/              # NextAuth
│   │   ├── balance/           # RFID balance
│   │   ├── orders/            # Order management
│   │   ├── menu-items/        # Menu CRUD
│   │   └── vendors/           # Vendor data
│   ├── dashboard/             # Protected dashboards
│   │   ├── student/
│   │   ├── vendor/
│   │   └── admin/
│   ├── login/                 # Login page
│   └── page.tsx               # Homepage
├── components/                # React components
│   ├── student/               # Student portal
│   ├── vendor/                # Vendor portal
│   ├── admin/                 # Admin portal
│   └── ui/                    # Shared UI components
├── lib/                       # Utilities
│   ├── auth.ts                # NextAuth config
│   ├── db-service.ts          # Database abstraction
│   ├── firebase.ts            # Firebase config
│   └── prisma.ts              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── scripts/
│   ├── test-system.ts         # System tests
│   ├── db-health.ts           # Health check
│   └── setup.ts               # Setup script
└── public/                    # Static assets
```

---

## 🔧 Configuration

### Database Fallback System

The app uses a smart database service layer:
1. **Primary:** Prisma + SQLite (fast, local)
2. **Fallback:** Firebase Firestore (cloud backup)

If Prisma fails, the system automatically switches to Firebase.

### Environment Configuration

Required variables:
- `DATABASE_URL` - SQLite connection string
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - Application URL

Optional (Firebase fallback):
- `NEXT_PUBLIC_FIREBASE_*` - Firebase credentials

**Important Security Note:** 
Never commit actual secrets to version control. Use `.env.local` for development and set environment variables in your hosting platform for production. See `.env.example` for the required variables.

---

## 🚦 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `.next`
4. Add all environment variables from `.env.local` to Netlify's environment variables section
5. Deploy automatically on push

### Environment Setup
1. Add all environment variables to your hosting platform
2. Connect your repository
3. Deploy automatically on push

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Check System Health
```bash
npm run db:health
npm test
```

---

## 📈 Future Enhancements

- [ ] Group order feature (schema ready)
- [ ] Invoice generation with PDF (jsPDF integrated)
- [ ] Review and rating system (schema ready)
- [ ] Push notifications for order updates
- [ ] Mobile app (React Native)
- [ ] Loyalty points program
- [ ] Scheduled orders
- [ ] Order analytics for vendors
- [ ] Meal plans and subscriptions

---

## 👥 Contributors

- **Developer:** AI Assistant
- **Project:** Madras Engineering College

---

## 📄 License

MIT License - Feel free to use this project for your institution!

---

## 🙏 Acknowledgments

- **MEC** - Madras Engineering College
- **Swiggy** - UI/UX inspiration
- **Next.js Team** - Awesome framework
- **Prisma Team** - Database toolkit

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run `npm run db:health` to diagnose
3. Run `npm test` to verify system
4. Check browser console for errors

---

**Made with ❤️ for MEC Students**