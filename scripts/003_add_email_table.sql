-- Create outbound_emails table for tracking email notifications
CREATE TABLE IF NOT EXISTS outbound_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  template TEXT,
  template_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_outbound_emails_status ON outbound_emails(status);
CREATE INDEX IF NOT EXISTS idx_outbound_emails_created ON outbound_emails(created_at DESC);

-- Enable RLS
ALTER TABLE outbound_emails ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert emails (for purchase flow)
CREATE POLICY "Anyone can insert emails" ON outbound_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view emails" ON outbound_emails FOR SELECT TO authenticated USING (true);

-- Insert all 16 products
INSERT INTO products (name, slug, game, description, image, status) VALUES
('HWID Spoofer', 'hwid-spoofer', 'Universal', 'Advanced HWID Spoofer to bypass hardware bans across all games. Spoofs disk, MAC, motherboard, and GPU identifiers.', '/images/hwid-spoofer.jpg', 'Undetected'),
('Fortnite Cheat', 'fortnite', 'Fortnite', 'Premium Fortnite cheat with aimbot, ESP, and build assist features.', '/images/fortnite.jpg', 'Undetected'),
('Marvel Rivals Cheat', 'marvel-rivals', 'Marvel Rivals', 'Unleash your powers in Marvel Rivals with our advanced cheat suite.', '/images/marvel-rivals.jpg', 'Undetected'),
('Delta Force Cheat', 'delta-force', 'Delta Force', 'Tactical advantage in Delta Force with precision aimbot and ESP.', '/images/delta-force.jpg', 'Undetected'),
('PUBG Cheat', 'pubg', 'PUBG', 'Win every chicken dinner with our premium PUBG cheat.', '/images/pubg.jpg', 'Undetected'),
('DayZ Cheat', 'dayz', 'DayZ', 'Survive the apocalypse with our comprehensive DayZ cheat.', '/images/dayz.jpg', 'Undetected'),
('Dune Awakening Cheat', 'dune-awakening', 'Dune Awakening', 'Conquer Arrakis with enhanced awareness and combat features.', '/images/dune-awakening.jpg', 'Testing'),
('Dead by Daylight Cheat', 'dead-by-daylight', 'Dead by Daylight', 'Escape or hunt with supernatural advantages in DBD.', '/images/dead-by-daylight.jpg', 'Undetected'),
('ARC Raiders Cheat', 'arc-raiders', 'ARC Raiders', 'Extract with confidence using our ARC Raiders feature set.', '/images/arc-raiders.png', 'Testing'),
('Rainbow Six Siege Cheat', 'rainbow-six-siege', 'Rainbow Six Siege', 'Tactical ESP and precision aim for Siege operators.', '/images/rainbow-six.jpg', 'Undetected'),
('Battlefield 6 Cheat', 'battlefield-6', 'Battlefield 6', 'Dominate large-scale warfare with our BF6 features.', '/images/battlefield-6.jpg', 'Testing'),
('COD Black Ops 7 Cheat', 'cod-bo7', 'Call of Duty', 'Next-gen COD domination with BO7 enhancements.', '/images/cod-bo7.jpg', 'Undetected'),
('COD Black Ops 6 Cheat', 'cod-bo6', 'Call of Duty', 'Premium Black Ops 6 cheat with full feature set.', '/images/cod-bo6.jpg', 'Undetected'),
('Rust Cheat', 'rust', 'Rust', 'Survive and raid with our comprehensive Rust cheat.', '/images/rust.jpg', 'Undetected'),
('Apex Legends Cheat', 'apex-legends', 'Apex Legends', 'Become the Apex Predator with our premium cheat suite.', '/images/apex-product.png', 'Undetected'),
('Escape from Tarkov Cheat', 'escape-from-tarkov', 'Escape from Tarkov', 'Extract with confidence using our Tarkov ESP and aimbot.', '/images/tarkov.jpg', 'Undetected')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  game = EXCLUDED.game,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert pricing for all products
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN SELECT id, slug FROM products LOOP
    -- 1 Day pricing
    INSERT INTO product_pricing (product_id, duration, price, stock) 
    VALUES (prod.id, '1 Day', 
      CASE 
        WHEN prod.slug = 'hwid-spoofer' THEN 4.90
        WHEN prod.slug = 'escape-from-tarkov' THEN 12.90
        WHEN prod.slug IN ('cod-bo7') THEN 11.90
        WHEN prod.slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 9.90
        WHEN prod.slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 8.90
        WHEN prod.slug IN ('delta-force', 'arc-raiders') THEN 7.90
        WHEN prod.slug IN ('pubg') THEN 6.90
        ELSE 5.90
      END, 50)
    ON CONFLICT DO NOTHING;
    
    -- 7 Days pricing
    INSERT INTO product_pricing (product_id, duration, price, stock) 
    VALUES (prod.id, '7 Days', 
      CASE 
        WHEN prod.slug = 'hwid-spoofer' THEN 14.90
        WHEN prod.slug = 'escape-from-tarkov' THEN 59.90
        WHEN prod.slug IN ('cod-bo7') THEN 54.90
        WHEN prod.slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 49.90
        WHEN prod.slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 44.90
        WHEN prod.slug IN ('delta-force', 'arc-raiders') THEN 39.90
        WHEN prod.slug IN ('pubg') THEN 34.90
        ELSE 29.90
      END, 30)
    ON CONFLICT DO NOTHING;
    
    -- 30 Days pricing
    INSERT INTO product_pricing (product_id, duration, price, stock) 
    VALUES (prod.id, '30 Days', 
      CASE 
        WHEN prod.slug = 'hwid-spoofer' THEN 29.90
        WHEN prod.slug = 'escape-from-tarkov' THEN 109.90
        WHEN prod.slug IN ('cod-bo7') THEN 99.90
        WHEN prod.slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 89.90
        WHEN prod.slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 79.90
        WHEN prod.slug IN ('delta-force', 'arc-raiders') THEN 69.90
        WHEN prod.slug IN ('pubg') THEN 59.90
        ELSE 49.90
      END, 20)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Insert product requirements for all products
