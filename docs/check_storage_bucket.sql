-- Script para verificar e configurar bucket de storage
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR BUCKETS EXISTENTES
-- ========================================

-- Verificar buckets de storage
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- ========================================
-- 2. VERIFICAR POLÍTICAS DE STORAGE
-- ========================================

-- Verificar políticas do bucket mural-images
SELECT 
  name,
  definition
FROM storage.policies 
WHERE bucket_id = 'mural-images';

-- ========================================
-- 3. CRIAR BUCKET SE NÃO EXISTIR
-- ========================================

-- Criar bucket mural-images se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mural-images',
  'mural-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. CRIAR POLÍTICAS DE STORAGE PERMISSIVAS
-- ========================================

-- Remover políticas antigas do bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;

-- Política para permitir upload de imagens (qualquer pessoa)
CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mural-images' AND
    (storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif'])
  );

-- Política para permitir visualização de imagens (qualquer pessoa)
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'mural-images');

-- Política para permitir atualização de imagens (qualquer pessoa)
CREATE POLICY "Anyone can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'mural-images');

-- Política para permitir exclusão de imagens (qualquer pessoa)
CREATE POLICY "Anyone can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'mural-images');

-- ========================================
-- 5. VERIFICAR RESULTADO
-- ========================================

-- Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'mural-images';

-- Verificar políticas criadas
SELECT 
  name,
  definition
FROM storage.policies 
WHERE bucket_id = 'mural-images';

-- ========================================
-- 6. TESTE DE UPLOAD (execute manualmente)
-- ========================================

-- Para testar o upload, execute no SQL Editor:
/*
-- Teste 1: Verificar se consegue inserir no storage
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'mural-images',
  'test/test-image.jpg',
  auth.uid(),
  '{"size": 1024, "mimetype": "image/jpeg"}'
);

-- Teste 2: Verificar se consegue visualizar
SELECT * FROM storage.objects 
WHERE bucket_id = 'mural-images';
*/

-- ========================================
-- 7. MENSAGEM FINAL
-- ========================================

-- Agora teste o upload de fotos no app!
-- Se ainda não funcionar, o problema pode ser:
-- 1. RLS das tabelas (execute fix_rls_aggressive.sql)
-- 2. Autenticação do usuário
-- 3. Evento não está ativo
-- 4. Problema no código frontend 