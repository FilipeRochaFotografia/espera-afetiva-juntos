-- Script SIMPLES para corrigir erro de upload de fotos
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR SE O EVENTO ESTÁ ATIVO
-- ========================================

-- Verificar eventos ativos
SELECT 
  id, 
  name, 
  is_active, 
  created_by 
FROM events 
WHERE is_active = true;

-- ========================================
-- 2. CORRIGIR POLÍTICAS RLS DO MURAL_POSTS
-- ========================================

-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view posts from their events" ON mural_posts;
DROP POLICY IF EXISTS "Users can create posts in their events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can view posts from active events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can create posts in active events" ON mural_posts;

-- Criar política SIMPLES que permite criar posts em eventos ativos
CREATE POLICY "Allow posts in active events" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- Criar política SIMPLES que permite visualizar posts de eventos ativos
CREATE POLICY "Allow viewing posts from active events" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- ========================================
-- 3. CORRIGIR POLÍTICAS RLS DO MURAL_REACTIONS
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view reactions from their events" ON mural_reactions;
DROP POLICY IF EXISTS "Users can create reactions in their events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions from active events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can create reactions in active events" ON mural_reactions;

-- Criar política SIMPLES que permite criar reações em eventos ativos
CREATE POLICY "Allow reactions in active events" ON mural_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- Criar política SIMPLES que permite visualizar reações de eventos ativos
CREATE POLICY "Allow viewing reactions from active events" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- ========================================
-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ========================================

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('mural_posts', 'mural_reactions')
ORDER BY tablename, policyname;

-- ========================================
-- 5. TESTE SIMPLES
-- ========================================

-- Verificar se há eventos ativos
SELECT 
  COUNT(*) as eventos_ativos
FROM events 
WHERE is_active = true;

-- Verificar se há posts existentes
SELECT 
  COUNT(*) as posts_existentes
FROM mural_posts;

-- ========================================
-- 6. MENSAGEM DE SUCESSO
-- ========================================

-- Se chegou até aqui, as políticas foram criadas com sucesso
-- Agora teste o upload de fotos no app! 