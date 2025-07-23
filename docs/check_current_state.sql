-- Script para verificar o estado atual do Supabase
-- Execute este script para ver o que foi modificado

-- ========================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Verificar estrutura da tabela mural_posts
SELECT 
  'mural_posts structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_posts'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela mural_reactions
SELECT 
  'mural_reactions structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_reactions'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR STATUS DO RLS
-- ========================================

-- Verificar se RLS está habilitado/desabilitado
SELECT 
  'RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('mural_posts', 'mural_reactions', 'events', 'users')
ORDER BY tablename;

-- ========================================
-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
-- ========================================

-- Verificar políticas atuais
SELECT 
  'Current RLS Policies' as info,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('mural_posts', 'mural_reactions')
ORDER BY tablename, policyname;

-- ========================================
-- 4. VERIFICAR STORAGE
-- ========================================

-- Verificar buckets de storage
SELECT 
  'Storage Buckets' as info,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets;

-- ========================================
-- 5. VERIFICAR DADOS EXISTENTES
-- ========================================

-- Verificar posts existentes
SELECT 
  'Existing Posts' as info,
  COUNT(*) as total_posts
FROM mural_posts;

-- Verificar eventos ativos
SELECT 
  'Active Events' as info,
  COUNT(*) as active_events
FROM events 
WHERE is_active = true;

-- Verificar usuários
SELECT 
  'Users' as info,
  COUNT(*) as total_users
FROM auth.users;

-- ========================================
-- 6. RESUMO DO ESTADO ATUAL
-- ========================================

-- Criar resumo
SELECT 
  'SUMMARY' as info,
  'Current state after all modifications' as description;

-- ========================================
-- 7. POSSÍVEIS PROBLEMAS IDENTIFICADOS
-- ========================================

-- Se mural_posts não tem colunas content/media_url, isso é um problema
-- Se RLS está desabilitado mas ainda há erro 403, pode ser storage
-- Se não há bucket mural-images, isso é um problema
-- Se há políticas conflitantes, isso é um problema 