-- ============================================================
-- Seed: 001_foods.sql
-- Description: Indian and South Indian food catalogue (50+ items)
-- Sources: NIN India (National Institute of Nutrition) reference values.
--          Mixed dishes marked as approximate (requires_variation_warning = true).
-- ============================================================

-- We insert with a fixed ID so aliases can reference them reliably.

INSERT INTO foods (
  id, owner_user_id, name, normalized_name,
  food_type, source_type,
  calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  default_serving_name, default_serving_weight_g,
  is_verified, requires_variation_warning,
  description
) VALUES

-- RICE AND GRAINS
('00000001-0000-0000-0000-000000000001', NULL, 'Cooked White Rice', 'cooked white rice',
 'SYSTEM', 'INDIAN_REFERENCE', 130, 2.7, 28.2, 0.3, 'medium plate', 180, TRUE, FALSE,
 'Plain boiled white rice (130 kcal per 100g)'),

('00000001-0000-0000-0000-000000000002', NULL, 'Brown Rice (Cooked)', 'brown rice cooked',
 'SYSTEM', 'INDIAN_REFERENCE', 112, 2.6, 23.5, 0.9, 'medium plate', 180, TRUE, FALSE,
 'Cooked brown rice'),

('00000001-0000-0000-0000-000000000003', NULL, 'Poha', 'poha',
 'SYSTEM', 'INDIAN_REFERENCE', 130, 2.1, 28.2, 0.5, 'serving bowl', 150, TRUE, TRUE,
 'Flattened rice / beaten rice preparation. Calories vary with oil and vegetables.'),

('00000001-0000-0000-0000-000000000004', NULL, 'Oats (Cooked)', 'oats cooked',
 'SYSTEM', 'INDIAN_REFERENCE', 68, 2.4, 12.0, 1.4, 'bowl', 200, TRUE, FALSE,
 'Plain cooked oats with water'),

('00000001-0000-0000-0000-000000000005', NULL, 'Ragi Malt', 'ragi malt',
 'SYSTEM', 'INDIAN_REFERENCE', 72, 2.2, 14.8, 0.5, 'glass', 200, TRUE, FALSE,
 'Finger millet porridge'),

-- SOUTH INDIAN BREAKFAST
('00000001-0000-0000-0000-000000000010', NULL, 'Idli', 'idli',
 'SYSTEM', 'INDIAN_REFERENCE', 58, 2.0, 11.5, 0.4, '1 idli', 40, TRUE, FALSE,
 'Steamed rice and lentil cake. Standard idli approx 40g.'),

('00000001-0000-0000-0000-000000000011', NULL, 'Plain Dosa', 'plain dosa',
 'SYSTEM', 'INDIAN_REFERENCE', 133, 3.4, 26.0, 1.5, '1 dosa', 75, TRUE, FALSE,
 'Plain crispy dosa without filling'),

('00000001-0000-0000-0000-000000000012', NULL, 'Masala Dosa', 'masala dosa',
 'SYSTEM', 'INDIAN_REFERENCE', 175, 4.5, 28.0, 5.0, '1 dosa', 150, TRUE, TRUE,
 'Dosa with potato filling. Calories vary with oil and filling quantity.'),

('00000001-0000-0000-0000-000000000013', NULL, 'Pesarattu', 'pesarattu',
 'SYSTEM', 'INDIAN_REFERENCE', 155, 7.0, 22.0, 4.5, '1 pesarattu', 100, TRUE, TRUE,
 'Green gram dosa. Calories vary with oil used.'),

('00000001-0000-0000-0000-000000000014', NULL, 'Upma', 'upma',
 'SYSTEM', 'INDIAN_REFERENCE', 127, 3.0, 22.5, 3.5, 'bowl', 150, TRUE, TRUE,
 'Semolina porridge. Calories vary with oil and vegetables.'),

('00000001-0000-0000-0000-000000000015', NULL, 'Ven Pongal', 'ven pongal',
 'SYSTEM', 'INDIAN_REFERENCE', 140, 4.5, 22.0, 4.0, 'bowl', 200, TRUE, TRUE,
 'Rice and lentil preparation with ghee. Calories vary with ghee.'),

