# 数据库初始化指南

## 📋 初始化步骤

### 方法 1: 使用 Supabase Dashboard（推荐）

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 在左侧菜单点击 "SQL Editor"
   - 点击 "New query"

3. **执行初始化脚本**
   
   **第一步：创建表结构**
   - 复制 `supabase/game_core_schema.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

   **第二步：初始化数据**
   - 复制 `supabase/init_game_core_data.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

4. **验证数据**
   - 执行以下查询检查数据是否创建成功：
   ```sql
   -- 检查分类
   SELECT name, name_en, icon FROM game_categories WHERE is_active = true;
   
   -- 检查模板
   SELECT name, name_en, difficulty FROM game_templates WHERE is_active = true;
   ```

### 方法 2: 使用 Supabase CLI

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接到项目
supabase link --project-ref your-project-ref

# 3. 执行 SQL 文件
supabase db execute -f supabase/game_core_schema.sql
supabase db execute -f supabase/init_game_core_data.sql
```

## 🔍 验证数据

执行以下 SQL 查询验证数据：

```sql
-- 1. 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('game_categories', 'game_templates');

-- 2. 检查分类数据
SELECT 
  id,
  name,
  name_en,
  icon,
  is_active,
  display_order
FROM game_categories
ORDER BY display_order;

-- 3. 检查模板数据
SELECT 
  t.id,
  t.name,
  t.name_en,
  t.difficulty,
  c.name as category_name
FROM game_templates t
JOIN game_categories c ON t.category_id = c.id
WHERE t.is_active = true
ORDER BY t.display_order;

-- 4. 检查 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('game_categories', 'game_templates');
```

## ⚠️ 常见问题

### 问题 1: "relation does not exist"
**原因**: 表还没有创建
**解决**: 先执行 `game_core_schema.sql`

### 问题 2: "duplicate key value violates unique constraint"
**原因**: 数据已经存在
**解决**: 这是正常的，脚本使用了 `ON CONFLICT DO NOTHING` 或 `ON CONFLICT DO UPDATE`

### 问题 3: "permission denied"
**原因**: RLS 策略配置错误
**解决**: 检查 RLS 策略是否正确创建，确保有 "Public can view active game categories" 策略

### 问题 4: 前端显示 "暂无可用类别"
**可能原因**:
1. 数据未初始化
2. RLS 策略阻止了查询
3. 网络连接问题

**排查步骤**:
1. 在 Supabase Dashboard 中执行验证查询
2. 检查浏览器控制台是否有错误
3. 检查网络请求是否成功（F12 → Network）

## 📝 手动插入数据（如果需要）

如果自动脚本失败，可以手动插入：

```sql
-- 插入卡牌游戏分类
INSERT INTO game_categories (
  name, name_en, icon, description, description_en, 
  is_active, display_order, metadata
) VALUES (
  '卡牌游戏',
  'Card Games',
  '🃏',
  '策略与运气的完美结合',
  'Perfect combination of strategy and luck',
  true,
  1,
  '{}'::jsonb
);
```

## 🔄 重置数据（如果需要）

如果需要重新初始化：

```sql
-- 删除所有模板
DELETE FROM game_templates;

-- 删除所有分类
DELETE FROM game_categories;

-- 然后重新执行 init_game_core_data.sql
```

## 📞 需要帮助？

如果遇到问题：
1. 检查 Supabase Dashboard 的日志
2. 查看浏览器控制台的错误信息
3. 确认环境变量配置正确