INSERT INTO product_requirements (product_id, cpu, windows, cheat_type, controller)
SELECT id, 'Intel & AMD', '10 - 11', 'External', true FROM products
WHERE slug NOT IN ('delta-force', 'rainbow-six-siege', 'escape-from-tarkov')
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO product_requirements (product_id, cpu, windows, cheat_type, controller)
SELECT id, 'Intel only', '10 - 11', 'External', false FROM products
WHERE slug IN ('delta-force', 'rainbow-six-siege', 'escape-from-tarkov')
ON CONFLICT (product_id) DO NOTHING;

-- Insert features for all products
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN SELECT id, slug FROM products LOOP
    -- Aimbot features
    IF prod.slug != 'hwid-spoofer' THEN
      INSERT INTO product_features (product_id, category, feature) VALUES
        (prod.id, 'aimbot', 'Aimbot Enable'),
        (prod.id, 'aimbot', 'Silent Aim'),
        (prod.id, 'aimbot', 'Aim Key Bind'),
        (prod.id, 'aimbot', 'Smooth Aim'),
        (prod.id, 'aimbot', 'FOV Control'),
        (prod.id, 'aimbot', 'Bone Selection')
      ON CONFLICT DO NOTHING;
      
      -- ESP features
      INSERT INTO product_features (product_id, category, feature) VALUES
        (prod.id, 'esp', 'Player ESP'),
        (prod.id, 'esp', 'Box ESP'),
        (prod.id, 'esp', 'Skeleton ESP'),
        (prod.id, 'esp', 'Health Bars'),
        (prod.id, 'esp', 'Distance ESP'),
        (prod.id, 'esp', 'Name ESP')
      ON CONFLICT DO NOTHING;
      
      -- Misc features
      INSERT INTO product_features (product_id, category, feature) VALUES
        (prod.id, 'misc', 'No Recoil'),
        (prod.id, 'misc', 'Radar Hack'),
        (prod.id, 'misc', 'Stream Proof')
      ON CONFLICT DO NOTHING;
    ELSE
      -- HWID Spoofer features
      INSERT INTO product_features (product_id, category, feature) VALUES
        (prod.id, 'misc', 'Disk Spoof'),
        (prod.id, 'misc', 'MAC Address Spoof'),
        (prod.id, 'misc', 'Motherboard Spoof'),
        (prod.id, 'misc', 'GPU Spoof'),
        (prod.id, 'misc', 'RAM Spoof'),
        (prod.id, 'misc', 'Registry Cleaner')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Insert sample coupons
INSERT INTO coupons (code, discount_percent, max_uses, is_active) VALUES
('SAVE10', 10, 100, true),
('WELCOME20', 20, 50, true),
('VIP30', 30, 25, true)
ON CONFLICT (code) DO NOTHING;
