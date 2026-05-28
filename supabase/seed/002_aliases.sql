-- ============================================================
-- Seed: 002_aliases.sql
-- Description: Regional and alternate food name aliases
-- ============================================================

INSERT INTO food_aliases (food_id, alias, normalized_alias, language_or_region)
VALUES
-- Cooked White Rice aliases
('00000001-0000-0000-0000-000000000001', 'Annam', 'annam', 'Telugu'),
('00000001-0000-0000-0000-000000000001', 'Sadam', 'sadam', 'Tamil'),
('00000001-0000-0000-0000-000000000001', 'Bhat', 'bhat', 'Hindi'),
('00000001-0000-0000-0000-000000000001', 'Cooked Rice', 'cooked rice', 'English'),
('00000001-0000-0000-0000-000000000001', 'White Rice', 'white rice', 'English'),
('00000001-0000-0000-0000-000000000001', 'Plain Rice', 'plain rice', 'English'),

-- Curd Rice aliases
('00000001-0000-0000-0000-000000000020', 'Perugu Annam', 'perugu annam', 'Telugu'),
('00000001-0000-0000-0000-000000000020', 'Perugu Sadam', 'perugu sadam', 'Tamil'),
('00000001-0000-0000-0000-000000000020', 'Yogurt Rice', 'yogurt rice', 'English'),
('00000001-0000-0000-0000-000000000020', 'Dahi Chawal', 'dahi chawal', 'Hindi'),
('00000001-0000-0000-0000-000000000020', 'Thayir Sadam', 'thayir sadam', 'Tamil'),

-- Plain Dal aliases
('00000001-0000-0000-0000-000000000050', 'Pappu', 'pappu', 'Telugu'),
('00000001-0000-0000-0000-000000000050', 'Mudda Pappu', 'mudda pappu', 'Telugu'),
('00000001-0000-0000-0000-000000000050', 'Paruppu', 'paruppu', 'Tamil'),
('00000001-0000-0000-0000-000000000050', 'Dal', 'dal', 'Hindi'),
('00000001-0000-0000-0000-000000000050', 'Dhal', 'dhal', 'English'),
('00000001-0000-0000-0000-000000000050', 'Cooked Lentils', 'cooked lentils', 'English'),

-- Tamarind Rice aliases
('00000001-0000-0000-0000-000000000022', 'Pulihora', 'pulihora', 'Telugu'),
('00000001-0000-0000-0000-000000000022', 'Puliyodarai', 'puliyodarai', 'Tamil'),
('00000001-0000-0000-0000-000000000022', 'Chitrannam', 'chitrannam', 'Telugu'),
('00000001-0000-0000-0000-000000000022', 'Tamarind Rice', 'tamarind rice', 'English'),
('00000001-0000-0000-0000-000000000022', 'Imli Rice', 'imli rice', 'Hindi'),

-- Pesarattu aliases
('00000001-0000-0000-0000-000000000013', 'Pesarattu', 'pesarattu', 'Telugu'),
('00000001-0000-0000-0000-000000000013', 'Green Gram Dosa', 'green gram dosa', 'English'),
('00000001-0000-0000-0000-000000000013', 'Moong Dal Dosa', 'moong dal dosa', 'English'),

-- Upma aliases
('00000001-0000-0000-0000-000000000014', 'Uppittu', 'uppittu', 'Kannada'),
('00000001-0000-0000-0000-000000000014', 'Uppuma', 'uppuma', 'Tamil'),
('00000001-0000-0000-0000-000000000014', 'Semolina Porridge', 'semolina porridge', 'English'),
('00000001-0000-0000-0000-000000000014', 'Rava Upma', 'rava upma', 'English'),

-- Chapati aliases
('00000001-0000-0000-0000-000000000040', 'Roti', 'roti', 'Hindi'),
('00000001-0000-0000-0000-000000000040', 'Chapathi', 'chapathi', 'English'),
('00000001-0000-0000-0000-000000000040', 'Phulka', 'phulka', 'Hindi'),
('00000001-0000-0000-0000-000000000040', 'Wheat Roti', 'wheat roti', 'English'),

-- Buttermilk aliases
('00000001-0000-0000-0000-000000000081', 'Majjiga', 'majjiga', 'Telugu'),
('00000001-0000-0000-0000-000000000081', 'Mor', 'mor', 'Tamil'),
('00000001-0000-0000-0000-000000000081', 'Chaas', 'chaas', 'Hindi'),

-- Curd aliases
('00000001-0000-0000-0000-000000000080', 'Perugu', 'perugu', 'Telugu'),
('00000001-0000-0000-0000-000000000080', 'Thayir', 'thayir', 'Tamil'),
('00000001-0000-0000-0000-000000000080', 'Dahi', 'dahi', 'Hindi'),
('00000001-0000-0000-0000-000000000080', 'Yogurt', 'yogurt', 'English'),

-- Vada aliases
('00000001-0000-0000-0000-000000000016', 'Garelu', 'garelu', 'Telugu'),
('00000001-0000-0000-0000-000000000016', 'Ulundu Vadai', 'ulundu vadai', 'Tamil'),
('00000001-0000-0000-0000-000000000016', 'Medu Vada', 'medu vada', 'English'),

-- Sambar Rice aliases
('00000001-0000-0000-0000-000000000023', 'Sambar Sadam', 'sambar sadam', 'Tamil'),
('00000001-0000-0000-0000-000000000023', 'Pappu Annam', 'pappu annam', 'Telugu'),

-- Ven Pongal aliases
('00000001-0000-0000-0000-000000000015', 'Kichadi', 'kichadi', 'Telugu'),
('00000001-0000-0000-0000-000000000015', 'Khichdi', 'khichdi', 'Hindi'),
('00000001-0000-0000-0000-000000000015', 'Pongal', 'pongal', 'Tamil')

ON CONFLICT DO NOTHING;
