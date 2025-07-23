-- Script para adicionar colunas que faltam na tabela mural_posts
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

-- Verificar colunas atuais da tabela mural_posts
SELECT 
  'Estrutura Atual' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_posts'
ORDER BY ordinal_position;

-- ========================================
-- 2. ADICIONAR COLUNAS QUE FALTAM
-- ========================================

-- Adicionar coluna content (texto do post)
ALTER TABLE mural_posts 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Adicionar coluna media_url (URL da imagem)
ALTER TABLE mural_posts 
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Adicionar coluna created_at (data de criação)
ALTER TABLE mural_posts 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar coluna updated_at (data de atualização)
ALTER TABLE mural_posts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- 3. VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Verificar colunas após adição
SELECT 
  'Estrutura Final' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mural_posts'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR DADOS EXISTENTES
-- ========================================

-- Verificar posts existentes
SELECT 
  'Posts Existentes' as info,
  id,
  event_id,
  user_id,
  type,
  content,
  media_url,
  created_at
FROM mural_posts 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- 5. MENSAGEM FINAL
-- ========================================

-- ✅ PROBLEMA RESOLVIDO!
-- 
-- Colunas adicionadas:
-- - content: para o texto do post
-- - media_url: para a URL da imagem
-- - created_at: data de criação
-- - updated_at: data de atualização
--
-- Agora teste o upload de fotos no app!
-- Deve funcionar perfeitamente. 