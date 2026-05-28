# RentFlow Frontend - React App

இது **RentFlow Backend** (.NET Clean Architecture) க்கான முழு React frontend.

## Stack
- **React 18** + React Router v6
- **Axios** - API calls + JWT auto-refresh
- **Recharts** - Dashboard charts
- **react-hot-toast** - Notifications
- **lucide-react** - Icons
- **date-fns** - Date formatting

## Features

### Admin Panel
- 📊 Dashboard - Revenue charts, stats, top rented assets
- 📦 Assets - CRUD, QR code generation, search
- 📅 Bookings - Approve/Reject/Activate, Process Returns
- 🔔 Returns - Damage assessment, additional charges

### Member Portal
- 🏠 Dashboard - Active rentals, upcoming returns
- 🔍 Browse Assets - Available items, book with date picker
- 📋 My Bookings - Status tracking, cancel bookings
- 🔔 Notifications - Read/unread with mark all read

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Environment setup
cp .env.example .env
# .env file ல் உங்கள் backend URL மாற்றவும்

# 3. Start development server
npm start
```

## API Configuration

`.env` file ல்:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.js       # Navigation sidebar
│   │   └── AppLayout.js     # Main layout wrapper
│   └── ProtectedRoute.js    # Auth guards
├── context/
│   └── AuthContext.js       # JWT auth state management
├── pages/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── admin/
│   │   ├── AdminDashboard.js
│   │   ├── AdminAssets.js
│   │   └── AdminBookings.js
│   └── member/
│       ├── MemberDashboard.js
│       ├── MemberAssets.js
│       ├── MemberBookings.js
│       └── MemberNotifications.js
├── services/
│   └── api.js               # All API calls
└── index.css                # Global styles
```

## Auth Flow
- JWT Access Token + Refresh Token
- Auto-refresh on 401 responses
- Role-based routing (Admin → /admin, Member → /member)

## Design
- Dark theme with blue accent (#4f8ef7)
- Syne font (headers) + DM Sans (body)
- Responsive layout
