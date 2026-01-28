-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add some sample reviews if table is empty
INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'ProGamer_X',
  'PG',
  5,
  'Absolutely love this service! Smooth performance and the features work exactly as advertised. Support team is incredibly responsive.',
  true,
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews LIMIT 1);

INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'ElitePlayer',
  'EP',
  5,
  'Been using for over a month now with no issues. Undetected and reliable. Highly recommend to anyone looking for quality.',
  true,
  NOW() - INTERVAL '12 days'
WHERE (SELECT COUNT(*) FROM reviews) < 2;

INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'GameChanger',
  'GC',
  4,
  'Solid product with great features. Setup was easy and support helped me optimize my settings.',
  true,
  NOW() - INTERVAL '15 days'
WHERE (SELECT COUNT(*) FROM reviews) < 3;

INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'NightHawk',
  'NH',
  5,
  'Best purchase I''ve made! The quality is outstanding and customer service is top-notch.',
  true,
  NOW() - INTERVAL '8 days'
WHERE (SELECT COUNT(*) FROM reviews) < 4;

INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'SkillMaster',
  'SM',
  5,
  'Exceeded my expectations. Fast delivery and everything works perfectly. Will definitely buy again!',
  true,
  NOW() - INTERVAL '3 days'
WHERE (SELECT COUNT(*) FROM reviews) < 5;

INSERT INTO reviews (username, avatar, rating, text, verified, created_at)
SELECT 
  'TechSavvy',
  'TS',
  4,
  'Great product overall. Had a minor issue but support resolved it quickly. Very satisfied!',
  true,
  NOW() - INTERVAL '20 days'
WHERE (SELECT COUNT(*) FROM reviews) < 6;
