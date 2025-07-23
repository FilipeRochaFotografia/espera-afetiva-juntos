-- Script para verificar status de autenticação e sessões
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR SESSÕES ATIVAS
-- ========================================

-- Verificar sessões ativas (apenas para admin)
-- Nota: A tabela auth.sessions pode ter estrutura diferente
-- Vamos verificar primeiro a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Tentar verificar sessões com colunas que existem
SELECT 
  id,
  user_id,
  created_at,
  updated_at
FROM auth.sessions 
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 2. VERIFICAR USUÁRIOS
-- ========================================

-- Verificar usuários recentes
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ========================================
-- 3. VERIFICAR PERFIS DE USUÁRIOS
-- ========================================

-- Verificar se os perfis foram criados corretamente
SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC
LIMIT 10;

-- ========================================
-- 4. VERIFICAR EVENTOS E SEUS CRIADORES
-- ========================================

-- Verificar eventos e seus criadores
SELECT 
  e.id,
  e.name,
  e.is_active,
  e.created_by,
  u.name as creator_name,
  u.email as creator_email,
  e.created_at
FROM events e
LEFT JOIN users u ON e.created_by = u.id
ORDER BY e.created_at DESC;

-- ========================================
-- 5. VERIFICAR POSTS EXISTENTES
-- ========================================

-- Verificar posts e seus autores
SELECT 
  mp.id,
  mp.event_id,
  mp.user_id,
  mp.type,
  mp.content,
  mp.created_at,
  u.name as author_name,
  u.email as author_email,
  e.name as event_name,
  e.is_active as event_active
FROM mural_posts mp
LEFT JOIN users u ON mp.user_id = u.id
LEFT JOIN events e ON mp.event_id = e.id
ORDER BY mp.created_at DESC
LIMIT 10;

-- ========================================
-- 6. VERIFICAR REAÇÕES
-- ========================================

-- Verificar reações existentes
SELECT 
  mr.id,
  mr.post_id,
  mr.user_id,
  mr.emoji,
  mr.created_at,
  u.name as user_name,
  u.email as user_email
FROM mural_reactions mr
LEFT JOIN users u ON mr.user_id = u.id
ORDER BY mr.created_at DESC
LIMIT 10;

-- ========================================
-- 7. VERIFICAR TRIGGERS
-- ========================================

-- Verificar se o trigger handle_new_user existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';

-- ========================================
-- 8. VERIFICAR FUNÇÕES
-- ========================================

-- Verificar se a função handle_new_user existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- ========================================
-- 9. TESTE DE AUTENTICAÇÃO
-- ========================================

-- Verificar se auth.uid() funciona (execute como usuário autenticado)
-- SELECT auth.uid() as current_user_id;

-- ========================================
-- 10. VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar todas as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('users', 'events', 'mural_posts', 'mural_reactions')
ORDER BY tablename, policyname;

-- ========================================
-- 11. VERIFICAR SE RLS ESTÁ HABILITADO
-- ========================================

-- Verificar se RLS está habilitado nas tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'events', 'mural_posts', 'mural_reactions')
ORDER BY tablename;

-- ========================================
-- 12. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Verificar estrutura da tabela auth.sessions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela auth.users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position; 