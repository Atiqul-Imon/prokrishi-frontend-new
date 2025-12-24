# ImageKit CDN Setup Guide

This project uses ImageKit CDN for image optimization and delivery instead of Vercel's image optimization.

## Features

- ✅ Automatic image optimization (WebP/AVIF conversion)
- ✅ Responsive image sizing
- ✅ Quality optimization
- ✅ Global CDN delivery (750+ nodes)
- ✅ Real-time transformations
- ✅ Automatic format conversion based on browser support

## Setup Instructions

### 1. Create ImageKit Account

1. Go to [https://imagekit.io](https://imagekit.io)
2. Sign up for a free account
3. Create a new media library

### 2. Get Your ImageKit Credentials

1. Go to [ImageKit Dashboard](https://imagekit.io/dashboard/developer/api-keys)
2. Copy your **URL Endpoint** (e.g., `https://ik.imagekit.io/your_imagekit_id`)
3. Copy your **Public Key** (optional, for client-side operations)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
```

### 4. Upload Images to ImageKit

You have two options:

#### Option A: Use ImageKit as Origin Storage
- Upload images directly to ImageKit
- Images will be served from ImageKit CDN

#### Option B: Use External Storage (S3, etc.)
- Configure ImageKit to pull from your existing storage
- Images will be cached and optimized by ImageKit

## Usage

### Using ImageKitImage Component

The `ImageKitImage` component automatically handles ImageKit transformations:

```tsx
import ImageKitImage from "@/components/ui/ImageKitImage";

// Product image
<ImageKitImage
  src={product.image}
  alt={product.name}
  imageType="product"
  size="medium"
  quality={85}
/>

// Category image
<ImageKitImage
  src={category.image}
  alt={category.name}
  imageType="category"
  size="medium"
/>

// Custom image
<ImageKitImage
  src={imageUrl}
  alt="Custom image"
  imageType="custom"
  width={600}
  height={400}
  quality={90}
  format="auto"
/>
```

### Using ImageKit Utility Functions

For more control, use the utility functions directly:

```tsx
import { getImageKitUrl, getProductImageUrl } from "@/app/utils/imagekit";

// Get optimized product image URL
const imageUrl = getProductImageUrl(product.image, 'medium');

// Get custom transformation URL
const customUrl = getImageKitUrl(imageUrl, {
  width: 600,
  height: 400,
  quality: 85,
  format: 'auto',
  crop: 'maintain_ratio',
});
```

## Image Types and Sizes

### Product Images
- `thumbnail`: 150x150px, quality 75
- `small`: 300x300px, quality 80
- `medium`: 600x600px, quality 85 (default)
- `large`: 1200x1200px, quality 90

### Category Images
- `small`: 64x64px, quality 80
- `medium`: 96x96px, quality 85 (default)
- `large`: 128x128px, quality 90

## Transformation Parameters

- `width`: Image width in pixels
- `height`: Image height in pixels
- `quality`: 1-100 (default: 80)
- `format`: `auto`, `webp`, `avif`, `jpg`, `png`
- `crop`: `maintain_ratio`, `at_max`, `at_least`, `force`
- `focus`: `auto`, `center`, `top`, `left`, `bottom`, `right`, etc.
- `blur`: 1-100
- `brightness`: -100 to 100
- `contrast`: -100 to 100
- `saturation`: -100 to 100

## Migration from Vercel Image Optimization

The following changes were made:

1. ✅ Disabled Vercel image optimization (`unoptimized: true`)
2. ✅ Added ImageKit domain to `remotePatterns`
3. ✅ Created `ImageKitImage` component wrapper
4. ✅ Updated components to use ImageKit:
   - `ProductCard.tsx`
   - `FeaturedCategories.tsx`
   - `SwipeableImageGallery.tsx`

## Benefits

- **Cost**: Free tier includes 20GB bandwidth/month
- **Performance**: 750+ CDN nodes globally
- **Features**: Real-time transformations, automatic format conversion
- **Flexibility**: Works with any hosting platform
- **Scalability**: Handles high traffic efficiently

## Troubleshooting

### Images not loading
1. Check that `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is set correctly
2. Verify images are uploaded to ImageKit or storage is configured
3. Check browser console for CORS errors

### Images not optimized
1. Ensure ImageKit URL endpoint is configured
2. Check that image URLs are being transformed through ImageKit
3. Verify transformations are applied in the URL

### Build errors
1. Make sure all environment variables are set
2. Check that ImageKit utility functions are imported correctly
3. Verify TypeScript types are correct

## Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [ImageKit Dashboard](https://imagekit.io/dashboard)
- [ImageKit Pricing](https://imagekit.io/pricing)






