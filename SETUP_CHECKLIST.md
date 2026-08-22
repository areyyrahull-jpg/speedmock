# ✅ SpeedMock Auth Setup Checklist



Follow this checklist to complete the authentication setup.

## Step 1: Prepare Supabase (5 min) 🗄️

- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Log in to your project
- [ ] Go to **SQL Editor**
- [ ] Run these SQL queries:

```sql
-- Users Table
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

-- Subscriptions Table (optional)
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

-- Free Credits Table (optional)
CREATE TABLE free_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  credits_remaining INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- [ ] Verify tables appear in **Table Editor**

## Step 2: Get Supabase Credentials (5 min) 🔑

- [ ] Go to **Project Settings** → **API**
- [ ] Copy `Project URL` (e.g., `https://sfrjyzkmzvpkdbofdmcr.supabase.co`)
- [ ] Copy `Service Role Secret` (for server/.env)
- [ ] Copy `Anon Public Key` (for client/.env.local)

## Step 3: Setup Redis (3 min) 🔴

- [ ] Go to [Upstash Console](https://console.upstash.com)
- [ ] Create a Redis database (Free tier is fine)
- [ ] Copy the connection URL (format: `redis://default:password@host:port`)

## Step 4: Configure Environment Variables (3 min) ⚙️

### Server Configuration
- [ ] Open `server/.env`
- [ ] Fill in:
  ```
  DATABASE_URL=postgresql://postgres:PASSWORD@sfrjyzkmzvpkdbofdmcr.supabase.co:5432/speedmock?sslmode=require
  UPSTASH_REDIS_URL=redis://default:PASSWORD@host:port
  JWT_SECRET=your-secret-key-change-this
  JWT_EXPIRY=7d
  SUPABASE_URL=https://sfrjyzkmzvpkdbofdmcr.supabase.co
  SUPABASE_SERVICE_KEY=eyJ...
  PORT=5000
  NODE_ENV=development
  FRONTEND_URL=http://localhost:5173
  CORS_ALLOWED_ORIGINS=http://localhost:5173
  ```

### Client Configuration
- [ ] Open `client/.env.local`
- [ ] Fill in:
  ```
  VITE_API_URL=http://localhost:5000/api
  VITE_SUPABASE_URL=https://sfrjyzkmzvpkdbofdmcr.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```

## Step 5: Install Dependencies (2 min) 📦

```bash
cd server
npm install bcryptjs jsonwebtoken pg ioredis dotenv cors
cd ..
cd client
npm install
```

- [ ] Installation completed without errors

## Step 6: Update App.jsx (2 min) 🎯

- [ ] Open `client/src/App.jsx`
- [ ] Add import: `import { AuthProvider } from "./context/AuthContext";`
- [ ] Wrap your app with `<AuthProvider>` (should wrap all other providers):

```jsx
<AuthProvider>
  <ThemeProvider>
    <LanguageProvider>
      <ExamProvider>
        {/* rest of app */}
      </ExamProvider>
    </LanguageProvider>
  </ThemeProvider>
</AuthProvider>
```

## Step 7: Test Backend (5 min) 🧪

- [ ] Open terminal in `server/` directory
- [ ] Run: `npm start`
- [ ] Verify output:
  ```
  ✅ Successfully connected to Supabase PostgreSQL
  ✅ Connected to Upstash Redis
  ✅ Server running on http://localhost:5000
  ```

## Step 8: Test Frontend (5 min) 🚀

- [ ] Open new terminal in `client/` directory
- [ ] Run: `npm run dev`
- [ ] Verify React app loads at `http://localhost:5173`

## Step 9: Test Login Flow (5 min) ✅

- [ ] Navigate to login page
- [ ] Enter a 10-digit phone number (e.g., `9876543210`)
- [ ] Enter password (e.g., `password123`)
- [ ] Click "Login to SpeedMock"

Expected behavior:
- [ ] If user doesn't exist: "This mobile number is not registered. Please create an account."
- [ ] If password is wrong: "Incorrect password. Please try again."
- [ ] If login succeeds: Redirected to dashboard, token stored in localStorage

## Step 10: Test Signup Flow (5 min) ✅

- [ ] Navigate to signup page
- [ ] Enter name, phone, password, email
- [ ] Click "Create Account"
- [ ] Click "Send OTP" - check server terminal for OTP
- [ ] Enter OTP in the input field
- [ ] Click "Verify & Create Account"

Expected behavior:
- [ ] Account created in Supabase
- [ ] Redirected to dashboard
- [ ] Token stored in localStorage

## Step 11: Verify Database (3 min) 📋

- [ ] Go to Supabase Dashboard
- [ ] Open **Table Editor** → **users**
- [ ] Verify your test account appears in the table
- [ ] Check that `password_hash` is encrypted (not plain text)

## 🎉 All Done!

Your SpeedMock authentication is now fully wired and ready to use!

### What's Working:
✅ User registration with OTP verification  
✅ Secure password hashing with bcryptjs  
✅ JWT-based authentication  
✅ Redis-backed OTP caching  
✅ React Context for global auth state  
✅ Protected API endpoints  
✅ Login/logout functionality  

### Next Steps (Optional):
- [ ] Implement forgot password flow
- [ ] Add email verification
- [ ] Setup real SMS provider (Twilio)
- [ ] Add rate limiting
- [ ] Deploy to production

---

**Stuck?** Check these files:
- `AUTH_SETUP_GUIDE.md` - Detailed setup guide
- `AUTH_INTEGRATION_STATUS.md` - What's been done & what's left
- Server logs - Check terminal for error messages

**Questions?** Check the Troubleshooting section in `AUTH_SETUP_GUIDE.md`

Good luck! 🚀
