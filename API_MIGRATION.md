# API Migration to NestJS Backend

## ✅ Migration Complete

The frontend has been successfully migrated to use the NestJS backend API.

## 🔄 Endpoint Changes

### Updated Endpoints

| Old Endpoint (Express) | New Endpoint (NestJS) | Method | Notes |
|------------------------|----------------------|--------|-------|
| `/order/create` | `/order` | POST | Order creation |
| `/order/user` | `/order` | GET | User orders (JWT context) |
| `/order/validate` | `/cart/validate` | POST | Cart validation moved to cart module |
| `/cart/add` | `/cart` | POST | Add to cart |
| `/product/create` | `/product` | POST | Create product |
| `/category/create` | `/category` | POST | Create category |
| `/category/update/:id` | `/category/:id` | PUT | Update category |
| `/category/delete/:id` | `/category/:id` | DELETE | Delete category |
| `/category/featured` | `/category?featured=true` | GET | Featured categories |
| `/category/id/:id` | `/category/:id` | GET | Get category by ID |
| `/user/profile/addresses` | `/user/address` | POST | Add address |
| `/user/profile/addresses/:id` | `/user/address/:id` | PUT/DELETE | Update/Delete address |
| `/user/reset-password-email/:token` | `/user/reset-password-email/:token` | PUT | Changed from POST to PUT |
| `/user/reset-password-phone` | `/user/reset-password-phone` | PUT | Changed from POST to PUT |
| `/payment/create-session` | `/payment/cod/process` | POST | COD payment processing |
| `/payment/success` | `/payment/cod/confirm` | PUT | COD payment confirmation |

## 🔧 Configuration Changes

### API Base URL
- **Default Port**: Changed from `3500` to `3501` to match NestJS backend
- **Environment Variable**: `NEXT_PUBLIC_API_BASE_URL`
- **Default Value**: `http://localhost:3501/api`

### Updated Files
1. `app/utils/env.ts` - Default API base URL updated
2. `next.config.ts` - Environment variable default updated
3. `__tests__/setup.ts` - Test API URL updated
4. `README.md` - Documentation updated

## 📝 Payment Endpoints (COD Only)

The payment system has been updated to use COD-specific endpoints:

- **Process COD**: `POST /payment/cod/process`
- **Confirm COD**: `PUT /payment/cod/confirm`
- **Payment Status**: `GET /payment/status/:orderId`
- **COD Instructions**: `GET /payment/cod/instructions` (public)

## ⚠️ Breaking Changes

1. **Cart Validation**: Moved from `/order/validate` to `/cart/validate`
2. **Password Reset**: Changed from POST to PUT methods
3. **Address Management**: Endpoints changed from `/user/profile/addresses` to `/user/address`
4. **Category Endpoints**: Simplified paths (removed `/create`, `/update`, `/delete` prefixes)
5. **Payment**: Now uses COD-specific endpoints instead of generic payment endpoints

## 🚀 Next Steps

1. Ensure NestJS backend is running on port `3501`
2. Update `.env.local` if using custom port:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3501/api
   ```
3. Test all API endpoints to ensure compatibility
4. Remove any remaining references to old Express backend

## 📚 Related Documentation

- [NestJS Backend Migration Progress](../../backend-nestjs/MIGRATION_PROGRESS.md)
- [NestJS Backend Setup](../../backend-nestjs/README.md)

