-- ============================================================================
-- MAGMA SITE - COMPLETE DATABASE SETUP
-- ============================================================================
-- Run this script ONCE in Supabase SQL Editor
-- This will set up everything needed for your admin panel

-- ============================================================================
-- DROP ALL EXISTING TABLES (Clean slate)
-- ============================================================================
DROP TABLE IF EXISTS outbound_emails CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_features CASCADE;
DROP TABLE IF EXISTS product_requirements CASCADE;
DROP TABLE IF EXISTS product_pricing CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ============================================================================
-- CREATE PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  image TEXT,
  provider TEXT DEFAULT 'Magma',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE PRODUCT PRICING TABLE
-- ============================================================================
CREATE TABLE product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, duration)
);

-- ============================================================================
-- CREATE PRODUCT REQUIREMENTS TABLE
-- ============================================================================
CREATE TABLE product_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cpu TEXT DEFAULT 'Intel & AMD',
  windows TEXT DEFAULT '10 - 11',
  cheat_type TEXT DEFAULT 'External',
  controller BOOLEAN DEFAULT true
);

-- ============================================================================
-- CREATE PRODUCT FEATURES TABLE
-- ============================================================================
CREATE TABLE product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('aimbot', 'esp', 'misc')),
  feature TEXT NOT NULL,
  UNIQUE(product_id, category, feature)
);

-- ============================================================================
-- CREATE ORDERS TABLE
-- ============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'crypto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE LICENSES TABLE
-- ============================================================================
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'unused')),
  expires_at TIMESTAMPTZ,
  hwid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE COUPONS TABLE
