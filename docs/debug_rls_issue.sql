-- Script para debugar e corrigir problema de RLS no mural_posts
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR STATUS ATUAL
-- ========================================

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'mural_posts';

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'mural_posts'
ORDER BY policyname;

-- Verificar eventos ativos
SELECT 
  id, 
  name, 
  is_active, 
  created_by,
  created_at
FROM events 
WHERE is_active = true 
ORDER BY created_at DESC;

-- Verificar usuários autenticados (se possível)
SELECT 
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- 2. CORRIGIR POLÍTICAS RLS
-- ========================================

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view posts from their events" ON mural_posts;
DROP POLICY IF EXISTS "Users can create posts in their events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can view posts from active events" ON mural_posts;
DROP POLICY IF EXISTS "Anyone can create posts in active events" ON mural_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON mural_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON mural_posts;

-- Criar políticas corretas
-- 1. Qualquer pessoa pode visualizar posts de eventos ativos
CREATE POLICY "Anyone can view posts from active events" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- 2. Qualquer pessoa pode criar posts em eventos ativos
CREATE POLICY "Anyone can create posts in active events" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- 3. Usuário só pode atualizar seus próprios posts
CREATE POLICY "Users can update their own posts" ON mural_posts
  FOR UPDATE USING (user_id = auth.uid());

-- 4. Usuário só pode deletar seus próprios posts
CREATE POLICY "Users can delete their own posts" ON mural_posts
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- 3. CORRIGIR POLÍTICAS MURAL_REACTIONS
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view reactions from their events" ON mural_reactions;
DROP POLICY IF EXISTS "Users can create reactions in their events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions from active events" ON mural_reactions;
DROP POLICY IF EXISTS "Anyone can create reactions in active events" ON mural_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON mural_reactions;

-- Criar políticas corretas
-- 1. Qualquer pessoa pode visualizar reações de eventos ativos
CREATE POLICY "Anyone can view reactions from active events" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- 2. Qualquer pessoa pode criar reações em eventos ativos
CREATE POLICY "Anyone can create reactions in active events" ON mural_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- 3. Usuário só pode deletar suas próprias reações
CREATE POLICY "Users can delete their own reactions" ON mural_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- 4. VERIFICAR RESULTADO
-- ========================================

-- Verificar políticas criadas
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
-- 5. TESTE DE FUNCIONALIDADE
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

-- Verificar estrutura da tabela mural_posts
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_posts'
ORDER BY ordinal_position;

-- ========================================
-- 6. COMANDOS DE TESTE (executar manualmente)
-- ========================================

-- Para testar se as políticas funcionam, execute no SQL Editor:
-- (Substitua os UUIDs pelos valores reais do seu banco)

/*
-- Teste 1: Verificar se consegue inserir post
INSERT INTO mural_posts (event_id, user_id, type, content)
VALUES (
  'UUID_DO_EVENTO_ATIVO',  -- Substitua pelo UUID de um evento ativo
  'UUID_DO_USUARIO',       -- Substitua pelo UUID do usuário autenticado
  'text',
  'Teste de post'
);

-- Teste 2: Verificar se consegue visualizar posts
SELECT * FROM mural_posts 
WHERE event_id = 'UUID_DO_EVENTO_ATIVO';

-- Teste 3: Verificar se consegue criar reação
INSERT INTO mural_reactions (post_id, user_id, emoji)
VALUES (
  'UUID_DO_POST',          -- Substitua pelo UUID de um post existente
  'UUID_DO_USUARIO',       -- Substitua pelo UUID do usuário autenticado
  '❤️'
);
*/ 