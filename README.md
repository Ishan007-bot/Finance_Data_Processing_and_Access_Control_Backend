# Zorvyn Finance Backend

A Finance Data Processing and Access Control Backend built with **Node.js**, **Express**, **MongoDB**, and **JWT authentication**. Features role-based access control, financial records management, dashboard analytics, and comprehensive API documentation.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Reference](#api-reference)
- [Access Control Matrix](#access-control-matrix)
- [Data Models](#data-models)
- [Design Decisions & Assumptions](#design-decisions--assumptions)
- [Running Tests](#running-tests)

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js | Server-side JavaScript |
| Framework | Express.js | HTTP server and routing |
| Database | MongoDB 7.0 | Document storage |
| ODM | Mongoose | Schema validation, query building |
| Auth | JWT + bcrypt | Stateless authentication, password hashing |
| Validation | Joi | Request input validation |
| API Docs | Swagger (OpenAPI 3.0) | Interactive API documentation |
| Testing | Jest + Supertest | Integration tests |
| Containerization | Docker Compose | MongoDB container for easy setup |
| Rate Limiting | express-rate-limit | API abuse prevention |

---

## Project Structure

```
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection via Mongoose
│   │   ├── environment.js       # Centralized env var config
│   │   └── swagger.js           # Swagger/OpenAPI specification
│   │
│   ├── models/
│   │   ├── user.model.js        # User schema (roles, status)
│   │   └── record.model.js      # Financial record schema (soft delete)
│   │
│   ├── middleware/
│   │   ├── authenticate.js      # JWT token verification
│   │   ├── authorize.js         # Role-based access control
│   │   ├── validate.js          # Joi schema validation
│   │   ├── errorHandler.js      # Global error handler
│   │   └── rateLimiter.js       # Rate limiting (general + auth)
│   │
│   ├── modules/
│   │   ├── auth/                # Register, Login, Profile
│   │   ├── users/               # User management (Admin)
│   │   ├── records/             # Financial records CRUD
│   │   └── dashboard/           # Analytics & summaries
│   │
│   ├── utils/
│   │   ├── apiResponse.js       # Standardized response format
│   │   ├── apiError.js          # Custom error class
│   │   └── logger.js            # Timestamped logging
│   │
│   └── app.js                   # Express app configuration
│
├── tests/                       # Integration tests
├── scripts/seed.js              # Database seed script
├── docker-compose.yml           # MongoDB container
├── server.js                    # Entry point
└── package.json
```

**Architecture:** Each module follows a `controller → service` pattern. Controllers handle HTTP concerns (request/response). Services contain business logic and interact with Mongoose models directly.

---

## Setup & Installation

### Prerequisites

- **Node.js** v18+ 
- **Docker** (for MongoDB) OR a local MongoDB instance

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ishan007-bot/Finance_Data_Processing_and_Access_Control_Backend.git
   cd Finance_Data_Processing_and_Access_Control_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if needed (defaults work for local development).

4. **Start MongoDB** (choose one)
   ```bash
   # Option A: Using Docker (recommended)
   docker compose up -d

   # Option B: Use your own MongoDB instance
   # Update MONGODB_URI in .env
   ```

5. **Seed the database** (creates demo users and ~70 financial records)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev     # Development (with auto-reload)
   npm start       # Production
   ```

7. **Access the API**
   - API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/api/health`

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@zorvyn.com | admin123 |
| Analyst | analyst@zorvyn.com | analyst123 |
| Viewer | viewer@zorvyn.com | viewer123 |

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Bearer Token |

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paginated, filterable by role/status) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Activate/deactivate user |

### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/records` | List records (filtered, paginated, sorted) | All roles |
| GET | `/api/records/:id` | Get single record | All roles |
| POST | `/api/records` | Create record | Admin |
| PUT | `/api/records/:id` | Update record | Admin |
| DELETE | `/api/records/:id` | Soft-delete record | Admin |

**Query Parameters for GET /api/records:**
- `type` — `income` or `expense`
- `category` — partial match (case-insensitive)
- `startDate` / `endDate` — date range filter (ISO 8601)
- `sortBy` — `date`, `amount`, or `createdAt`
- `sortOrder` — `asc` or `desc`
- `page` / `limit` — pagination

### Dashboard Analytics (Admin & Analyst)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance |
| GET | `/api/dashboard/category-totals` | Breakdown by category and type |
| GET | `/api/dashboard/trends` | Monthly income/expense trends (12 months) |
| GET | `/api/dashboard/recent-activity` | Last N records (`?limit=10`) |

> **Full interactive documentation available at** `http://localhost:3000/api-docs`

---

## Access Control Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Access dashboard analytics | ❌ | ✅ | ✅ |
| Create/update/delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

Access control is enforced at the middleware level using `authenticate` (JWT verification) and `authorize(...roles)` (role checking). Every protected route explicitly declares which roles are allowed.

---

## Data Models

### User

```javascript
{
  email:        String,   // unique, required
  passwordHash: String,   // bcrypt hashed, excluded from API responses
  name:         String,   // required
  role:         String,   // 'admin' | 'analyst' | 'viewer'
  status:       String,   // 'active' | 'inactive'
  createdAt:    Date,     // auto-managed
  updatedAt:    Date      // auto-managed
}
```

### Financial Record

```javascript
{
  amount:      Number,    // required, positive
  type:        String,    // 'income' | 'expense'
  category:    String,    // required
  date:        Date,      // required
  description: String,    // optional
  createdBy:   ObjectId,  // reference to User
  isDeleted:   Boolean,   // soft delete flag (default: false)
  createdAt:   Date,      // auto-managed
  updatedAt:   Date       // auto-managed
}
```

**Indexes:** `type`, `category`, `date`, `createdBy`, `isDeleted` — optimized for common query patterns.

**Soft Delete:** Records are never permanently removed. A Mongoose query middleware automatically filters out `isDeleted: true` records from all `find` operations.

---

## Design Decisions & Assumptions

1. **Controller → Service pattern** — Controllers handle HTTP concerns only. Services contain business logic and interact with Mongoose models. No separate repository layer since Mongoose already serves as the data access layer.

2. **No hardcoded values** — All configuration (port, JWT secret, token expiry, DB URI, rate limits) comes from environment variables via `src/config/environment.js`.

3. **Soft delete for financial records** — Records are marked `isDeleted: true` rather than permanently removed. This is standard in finance systems for audit trail purposes.

4. **Default role is `viewer`** — New users register as `viewer`. Only an admin can promote users to `analyst` or `admin`.

5. **Safety checks on user management** — An admin cannot change their own role or deactivate their own account (prevents accidental lockout).

6. **MongoDB aggregation for analytics** — Dashboard endpoints use MongoDB's aggregation pipeline for server-side computation rather than fetching all records to the application layer.

7. **Generic login error messages** — Login returns "Invalid email or password" for both wrong email and wrong password to prevent user enumeration.

8. **Stricter rate limiting on auth routes** — Auth endpoints have a separate, more restrictive rate limiter (20 requests per 15 minutes) to prevent brute-force attacks.

9. **ISO 8601 dates** — All dates are stored and accepted in ISO 8601 format.

10. **SQLite-portable schema** — While MongoDB is used, the data model is structured relationally (with references) and could be adapted to a SQL database if needed.

---

## Running Tests

Tests use a separate MongoDB database (`zorvyn_finance_test`) to avoid affecting development data.

```bash
# Run all tests
npm test

# Run with verbose output
npx jest --runInBand --forceExit --verbose
```

**Test coverage (33 tests):**
- **Auth** — Registration (success, duplicate, validation), Login (success, wrong password, inactive user), Profile retrieval
- **Records** — CRUD operations, RBAC enforcement, filtering, pagination, soft delete
- **Dashboard** — Summary totals, category breakdowns, trends, recent activity, role-based access denial

---

## Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

The global error handler maps specific error types to appropriate HTTP status codes:

| Error Type | Status Code |
|-----------|-------------|
| Validation error (Joi / Mongoose) | 400 |
| Missing or invalid JWT | 401 |
| Insufficient role permissions | 403 |
| Resource not found | 404 |
| Duplicate key (e.g., email) | 409 |
| Rate limit exceeded | 429 |
| Internal server error | 500 |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run in production mode |
| Dev | `npm run dev` | Run with nodemon (auto-reload) |
| Seed | `npm run seed` | Populate database with demo data |
| Test | `npm test` | Run all integration tests |