('00000001-0000-0000-0000-000000000016', NULL, 'Vada (Medu Vada)', 'vada medu vada',
 'SYSTEM', 'INDIAN_REFERENCE', 265, 9.0, 30.0, 12.0, '1 vada', 45, TRUE, TRUE,
 'Deep fried lentil donut. Calories vary with oil absorption.'),

('00000001-0000-0000-0000-000000000017', NULL, 'Poori', 'poori',
 'SYSTEM', 'INDIAN_REFERENCE', 325, 6.5, 42.0, 14.5, '1 poori', 40, TRUE, TRUE,
 'Deep fried wheat bread. Calories vary with oil absorption.'),

-- RICE DISHES
('00000001-0000-0000-0000-000000000020', NULL, 'Curd Rice', 'curd rice',
 'SYSTEM', 'INDIAN_REFERENCE', 110, 3.0, 18.0, 2.5, 'bowl', 200, TRUE, FALSE,
 'Cooked rice with curd. Also called Perugu Annam or Yogurt Rice.'),

('00000001-0000-0000-0000-000000000021', NULL, 'Lemon Rice', 'lemon rice',
 'SYSTEM', 'INDIAN_REFERENCE', 150, 2.5, 28.0, 4.0, 'bowl', 180, TRUE, TRUE,
 'Rice tempered with lemon, mustard seeds and peanuts.'),

('00000001-0000-0000-0000-000000000022', NULL, 'Tamarind Rice', 'tamarind rice',
 'SYSTEM', 'INDIAN_REFERENCE', 170, 3.0, 28.0, 5.0, 'bowl', 180, TRUE, TRUE,
 'Pulihora / Chitrannam. Tangy tamarind seasoned rice.'),

('00000001-0000-0000-0000-000000000023', NULL, 'Sambar Rice', 'sambar rice',
 'SYSTEM', 'INDIAN_REFERENCE', 120, 4.0, 22.0, 2.0, 'bowl', 200, TRUE, TRUE,
 'Rice mixed with sambar. Calories vary with sambar recipe.'),

-- ACCOMPANIMENTS
('00000001-0000-0000-0000-000000000030', NULL, 'Sambar', 'sambar',
 'SYSTEM', 'INDIAN_REFERENCE', 55, 3.0, 8.0, 1.5, 'ladle', 100, TRUE, TRUE,
 'Lentil vegetable stew. Calories vary with vegetables and oil.'),

('00000001-0000-0000-0000-000000000031', NULL, 'Rasam', 'rasam',
 'SYSTEM', 'INDIAN_REFERENCE', 30, 1.5, 4.5, 0.8, 'small bowl', 150, TRUE, FALSE,
 'Thin tamarind and tomato soup'),

('00000001-0000-0000-0000-000000000032', NULL, 'Coconut Chutney', 'coconut chutney',
 'SYSTEM', 'INDIAN_REFERENCE', 190, 2.0, 8.0, 17.0, 'serving', 30, TRUE, FALSE,
 'Fresh coconut chutney with green chilli'),

('00000001-0000-0000-0000-000000000033', NULL, 'Tomato Chutney', 'tomato chutney',
 'SYSTEM', 'INDIAN_REFERENCE', 80, 1.5, 10.0, 4.0, 'serving', 30, TRUE, FALSE,
 'Cooked tomato chutney'),

('00000001-0000-0000-0000-000000000034', NULL, 'Peanut Chutney', 'peanut chutney',
 'SYSTEM', 'INDIAN_REFERENCE', 280, 9.0, 12.0, 22.0, 'serving', 30, TRUE, FALSE,
 'Groundnut chutney'),

-- BREADS
('00000001-0000-0000-0000-000000000040', NULL, 'Chapati', 'chapati',
 'SYSTEM', 'INDIAN_REFERENCE', 297, 9.0, 53.0, 5.0, '1 chapati', 30, TRUE, FALSE,
 'Whole wheat flatbread. Also called roti.'),

('00000001-0000-0000-0000-000000000041', NULL, 'Paratha', 'paratha',
 'SYSTEM', 'INDIAN_REFERENCE', 350, 7.5, 50.0, 13.0, '1 paratha', 60, TRUE, TRUE,
 'Layered flatbread with ghee. Calories vary significantly with ghee.'),

