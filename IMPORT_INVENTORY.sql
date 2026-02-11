-- ============================================================
-- SoverAIn Lab — Full Inventory Import
-- Run this in the Supabase SQL Editor
-- ============================================================
-- WARNING: This clears existing data first.
-- Remove the DELETE block below if you want to KEEP existing records.
-- ============================================================

-- Step 0: Add 'type' column to devices (safe if already exists)
ALTER TABLE devices ADD COLUMN IF NOT EXISTS type TEXT;

-- Step 1: Clear existing data (comment out to preserve)
DELETE FROM initiative_parts;
DELETE FROM initiative_devices;
DELETE FROM parts;
DELETE FROM initiatives;
DELETE FROM devices;

-- ============================================================
-- DEVICES  (15 total)
-- ============================================================

INSERT INTO devices (name, type, description, status, location, serial_number, cost) VALUES

-- ── Smartphones / Servers ──────────────────────────────────
('Samsung Galaxy S22', 'smartphone',
 'SM-S901U · Snapdragon 8 Gen 1 · 8 GB LPDDR5 · 128/256 GB UFS 3.1 · Wi-Fi 6E · Android 14. EXCELLENT server viability — PRIMARY server.',
 'available', 'Lab', 'SM-S901U', NULL),

('Samsung Galaxy S20+', 'smartphone',
 'SM-G985F · Exynos 990 · 8 GB LPDDR5 · 128 GB UFS 3.0 · Wi-Fi 6 · Android 11. GOOD server viability — SECONDARY / failover server.',
 'available', 'Lab', 'SM-G985F', NULL),

('Google Pixel 3 XL', 'smartphone',
 'Snapdragon 845 · 4 GB LPDDR4X · 64/128 GB UFS 2.1 · Wi-Fi 5 · Android 9-12. FAIR server viability — lightweight services / MQTT broker.',
 'available', 'Lab', NULL, NULL),

('iPhone X', 'smartphone',
 'MQAJ2LL/A · A11 Bionic · 3 GB LPDDR4X · 64 GB · iOS 14-16 · Face ID · Space Gray. NO server viability — marked for parts strip.',
 'maintenance', 'Lab', 'MQAJ2LL/A', NULL),

-- ── Smart Display ──────────────────────────────────────────
('Amazon Echo Show 8', 'smart_speaker',
 'C7H6N3 · 1st Gen MT8163 · 1-2 GB DDR3 · 8-16 GB eMMC · 8" 1280×800 · Wi-Fi ac. EXCELLENT — jailbreak to LineageOS 18.1 for Home Assistant.',
 'available', 'Lab', 'C7H6N3', NULL),

-- ── Feature Phone ──────────────────────────────────────────
('Qilive U2403', 'smartphone',
 'Feature phone · 48 MB RAM · 128 MB storage · 4G LTE · BT 2.1 · 2.4" LCD. Use as 4G LTE modem or parts donor.',
 'available', 'Lab', '353186071718118', NULL),

-- ── Power Banks (UPS) ──────────────────────────────────────
('Power Bank (Chargeworx)', 'other',
 '~10,000 mAh · 5 V USB output · Li-ion cells. UPS backup for primary server — test pass-through charging.',
 'maintenance', 'Lab', NULL, NULL),

('Power Bank (PocketJuice)', 'other',
 '~10,000 mAh · 5 V USB output · Li-ion cells. UPS backup for secondary / portable — test pass-through charging.',
 'maintenance', 'Lab', NULL, NULL),

-- ── Smartwatches (Liquidation) ─────────────────────────────
('Apple Watch #1', 'smartwatch',
 'Series 3 or earlier · 768 MB RAM · 8-16 GB · Wi-Fi b/g/n · BT 4.2 · NFC. Sell ($50-100) or repurpose for Arduino/BLE.',
 'retired', 'Lab', NULL, 50),

('Apple Watch #2', 'smartwatch',
 'Series 3 or earlier · 768 MB RAM · 8-16 GB · Wi-Fi b/g/n · BT 4.2 · NFC. Sell ($50-100) or repurpose for Arduino/BLE.',
 'retired', 'Lab', NULL, 50),

('Garmin Smartwatch', 'smartwatch',
 'Unspecified vivoactive/Forerunner · GPS/GLONASS · HR · barometer · compass · BT · ANT+. Sell ($30-80) or keep for fitness.',
 'available', 'Lab', NULL, 30),