-- ============================================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Support' CHECK (role IN ('Owner', 'Admin', 'Moderator', 'Support', 'Developer')),
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE WEBHOOKS TABLE
-- ============================================================================
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['payment.completed'],
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE SETTINGS TABLE
-- ============================================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE OUTBOUND EMAILS TABLE
-- ============================================================================
CREATE TABLE outbound_emails (
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

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_game ON products(game);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_pricing_product_id ON product_pricing(product_id);
CREATE INDEX idx_product_features_product_id ON product_features(product_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_licenses_customer_email ON licenses(customer_email);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_outbound_emails_status ON outbound_emails(status);
CREATE INDEX idx_outbound_emails_created ON outbound_emails(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_emails ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES - PUBLIC READ
-- ============================================================================
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "public_read_pricing" ON product_pricing FOR SELECT USING (true);
CREATE POLICY "public_read_requirements" ON product_requirements FOR SELECT USING (true);
CREATE POLICY "public_read_features" ON product_features FOR SELECT USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "public_read_licenses" ON licenses FOR SELECT USING (true);
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "public_insert_emails" ON outbound_emails FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CREATE RLS POLICIES - ADMIN (AUTHENTICATED)
-- ============================================================================
CREATE POLICY "admin_all_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_pricing" ON product_pricing FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_requirements" ON product_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_features" ON product_features FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_licenses" ON licenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_team" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_webhooks" ON webhooks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_emails" ON outbound_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- INSERT PRODUCTS
-- ============================================================================
INSERT INTO products (name, slug, game, description, image, provider, status) VALUES
('HWID Spoofer', 'hwid-spoofer', 'Universal', 'Advanced HWID Spoofer to bypass hardware bans across all games. Spoofs disk, MAC, motherboard, and GPU identifiers.', '/images/hwid-spoofer.jpg', 'Magma', 'active'),
('Fortnite Cheat', 'fortnite', 'Fortnite', 'Premium Fortnite cheat with aimbot, ESP, and build assist features.', '/images/fortnite.jpg', 'Magma', 'active'),
('Marvel Rivals Cheat', 'marvel-rivals', 'Marvel Rivals', 'Unleash your powers in Marvel Rivals with our advanced cheat suite.', '/images/marvel-rivals.jpg', 'Magma', 'active'),
('Delta Force Cheat', 'delta-force', 'Delta Force', 'Tactical advantage in Delta Force with precision aimbot and ESP.', '/images/delta-force.jpg', 'Magma', 'active'),
('PUBG Cheat', 'pubg', 'PUBG', 'Win every chicken dinner with our premium PUBG cheat.', '/images/pubg.jpg', 'Magma', 'active'),
('DayZ Cheat', 'dayz', 'DayZ', 'Survive the apocalypse with our comprehensive DayZ cheat.', '/images/dayz.jpg', 'Magma', 'active'),
('Dune Awakening Cheat', 'dune-awakening', 'Dune Awakening', 'Conquer Arrakis with enhanced awareness and combat features.', '/images/dune-awakening.jpg', 'Magma', 'maintenance'),
('Dead by Daylight Cheat', 'dead-by-daylight', 'Dead by Daylight', 'Escape or hunt with supernatural advantages in DBD.', '/images/dead-by-daylight.jpg', 'Magma', 'active'),
('ARC Raiders Cheat', 'arc-raiders', 'ARC Raiders', 'Extract with confidence using our ARC Raiders feature set.', '/images/arc-raiders.png', 'Magma', 'maintenance'),
('Rainbow Six Siege Cheat', 'rainbow-six-siege', 'Rainbow Six Siege', 'Tactical ESP and precision aim for Siege operators.', '/images/rainbow-six.jpg', 'Magma', 'active'),
('Battlefield 6 Cheat', 'battlefield-6', 'Battlefield 6', 'Dominate large-scale warfare with our BF6 features.', '/images/battlefield-6.jpg', 'Magma', 'maintenance'),
('COD Black Ops 7 Cheat', 'cod-bo7', 'Call of Duty', 'Next-gen COD domination with BO7 enhancements.', '/images/cod-bo7.jpg', 'Magma', 'active'),
('COD Black Ops 6 Cheat', 'cod-bo6', 'Call of Duty', 'Premium Black Ops 6 cheat with full feature set.', '/images/cod-bo6.jpg', 'Magma', 'active'),
('Rust Cheat', 'rust', 'Rust', 'Survive and raid with our comprehensive Rust cheat.', '/images/rust.jpg', 'Magma', 'active'),
('Apex Legends Cheat', 'apex-legends', 'Apex Legends', 'Become the Apex Predator with our premium cheat suite.', '/images/apex-product.png', 'Magma', 'active'),
('Escape from Tarkov Cheat', 'escape-from-tarkov', 'Escape from Tarkov', 'Extract with confidence using our Tarkov ESP and aimbot.', '/images/tarkov.jpg', 'Magma', 'active');

-- ============================================================================
-- INSERT PRODUCT PRICING
-- ============================================================================
INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '1 Day', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 4.90
    WHEN slug = 'escape-from-tarkov' THEN 12.90
    WHEN slug = 'cod-bo7' THEN 11.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 9.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 8.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 7.90
    WHEN slug = 'pubg' THEN 6.90
    ELSE 5.90
  END, 50
FROM products;

INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '7 Days', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 14.90
    WHEN slug = 'escape-from-tarkov' THEN 59.90
    WHEN slug = 'cod-bo7' THEN 54.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 49.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 44.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 39.90
    WHEN slug = 'pubg' THEN 34.90
    ELSE 29.90
  END, 30
FROM products;

INSERT INTO product_pricing (product_id, duration, price, stock) 
SELECT id, '30 Days', 
  CASE 
    WHEN slug = 'hwid-spoofer' THEN 29.90
    WHEN slug = 'escape-from-tarkov' THEN 109.90
    WHEN slug = 'cod-bo7' THEN 99.90
    WHEN slug IN ('rust', 'cod-bo6', 'rainbow-six-siege', 'marvel-rivals') THEN 89.90
    WHEN slug IN ('fortnite', 'dune-awakening', 'battlefield-6', 'apex-legends') THEN 79.90
    WHEN slug IN ('delta-force', 'arc-raiders') THEN 69.90
    WHEN slug = 'pubg' THEN 59.90
    ELSE 49.90
  END, 20
FROM products;

-- ============================================================================
-- INSERT PRODUCT REQUIREMENTS
-- ============================================================================
INSERT INTO product_requirements (product_id, cpu, windows, cheat_type, controller)
SELECT id, 'Intel & AMD', '10 - 11', 'External', true FROM products
WHERE slug NOT IN ('delta-force', 'rainbow-six-siege', 'escape-from-tarkov');

INSERT INTO product_requirements (product_id, cpu, windows, cheat_type, controller)
SELECT id, 'Intel only', '10 - 11', 'External', false FROM products
WHERE slug IN ('delta-force', 'rainbow-six-siege', 'escape-from-tarkov');

-- ============================================================================
-- INSERT PRODUCT FEATURES
-- ============================================================================
-- HWID Spoofer features
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES ('Disk Spoof'), ('MAC Address Spoof'), ('Motherboard Spoof'), ('GPU Spoof'), ('RAM Spoof'), ('Registry Cleaner')) AS features(feature)
WHERE slug = 'hwid-spoofer';

-- Aimbot features for all cheats (except HWID Spoofer)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'aimbot', feature FROM products, 
  (VALUES ('Aimbot Enable'), ('Silent Aim'), ('Aim Key Bind'), ('Smooth Aim'), ('FOV Control'), ('Bone Selection')) AS features(feature)
WHERE slug != 'hwid-spoofer';

-- ESP features for all cheats (except HWID Spoofer)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'esp', feature FROM products, 
  (VALUES ('Player ESP'), ('Box ESP'), ('Skeleton ESP'), ('Health Bars'), ('Distance ESP'), ('Name ESP')) AS features(feature)
WHERE slug != 'hwid-spoofer';

-- Misc features for all cheats (except HWID Spoofer)
INSERT INTO product_features (product_id, category, feature)
SELECT id, 'misc', feature FROM products, 
  (VALUES ('No Recoil'), ('Radar Hack'), ('Stream Proof')) AS features(feature)
WHERE slug != 'hwid-spoofer';

-- ============================================================================
-- INSERT REVIEWS
-- ============================================================================
INSERT INTO reviews (username, avatar, rating, text, product_id, verified, created_at) VALUES
('Alex_Gamer', 'A', 5, 'Best cheats I have ever used! The aimbot is smooth and the ESP is crystal clear. Customer support is top notch.', (SELECT id FROM products WHERE slug = 'apex-legends'), true, NOW() - INTERVAL '2 days'),
('ProPlayer99', 'P', 5, 'Undetected for months now. Worth every penny. The features are exactly as described.', (SELECT id FROM products WHERE slug = 'apex-legends'), true, NOW() - INTERVAL '5 days'),
('ShadowHunter', 'S', 4, 'Great product overall. Minor lag issues at first but support helped me fix it quickly.', (SELECT id FROM products WHERE slug = 'fortnite'), true, NOW() - INTERVAL '1 week'),
('NightOwl', 'N', 5, 'Been using for 3 months straight. No bans, smooth gameplay. Highly recommend!', (SELECT id FROM products WHERE slug = 'fortnite'), true, NOW() - INTERVAL '2 weeks'),
('TurboKing', 'T', 5, 'The ESP features are insane. Can see everything on the map. Game changer!', (SELECT id FROM products WHERE slug = 'rust'), true, NOW() - INTERVAL '3 weeks'),
('CyberNinja', 'C', 4, 'Good value for money. Works as advertised. Support team is responsive.', (SELECT id FROM products WHERE slug = 'apex-legends'), false, NOW() - INTERVAL '1 month'),
('StealthMode', 'S', 5, 'Finally found a cheat provider I can trust. Instant delivery and great features.', (SELECT id FROM products WHERE slug = 'fortnite'), true, NOW() - INTERVAL '1 month'),
('VortexPro', 'V', 5, 'Amazing aimbot smoothness. My K/D has improved dramatically. 10/10 would recommend.', (SELECT id FROM products WHERE slug = 'cod-bo6'), true, NOW() - INTERVAL '2 months'),
('PhoenixRise', 'P', 4, 'Solid product. A few bugs here and there but nothing major. Good overall experience.', (SELECT id FROM products WHERE slug = 'fortnite'), false, NOW() - INTERVAL '2 months'),
('DarkMatter', 'D', 5, 'Best decision I made. The cheat is undetectable and features work flawlessly.', (SELECT id FROM products WHERE slug = 'rust'), true, NOW() - INTERVAL '3 months'),
('QuantumLeap', 'Q', 5, 'Excellent customer service and product quality. Will definitely renew my subscription.', (SELECT id FROM products WHERE slug = 'apex-legends'), true, NOW() - INTERVAL '3 months'),
('BlazeFury', 'B', 4, 'Works great on my Intel system. Easy to set up and use. Recommended!', (SELECT id FROM products WHERE slug = 'escape-from-tarkov'), true, NOW() - INTERVAL '4 months');

-- ============================================================================
-- INSERT COUPONS
-- ============================================================================
INSERT INTO coupons (code, discount_percent, max_uses, current_uses, valid_until, is_active) VALUES
('WELCOME10', 10, 100, 23, NOW() + INTERVAL '6 months', true),
('SUMMER25', 25, 50, 12, NOW() + INTERVAL '3 months', true),
('VIP50', 50, 10, 3, NOW() + INTERVAL '1 month', true),
('NEWUSER15', 15, 200, 45, NOW() + INTERVAL '12 months', true);

-- ============================================================================
-- INSERT SAMPLE ORDERS
-- ============================================================================
INSERT INTO orders (order_number, customer_email, product_id, product_name, duration, amount, status, payment_method, created_at) VALUES
('ORD-001', 'customer1@example.com', (SELECT id FROM products WHERE slug = 'apex-legends'), 'Apex Legends Cheat', '7 Days', 44.90, 'completed', 'crypto', NOW() - INTERVAL '1 day'),
('ORD-002', 'customer2@example.com', (SELECT id FROM products WHERE slug = 'fortnite'), 'Fortnite Cheat', '30 Days', 79.90, 'completed', 'crypto', NOW() - INTERVAL '2 days'),
('ORD-003', 'customer3@example.com', (SELECT id FROM products WHERE slug = 'fortnite'), 'Fortnite Cheat', '1 Day', 8.90, 'pending', 'crypto', NOW() - INTERVAL '1 hour'),
('ORD-004', 'customer4@example.com', (SELECT id FROM products WHERE slug = 'rust'), 'Rust Cheat', '7 Days', 49.90, 'completed', 'crypto', NOW() - INTERVAL '3 days'),
('ORD-005', 'customer5@example.com', (SELECT id FROM products WHERE slug = 'apex-legends'), 'Apex Legends Cheat', '30 Days', 79.90, 'failed', 'crypto', NOW() - INTERVAL '5 days');

-- ============================================================================
-- INSERT SAMPLE LICENSES
-- ============================================================================
INSERT INTO licenses (license_key, order_id, product_id, product_name, customer_email, status, expires_at, created_at) VALUES
('XXXX-XXXX-XXXX-1111', (SELECT id FROM orders WHERE order_number = 'ORD-001'), (SELECT id FROM products WHERE slug = 'apex-legends'), 'Apex Legends Cheat', 'customer1@example.com', 'active', NOW() + INTERVAL '6 days', NOW() - INTERVAL '1 day'),
('XXXX-XXXX-XXXX-2222', (SELECT id FROM orders WHERE order_number = 'ORD-002'), (SELECT id FROM products WHERE slug = 'fortnite'), 'Fortnite Cheat', 'customer2@example.com', 'active', NOW() + INTERVAL '28 days', NOW() - INTERVAL '2 days'),
('XXXX-XXXX-XXXX-4444', (SELECT id FROM orders WHERE order_number = 'ORD-004'), (SELECT id FROM products WHERE slug = 'rust'), 'Rust Cheat', 'customer4@example.com', 'active', NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('XXXX-XXXX-XXXX-OLD1', NULL, (SELECT id FROM products WHERE slug = 'apex-legends'), 'Apex Legends Cheat', 'oldcustomer@example.com', 'expired', NOW() - INTERVAL '10 days', NOW() - INTERVAL '40 days');

-- ============================================================================
-- INSERT TEAM MEMBERS
-- ============================================================================
INSERT INTO team_members (name, email, role, is_active) VALUES
('Admin User', 'admin@magma.local', 'Owner', true),
('Support Team', 'support@magma.local', 'Support', true),
('Developer', 'dev@magma.local', 'Developer', true);

-- ============================================================================
-- INSERT SETTINGS
-- ============================================================================
INSERT INTO settings (key, value) VALUES
('site_name', '"Magma Cheats"'),
('site_description', '"Premium undetected cheats for all games"'),
('support_email', '"support@magma.local"'),
('maintenance_mode', 'false');

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now ready!
-- All tables created, data seeded, and admin panel will work perfectly.
