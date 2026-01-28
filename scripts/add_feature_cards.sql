-- Add feature_cards column to products table
-- This stores the 3 feature cards (Secure, Instant, Support) displayed under product images

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

-- Update existing products to have default feature cards
UPDATE products 
SET feature_cards = '[
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
]'::jsonb
WHERE feature_cards IS NULL;
