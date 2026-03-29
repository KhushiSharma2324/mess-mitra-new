# 🍱 MessMitra

**Smart Mess Management for Students & Owners**

MessMitra is a full-stack web application designed to digitize and streamline the mess (tiffin) management experience for students, mess owners, and delivery partners. It provides subscription management, daily attendance tracking, menu planning, delivery logistics, and a review system — all from a single platform.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Set Up the Database](#4-set-up-the-database)
  - [5. Run the Application](#5-run-the-application)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [PWA Support](#-pwa-support)
- [Scripts Reference](#-scripts-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **🎓 Student** | Browse mess listings, subscribe to meal plans, mark daily attendance, track deliveries, write reviews |
| **🏪 Mess Owner** | Register & manage mess profile, create meal plans, set daily menus, declare holidays, view subscriber analytics |
| **🚚 Delivery Partner** | View assigned delivery orders, update delivery status (picked up → delivered), manage delivery workflow |

### Core Modules

- **Authentication** — Register / Login with JWT-based auth & role-based access (Student, Owner, Delivery)
- **Mess Management** — CRUD operations for mess profiles with location, timings, cutoff times, and cover photos
- **Meal Plans** — Create weekly/monthly/custom plans with Veg, Non-Veg, Egg, or Vegan categories
- **Subscriptions** — Students subscribe to plans with delivery address and payment tracking
- **Attendance** — Daily meal attendance logging (Present / Absent / Holiday)
- **Menu** — Daily menu items with meal type and food category
- **Delivery** — Order lifecycle management: Pending → Assigned → Picked Up → Delivered / Failed
- **Reviews & Ratings** — Food & delivery ratings with comments, tied to specific delivery orders
- **Holidays** — Mess owners can declare holidays for specific dates
- **File Upload** — Image uploads via Cloudinary (profile photos, cover images)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL (hosted on Neon) |
| **ORM** | Prisma |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **File Storage** | Cloudinary |
| **File Upload** | Multer |
| **Frontend** | Vanilla HTML / CSS / JavaScript (PWA) |
| **Dev Tools** | Nodemon, TypeScript (types only) |

---

## 📁 Directory Structure

```
messmitra/
├── README.md
├── backend/
│   ├── .env                        # Environment variables (not committed)
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                   # Express app entry point
│   ├── icon-192.png                # PWA icon (192x192)
│   ├── icon-512.png                # PWA icon (512x512)
│   │
│   ├── prisma/
│   │   └── schema.prisma           # Database schema & models
│   │
│   ├── public/                     # Static frontend (served by Express)
│   │   ├── index.html              # Home / landing page
│   │   ├── login.html              # Login page
│   │   ├── register.html           # Registration page
│   │   ├── mess-detail.html        # Individual mess detail page
│   │   ├── manifest.json           # PWA manifest
│   │   ├── service-worker.js       # Service worker for offline support
│   │   ├── css/
│   │   │   ├── main.css            # Global styles
│   │   │   └── components.css      # Component-level styles
│   │   └── js/
│   │       ├── api.js              # API client / fetch wrapper
│   │       ├── auth.js             # Auth state management (token, user)
│   │       └── utils.js            # UI utility functions
│   │
│   └── src/                        # Backend application source
│       ├── config/
│       │   ├── constants.js        # App-wide constants
│       │   └── db.js               # Prisma client instance
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js   # JWT token verification
│       │   ├── role.middleware.js   # Role-based access control
│       │   └── error.middleware.js  # Global error & 404 handlers
│       │
│       ├── utils/
│       │   ├── response.js         # Standardized API response helpers
│       │   ├── jwt.js              # JWT sign & verify utilities
│       │   ├── hash.js             # Password hashing with bcryptjs
│       │   └── date.js             # Date formatting utilities
│       │
│       └── modules/                # Feature modules (routes → controller → service)
│           ├── auth/               # Register, Login, Profile
│           ├── mess/               # Mess CRUD
│           ├── plans/              # Meal plan management
│           ├── subscriptions/      # Student subscriptions
│           ├── attendance/         # Daily attendance logs
│           ├── menu/               # Daily menu items
│           ├── delivery/           # Delivery order lifecycle
│           ├── reviews/            # Ratings & reviews
│           ├── holidays/           # Holiday declarations
│           └── upload/             # Cloudinary file uploads
│
└── frontend/                       # (Reserved for future frontend app)
```

---

## 📦 Prerequisites

Make sure you have these installed on your machine before starting:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | [https://nodejs.org](https://nodejs.org) |
| **npm** | v9 or higher (comes with Node) | — |
| **PostgreSQL** | v14+ (or use a hosted service like [Neon](https://neon.tech)) | [https://postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [https://git-scm.com](https://git-scm.com) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/krishna7805/messmitra.git
cd messmitra
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

This will install all project dependencies including:
- `express` — Web framework
- `@prisma/client` — Database ORM client
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT authentication
- `cloudinary` & `multer` — File uploads
- `cors` — Cross-origin resource sharing
- `dotenv` — Environment variable management

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
cp .env.example .env   # or create manually
```

Add the following variables:

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"

# Authentication
JWT_SECRET="your_jwt_secret_key_here"

# Server
PORT=3000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

> **💡 Tip:** You can get a free PostgreSQL database from [Neon](https://neon.tech) and free Cloudinary credentials from [cloudinary.com](https://cloudinary.com).

### 4. Set Up the Database

Generate the Prisma client and push the schema to your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to the database (creates tables)
npx prisma db push
```

To visually explore your database:

```bash
npx prisma studio
```

### 5. Run the Application

**Development mode** (with auto-reload via nodemon):

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start at: **http://localhost:3000**

You can verify the server is running by visiting the health check endpoint:

```
GET http://localhost:3000/health
```

---

## 🔗 API Endpoints

All API routes are prefixed with `/api`.

| Module | Base Route | Description |
|--------|-----------|-------------|
| **Auth** | `/api/auth` | Register, login, profile management |
| **Mess** | `/api/mess` | Mess profile CRUD operations |
| **Plans** | `/api/plans` | Meal plan management |
| **Subscriptions** | `/api/subscriptions` | Subscription creation & management |
| **Attendance** | `/api/attendance` | Daily meal attendance tracking |
| **Menu** | `/api/menu` | Daily menu item management |
| **Delivery** | `/api/delivery` | Delivery order lifecycle |
| **Reviews** | `/api/reviews` | Ratings & reviews |
| **Holidays** | `/api/holidays` | Holiday declarations |
| **Upload** | `/api/upload` | File/image uploads |

> **Authentication:** Most endpoints require a Bearer token in the `Authorization` header.
>
> ```
> Authorization: Bearer <your_jwt_token>
> ```

---

## 🗄 Database Schema

The application uses the following core models:

```
User ──────┬──── Mess ──────┬──── Plan ──── Subscription ──── AttendanceLog
           │                │                                        │
           │                ├──── MenuItem                    DeliveryOrder
           │                │                                        │
           │                ├──── Holiday                       Review
           │                │
           └── (Delivery) ──┴──── DeliveryOrder
```

### Key Models

| Model | Purpose |
|-------|---------|
| `User` | Students, owners, and delivery partners (role-based) |
| `Mess` | Mess profiles with location, timings, and categories |
| `Plan` | Meal plans (weekly/monthly/custom) with pricing |
| `Subscription` | Links students to plans with payment & delivery info |
| `AttendanceLog` | Daily per-meal attendance records |
| `MenuItem` | Daily menu items per mess |
| `DeliveryOrder` | Delivery tracking with full lifecycle status |
| `Review` | Ratings (food + delivery) with comments |
| `Holiday` | Mess-declared holiday dates |

### Enums

| Enum | Values |
|------|--------|
| `Role` | STUDENT, OWNER, DELIVERY |
| `MealType` | BREAKFAST, LUNCH, DINNER |
| `FoodCategory` | VEG, NONVEG, EGG, VEGAN |
| `MessCategory` | PURE_VEG, NONVEG, BOTH |
| `PlanDuration` | WEEKLY, MONTHLY, CUSTOM |
| `SubscriptionStatus` | PENDING, ACTIVE, CANCELLED, EXPIRED, PAUSED |
| `DeliveryStatus` | PENDING, ASSIGNED, PICKED_UP, DELIVERED, FAILED |

---

## 📱 PWA Support

MessMitra is a **Progressive Web App (PWA)** — it can be installed on mobile devices and works offline with service worker caching.

- **Manifest**: `backend/public/manifest.json`
- **Service Worker**: `backend/public/service-worker.js`
- **Theme Color**: `#C84B00` (warm orange)
- **Categories**: Food, Lifestyle, Utilities

---

## 📜 Scripts Reference

Run these from the `backend/` directory:

| Command | Description |
|---------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start with nodemon (auto-reload on changes) |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate Prisma client |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ❤️ for students & mess owners
</p>
