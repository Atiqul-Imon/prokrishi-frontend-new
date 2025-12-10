# Deployment Guide - Prokrishi Frontend

This guide covers deploying the Prokrishi frontend to Vercel.

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare Your Code

1. **Ensure all changes are committed**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verify build works locally**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend-new
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No** (first time) or **Yes** (updates)
   - Project name? **prokrishi-frontend** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. **Set environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_BASE_URL
   # Enter your production API URL when prompted
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import your GitHub repository**
   - Select your repository
   - Choose the `frontend-new` directory as root

4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `frontend-new`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     Name: NEXT_PUBLIC_API_BASE_URL
     Value: https://your-backend-api.com/api
     Environment: Production, Preview, Development
     ```

6. **Click "Deploy"**

### Step 3: Post-Deployment

1. **Verify deployment**
   - Check the deployment URL provided by Vercel
   - Test key features:
     - Homepage loads
     - Products display
     - Cart works
     - Checkout process

2. **Set up custom domain** (optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Enable Analytics** (optional)
   - Go to Project Settings → Analytics
   - Enable Vercel Analytics

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://api.prokrishi.com/api` |

### Setting in Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable for:
   - **Production** - Live site
   - **Preview** - PR previews
   - **Development** - Local development (optional)

## 📋 Pre-Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Backend API is accessible from Vercel
- [ ] CORS configured in backend for Vercel domain
- [ ] No console errors in development
- [ ] Responsive design tested
- [ ] Key features tested (cart, checkout, auth)

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
- Check all imports are correct
- Verify `node_modules` is not in `.gitignore` incorrectly
- Run `npm install` locally to verify dependencies

**Error: Type errors**
- Run `npm run type-check` locally
- Fix all TypeScript errors before deploying

**Error: Environment variable not found**
- Ensure variables are set in Vercel dashboard
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables

### Runtime Errors

**API connection fails**
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check backend CORS settings
- Ensure backend is accessible from Vercel's servers

**Cart not working**
- Check browser console for errors
- Verify authentication tokens are being stored
- Check backend cart API endpoints

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics to identify bottlenecks
- Check image optimization
- Review bundle size with `npm run build` output

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deployment:
1. Go to Project Settings → Git
2. Configure deployment settings

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Logs**: View in Vercel dashboard under "Deployments"
- **Real-time**: Check deployment status in dashboard

## 🔐 Security

- Environment variables are encrypted
- Never commit `.env.local` files
- Use Vercel's environment variable management
- Enable security headers (already configured in `vercel.json`)

## 📝 Notes

- Vercel automatically optimizes Next.js apps
- Edge functions available for better performance
- Automatic HTTPS enabled
- Global CDN included

## 🆘 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- Contact: [Your support email]

