# Feature Cards Setup Guide

## What Was Created

I've set up the system to allow you to customize the 3 feature cards (Secure, Instant, Support) that appear under product images.

## Files Created/Modified

### 1. Database Migration
**File:** `scripts/add_feature_cards.sql`

Run this SQL in your Supabase SQL Editor to add the feature_cards column:

```sql
-- This adds the feature_cards column with default values
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS feature_cards JSONB DEFAULT '[
  {
    "icon": "Shield",
    "title": "Secure",
    "description": "SSL Protected"
  },
  {
    "icon": "Zap",
    "title": "Instant",
    "description": "Auto Delivery"
  },
  {
    "icon": "Users",
    "title": "Support",
    "description": "24/7 Available"
  }
]'::jsonb;
```

### 2. Product Detail Component
**File:** `components/product-detail-client.tsx`

✅ Updated to read feature cards from product data
✅ Falls back to default cards if none are set
✅ Supports 3 icon types: Shield, Zap, Users

### 3. Feature Cards Editor Component
**File:** `components/admin/edit-product-feature-cards.tsx`

A ready-to-use component for editing feature cards in the admin panel with:
- Live preview of each card
- Icon selector (Shield, Zap, Users)
- Title and description inputs
- Add/Remove cards (max 3)

## How to Add to Admin Panel

### Option 1: Quick Integration (Recommended)

Add this to your product edit form in `app/mgmt-x9k2m7/products/page.tsx`:

1. Import the component at the top:
```typescript
import { EditProductFeatureCards } from "@/components/admin/edit-product-feature-cards";
```

2. Add feature cards state to your form data:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  featureCards: [
    { icon: "Shield", title: "Secure", description: "SSL Protected" },
    { icon: "Zap", title: "Instant", description: "Auto Delivery" },
    { icon: "Users", title: "Support", description: "24/7 Available" }
  ]
});
```

3. Add the editor in your edit modal (after gallery or other fields):
```typescript
<EditProductFeatureCards
  featureCards={formData.featureCards}
  onChange={(cards) => setFormData({ ...formData, featureCards: cards })}
/>
```

4. Update your save function to include feature_cards:
```typescript
await supabase
  .from("products")
  .update({
    // ... other fields
    feature_cards: formData.featureCards
  })
  .eq("id", productId);
```

### Option 2: Manual JSON Editing

You can also edit feature cards directly in Supabase:

1. Go to Supabase → Table Editor → products
2. Find the product you want to edit
3. Edit the `feature_cards` column with JSON:

```json
[
  {
    "icon": "Shield",
    "title": "Secure",
    "description": "SSL Protected"
  },
  {
    "icon": "Zap",
    "title": "Instant",
    "description": "Auto Delivery"
  },
  {
    "icon": "Users",
    "title": "Support",
    "description": "24/7 Available"
  }
]
```

## Available Icons

- **Shield** - For security/protection features
- **Zap** - For speed/instant features  
- **Users** - For support/community features

## Example Customizations

### Gaming Cheat Product
```json
[
  {
    "icon": "Shield",
    "title": "Undetected",
    "description": "Safe & Secure"
  },
  {
    "icon": "Zap",
    "title": "Instant",
    "description": "Auto Delivery"
  },
  {
    "icon": "Users",
    "title": "Support",
    "description": "24/7 Discord"
  }
]
```

### HWID Spoofer Product
```json
[
  {
    "icon": "Shield",
    "title": "Protected",
    "description": "Ban Prevention"
  },
  {
    "icon": "Zap",
    "title": "Fast",
    "description": "One-Click Setup"
  },
  {
    "icon": "Users",
    "title": "Help",
    "description": "Live Support"
  }
]
```

## Testing

1. Run the SQL migration
2. Edit a product's feature_cards in Supabase
3. View the product page - you should see your custom cards
4. If no cards are set, default cards will show automatically

## Notes

- Maximum 3 cards per product
- Cards are optional - defaults will show if not set
- Icons are limited to Shield, Zap, and Users for consistency
- All products get default cards when you run the migration
