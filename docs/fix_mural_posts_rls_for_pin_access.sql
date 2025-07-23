-- Script para corrigir políticas RLS da tabela mural_posts
-- Permitir visualização de posts para eventos ativos (acesso via PIN)

-- ========================================
-- CORRIGIR POLÍTICAS MURAL_POSTS
-- ========================================

-- Remover política antiga de visualização
DROP POLICY IF EXISTS "Users can view posts from their events" ON mural_posts;

-- Criar nova política que permite visualizar posts de eventos ativos
CREATE POLICY "Anyone can view posts from active events" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- Remover política antiga de criação
DROP POLICY IF EXISTS "Users can create posts in their events" ON mural_posts;

-- Criar nova política que permite criar posts em eventos ativos
CREATE POLICY "Anyone can create posts in active events" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND events.is_active = true
    )
  );

-- Manter políticas de atualização e exclusão (usuário só pode editar/deletar seus próprios posts)

-- ========================================
-- CORRIGIR POLÍTICAS MURAL_REACTIONS
-- ========================================

-- Remover política antiga de visualização
DROP POLICY IF EXISTS "Users can view reactions from their events" ON mural_reactions;

-- Criar nova política que permite visualizar reações de eventos ativos
CREATE POLICY "Anyone can view reactions from active events" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON mp.event_id = e.id
      WHERE mp.id = mural_reactions.post_id 
      AND e.is_active = true
    )
  );

-- Remover política antiga de criação
DROP POLICY IF EXISTS "Users can create reactions in their events" ON mural_reactions;

-- Criar nova política que permite criar reações em eventos ativos
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

-- ========================================
-- VERIFICAR RESULTADO
-- ========================================

-- Verificar se as políticas foram criadas
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