# 🎬 Keya Studio — Backend API Server

> High-performance RESTful API powering Keya Studio, built with Express 5, MongoDB, and HTTPOnly Cookie JWT authentication.

---

## 🛠️ Tech Stack & Architecture
- **Runtime**: Node.js (v24 LTS / v20+)
- **Framework**: Express.js 5.3
- **Database**: MongoDB Atlas / Native MongoDB Driver v7.8
- **Authentication**: JSON Web Token (JWT) stored in HTTPOnly Cookies, Bcrypt.js password hashing
- **Security**: CORS with credentials, cookie-parser, input validation

---

## 🔌 API Endpoints Summary

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user with password validation (Uppercase, Lowercase, 6+ chars) | No |
| `POST` | `/api/auth/login` | Authenticate user & set HTTPOnly JWT cookie | No |
| `POST` | `/api/auth/social-login` | Authenticate via Google OAuth payload | No |
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
| `POST` | `/api/bookings` | Create reservation with status `"Pending"` & **Double-Booking Collision Prevention** | **Yes (Cookie)** |
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
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority
DB_NAME=studiospace
JWT_SECRET=studiospace_super_secret_jwt_key_b14_a8_cat_harry_2026
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📦 Scripts
- `npm run dev`: Start development server with auto-reload (`node --watch index.js`)
- `npm run start`: Start production server (`node index.js`)
- `npm run seed`: Populate MongoDB with 6 realistic featured studio workspaces
