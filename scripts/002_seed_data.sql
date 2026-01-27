-- Seed Products
INSERT INTO products (id, name, slug, game, description, image, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Armani', 'armani-apex', 'Apex Legends', 'Premium Apex Legends cheat with advanced aimbot and ESP features', '/images/apex-product.png', 'Undetected'),
  ('22222222-2222-2222-2222-222222222222', 'Phantom', 'phantom-valorant', 'Valorant', 'Undetected Valorant cheat with rage and legit modes', '/images/apex-product.png', 'Undetected'),
  ('33333333-3333-3333-3333-333333333333', 'Ghost', 'ghost-cod', 'Call of Duty', 'Call of Duty cheat with unlock all and aimbot', '/images/apex-product.png', 'Updating'),
  ('44444444-4444-4444-4444-444444444444', 'Shadow', 'shadow-fortnite', 'Fortnite', 'Fortnite cheat with softaim and ESP', '/images/apex-product.png', 'Undetected'),
  ('55555555-5555-5555-5555-555555555555', 'Viper', 'viper-rust', 'Rust', 'Rust cheat with full ESP and aimbot', '/images/apex-product.png', 'Undetected'),
  ('66666666-6666-6666-6666-666666666666', 'Nova', 'nova-csgo', 'CS2', 'Counter-Strike 2 cheat with legit features', '/images/apex-product.png', 'Testing')
ON CONFLICT (id) DO NOTHING;

-- Seed Product Pricing
INSERT INTO product_pricing (product_id, duration, price, stock) VALUES
  -- Armani Apex
  ('11111111-1111-1111-1111-111111111111', '1 Day', 7.90, 5),
  ('11111111-1111-1111-1111-111111111111', '7 Days', 39.90, 8),
  ('11111111-1111-1111-1111-111111111111', '30 Days', 69.90, 3),
  -- Phantom Valorant
  ('22222222-2222-2222-2222-222222222222', '1 Day', 9.90, 10),
  ('22222222-2222-2222-2222-222222222222', '7 Days', 49.90, 5),
  ('22222222-2222-2222-2222-222222222222', '30 Days', 89.90, 2),
  -- Ghost COD
  ('33333333-3333-3333-3333-333333333333', '1 Day', 8.90, 0),
  ('33333333-3333-3333-3333-333333333333', '7 Days', 44.90, 0),
  ('33333333-3333-3333-3333-333333333333', '30 Days', 79.90, 0),
  -- Shadow Fortnite
  ('44444444-4444-4444-4444-444444444444', '1 Day', 6.90, 15),
  ('44444444-4444-4444-4444-444444444444', '7 Days', 34.90, 10),
  ('44444444-4444-4444-4444-444444444444', '30 Days', 59.90, 5),
  -- Viper Rust
  ('55555555-5555-5555-5555-555555555555', '1 Day', 10.90, 8),
  ('55555555-5555-5555-5555-555555555555', '7 Days', 54.90, 4),
  ('55555555-5555-5555-5555-555555555555', '30 Days', 99.90, 2),
  -- Nova CS2
  ('66666666-6666-6666-6666-666666666666', '1 Day', 7.90, 3),
  ('66666666-6666-6666-6666-666666666666', '7 Days', 39.90, 2),
  ('66666666-6666-6666-6666-666666666666', '30 Days', 69.90, 1);

-- Seed Product Requirements
INSERT INTO product_requirements (product_id, cpu, windows, cheat_type, controller) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Intel only', '10 - 11', 'External', true),
  ('22222222-2222-2222-2222-222222222222', 'Intel / AMD', '10 - 11', 'External', false),
  ('33333333-3333-3333-3333-333333333333', 'Intel / AMD', '10 - 11', 'Internal', true),
  ('44444444-4444-4444-4444-444444444444', 'Intel only', '10 - 11', 'External', true),
  ('55555555-5555-5555-5555-555555555555', 'Intel / AMD', '10 - 11', 'External', false),
  ('66666666-6666-6666-6666-666666666666', 'Intel / AMD', '10 - 11', 'External', true)
ON CONFLICT (product_id) DO NOTHING;

-- Seed Product Features - Armani Apex
INSERT INTO product_features (product_id, category, feature) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Aimbot enable'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Aim key'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Aim on shoot'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Visibility check'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Field of view'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Bone selector'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Target switch delay'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Nearest coefficient'),
  ('11111111-1111-1111-1111-111111111111', 'aimbot', 'Aimbot speed'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy box ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy line'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy distance ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy health ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy shield ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Enemy name'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Player team check'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Skeleton ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Item ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Item filters'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Loot ESP'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Night mode'),
  ('11111111-1111-1111-1111-111111111111', 'esp', 'Knocked out text'),
  ('11111111-1111-1111-1111-111111111111', 'misc', 'Skin changer'),
  ('11111111-1111-1111-1111-111111111111', 'misc', 'Custom crosshair'),
  ('11111111-1111-1111-1111-111111111111', 'misc', 'Distance unit selection');

