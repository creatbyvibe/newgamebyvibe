-- Enjoy ByVibe 完整数据库设置脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 启用 UUID 扩展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. 创建表结构
-- ============================================

-- Profiles 表（用户资料）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creations 表（用户作品）
CREATE TABLE IF NOT EXISTS creations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  html_code TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  likes INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  auto_saved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creation Versions 表（版本历史）
CREATE TABLE IF NOT EXISTS creation_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  html_code TEXT NOT NULL,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creation Likes 表（点赞记录）
CREATE TABLE IF NOT EXISTS creation_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creation_id)
);

-- Creation Comments 表（评论）
CREATE TABLE IF NOT EXISTS creation_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks 表（收藏）
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creation_id)
);

-- Game Saves 表（游戏存档）
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creation_id UUID NOT NULL REFERENCES creations(id) ON DELETE CASCADE,
  save_slot INTEGER DEFAULT 1,
  save_name TEXT,
  save_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creation_id, save_slot)
);

-- ============================================
-- 3. 创建索引（提升查询性能）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_creations_public ON creations(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_creations_created_at ON creations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creations_likes ON creations(likes DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_creation_versions_creation_id ON creation_versions(creation_id);
CREATE INDEX IF NOT EXISTS idx_creation_versions_version ON creation_versions(creation_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_creation_likes_creation_id ON creation_likes(creation_id);
CREATE INDEX IF NOT EXISTS idx_creation_comments_creation_id ON creation_comments(creation_id);

-- ============================================
-- 4. 启用 Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 创建 RLS 策略
-- ============================================

-- Profiles 策略
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Creations 策略
CREATE POLICY "Anyone can view public creations"
  ON creations FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own creations"
  ON creations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creations"
  ON creations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own creations"
  ON creations FOR DELETE
  USING (auth.uid() = user_id);

-- Creation Versions 策略
CREATE POLICY "Users can view versions of own creations"
  ON creation_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creations
      WHERE creations.id = creation_versions.creation_id
        AND creations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for own creations"
  ON creation_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creations
      WHERE creations.id = creation_versions.creation_id
        AND creations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update versions of own creations"
  ON creation_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM creations
      WHERE creations.id = creation_versions.creation_id
        AND creations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete versions of own creations"
  ON creation_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM creations
      WHERE creations.id = creation_versions.creation_id
        AND creations.user_id = auth.uid()
    )
  );

-- Creation Likes 策略
CREATE POLICY "Anyone can view likes"
  ON creation_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON creation_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Creation Comments 策略
CREATE POLICY "Anyone can view comments on public creations"
  ON creation_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM creations
      WHERE creations.id = creation_comments.creation_id
        AND creations.is_public = true
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can create comments"
  ON creation_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON creation_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON creation_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks 策略
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game Saves 策略
CREATE POLICY "Users can manage own game saves"
  ON game_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. 创建数据库函数（用于自动更新）
-- ============================================

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 creations 表添加触发器
CREATE TRIGGER update_creations_updated_at
  BEFORE UPDATE ON creations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 creation_comments 表添加触发器
CREATE TRIGGER update_creation_comments_updated_at
  BEFORE UPDATE ON creation_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 game_saves 表添加触发器
CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON game_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. 创建点赞计数函数（可选）
-- ============================================

-- 当点赞/取消点赞时，自动更新 creations.likes 计数
CREATE OR REPLACE FUNCTION update_creation_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE creations
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = NEW.creation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE creations
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = OLD.creation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_likes_count_on_like
  AFTER INSERT OR DELETE ON creation_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_creation_likes_count();

-- ============================================
-- 完成！
-- ============================================
-- 所有表、索引、RLS 策略和触发器已创建
-- 现在可以开始使用数据库了