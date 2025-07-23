-- Script de DIAGNÓSTICO COMPLETO para upload de fotos
-- Execute este script no Supabase SQL Editor
-- Este script verifica TODOS os possíveis problemas

-- ========================================
-- 1. VERIFICAR AUTENTICAÇÃO
-- ========================================

-- Verificar se há usuários autenticados
SELECT 
  COUNT(*) as total_users
FROM auth.users;

-- Verificar usuários recentes
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- 2. VERIFICAR EVENTOS
-- ========================================

-- Verificar todos os eventos
SELECT 
  id,
  name,
  is_active,
  created_by,
  created_at
FROM events 
ORDER BY created_at DESC;

-- Verificar eventos ativos especificamente
SELECT 
  COUNT(*) as eventos_ativos
FROM events 
WHERE is_active = true;

-- ========================================
-- 3. VERIFICAR RLS DAS TABELAS
-- ========================================

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('mural_posts', 'mural_reactions', 'events', 'users')
ORDER BY tablename;

-- Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('mural_posts', 'mural_reactions')
ORDER BY tablename, policyname;

-- ========================================
-- 4. VERIFICAR STORAGE
-- ========================================

-- Verificar buckets de storage
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- Verificar políticas de storage
SELECT 
  name,
  definition
FROM storage.policies 
WHERE bucket_id = 'mural-images';

-- ========================================
-- 5. VERIFICAR POSTS EXISTENTES
-- ========================================

-- Verificar posts existentes
SELECT 
  COUNT(*) as total_posts
FROM mural_posts;

-- Verificar posts por evento
SELECT 
  e.name as event_name,
  e.is_active,
  COUNT(mp.id) as posts_count
FROM events e
LEFT JOIN mural_posts mp ON e.id = mp.event_id
GROUP BY e.id, e.name, e.is_active
ORDER BY posts_count DESC;

-- ========================================
-- 6. TESTE DE INSERÇÃO MANUAL
-- ========================================

-- Teste 1: Tentar inserir post sem RLS (execute manualmente)
/*
-- Primeiro, desabilitar RLS temporariamente
ALTER TABLE mural_posts DISABLE ROW LEVEL SECURITY;

-- Tentar inserir um post de teste
INSERT INTO mural_posts (event_id, user_id, type, content)
VALUES (
  'UUID_DO_EVENTO_ATIVO',  -- Substitua pelo UUID real
  'UUID_DO_USUARIO',       -- Substitua pelo UUID real
  'text',
  'Teste de inserção manual'
);

-- Reabilitar RLS
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;
*/

-- ========================================
-- 7. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Verificar estrutura da tabela mural_posts
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_posts'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela events
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- ========================================
-- 8. VERIFICAR TRIGGERS E FUNÇÕES
-- ========================================

-- Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('mural_posts', 'events');

-- Verificar funções
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%mural%' OR routine_name LIKE '%event%';

-- ========================================
-- 9. RESUMO DO DIAGNÓSTICO
-- ========================================

-- Criar resumo do diagnóstico
SELECT 
  'Diagnóstico Completo' as tipo,
  'Verificações realizadas:' as descricao;

-- ========================================
-- 10. COMANDOS DE CORREÇÃO RÁPIDA
-- ========================================

-- Se o diagnóstico mostrar problemas, execute estes comandos:

-- Comando 1: Desabilitar RLS completamente (SOLUÇÃO RÁPIDA)
/*
ALTER TABLE mural_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mural_reactions DISABLE ROW LEVEL SECURITY;
*/

-- Comando 2: Criar políticas ultra permissivas
/*
CREATE POLICY "Ultra permissive posts" ON mural_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Ultra permissive reactions" ON mural_reactions
  FOR ALL USING (true) WITH CHECK (true);
*/

-- Comando 3: Verificar se o evento está ativo
/*
UPDATE events 
SET is_active = true 
WHERE id = 'UUID_DO_EVENTO';
*/

-- ========================================
-- 11. MENSAGEM FINAL
-- ========================================

-- Após executar este diagnóstico:
-- 1. Verifique os resultados de cada seção
-- 2. Se houver problemas, execute os comandos de correção
-- 3. Teste o upload de fotos novamente
-- 4. Se ainda não funcionar, o problema pode ser no código frontend 