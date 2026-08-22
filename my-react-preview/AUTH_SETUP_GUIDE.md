# 🔐 SpeedMock Authentication Setup Guide

## Overview
SpeedMock uses **Supabase PostgreSQL + Upstash Redis + JWT** for secure authentication with OTP verification.

---

## 📦 Required Packages

### Backend
```bash
cd server
npm install bcryptjs jsonwebtoken pg ioredis dotenv express cors
```

### Frontend
```bash
cd client
npm install axios  # or fetch (already included)
```

---

## 🗄️ Supabase Setup

### 1. Create Required Tables

Log in to [Supabase Dashboard](https://app.supabase.com) and run these SQL queries:

#### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(10) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_email ON users(email);
```

#### Subscriptions Table (Optional)
```sql
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

#### Free Credits Table (Optional)
```sql
CREATE TABLE free_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  credits_remaining INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Get Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Secret` → `SUPABASE_SERVICE_KEY` (backend only)
   - `Anon Public Key` → `VITE_SUPABASE_ANON_KEY` (frontend only)

---

## 🔴 Redis Setup (Upstash)

### 1. Create Upstash Account
- Go to [Upstash Console](https://console.upstash.com)
- Create a new Redis database
- Copy the URL (format: `redis://:password@host:port`)

### 2. Configure Environment
Add to `.env`:
```
UPSTASH_REDIS_URL=redis://default:password@host:6379
```

---

## 🔑 Environment Variables

### Server (`.env`)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@sfrjyzkmzvpkdbofdmcr.supabase.co:5432/speedmock?sslmode=require

# Redis
UPSTASH_REDIS_URL=redis://default:password@host:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Supabase
SUPABASE_URL=https://sfrjyzkmzvpkdbofdmcr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Client (`.env.local`)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://sfrjyzkmzvpkdbofdmcr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 🚀 Running the App

### 1. Start Backend
```bash
cd server
npm install
npm start  # or npm run dev
```

Expected output:
```
✅ Successfully connected to Supabase PostgreSQL
✅ Connected to Upstash Redis
✅ Server running on http://localhost:5000
```

### 2. Start Frontend
```bash
cd client
npm install
npm run dev
```

Expected: React app runs on `http://localhost:5173`

---

## 🔄 Authentication Flow

### Registration
1. User enters name, mobile, password, email
2. **Send OTP** → OTP stored in Redis (2 min expiry)
3. User enters 6-digit OTP
4. **Verify OTP & Register** → User saved to Supabase, JWT token returned
5. Token + User stored in localStorage

### Login
1. User enters mobile + password
2. **Verify Password** → Compare with hashed password in Supabase
3. JWT token returned
4. Token stored in localStorage
5. Redirect to dashboard

### Protected Routes
- Add middleware: `authenticateToken` (checks JWT validity)
- Attach token: `Authorization: Bearer <token>` header

---

## 📝 API Endpoints

All endpoints prefixed with `/api/auth`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/check-mobile` | Check if mobile is registered |
| POST | `/send-otp` | Send OTP for registration |
| POST | `/register` | Register with OTP |
| POST | `/login` | Login with mobile + password |
| POST | `/send-recovery-otp` | Send OTP for password reset |
| POST | `/verify-recovery-otp` | Verify recovery OTP |
| POST | `/reset-password` | Reset password with token |
| GET | `/me` | Get current user (requires auth) |
| POST | `/logout` | Logout user |

---

## 🎯 Frontend Integration

### Using Auth Context
```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### Using Auth Service Directly
```javascript
import authService from "../services/authService";

// Login
const result = await authService.login("9876543210", "password");
// result.token, result.user

// Check if authenticated
if (authService.isAuthenticated()) {
  // Show dashboard
}

// Logout
authService.logout();
```

---

## 🧪 Testing

### Test Registration (with Mock SMS)
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Look for OTP in server terminal output
# Then:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "mobile":"9876543210",
    "password":"securepass123",
    "email":"john@example.com",
    "otp":"123456"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","password":"securepass123"}'
```

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string in production
- [ ] Set `NODE_ENV=production` on live server
- [ ] Use HTTPS in production (not HTTP)
- [ ] Implement rate limiting on OTP endpoints
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Store sensitive data (passwords) hashed in database
- [ ] Never commit `.env` file to git
- [ ] Rotate `SUPABASE_SERVICE_KEY` regularly

---

## 📞 SMS Provider (Optional)

Currently uses **Mock SMS** (prints to terminal). To integrate real SMS:

1. Update `server/src/services/otp.services.js`:
```javascript
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (mobile, message) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${mobile}`
  });
};
```

2. Add Twilio credentials to `.env`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check DATABASE_URL and Redis URL in .env |
| "Invalid JWT" | Ensure JWT_SECRET matches between login/auth |
| "CORS error" | Add frontend URL to CORS_ALLOWED_ORIGINS |
| "OTP expired" | OTP expires after 2 minutes, request new one |
| "Mobile already registered" | Use different phone number or reset in Supabase |

---

## 📚 Files Created/Modified

### New Files
- `server/src/config/supabase.js`
- `server/src/routes/auth.routes.js`
- `server/src/middleware/validate.middleware.js`
- `client/src/services/authService.js`
- `client/src/context/AuthContext.jsx`
- `server/.env.example`
- `client/.env.example`

### Modified Files
- `server/server.js` - Cleaned up, integrated routes
- `server/src/controllers/auth.controller.js` - Added logging
- `client/src/pages/auth/speedmocklogin.jsx` - Wired to auth service

---

## ✅ Next Steps

1. ✅ Supabase tables created
2. ✅ Redis configured
3. ✅ Backend auth endpoints wired
4. ✅ Frontend auth service created
5. ⏳ Update signup component to use authService
6. ⏳ Create protected route wrapper
7. ⏳ Add AuthProvider to App.jsx
8. ⏳ Update dashboard to require authentication

---

Generated: June 16, 2026
