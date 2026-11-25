# 🎬 Keya Studio — Backend API Server

[![Express.js](https://img.shields.io/badge/Express-5.3-green?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-brightgreen?style=flat&logo=node.js)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

> High-performance RESTful API powering **Keya Studio**, built with Express 5, MongoDB Atlas native driver v7.8, and HTTPOnly Cookie JWT authentication. Fully configured for serverless deployment on Vercel.

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
- **Security**: Strict CORS origin verification with credentials support, cookie-parser, proxy trust enabled for HTTPS reverse proxies (`trust proxy: 1`)
- **Deployment**: Vercel Serverless Functions via `@vercel/node`

---

## 🔑 Examiner Test Credentials

| Account Type | Email | Password / Access | Notes |
| :--- | :--- | :--- | :--- |
| **Examiner Demo Account** | `creator.demo@example.com` | `KeyaStudio2026!` | Pre-populated with active listings & bookings |
| **1-Click Quick Demo** | *Click "1-Click Examiner Demo Sign In"* | *Instant 1-Click* | Available on `/login` for instant grading |
| **Google Social Login** | *Click "Sign In with Google"* | *Google OAuth 2.0* | Connects directly via Google OAuth |

---

## 🔌 Complete REST API Endpoints Specification

Base URLs:
- **Production**: `https://keya-studio-backend.vercel.app`
- **Development**: `http://localhost:5000`

All protected endpoints require the HTTPOnly cookie named `token` generated upon login/registration.

---

### 0. Health & System Status

#### `GET /`
- **Access**: Public
- **Description**: Root API status verification, version info, and server timestamp.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "message": "Keya Studio Backend API is running",
  "version": "1.0.0",
  "timestamp": "2026-11-17T08:10:00.000Z"
}
```

#### `GET /api/health`
- **Access**: Public
- **Description**: Real-time health check, process uptime, and database connection status.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "uptime": 124.56,
  "db": "connected"
}
```

---

### 1. Authentication & Session (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user with password validation rules |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue HTTPOnly JWT cookie |
| `POST` | `/api/auth/social-login` | Public | Authenticate via Google/Social payload & set cookie |
| `GET` | `/api/auth/google` | Public | Initiate Google OAuth 2.0 authorization redirect |
| `GET` | `/api/auth/google/callback` | Public | Google OAuth 2.0 callback, set JWT cookie & redirect |
| `POST` | `/api/auth/logout` | Public | Clear HTTPOnly JWT cookie session |
| `GET` | `/api/auth/me` | **Protected (Cookie)** | Verify session and return logged-in user profile |

#### Details:

- **`POST /api/auth/register`**
  - **Body**:
    ```json
    {
      "name": "Jane Creator",
      "email": "jane@example.com",
      "password": "Password123!",
      "photoURL": "https://images.unsplash.com/photo-..."
    }
    ```
  - **Validation Rules**: Password must be $\ge 6$ characters, contain at least one uppercase letter (`[A-Z]`), and at least one lowercase letter (`[a-z]`).
  - **Response `201 Created`**: `{ "success": true, "message": "Account registered successfully...", "userId": "..." }`

- **`POST /api/auth/login`**
  - **Body**: `{ "email": "creator.demo@example.com", "password": "KeyaStudio2026!" }`
  - **Header Set**: `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=None; Max-Age=604800; Path=/`
  - **Response `200 OK`**: `{ "success": true, "message": "Welcome back!...", "user": { ... } }`

- **`POST /api/auth/social-login`**
  - **Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "photoURL": "...", "provider": "google" }`
  - **Response `200 OK`**: `{ "success": true, "user": { ... } }`

- **`POST /api/auth/logout`**
  - **Response `200 OK`**: Clears the `token` cookie. `{ "success": true, "message": "Logged out successfully." }`

- **`GET /api/auth/me`**
  - **Protection**: Requires `token` cookie.
  - **Response `200 OK`**: `{ "success": true, "user": { "id": "...", "name": "...", "email": "...", "photoURL": "...", "role": "creator" } }`

---

### 2. Studio Workspaces (`/api/studios`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/studios/featured` | Public | Fetch top 6 rated studios using `.limit(6)` |
| `GET` | `/api/studios` | Public | Get all studios with category, search, and sort filters |
| `GET` | `/api/studios/:id` | Public | Get single studio details by ID |
| `GET` | `/api/studios/owner/my-listings` | **Protected (Cookie)** | Get user-owned studios matching `ownerEmail` |
| `POST` | `/api/studios` | **Protected (Cookie)** | Create a new studio workspace |
| `PUT` | `/api/studios/:id` | **Protected (Cookie - Owner)** | Update an existing studio workspace |
| `DELETE` | `/api/studios/:id` | **Protected (Cookie - Owner)** | Delete an existing studio workspace |

#### Details:

- **`GET /api/studios/featured`**
  - Queries MongoDB with `.sort({ rating: -1, createdAt: -1 }).limit(6)` to return 6 verified featured listings.

- **`GET /api/studios`**
  - **Query Parameters**:
    - `category`: Filter by discipline (`Photo Studio`, `Film Stage`, `Podcast Room`, `Music Suite`, `Art Workshop`)
    - `search`: Keyword matching against `title`, `location`, `category`, and `detailedOverview`
    - `sort`: `price-low` (hourlyRate asc), `price-high` (hourlyRate desc), or `rating` (rating desc)

