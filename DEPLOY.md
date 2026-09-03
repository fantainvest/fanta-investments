# Fanta Investments — Deployment Guide

## Architecture
- **Frontend**: React + Vite → Deployed on Vercel/Netlify
- **Backend**: Express + SQLite → Deployed on Railway
- **Database**: SQLite (file-based, persists on Railway)
- **Payments**: Stripe (Card) + PayPal

## Prerequisites
1. [Vercel/Netlify account](https://vercel.com) (free tier works)
2. [Railway account](https://railway.app) ($5 free credit/month)
3. [Stripe account](https://dashboard.stripe.com) (free to sign up)
4. [PayPal Developer account](https://developer.paypal.com) (free to sign up)

## Step 1: Push to GitHub
```bash
cd "your-project-dir"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fanta-investments.git
git push -u origin main
```

## Step 2: Set Up Stripe
1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your **Secret Key** from Developers → API Keys
3. For production, also set up Stripe Webhooks:
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-railway-url/api/deposits/stripe-webhook`
   - Events: `checkout.session.completed`

## Step 3: Set Up PayPal
1. Sign up at [developer.paypal.com](https://developer.paypal.com)
2. Create an app → get **Client ID** and **Secret**
3. Set mode to `live` for real payments

## Step 4: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Set Root Directory to `server`
3. Add Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate a strong random key>
   CORS_ORIGIN=*
   PORT=5000
   STRIPE_SECRET_KEY=sk_live_<your-stripe-secret-key>
   STRIPE_SUCCESS_URL=https://your-vercel-url/deposit?success=true
   STRIPE_CANCEL_URL=https://your-vercel-url/deposit?cancelled=true
   PAYPAL_CLIENT_ID=<your-paypal-client-id>
   PAYPAL_CLIENT_SECRET=<your-paypal-secret>
   PAYPAL_MODE=live
   PAYPAL_RETURN_URL=https://your-vercel-url/deposit?success=true
   PAYPAL_CANCEL_URL=https://your-vercel-url/deposit?cancelled=true
   ```

## Step 5: Deploy Frontend
1. Deploy `client/` to Vercel/Netlify with:
   ```
   VITE_API_URL=https://your-railway-url/api
   ```
2. Update Stripe/PayPal success/cancel URLs in Railway env vars to point to your frontend URL

## Step 6: Verify
1. Open your frontend URL
2. Test login with demo credentials:
   - User: `demo@fanta.io` / `password123`
   - Admin: `admin@fanta.io` / `password123`
3. Test Card deposit → should redirect to Stripe Checkout
4. Test PayPal deposit → should redirect to PayPal
5. Admin dashboard → confirm deposits and credit users

## Demo Credentials
- **User**: demo@fanta.io / password123
- **Admin**: admin@fanta.io / password123

## Notes
- SQLite database persists on Railway between deploys
- For production, set a strong `JWT_SECRET` and restrict `CORS_ORIGIN`
- Card deposits auto-confirm via Stripe webhook
- PayPal deposits auto-confirm after user completes payment
- Airtel Money deposits require admin confirmation
