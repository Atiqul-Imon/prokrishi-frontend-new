# Vercel Setup Guide

Quick guide to deploy Prokrishi Frontend to Vercel.

## 🚀 Quick Start

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the repository containing `frontend-new`

### 2. Configure Project

**Root Directory:** `frontend-new`

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 3. Environment Variables

Add the following environment variable:

**Name:** `NEXT_PUBLIC_API_BASE_URL`  
**Value:** Your production backend API URL (e.g., `https://api.prokrishi.com/api`)  
**Environment:** Production, Preview, Development

### 4. Deploy

Click **"Deploy"** and wait for the build to complete.

## 📝 Environment Variables

### Required

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api.com/api` | Backend API URL |

### Optional

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.com` | Site URL for SEO |

## 🔧 Post-Deployment

1. **Test the deployment**
   - Visit the provided Vercel URL
   - Test key features (homepage, products, cart, checkout)

2. **Set up custom domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

3. **Enable Analytics** (optional)
   - Go to Project Settings → Analytics
   - Enable Vercel Analytics

## 🔄 Automatic Deployments

- **Production:** Deploys automatically on push to `main` branch
- **Preview:** Creates preview deployments for pull requests

## 🐛 Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure `package.json` has correct build script
4. Check that all dependencies are in `package.json`

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Check backend CORS settings allow Vercel domain
3. Test API endpoint directly

### Environment Variables Not Working

1. Ensure variable name starts with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding/changing variables
3. Check variable is set for correct environment (Production/Preview)

## 📊 Monitoring

- View deployment logs in Vercel dashboard
- Check Analytics for performance metrics
- Monitor errors in Vercel dashboard

## 🔐 Security

- Environment variables are encrypted
- HTTPS is automatically enabled
- Security headers configured in `vercel.json`

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