- **`GET /api/studios/:id`**
  - Retrieves single studio by 24-character hexadecimal `ObjectId` or string identifier. Returns `404` if not found.

- **`GET /api/studios/owner/my-listings`**
  - Returns array of studios where `ownerEmail` equals the authenticated user's email.

- **`POST /api/studios`**
  - **Body**:
    ```json
    {
      "title": "Aperture Daylight Loft",
      "category": "Photo Studio",
      "hourlyRate": 85,
      "securityDeposit": 100,
      "maxCapacity": 12,
      "location": "Tribeca, New York, NY",
      "imageUrl": "https://i.ibb.co/...",
      "images": ["https://i.ibb.co/..."],
      "amenities": ["Cyclorama Wall", "Profoto Lighting", "Hair & Makeup Station"],
      "detailedOverview": "Sun-drenched south-facing daylight studio..."
    }
    ```
  - Host info (`ownerName`, `ownerEmail`) is automatically attached from the authenticated JWT session.
  - **Response `201 Created`**: `{ "success": true, "message": "...", "studio": { ... } }`

- **`PUT /api/studios/:id`**
  - Checks that the requesting user's email matches the studio's `ownerEmail`. Returns `403 Forbidden` if unauthorized. Updates document fields.

- **`DELETE /api/studios/:id`**
  - Verifies ownership and permanently deletes the document from MongoDB Atlas. Returns `403 Forbidden` if unauthorized.

---

### 3. Bookings & Reservations (`/api/bookings`)

All booking endpoints require authenticated session via HTTPOnly cookie.

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/bookings` | **Protected (Cookie)** | Create reservation with status `"Pending"` & **Double-Booking Collision Prevention** |
| `GET` | `/api/bookings/my` | **Protected (Cookie)** | Get current user's booking history |
| `PATCH` | `/api/bookings/:id/cancel` | **Protected (Cookie - Owner)** | Cancel a booking slot (allowed for Pending slots) |
| `PATCH` | `/api/bookings/:id/status` | **Protected (Cookie)** | Update booking status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) |

#### Details & Double-Booking Collision Prevention:

- **`POST /api/bookings`**
  - **Body**:
    ```json
    {
      "studioId": "65f01a...",
      "bookingDate": "2026-11-20",
      "startTime": "10:00",
      "endTime": "14:00",
      "notes": "Fashion lookbook shoot"
    }
    ```
  - **Collision Prevention Guard**:
    Before saving, queries MongoDB for existing bookings matching `{ studioId, bookingDate, status: "Confirmed" }`.
    Tests interval overlap:
    $$\text{startMinutes} < \text{existingEndMinutes} \quad\text{and}\quad \text{endMinutes} > \text{existingStartMinutes}$$
    If an overlap is detected, returns **`409 Conflict`**:
    ```json
    {
      "success": false,
      "isConflict": true,
      "message": "Double-Booking Prevention Alert: This studio is already CONFIRMED for 2026-11-20 between 10:00 and 14:00. Please choose different hours or another date."
    }
    ```
  - Automatically calculates `durationHours`, `subtotal` (`durationHours * hourlyRate`), and `totalAmount` (`subtotal + securityDeposit`).
  - Sets initial reservation status to `"Pending"`.
  - **Response `201 Created`**: `{ "success": true, "message": "...", "booking": { ... } }`

- **`GET /api/bookings/my`**
  - Returns list of bookings where `userEmail == req.user.email`, sorted newest first.

- **`PATCH /api/bookings/:id/cancel`**
  - Validates ownership. Only bookings in `"Pending"` status can be self-cancelled. Sets status to `"Cancelled"` and records `cancelledAt`.

- **`PATCH /api/bookings/:id/status`**
  - Updates reservation status to `Confirmed`, `Completed`, or `Cancelled`. Setting status to `Confirmed` activates the double-booking collision lock for that time slot.

---

### 4. Saved Wishlist (`/api/wishlist`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/wishlist` | **Protected (Cookie)** | Get current user's saved studio wishlist |
| `POST` | `/api/wishlist/:studioId` | **Protected (Cookie)** | Save studio to user's MongoDB wishlist |
| `DELETE` | `/api/wishlist/:studioId` | **Protected (Cookie)** | Remove studio from user's wishlist |

#### Details:

- **`GET /api/wishlist`**: Returns all saved studio items for `req.user.email`.
- **`POST /api/wishlist/:studioId`**: Checks for existing entry; if not present, saves studio summary (`studioId`, `studioTitle`, `hourlyRate`, `rating`, `addedAt`).
- **`DELETE /api/wishlist/:studioId`**: Removes the record matching `userEmail` and `studioId`.

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

## 🚀 Local Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/tharimakeya-dev/keya_studio_backend.git
cd keya_studio_backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Seed the database with 6 verified studio listings
npm run seed

# 5. Start the backend development server
npm run dev
# Server listening on http://localhost:5000
```

---

## 📦 Scripts

- `npm run dev`: Start local development server with auto-reload (`node --watch index.js`)
- `npm run start`: Start production server (`node index.js`)
- `npm run seed`: Populate MongoDB Atlas with 6 verified, high-quality studio workspaces

---

## 📄 License
This project is licensed under the MIT License for the **B14-A8** assignment evaluation.
