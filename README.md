# Crypto Investment Platform

A modern cryptocurrency investment platform built with React + Tailwind CSS (frontend), Node.js + Express (backend), and PostgreSQL (database).

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide React
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (via pg), JWT, bcrypt
- **Database:** PostgreSQL (compatible with Supabase)

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts (auth)
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   └── ...
├── server/          # Express backend
│   ├── src/
│   │   ├── config/       # Environment & database config
│   │   ├── middleware/    # Auth, rate limiting, validation
│   │   ├── routes/       # API route handlers
│   │   ├── models/       # SQL schemas
│   │   └── utils/        # Helpers
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a Supabase project)

### 1. Install Dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Set Up Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your database credentials
```

### 3. Set Up Database

```bash
npm run db:setup
```

This runs `server/src/models/schema.sql` against your PostgreSQL database.

### 4. Start Development Servers

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) concurrently.

### Frontend: http://localhost:5173
### Backend API: http://localhost:5000/api

## Demo Mode

The platform uses realistic demo/mock data. All simulated transactions are clearly labeled. No real cryptocurrency processing or wallet key storage occurs.

## Important Disclaimers

- This platform is for **educational and demonstration purposes**
- All displayed returns are **illustrative only** and not guaranteed
- Cryptocurrency investments carry significant risk and can lose value
- Do not fabricate deposits, withdrawals, balances, profits, testimonials, licenses, or regulatory approvals
- Terms of Service, Privacy Policy, Risk Disclosure, and Contact pages are included

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (user/admin)
- Rate limiting on API endpoints
- Input validation
- HTTPS-ready
- No private key storage

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd client && npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render/Fly.io)

```bash
cd server && npm run build
# Deploy with NODE_ENV=production
# Set environment variables for database URL, JWT secret, etc.
```

### Database

- **Supabase:** Create a project, use the connection string in `.env`
- **Self-hosted PostgreSQL:** Run `schema.sql` to initialize tables

## License

MIT
