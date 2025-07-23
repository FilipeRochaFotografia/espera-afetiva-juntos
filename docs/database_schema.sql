-- Tabelas para o mural colaborativo do Espera

-- Tabela de posts do mural
CREATE TABLE IF NOT EXISTS mural_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'video')),
  content TEXT,
  media_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de reações aos posts
CREATE TABLE IF NOT EXISTS mural_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES mural_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- Tabela de usuários (extensão da auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mural_posts_event_id ON mural_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_mural_posts_created_at ON mural_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mural_reactions_post_id ON mural_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_mural_reactions_user_id ON mural_reactions(user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_mural_posts_updated_at 
  BEFORE UPDATE ON mural_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para mural_posts
CREATE POLICY "Users can view posts from events they have access to" ON mural_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND (events.created_by = auth.uid() OR events.is_active = true)
    )
  );

CREATE POLICY "Users can create posts in events they have access to" ON mural_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = mural_posts.event_id 
      AND (events.created_by = auth.uid() OR events.is_active = true)
    )
  );

CREATE POLICY "Users can update their own posts" ON mural_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON mural_posts
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para mural_reactions
CREATE POLICY "Users can view reactions from posts they can see" ON mural_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON e.id = mp.event_id
      WHERE mp.id = mural_reactions.post_id 
      AND (e.created_by = auth.uid() OR e.is_active = true)
    )
  );

CREATE POLICY "Users can create reactions" ON mural_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mural_posts mp
      JOIN events e ON e.id = mp.event_id
      WHERE mp.id = mural_reactions.post_id 
      AND (e.created_by = auth.uid() OR e.is_active = true)
    )
  );

CREATE POLICY "Users can delete their own reactions" ON mural_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para users
CREATE POLICY "Users can view other users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar o cadastro
    RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 