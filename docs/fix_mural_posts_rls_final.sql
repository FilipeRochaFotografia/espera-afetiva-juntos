-- Script FINAL para corrigir políticas RLS da tabela mural_posts
-- Permitir que qualquer pessoa crie posts em eventos ativos (acesso via PIN)
-- Execute este script no Supabase SQL Editor

-- ========================================
-- CORRIGIR POLÍTICAS MURAL_POSTS
-- ========================================

-- Remover TODAS as políticas antigas de mural_posts
DROP POLICY IF EXISTS "Users can view posts from their events" ON mural_posts;
DROP POLICY IF EXISTS "Users can create posts in their events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can view posts from active events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can create posts in active events" ON mural_posts;

-- Criar política que permite visualizar posts de eventos ativos
CREATE POLICY "Anyone can view posts from active events" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- Criar política que permite criar posts em eventos ativos
CREATE POLICY "Anyone can create posts in active events" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- Manter políticas de atualização e exclusão (usuário só pode editar/deletar seus próprios posts)
-- (Estas políticas já devem existir, mas vamos garantir que estão corretas)

-- Política para atualizar posts próprios
CREATE POLICY "Users can update their own posts" ON mural_posts
  FOR UPDATE USING (user_id = auth.uid());

-- Política para deletar posts próprios
CREATE POLICY "Users can delete their own posts" ON mural_posts
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- CORRIGIR POLÍTICAS MURAL_REACTIONS
-- ========================================

-- Remover TODAS as políticas antigas de mural_reactions
DROP POLICY IF EXISTS "Users can view reactions from their events" ON mural_reactions;
DROP POLICY IF EXISTS "Users can create reactions in their events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions from active events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can create reactions in active events" ON mural_reactions;

-- Criar política que permite visualizar reações de eventos ativos
CREATE POLICY "Anyone can view reactions from active events" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- Criar política que permite criar reações em eventos ativos
CREATE POLICY "Anyone can create reactions in active events" ON mural_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- Manter política de exclusão (usuário só pode deletar suas próprias reações)
CREATE POLICY "Users can delete their own reactions" ON mural_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- VERIFICAR RESULTADO
-- ========================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('mural_posts', 'mural_reactions')
ORDER BY tablename, policyname;

-- ========================================
-- TESTE DE VERIFICAÇÃO
-- ========================================

-- Verificar se há eventos ativos
SELECT 
  id, 
  name, 
  is_active, 
  created_by 
FROM events 
WHERE is_active = true 
LIMIT 5;

-- Verificar se há posts existentes
SELECT 
  mp.id,
  mp.event_id,
  mp.user_id,
  mp.type,
  e.name as event_name,
  e.is_active
FROM mural_posts mp
JOIN events e ON mp.event_id = e.id
LIMIT 5; 