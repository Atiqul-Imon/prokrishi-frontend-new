# Code Organization & Refactoring Plan

## Analysis Summary

**Largest Files (Candidates for Refactoring):**
1. `app/admin/products/edit/[id]/page.tsx` - 1,095 lines
2. `app/admin/products/add/page.tsx` - 968 lines
3. `app/checkout/page.tsx` - 680 lines
4. `app/admin/fish/products/edit/[id]/page.tsx` - 650 lines
5. `app/admin/orders/page.tsx` - 596 lines

**Common Patterns Identified:**
- Image upload logic (primary + gallery) - duplicated in 4+ files
- Form input fields with similar styling - 19+ instances
- Delete confirmation modals - 30+ instances
- Variant/size category management - duplicated in product pages
- Table/list components - similar across admin pages
- Error message displays - repeated pattern

---

## Phase 1: Extract Reusable Form Components

### 1.1 Form Input Component
**Location:** `components/admin/FormInput.tsx`
**Purpose:** Standardized form input with label, error handling, and Nexus styling
**Used in:** All admin form pages

### 1.2 Form Select Component
**Location:** `components/admin/FormSelect.tsx`
**Purpose:** Standardized select dropdown with label and styling
**Used in:** Category selection, status selection, etc.

### 1.3 Form Textarea Component
**Location:** `components/admin/FormTextarea.tsx`
**Purpose:** Standardized textarea with label and styling
**Used in:** Description fields, notes, etc.

---

## Phase 2: Extract Image Upload Components

### 2.1 ImageUpload Component
**Location:** `components/admin/ImageUpload.tsx`
**Purpose:** Single image upload with preview and remove functionality
**Used in:** Primary image uploads in product/category pages

### 2.2 GalleryUpload Component
**Location:** `components/admin/GalleryUpload.tsx`
**Purpose:** Multiple image upload with preview grid and remove functionality
**Used in:** Product gallery images

---

## Phase 3: Extract Variant Management Components

### 3.1 VariantManager Component
**Location:** `components/admin/VariantManager.tsx`
**Purpose:** Manage product variants (add, edit, remove, set default)
**Used in:** Product add/edit pages

### 3.2 SizeCategoryManager Component
**Location:** `components/admin/SizeCategoryManager.tsx`
**Purpose:** Manage fish product size categories
**Used in:** Fish product add/edit pages

---

## Phase 4: Extract Modal/Dialog Components

### 4.1 ConfirmDialog Component
**Location:** `components/admin/ConfirmDialog.tsx`
**Purpose:** Reusable confirmation dialog for delete/action confirmations
**Used in:** All admin pages with delete functionality

### 4.2 ErrorAlert Component
**Location:** `components/admin/ErrorAlert.tsx`
**Purpose:** Standardized error message display
**Used in:** All admin pages

---

## Phase 5: Extract Table/List Components

### 5.1 AdminTable Component
**Location:** `components/admin/AdminTable.tsx`
**Purpose:** Reusable table with sorting, pagination, selection
**Used in:** Products, orders, customers, categories lists

### 5.2 AdminTableRow Component
**Location:** `components/admin/AdminTableRow.tsx`
**Purpose:** Standardized table row with actions
**Used in:** All admin table pages

---

## Phase 6: Create Shared Admin Layouts

### 6.1 AdminPageHeader Component
**Location:** `components/admin/AdminPageHeader.tsx`
**Purpose:** Standardized page header with title, description, and action buttons
**Used in:** All admin pages

### 6.2 AdminFormLayout Component
**Location:** `components/admin/AdminFormLayout.tsx`
**Purpose:** Standardized form page layout with sections
**Used in:** All admin add/edit pages

---

## Phase 7: Add Barrel Exports

### 7.1 Create index.ts files
- `components/admin/index.ts` - Export all admin components
- `components/ui/index.ts` - Export all UI components
- `app/utils/index.ts` - Export all utilities

---

## Implementation Order

1. **Phase 1** - Form components (foundation for all forms)
2. **Phase 4** - Modal components (used everywhere)
3. **Phase 2** - Image upload components (high duplication)
4. **Phase 3** - Variant management (complex logic)
5. **Phase 5** - Table components (large impact)
6. **Phase 6** - Layout components (polish)
7. **Phase 7** - Barrel exports (cleanup)

---

## Expected Benefits

- **Reduced Code:** ~30-40% reduction in duplicate code
- **Faster Development:** New admin pages can reuse components
- **Easier Maintenance:** Fix bugs in one place
- **Consistency:** All admin pages use same components
- **Better Testing:** Test components once, use everywhere

