# Internal Tech Issue & Feature Tracker

A robust REST API for managing issues with user authentication, role-based access control, and comprehensive issue management features.

## 🌐 Live URL

- **Development**: `http://localhost:PORT` (Configure PORT in `.env` file)
- **Base API URL**: `http://localhost:PORT/api`

## ✨ Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Role-Based Access Control**: Support for different user roles (contributor, maintainer)
- **Issue Management**: Create, read, update, and delete issues
- **Issue Tracking**: Track issue status (open, in_progress, resolved)
- **Issue Classification**: Categorize issues by type
- **Error Handling**: Comprehensive global error handling
- **Input Validation**: Data validation for all API requests
- **Security**: Password hashing with bcrypt and JWT authentication

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express 5.2.1 |
| **Language** | TypeScript 6.0.3 |
| **Database** | PostgreSQL 8.21.0 |
| **Authentication** | JWT (jsonwebtoken 9.0.3) |
| **Security** | Bcrypt 6.0.0 |
| **HTTP Utilities** | http-status-codes 2.3.0 |
| **Parser** | Cookie-parser 1.4.7 |
| **Dev Tools** | tsx 4.22.3, TypeScript 6.0.3 |

## 📋 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm

### Installation Steps

1. **Clone the repository** 
   ```bash
   git clone https://github.com/rakib-hossain32/next-level-assignment-2.git
   cd assignment-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/issue_tracker_db
   SECRET=your_jwt_secret_key
   REFRESH_SECRET=your_refresh_token_secret
   ```

4. **Set up the database**
   
   The database tables will be automatically created on the first server start:
   - `users` table (for user management)
   - `issues` table (for issue tracking)

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The server will start on the configured PORT and display:
   ```
   assignment server is running port - 5000
   Database connected successfully!
   ```

6. **Verify the server is running**
   
   Make a GET request to the root endpoint:
   ```bash
   curl http://localhost:5000/
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "Assignment Server is running..."
   }
   ```

## 📡 API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Create a new user account | ❌ No |
| POST | `/api/auth/login` | Authenticate user and get JWT token | ❌ No |

**Request Body - Signup:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Body - Login:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Issue Management Endpoints (`/api/issues`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|--------|-------|
| POST | `/api/issues` | Create a new issue | ✅ Yes | Contributor, Maintainer |
| GET | `/api/issues` | Get all issues | ❌ No | - |
| GET | `/api/issues/:id` | Get issue by ID | ❌ No | - |
| PATCH | `/api/issues/:id` | Update an issue | ✅ Yes | Owner, Maintainer |
| DELETE | `/api/issues/:id` | Delete an issue | ✅ Yes | Owner, Maintainer |

**Request Body - Create Issue:**
```json
{
  "title": "Login page not responsive",
  "description": "The login page displays incorrectly on mobile devices. Needs responsive design implementation.",
  "type": "bug",
  "reporter_id": 1
}
```

**Request Body - Update Issue:**
```json
{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "type": "feature",
  "status": "in_progress"
}
```

## 🗄️ Database Schema Summary

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(40) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(15) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique user identifier (auto-increment)
- `name`: User's full name (required, max 40 chars)
- `email`: User's email address (required, unique, max 40 chars)
- `password`: Hashed password (required)
- `role`: User role - either 'contributor' or 'maintainer' (default: 'contributor')
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Issues Table

```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT CHECK (LENGTH(description) >= 20),
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
  reporter_id INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique issue identifier (auto-increment)
- `title`: Issue title (required, max 150 chars)
- `description`: Detailed issue description (required, min 20 chars)
- `type`: Issue type/category (required, max 20 chars)
- `status`: Issue status - 'open', 'in_progress', or 'resolved' (default: 'open')
- `reporter_id`: ID of the user who reported the issue
- `created_at`: Issue creation timestamp
- `updated_at`: Last update timestamp

## 🚀 Available Scripts

```bash
# Development server with auto-reload
npm run dev

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/
│   └── env.ts             # Environment configuration
├── db/
│   └── database.ts        # Database initialization
├── middleware/
│   ├── globalErrorHandler.ts
│   ├── issueCreate.ts
│   ├── issueDelete.ts
│   ├── issueUpdate.ts
│   └── index.d.ts
├── modules/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.interface.ts
│   │   ├── user.route.ts
│   │   └── user.service.ts
│   └── issue/
│       ├── issue.controller.ts
│       ├── issue.interface.ts
│       ├── issue.route.ts
│       └── issue.service.ts
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/
    └── sendResponse.ts    # Response formatting utilities
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication for protected routes
- **Role-Based Access Control**: Middleware to check user roles
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes


## 📝 Example Usage

### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

### 3. Create Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Database connection issue",
    "description": "The application fails to connect to the PostgreSQL database on startup",
    "type": "bug",
    "reporter_id": 1
  }'
```

### 4. Get All Issues
```bash
curl http://localhost:5000/api/issues
```

### 5. Update Issue
```bash
curl -X PATCH http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "in_progress"
  }'
```

### 6. Delete Issue
```bash
curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "Authorization: Bearer <token>"
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change the PORT in `.env` file or kill the process using the port |
| Database connection error | Verify PostgreSQL is running and DATABASE_URL is correct in `.env` |
| JWT token expired | Get a new token by logging in again |
| Module not found | Run `npm install` to install all dependencies |

