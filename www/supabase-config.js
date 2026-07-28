// ╔══════════════════════════════════════════╗
// ║   Supabase 配置                          ║
// ║   请替换为你的项目 URL 和 anon key        ║
// ╚══════════════════════════════════════════╝

// 1. 去 https://supabase.com 注册免费账号
// 2. 创建新项目
// 3. 在 Settings → API 中找到以下两个值并替换：
const SUPABASE_URL = 'https://kavdjmjfwdbbdgzkfwru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gbjpOH-_bCaAe0eqUwHl2g_PGId1kHB';

// ╔══════════════════════════════════════════╗
// ║   创建数据库表（在 Supabase SQL Editor 执行） ║
// ╚══════════════════════════════════════════╝
/*
-- 日记表
CREATE TABLE diary_entries (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS（行级安全）
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 用户只能读写自己的日记
CREATE POLICY "Users read own diary" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diary" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own diary" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);
*/
