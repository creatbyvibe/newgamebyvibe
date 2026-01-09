-- Verify game categories and templates
SELECT 
  'Categories: ' || COUNT(*)::text as result
FROM game_categories
WHERE is_active = true;

SELECT 
  'Templates: ' || COUNT(*)::text as result
FROM game_templates
WHERE is_active = true;

-- Show all categories
SELECT 
  name,
  name_en,
  icon,
  display_order
FROM game_categories
WHERE is_active = true
ORDER BY display_order;

-- Show all templates
SELECT 
  t.name,
  t.name_en,
  t.difficulty,
  c.name as category_name
FROM game_templates t
JOIN game_categories c ON t.category_id = c.id
WHERE t.is_active = true
ORDER BY t.display_order;
