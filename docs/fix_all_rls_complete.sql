-- Script completo para corrigir todas as políticas RLS
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. CORRIGIR TABELA EVENTS
-- ========================================

-- Recriar tabela events com estrutura correta
DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  theme VARCHAR(100) NOT NULL,
  custom_message TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (created_by = auth.uid());

-- ========================================
-- 2. CORRIGIR TABELA MURAL_POSTS
-- ========================================

-- Recriar tabela mural_posts
DROP TABLE IF EXISTS mural_posts CASCADE;

CREATE TABLE mural_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('text', 'image')),
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para mural_posts
CREATE POLICY "Users can view posts from their events" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create posts in their events" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts" ON mural_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON mural_posts
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- 3. CORRIGIR TABELA MURAL_REACTIONS
-- ========================================

-- Recriar tabela mural_reactions
DROP TABLE IF EXISTS mural_reactions CASCADE;

CREATE TABLE mural_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES mural_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- Habilitar RLS
ALTER TABLE mural_reactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para mural_reactions
CREATE POLICY "Users can view reactions from their events" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create reactions in their events" ON mural_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reactions" ON mural_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- 4. CORRIGIR STORAGE BUCKET
-- ========================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mural-images',
  'mural-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Remover políticas antigas de storage
DROP POLICY IF EXISTS "Users can upload images to their events" ON storage.objects;
DROP POLICY IF EXISTS "Users can view images from their events" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their events" ON storage.objects;

-- Criar políticas RLS para storage
CREATE POLICY "Users can upload images to their events" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mural-images' AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id::text = (storage.foldername(name))[1]
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view images from their events" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mural-images' AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id::text = (storage.foldername(name))[1]
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from their events" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mural-images' AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id::text = (storage.foldername(name))[1]
      AND events.created_by = auth.uid()
    )
  );

-- ========================================
-- 5. CRIAR FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mural_posts_updated_at 
  BEFORE UPDATE ON mural_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para events
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_is_active ON events(is_active);

-- Índices para mural_posts
CREATE INDEX idx_mural_posts_event_id ON mural_posts(event_id);
CREATE INDEX idx_mural_posts_user_id ON mural_posts(user_id);
CREATE INDEX idx_mural_posts_created_at ON mural_posts(created_at);

-- Índices para mural_reactions
CREATE INDEX idx_mural_reactions_post_id ON mural_reactions(post_id);
CREATE INDEX idx_mural_reactions_user_id ON mural_reactions(user_id);
CREATE INDEX idx_mural_reactions_created_at ON mural_reactions(created_at);

-- ========================================
-- 7. VERIFICAR SE TUDO FOI CRIADO
-- ========================================

SELECT 'Tabela events criada' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events');
SELECT 'Tabela mural_posts criada' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mural_posts');
SELECT 'Tabela mural_reactions criada' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mural_reactions');
SELECT 'Bucket mural-images criado' as status WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'mural-images');

SELECT 'Políticas RLS events criadas' as status WHERE EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events');
SELECT 'Políticas RLS mural_posts criadas' as status WHERE EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mural_posts');
SELECT 'Políticas RLS mural_reactions criadas' as status WHERE EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mural_reactions');
SELECT 'Políticas RLS storage criadas' as status WHERE EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage');

SELECT 'Triggers updated_at criados' as status WHERE EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at');
SELECT 'Índices criados' as status WHERE EXISTS (SELECT 1 FROM pg_indexes WHERE tablename IN ('events', 'mural_posts', 'mural_reactions')); 