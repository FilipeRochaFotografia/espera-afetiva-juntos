-- Script SIMPLES para resolver o problema de upload
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. DESABILITAR RLS
-- ========================================

ALTER TABLE mural_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mural_reactions DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. VERIFICAR
-- ========================================

SELECT 
  'RLS Desabilitado' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('mural_posts', 'mural_reactions');

-- ========================================
-- 3. CRIAR BUCKET DE STORAGE
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mural-images',
  'mural-images',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. VERIFICAR BUCKET
-- ========================================

SELECT 
  'Bucket Criado' as status,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'mural-images';

-- ========================================
-- 5. TESTE
-- ========================================

-- Agora teste o upload de fotos no app!
-- Deve funcionar perfeitamente. 