-- Seed Reviews
INSERT INTO reviews (username, avatar, rating, text, product_id, verified, created_at) VALUES
  ('Alex_Gamer', 'A', 5, 'Best cheats I have ever used! The aimbot is smooth and the ESP is crystal clear. Customer support is top notch.', '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '2 days'),
  ('ProPlayer99', 'P', 5, 'Undetected for months now. Worth every penny. The features are exactly as described.', '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '5 days'),
  ('ShadowHunter', 'S', 4, 'Great product overall. Minor lag issues at first but support helped me fix it quickly.', '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '1 week'),
  ('NightOwl', 'N', 5, 'Been using for 3 months straight. No bans, smooth gameplay. Highly recommend!', '44444444-4444-4444-4444-444444444444', true, NOW() - INTERVAL '2 weeks'),
  ('TurboKing', 'T', 5, 'The ESP features are insane. Can see everything on the map. Game changer!', '55555555-5555-5555-5555-555555555555', true, NOW() - INTERVAL '3 weeks'),
  ('CyberNinja', 'C', 4, 'Good value for money. Works as advertised. Support team is responsive.', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '1 month'),
  ('StealthMode', 'S', 5, 'Finally found a cheat provider I can trust. Instant delivery and great features.', '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '1 month'),
  ('VortexPro', 'V', 5, 'Amazing aimbot smoothness. My K/D has improved dramatically. 10/10 would recommend.', '33333333-3333-3333-3333-333333333333', true, NOW() - INTERVAL '2 months'),
  ('PhoenixRise', 'P', 4, 'Solid product. A few bugs here and there but nothing major. Good overall experience.', '44444444-4444-4444-4444-444444444444', false, NOW() - INTERVAL '2 months'),
  ('DarkMatter', 'D', 5, 'Best decision I made. The cheat is undetectable and features work flawlessly.', '55555555-5555-5555-5555-555555555555', true, NOW() - INTERVAL '3 months'),
  ('QuantumLeap', 'Q', 5, 'Excellent customer service and product quality. Will definitely renew my subscription.', '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '3 months'),
  ('BlazeFury', 'B', 4, 'Works great on my Intel system. Easy to set up and use. Recommended!', '66666666-6666-6666-6666-666666666666', true, NOW() - INTERVAL '4 months');

-- Seed Coupons
INSERT INTO coupons (code, discount_percent, max_uses, current_uses, valid_until, is_active) VALUES
  ('WELCOME10', 10, 100, 23, NOW() + INTERVAL '6 months', true),
  ('SUMMER25', 25, 50, 12, NOW() + INTERVAL '3 months', true),
  ('VIP50', 50, 10, 3, NOW() + INTERVAL '1 month', true),
  ('EXPIRED20', 20, 100, 45, NOW() - INTERVAL '1 month', false);

-- Seed sample orders
INSERT INTO orders (order_number, customer_email, product_id, product_name, duration, amount, status, created_at) VALUES
  ('ORD-001', 'customer1@example.com', '11111111-1111-1111-1111-111111111111', 'Armani', '7 Days', 39.90, 'completed', NOW() - INTERVAL '1 day'),
  ('ORD-002', 'customer2@example.com', '22222222-2222-2222-2222-222222222222', 'Phantom', '30 Days', 89.90, 'completed', NOW() - INTERVAL '2 days'),
  ('ORD-003', 'customer3@example.com', '44444444-4444-4444-4444-444444444444', 'Shadow', '1 Day', 6.90, 'pending', NOW() - INTERVAL '1 hour'),
  ('ORD-004', 'customer4@example.com', '55555555-5555-5555-5555-555555555555', 'Viper', '7 Days', 54.90, 'completed', NOW() - INTERVAL '3 days'),
  ('ORD-005', 'customer5@example.com', '11111111-1111-1111-1111-111111111111', 'Armani', '30 Days', 69.90, 'failed', NOW() - INTERVAL '5 days');

-- Seed sample licenses
INSERT INTO licenses (license_key, order_id, product_id, product_name, customer_email, status, expires_at, created_at) VALUES
  ('XXXX-XXXX-XXXX-1111', (SELECT id FROM orders WHERE order_number = 'ORD-001'), '11111111-1111-1111-1111-111111111111', 'Armani', 'customer1@example.com', 'active', NOW() + INTERVAL '6 days', NOW() - INTERVAL '1 day'),
  ('XXXX-XXXX-XXXX-2222', (SELECT id FROM orders WHERE order_number = 'ORD-002'), '22222222-2222-2222-2222-222222222222', 'Phantom', 'customer2@example.com', 'active', NOW() + INTERVAL '28 days', NOW() - INTERVAL '2 days'),
  ('XXXX-XXXX-XXXX-4444', (SELECT id FROM orders WHERE order_number = 'ORD-004'), '55555555-5555-5555-5555-555555555555', 'Viper', 'customer4@example.com', 'active', NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days'),
  ('XXXX-XXXX-XXXX-OLD1', NULL, '11111111-1111-1111-1111-111111111111', 'Armani', 'oldcustomer@example.com', 'expired', NOW() - INTERVAL '10 days', NOW() - INTERVAL '40 days');
