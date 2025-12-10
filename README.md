# Prokrishi Frontend (New)

Modern Next.js frontend for Prokrishi e-commerce platform.

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Responsive Design** - Mobile-first approach
- **Cart Management** - Backend sync for logged-in users
- **Product Search & Filtering**
- **Category Browsing**
- **Order Management**
- **Cash on Delivery (COD)** payment method
- **Admin Dashboard**

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prokrishi-v2/frontend-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your API URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3500/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable:
     - `NEXT_PUBLIC_API_BASE_URL` = Your production API URL
   - Click Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
     ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3500/api` |

### Project Structure

```
frontend-new/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── account/           # User account pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   ├── context/           # React contexts (Auth, Cart)
│   └── utils/             # Utility functions
├── components/            # Reusable components
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── vercel.json           # Vercel configuration
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js
- Prettier recommended (optional)

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:
- `accessToken` - For API authentication
- `refreshToken` - For token refresh (if implemented)

## 🛒 Cart Management

- **Logged-in users**: Cart syncs with backend API
- **Guest users**: Cart stored in localStorage
- Automatic sync on add/update/remove operations

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Touch-friendly interactions

## 🐛 Troubleshooting

### Build Errors

- Ensure Node.js version is 18+
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### API Connection Issues

- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings in backend

### Cart Not Syncing

- Verify user is logged in
- Check browser console for errors
- Ensure backend cart API is accessible

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team/Contributors]

## 📞 Support

For issues and questions, please contact [support email] or create an issue in the repository.
