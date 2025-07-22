# 🔧 Configuração do Supabase Storage

## 📸 Configuração para Upload de Imagens

### 1. Criar Bucket no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure:
   - **Name:** `mural-images`
   - **Public bucket:** ✅ Marque como público
   - **File size limit:** `5MB`
   - **Allowed MIME types:** `image/*`

### 2. Configurar Políticas de Acesso (RLS)

#### Política para Upload
```sql
-- Permitir upload de imagens para usuários autenticados
CREATE POLICY "Users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'mural-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE created_by = auth.uid()
  )
);
```

#### Política para Visualização
```sql
-- Permitir visualização pública de imagens
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'mural-images'
);
```

#### Política para Deleção
```sql
-- Permitir deleção apenas pelo criador do evento
CREATE POLICY "Users can delete their images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'mural-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM events WHERE created_by = auth.uid()
  )
);
```

### 3. Configurar CORS (se necessário)

Se houver problemas de CORS, adicione no Supabase:

```sql
-- Configurar CORS para o bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mural-images',
  'mural-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
```

### 4. Testar Upload

Após a configuração, teste o upload:

1. Acesse a aplicação
2. Crie um evento
3. Tente fazer upload de uma imagem
4. Verifique se a imagem aparece no bucket do Supabase

### 5. Monitoramento

#### Verificar Uploads
```sql
-- Consultar arquivos no bucket
SELECT * FROM storage.objects 
WHERE bucket_id = 'mural-images' 
ORDER BY created_at DESC;
```

#### Estatísticas de Uso
```sql
-- Tamanho total usado
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_size
FROM storage.objects 
WHERE bucket_id = 'mural-images'
GROUP BY bucket_id;
```

### 6. Limpeza Automática (Opcional)

Para limpar imagens antigas automaticamente:

```sql
-- Deletar imagens de eventos deletados
DELETE FROM storage.objects 
WHERE bucket_id = 'mural-images' 
AND (storage.foldername(name))[1] NOT IN (
  SELECT id::text FROM events
);
```

---

## ✅ Checklist de Configuração

- [ ] Bucket `mural-images` criado
- [ ] Bucket configurado como público
- [ ] Limite de 5MB configurado
- [ ] MIME types de imagem permitidos
- [ ] Políticas RLS configuradas
- [ ] Upload testado com sucesso
- [ ] Visualização pública funcionando

---

**Status:** Configuração necessária para upload de imagens funcionar corretamente. 