('00000001-0000-0000-0000-000000000042', NULL, 'Bread (White Slice)', 'bread white slice',
 'SYSTEM', 'INDIAN_REFERENCE', 265, 7.6, 51.2, 3.2, '1 slice', 25, TRUE, FALSE,
 'Commercial white bread slice'),

-- DAL AND LENTILS
('00000001-0000-0000-0000-000000000050', NULL, 'Plain Dal (Cooked)', 'plain dal cooked',
 'SYSTEM', 'INDIAN_REFERENCE', 100, 6.8, 14.5, 1.5, 'bowl', 150, TRUE, FALSE,
 'Simply cooked toor/moong dal. Also called Pappu.'),

('00000001-0000-0000-0000-000000000051', NULL, 'Dal Tadka', 'dal tadka',
 'SYSTEM', 'INDIAN_REFERENCE', 120, 7.0, 14.0, 4.0, 'bowl', 150, TRUE, TRUE,
 'Tempered lentils. Calories vary with ghee and oil.'),

('00000001-0000-0000-0000-000000000052', NULL, 'Dal Makhani', 'dal makhani',
 'SYSTEM', 'INDIAN_REFERENCE', 125, 6.0, 12.0, 5.5, 'bowl', 180, TRUE, TRUE,
 'Creamy black lentils. Calories vary significantly with butter and cream.'),

('00000001-0000-0000-0000-000000000053', NULL, 'Rajma', 'rajma',
 'SYSTEM', 'INDIAN_REFERENCE', 110, 7.5, 15.0, 2.0, 'bowl', 180, TRUE, TRUE,
 'Red kidney bean curry. Calories vary with oil and cream.'),

('00000001-0000-0000-0000-000000000054', NULL, 'Chana Masala', 'chana masala',
 'SYSTEM', 'INDIAN_REFERENCE', 160, 9.0, 20.0, 5.0, 'bowl', 180, TRUE, TRUE,
 'Spiced chickpea curry. Calories vary with oil.'),

-- VEGETABLE CURRIES
('00000001-0000-0000-0000-000000000060', NULL, 'Paneer Butter Masala', 'paneer butter masala',
 'SYSTEM', 'INDIAN_REFERENCE', 200, 8.0, 10.0, 15.0, 'bowl', 180, TRUE, TRUE,
 'Paneer in rich tomato cream sauce. Calories vary significantly.'),

('00000001-0000-0000-0000-000000000061', NULL, 'Paneer Curry', 'paneer curry',
 'SYSTEM', 'INDIAN_REFERENCE', 165, 9.0, 8.0, 11.0, 'bowl', 180, TRUE, TRUE,
 'Cottage cheese curry. Calories vary with oil.'),

('00000001-0000-0000-0000-000000000062', NULL, 'Vegetable Curry', 'vegetable curry',
 'SYSTEM', 'INDIAN_REFERENCE', 80, 2.5, 10.0, 3.5, 'bowl', 180, TRUE, TRUE,
 'Mixed vegetable curry. Calories vary with oil and vegetables.'),

('00000001-0000-0000-0000-000000000063', NULL, 'Potato Curry (Aloo Curry)', 'potato curry aloo curry',
 'SYSTEM', 'INDIAN_REFERENCE', 120, 2.0, 18.0, 4.5, 'bowl', 180, TRUE, TRUE,
 'Spiced potato curry. Calories vary with oil.'),

('00000001-0000-0000-0000-000000000064', NULL, 'Palak Curry', 'palak curry',
 'SYSTEM', 'INDIAN_REFERENCE', 90, 4.0, 6.0, 5.5, 'bowl', 180, TRUE, TRUE,
 'Spinach based curry. Calories vary with oil and cream.'),

-- NON-VEGETARIAN
('00000001-0000-0000-0000-000000000070', NULL, 'Chicken Curry', 'chicken curry',
 'SYSTEM', 'INDIAN_REFERENCE', 155, 16.0, 4.0, 8.5, 'bowl', 180, TRUE, TRUE,
 'Spiced chicken curry. Calories vary significantly with preparation.'),

('00000001-0000-0000-0000-000000000071', NULL, 'Egg Curry', 'egg curry',
 'SYSTEM', 'INDIAN_REFERENCE', 140, 9.5, 5.0, 9.5, 'bowl', 150, TRUE, TRUE,
 'Hard boiled eggs in spiced gravy.'),