-- ── Other Devices ──────────────────────────────────────────
('HP Financial Calculator', 'other',
 'HP 12C or 17BII+ · LCD 7-seg · RPN · CR2032 battery · IR printer port. Keep as calculator or e-waste.',
 'available', 'Lab', NULL, NULL),

('SK hynix DDR4 SO-DIMM', 'other',
 'HMAA1GS6CJR6N-XN · 8 GB DDR4-3200 · 1.2 V · CL22 · Non-ECC · 260-pin SO-DIMM. Install in compatible NUC / mini PC.',
 'available', 'Lab', 'HMAA1GS6CJR6N-XN', 15),

('Generic Android Tablet', 'tablet',
 '"Pro13" unidentified Chinese tablet — unknown CPU/RAM. Software reports "Pro13" for everything. Marked for scrap/teardown.',
 'retired', 'Lab', NULL, NULL),

('Oura Ring', 'smart_ring',
 'Health & sleep tracking ring · BLE connectivity. Keep for personal use or sell.',
 'available', 'Lab', NULL, NULL);


-- ============================================================
-- PARTS  (30 salvageable + 10 cables & accessories = 40)
-- ============================================================

-- ── iPhone X Parts ─────────────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('OLED Display 5.8"', 'display',
 'Super Retina HD · 2436×1125 · 458 ppi — high resale in repair market. Medium difficulty extraction.',
 1, 100.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('Dual Rear Cameras 12 MP', 'camera_module',
 '12 MP wide + 12 MP telephoto. Medium difficulty.',
 1, 30.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('TrueDepth Camera 7 MP', 'camera_module',
 'Front camera + Face ID IR components. Medium difficulty.',
 1, 20.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('Taptic Engine (iPhone X)', 'actuator',
 'Linear haptic actuator — useful for custom projects. Easy extraction.',
 1, 5.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('Battery 2716 mAh (iPhone X)', 'battery',
 'Test health first — keep if >80%, recycle if degraded. Easy extraction.',
 1, 20.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('Logic Board A11 (iPhone X)', 'circuit_board',
 'Proprietary Apple SoC — no reuse. Recycle for precious metals. NOT salvageable.',
 1, 0.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab'),

('LPDDR4X RAM 3 GB (iPhone X)', 'memory',
 'Integrated in A11 package — PoP, not removable. NOT salvageable.',
 1, 0.00, 'attached',
 (SELECT id FROM devices WHERE name = 'iPhone X'), 'Lab');

-- ── Power Bank Parts ───────────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('18650/21700 Li-ion Cells (Chargeworx)', 'battery',
 '3-4 cells per bank — salvage only if unit fails. Easy extraction.',
 4, 3.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Power Bank (Chargeworx)'), 'Lab'),

('Charging Circuit PCB (Power Banks)', 'circuit_board',
 'Reuse for DIY battery projects. Easy extraction. From both power banks.',
 2, 2.00, 'spare', NULL, 'Lab'),

('USB Ports (Power Banks)', 'connector',
 'Desolder for custom projects. Easy extraction.',
 4, 1.00, 'spare', NULL, 'Lab'),

('Enclosures (Power Banks)', 'enclosure',
 'Repurpose for custom electronics housing. Easy extraction.',
 2, 0.50, 'spare', NULL, 'Lab');

-- ── Echo Show 8 Parts (contingency — keep functional) ──────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('8" Touchscreen 1280×800 (Echo Show)', 'display',
 'Only extract if device fails — keep functional for LineageOS. Medium difficulty.',
 1, 40.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Amazon Echo Show 8'), 'Lab'),

('2× 10 W Speakers + Bass Radiator (Echo Show)', 'speaker',
 'Neodymium drivers + passive radiator. Only extract if device fails. Easy.',
 2, 15.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Amazon Echo Show 8'), 'Lab'),

('1 MP Camera Module (Echo Show)', 'camera_module',
 'For computer vision projects. Only extract if device fails. Easy.',
 1, 5.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Amazon Echo Show 8'), 'Lab');

-- ── Apple Watch Parts ──────────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('Taptic Engine × 2 (Apple Watches)', 'actuator',
 'Haptic actuator — tiny, custom driver needed. Hard extraction. Sell device first.',
 2, 3.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Apple Watch #1'), 'Lab'),

('Digital Crown × 2 (Apple Watches)', 'gear',
 'Rotary encoder mechanism — novel input device. Hard extraction. Sell device first.',
 2, 2.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Apple Watch #1'), 'Lab');

-- ── Garmin Parts ───────────────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('GPS Module (Garmin)', 'sensor',
 'Integrated, may be UART accessible — low practical value. Hard extraction. Sell device first.',
 1, 5.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Garmin Smartwatch'), 'Lab');

-- ── HP Calculator Parts ────────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('Tactile Keyboard Buttons (HP Calc)', 'switch',
 'For custom input projects. Easy extraction. Keep device.',
 1, 0.50, 'attached',
 (SELECT id FROM devices WHERE name = 'HP Financial Calculator'), 'Lab'),

('CR2032 Batteries (HP Calc)', 'battery',
 'Standard coin cell — if fresh. Easy extraction.',
 1, 1.00, 'attached',
 (SELECT id FROM devices WHERE name = 'HP Financial Calculator'), 'Lab'),

('PCB Precious Metals (HP Calc)', 'circuit_board',
 '~0.01 g gold, ~0.05 g silver — only viable at scale. Minimal value.',
 1, 0.50, 'attached',
 (SELECT id FROM devices WHERE name = 'HP Financial Calculator'), 'Lab');

-- ── Generic Tablet Parts ───────────────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('LCD Display (Pro13 Tablet)', 'display',
 'Unknown spec — assess after teardown. Medium difficulty.',
 1, 10.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Generic Android Tablet'), 'Lab'),

('Battery Li-Po (Pro13 Tablet)', 'battery',
 'Test health — likely pouch cell. Easy extraction.',
 1, 5.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Generic Android Tablet'), 'Lab');

-- ── Galaxy S22 Parts (contingency — PRIMARY SERVER) ────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('6.1" AMOLED Display (S22)', 'display',
 'ONLY if device fails — PRIMARY SERVER, do not strip. Hard difficulty.',
 1, 200.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S22'), 'Lab'),

('Camera 50+10+12 MP (S22)', 'camera_module',
 'ONLY if device fails. Hard difficulty.',
 1, 40.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S22'), 'Lab'),

('Battery 3700 mAh (S22)', 'battery',
 'Only if fails or degrades below 80%. Monitor health.',
 1, 40.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S22'), 'Lab');

-- ── Galaxy S20+ Parts (contingency — SECONDARY SERVER) ─────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('6.7" AMOLED Display (S20+)', 'display',
 'ONLY if device fails — SECONDARY SERVER, do not strip. Hard difficulty.',
 1, 150.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S20+'), 'Lab'),

('Camera 12+64+12 MP+ToF (S20+)', 'camera_module',
 'ONLY if device fails. Hard difficulty.',
 1, 30.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S20+'), 'Lab'),

('Battery 4500 mAh (S20+)', 'battery',
 'Only if fails or degrades below 80%. Monitor health.',
 1, 30.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S20+'), 'Lab');

-- ── Pixel 3 XL Parts (contingency) ────────────────────────
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('6.3" P-OLED Display (Pixel 3 XL)', 'display',
 'Only if device fails. Hard difficulty.',
 1, 80.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Google Pixel 3 XL'), 'Lab'),

('Battery 3430 mAh (Pixel 3 XL)', 'battery',
 'Likely degraded (2018 device) — may need replacement for 24/7 use. Test health.',
 1, 20.00, 'attached',
 (SELECT id FROM devices WHERE name = 'Google Pixel 3 XL'), 'Lab');

-- ── Cables & Accessories (from Marvin audit, 31 Jan 2026) ──
INSERT INTO parts (name, category, description, quantity, unit_cost, status, device_id, location) VALUES

('USB-A to Micro-USB Cable (5 ft, Black)', 'cable',
 'Standard Micro-USB cable. Good condition. Marvin audit 31 Jan.',
 1, 2.00, 'spare', NULL, 'Lab'),

('USB-A to Micro-USB Cable (6 ft, White)', 'cable',
 'Standard Micro-USB cable. Good condition. Marvin audit 31 Jan.',
 1, 2.00, 'spare', NULL, 'Lab'),

('USB-C to Apple Watch Charger (3 ft)', 'cable',
 'Magnetic MagLock charger for Apple Watch. Good condition.',
 1, 5.00, 'spare', NULL, 'Lab'),

('USB-A to Micro-USB Short (5 in, Black)', 'cable',
 'Very short cable for tight setups. Good condition.',
 1, 1.00, 'spare', NULL, 'Lab'),

('USB-A to Micro-USB Short (6 in, White)', 'cable',
 'Very short cable for tight setups. Good condition.',
 1, 1.00, 'spare', NULL, 'Lab'),

('USB-A to USB-C Cable (3 ft, White)', 'cable',
 'For Galaxy S22/S20+ charging and data. Good condition.',
 1, 3.00, 'spare', NULL, 'Lab'),

('Wall Plug to USB 5 W', 'power_supply',
 'AC to USB-A · 5 W output — low power. Good condition.',
 1, 2.00, 'spare', NULL, 'Lab'),

('3-Port Charging Station', 'connector',
 'USB hub/charger. INCOMPLETE — missing power supply cable.',
 1, 5.00, 'spare', NULL, 'Lab'),

('USB-A to USB-C Cable (Damaged)', 'cable',
 'Damaged — may be repairable or strip for parts.',
 1, 0.00, 'spare', NULL, 'Lab');


-- ============================================================
-- INITIATIVES  (15 total)
-- ============================================================

INSERT INTO initiatives (name, description, status, start_date, target_date) VALUES

('Moltbot / Clawdbot Server', 
 'Deploy primary AI agent environment. Termux + proot-distro Ubuntu 24.04. Node.js apps, MQTT, 5-8 agent sessions. Galaxy S22 primary, S20+ failover. P0 — Sprint 1.',
 'suggested', '2026-02-06', NULL),

('Searchbot (OpenClaw)',
 'AI chatbot/agent for the lab and Search Web Services. Core conversational AI product. Hosted on Galaxy S22. P0 — Sprint 1.',
 'executing', '2026-02-06', NULL),

('Home Assistant Dashboard',
 'Jailbreak Echo Show 8, install LineageOS 18.1, deploy as Home Assistant dashboard with 8" display + speakers. URGENT. P0 — Sprint 1.',
 'executing', '2026-02-06', NULL),

('Sovereign RFID Inventory',
 'Privacy-first offline UHF RFID tracking. Chafon reader + ESP32 + Home Assistant + Grocy. Target: warehouses, wine cellars. P1 — Sprint 1.',
 'suggested', NULL, NULL),

('Kombucha Fermentation Sensor',
 'Automated pH/Brix/temp sensor suite for fermentation. ESP32 + Atlas Scientific. No cloud dependency. P2 — Sprint 2.',
 'suggested', NULL, NULL),

('Handheld Local AI NPU',
 'Moonshot: RK3588-based handheld running local LLMs + Whisper STT. Offline voice notes for professionals. P3 — Sprint 3.',
 'suggested', NULL, NULL),

('Lab Inventory Dashboard',
 'Web app to manage devices, parts, and initiatives for the lab. Built by Bay. P1 — Sprint 1.',
 'executing', '2026-02-06', NULL),

('MQTT Broker Deployment',
 'Dedicated Mosquitto MQTT broker for sensor data and device communication. Running on Pixel 3 XL. P1 — Sprint 1.',
 'suggested', NULL, NULL),

('iPhone X Parts Teardown',
 'Strip iPhone X: OLED display, cameras, Taptic Engine, battery. Recycle logic board for precious metals. P1 — Sprint 1.',
 'suggested', '2026-02-06', NULL),

('Tablet Teardown (Pro13)',
 'Open generic Pro13 tablet to identify internal components. Strip usable parts (LCD, battery). P2 — Sprint 1.',
 'suggested', '2026-02-06', NULL),

('Smartwatch Liquidation',
 'List Apple Watches ($50-100 each) and Garmin ($30-80) for sale. Fund lab equipment purchases. P2 — Sprint 1.',
 'suggested', NULL, NULL),

('4G Backup Internet',
 'Configure Qilive U2403 phone as USB-tethered 4G modem for internet failover. P3 — Sprint 1.',
 'suggested', NULL, NULL),

('x86 Mini PC Server',
 'Acquire barebones Intel NUC or mini PC to use SK hynix DDR4 RAM. Better Docker/x86 compatibility. P2 — Sprint 2.',
 'suggested', NULL, NULL),

('Power Bank UPS Testing',
 'Test both power banks (Chargeworx + PocketJuice) for pass-through charging. Deploy as UPS if confirmed. P1 — Sprint 1.',
 'suggested', '2026-02-06', NULL),

('Hard Drive Integration',
 'Bay''s dad donating hard drives. Assess capacity/health and integrate into lab storage infrastructure. P2 — Sprint 1.',
 'suggested', NULL, NULL);


-- ============================================================
-- INITIATIVE ↔ DEVICE ASSIGNMENTS
-- ============================================================

INSERT INTO initiative_devices (initiative_id, device_id, notes) VALUES

-- Moltbot / Clawdbot Server → S22 + S20+
((SELECT id FROM initiatives WHERE name = 'Moltbot / Clawdbot Server'),
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S22'),
 'Primary server'),
((SELECT id FROM initiatives WHERE name = 'Moltbot / Clawdbot Server'),
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S20+'),
 'Failover server'),

-- Searchbot → S22
((SELECT id FROM initiatives WHERE name = 'Searchbot (OpenClaw)'),
 (SELECT id FROM devices WHERE name = 'Samsung Galaxy S22'),
 'Host server'),

-- Home Assistant → Echo Show + Power Banks
((SELECT id FROM initiatives WHERE name = 'Home Assistant Dashboard'),
 (SELECT id FROM devices WHERE name = 'Amazon Echo Show 8'),
 'Dashboard display'),
((SELECT id FROM initiatives WHERE name = 'Home Assistant Dashboard'),
 (SELECT id FROM devices WHERE name = 'Power Bank (Chargeworx)'),
 'UPS backup'),
((SELECT id FROM initiatives WHERE name = 'Home Assistant Dashboard'),
 (SELECT id FROM devices WHERE name = 'Power Bank (PocketJuice)'),
 'UPS backup'),

-- Sovereign RFID → DDR4 (for future NUC edge compute)
((SELECT id FROM initiatives WHERE name = 'Sovereign RFID Inventory'),
 (SELECT id FROM devices WHERE name = 'SK hynix DDR4 SO-DIMM'),
 'Edge compute upgrade (NUC)'),

-- MQTT Broker → Pixel 3 XL
((SELECT id FROM initiatives WHERE name = 'MQTT Broker Deployment'),
 (SELECT id FROM devices WHERE name = 'Google Pixel 3 XL'),
 'Dedicated MQTT broker host'),

-- iPhone X Teardown → iPhone X
((SELECT id FROM initiatives WHERE name = 'iPhone X Parts Teardown'),
 (SELECT id FROM devices WHERE name = 'iPhone X'),
 'Parts donor'),

-- Tablet Teardown → Generic Tablet
((SELECT id FROM initiatives WHERE name = 'Tablet Teardown (Pro13)'),
 (SELECT id FROM devices WHERE name = 'Generic Android Tablet'),
 'Parts donor'),

-- Smartwatch Liquidation → Apple Watch #1, #2, Garmin
((SELECT id FROM initiatives WHERE name = 'Smartwatch Liquidation'),
 (SELECT id FROM devices WHERE name = 'Apple Watch #1'),
 'Sell $50-100'),
((SELECT id FROM initiatives WHERE name = 'Smartwatch Liquidation'),
 (SELECT id FROM devices WHERE name = 'Apple Watch #2'),
 'Sell $50-100'),
((SELECT id FROM initiatives WHERE name = 'Smartwatch Liquidation'),
 (SELECT id FROM devices WHERE name = 'Garmin Smartwatch'),
 'Sell $30-80'),

-- 4G Backup → Qilive
((SELECT id FROM initiatives WHERE name = '4G Backup Internet'),
 (SELECT id FROM devices WHERE name = 'Qilive U2403'),
 '4G LTE tethered modem'),

-- x86 Mini PC → DDR4 RAM
((SELECT id FROM initiatives WHERE name = 'x86 Mini PC Server'),
 (SELECT id FROM devices WHERE name = 'SK hynix DDR4 SO-DIMM'),
 '8 GB DDR4 for NUC'),

-- Power Bank UPS Testing → Both power banks
((SELECT id FROM initiatives WHERE name = 'Power Bank UPS Testing'),
 (SELECT id FROM devices WHERE name = 'Power Bank (Chargeworx)'),
 'Test pass-through charging'),
((SELECT id FROM initiatives WHERE name = 'Power Bank UPS Testing'),
 (SELECT id FROM devices WHERE name = 'Power Bank (PocketJuice)'),
 'Test pass-through charging');


-- ============================================================
-- Done! Verify counts:
-- ============================================================
SELECT 'devices' AS entity, COUNT(*) AS count FROM devices
UNION ALL
SELECT 'parts', COUNT(*) FROM parts
UNION ALL
SELECT 'initiatives', COUNT(*) FROM initiatives
UNION ALL
SELECT 'initiative_devices', COUNT(*) FROM initiative_devices;
