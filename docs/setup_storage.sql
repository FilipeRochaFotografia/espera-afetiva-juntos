-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE STORAGE
-- Para Upload de Imagens do Mural Colaborativo
-- =====================================================

-- 1. CRIAR BUCKET PARA IMAGENS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mural-images',
  'mural-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
);

-- 2. CONFIGURAR POLÍTICAS DE ACESSO (RLS)
-- =====================================================

-- Política para UPLOAD de imagens
-- Permite que usuários autenticados façam upload de imagens para eventos que eles criaram
CREATE POLICY "Users can upload images to their events" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'mural-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE created_by = auth.uid()
  )
);

-- Política para VISUALIZAÇÃO de imagens
-- Permite visualização pública de todas as imagens
CREATE POLICY "Public can view all images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'mural-images'
);

-- Política para ATUALIZAÇÃO de imagens
-- Permite que usuários atualizem imagens de eventos que eles criaram
CREATE POLICY "Users can update images from their events" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'mural-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE created_by = auth.uid()
  )
);

-- Política para DELEÇÃO de imagens
-- Permite que usuários deletem imagens de eventos que eles criaram
CREATE POLICY "Users can delete images from their events" ON storage.objects
FOR DELETE USING (
  bucket_id = 'mural-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE created_by = auth.uid()
  )
);

-- 3. VERIFICAR CONFIGURAÇÃO
-- =====================================================

-- Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'mural-images';

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 4. FUNÇÃO DE LIMPEZA AUTOMÁTICA (OPCIONAL)
-- =====================================================

-- Função para deletar imagens de eventos deletados
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'mural-images' 
  AND (storage.foldername(name))[1] NOT IN (
    SELECT id::text FROM events
  );
END;
$$ LANGUAGE plpgsql;

-- 5. CONSULTAS ÚTEIS PARA MONITORAMENTO
-- =====================================================

-- Consulta para ver todas as imagens no bucket
-- SELECT 
--   name,
--   metadata,
--   created_at,
--   updated_at
-- FROM storage.objects 
-- WHERE bucket_id = 'mural-images' 
-- ORDER BY created_at DESC;

-- Consulta para estatísticas de uso
-- SELECT 
--   bucket_id,
--   COUNT(*) as total_files,
--   SUM((metadata->>'size')::bigint) as total_size_bytes,
--   ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb
-- FROM storage.objects 
-- WHERE bucket_id = 'mural-images'
-- GROUP BY bucket_id;

-- Consulta para imagens por evento
-- SELECT 
--   (storage.foldername(name))[1] as event_id,
--   COUNT(*) as image_count,
--   SUM((metadata->>'size')::bigint) as total_size_bytes
-- FROM storage.objects 
-- WHERE bucket_id = 'mural-images'
-- GROUP BY (storage.foldername(name))[1]
-- ORDER BY image_count DESC;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
1. Execute este script no SQL Editor do Supabase
2. Verifique se o bucket foi criado em Storage > mural-images
3. Teste o upload de uma imagem na aplicação
4. Monitore o uso com as consultas de exemplo

ESTRUTURA DE ARQUIVOS:
- mural-images/
  - {event_id}/
    - {timestamp}-{random}.{extension}

EXEMPLO:
- mural-images/
  - 123e4567-e89b-12d3-a456-426614174000/
    - 1703123456789-abc123.jpg
    - 1703123456790-def456.png
*/ 