# 🎬 Keya Studio — Backend API Server

[![Express.js](https://img.shields.io/badge/Express-5.3-green?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-brightgreen?style=flat&logo=node.js)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

> High-performance RESTful API powering **Keya Studio**, built with Express 5, MongoDB Atlas, and HTTPOnly Cookie JWT authentication. Fully configured for serverless deployment on Vercel.

---

## 🌐 Live Service URLs

| Service | Live URL |
| :--- | :--- |
| ⚡ **Live Backend API** | [https://keya-studio-backend.vercel.app](https://keya-studio-backend.vercel.app) |
| 🚀 **Live Frontend Client** | [https://keya-studio-frontend.vercel.app](https://keya-studio-frontend.vercel.app) |
| 🛠️ **Backend Repository** | [https://github.com/tharimakeya-dev/keya_studio_backend](https://github.com/tharimakeya-dev/keya_studio_backend) |
| 💻 **Frontend Repository** | [https://github.com/tharimakeya-dev/keya_studio_frontend](https://github.com/tharimakeya-dev/keya_studio_frontend) |

---

## 🛠️ Tech Stack & Architecture
- **Runtime**: Node.js (v20+ / v24 LTS)
- **Framework**: Express.js 5.3
- **Database**: MongoDB Atlas with Official Native Driver v7.8
- **Authentication**: JWT stored in HTTPOnly cookies (`SameSite=None; Secure`), Bcrypt.js password hashing
- **Security**: Strict CORS origin verification, cookie-parser, proxy trust enabled for HTTPS reverse proxies
- **Deployment**: Vercel Serverless Functions via `@vercel/node`

---

## 🔌 API Endpoints Summary

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user with password validation (Uppercase, Lowercase, 6+ chars) | No |
| `POST` | `/api/auth/login` | Authenticate user & set HTTPOnly JWT cookie | No |
| `POST` | `/api/auth/social-login` | Authenticate via Google/Social payload | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth 2.0 redirect flow | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler & JWT cookie generation | No |
| `POST` | `/api/auth/logout` | Clear HTTPOnly cookie session | No |
| `GET` | `/api/auth/me` | Verify session and return logged-in user profile | **Yes (Cookie)** |

### 2. Studio Workspaces (`/api/studios`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/studios/featured` | Fetch top 6 rated studios using `.limit(6)` | No |
| `GET` | `/api/studios` | Get all studios with category, search, and sort filters | No |
| `GET` | `/api/studios/:id` | Get single studio details by ID | No |
| `GET` | `/api/studios/owner/my-listings` | Get user-owned studios matching `ownerEmail` | **Yes (Cookie)** |
| `POST` | `/api/studios` | Create a new studio workspace | **Yes (Cookie)** |
| `PUT` | `/api/studios/:id` | Update an existing studio workspace | **Yes (Cookie)** |
| `DELETE` | `/api/studios/:id` | Delete an existing studio workspace | **Yes (Cookie)** |

### 3. Bookings & Reservations (`/api/bookings`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/bookings` | Create reservation with initial `"Pending"` status & **Double-Booking Collision Prevention** | **Yes (Cookie)** |
| `GET` | `/api/bookings/my` | Get current user's booking history | **Yes (Cookie)** |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking slot (allowed for Pending slots) | **Yes (Cookie)** |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) | **Yes (Cookie)** |

### 4. Saved Wishlist (`/api/wishlist`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/wishlist` | Get user's saved favorite studios | **Yes (Cookie)** |
| `POST` | `/api/wishlist/:studioId` | Save studio to user's MongoDB wishlist | **Yes (Cookie)** |
| `DELETE` | `/api/wishlist/:studioId` | Remove studio from user's wishlist | **Yes (Cookie)** |

---

## 🚀 Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
DB_NAME=studiospace
JWT_SECRET=studiospace_super_secret_jwt_key_b14_a8_cat_harry_2026
CLIENT_URL=https://keya-studio-frontend.vercel.app
BACKEND_URL=https://keya-studio-backend.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 📦 Scripts
- `npm run dev`: Start local development server with auto-reload (`node --watch index.js`)
- `npm run start`: Start production server (`node index.js`)
- `npm run seed`: Populate MongoDB Atlas with 6 verified, high-quality studio workspaces