('00000001-0000-0000-0000-000000000072', NULL, 'Fish Curry', 'fish curry',
 'SYSTEM', 'INDIAN_REFERENCE', 130, 15.0, 3.0, 7.0, 'bowl', 150, TRUE, TRUE,
 'Spiced fish curry. Calories vary with fish type and oil.'),

('00000001-0000-0000-0000-000000000073', NULL, 'Chicken Biryani', 'chicken biryani',
 'SYSTEM', 'INDIAN_REFERENCE', 195, 12.0, 22.0, 6.5, 'plate', 300, TRUE, TRUE,
 'Layered spiced rice with chicken. Calories vary significantly with recipe.'),

('00000001-0000-0000-0000-000000000074', NULL, 'Vegetable Biryani', 'vegetable biryani',
 'SYSTEM', 'INDIAN_REFERENCE', 165, 4.5, 26.0, 5.0, 'plate', 280, TRUE, TRUE,
 'Layered spiced rice with vegetables. Calories vary with recipe.'),

-- DAIRY AND BEVERAGES
('00000001-0000-0000-0000-000000000080', NULL, 'Curd (Yogurt)', 'curd yogurt',
 'SYSTEM', 'INDIAN_REFERENCE', 60, 3.2, 4.7, 3.0, 'small bowl', 100, TRUE, FALSE,
 'Plain fresh curd / yogurt'),

('00000001-0000-0000-0000-000000000081', NULL, 'Buttermilk', 'buttermilk',
 'SYSTEM', 'INDIAN_REFERENCE', 15, 0.8, 1.8, 0.5, 'glass', 200, TRUE, FALSE,
 'Diluted spiced curd drink. Also called Majjiga.'),

('00000001-0000-0000-0000-000000000082', NULL, 'Milk (Full Fat)', 'milk full fat',
 'SYSTEM', 'INDIAN_REFERENCE', 61, 3.2, 4.7, 3.3, 'glass', 200, TRUE, FALSE,
 'Full fat cow milk'),

('00000001-0000-0000-0000-000000000083', NULL, 'Tea with Milk and Sugar', 'tea with milk and sugar',
 'SYSTEM', 'INDIAN_REFERENCE', 35, 0.8, 5.5, 1.2, 'cup', 150, TRUE, TRUE,
 'Chai with milk and sugar. Calories vary with milk and sugar quantity.'),

('00000001-0000-0000-0000-000000000084', NULL, 'Coffee with Milk and Sugar', 'coffee with milk and sugar',
 'SYSTEM', 'INDIAN_REFERENCE', 38, 1.0, 5.5, 1.4, 'cup', 150, TRUE, TRUE,
 'Filter coffee or instant coffee with milk and sugar.'),

-- EGGS
('00000001-0000-0000-0000-000000000090', NULL, 'Boiled Egg', 'boiled egg',
 'SYSTEM', 'INDIAN_REFERENCE', 155, 13.0, 1.1, 11.0, '1 egg', 50, TRUE, FALSE,
 'Hard boiled whole egg'),

('00000001-0000-0000-0000-000000000091', NULL, 'Omelette (Plain)', 'omelette plain',
 'SYSTEM', 'INDIAN_REFERENCE', 175, 12.5, 0.7, 14.0, '2-egg omelette', 90, TRUE, TRUE,
 'Plain egg omelette. Calories vary with oil.'),

-- FRUITS
('00000001-0000-0000-0000-000000000100', NULL, 'Banana', 'banana',
 'SYSTEM', 'INDIAN_REFERENCE', 89, 1.1, 23.0, 0.3, '1 medium banana', 120, TRUE, FALSE,
 'Fresh ripe banana'),

('00000001-0000-0000-0000-000000000101', NULL, 'Apple', 'apple',
 'SYSTEM', 'INDIAN_REFERENCE', 52, 0.3, 14.0, 0.2, '1 medium apple', 150, TRUE, FALSE,
 'Fresh apple with skin'),

-- NUTS AND SPREADS
('00000001-0000-0000-0000-000000000110', NULL, 'Peanut Butter', 'peanut butter',
 'SYSTEM', 'INDIAN_REFERENCE', 588, 25.0, 20.0, 50.0, '1 tbsp', 16, TRUE, FALSE,
 'Plain peanut butter')

ON CONFLICT (id) DO NOTHING;
