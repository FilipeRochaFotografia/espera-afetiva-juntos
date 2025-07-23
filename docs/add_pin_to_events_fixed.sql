-- Adicionar campo PIN à tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS pin VARCHAR(6) UNIQUE;

-- Função para gerar PIN único de 6 caracteres (números e letras)
CREATE OR REPLACE FUNCTION generate_unique_pin()
RETURNS VARCHAR(6) AS $$
DECLARE
  new_pin VARCHAR(6);
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Gerar PIN aleatório de 6 caracteres (números e letras maiúsculas)
    new_pin := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Verificar se o PIN já existe
    IF NOT EXISTS (SELECT 1 FROM events WHERE events.pin = new_pin) THEN
      RETURN new_pin;
    END IF;
    
    -- Evitar loop infinito
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Não foi possível gerar um PIN único após 100 tentativas';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar PIN automaticamente quando um evento é criado
CREATE OR REPLACE FUNCTION set_event_pin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pin IS NULL THEN
    NEW.pin := generate_unique_pin();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela events
DROP TRIGGER IF EXISTS trigger_set_event_pin ON events;
CREATE TRIGGER trigger_set_event_pin
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_event_pin();

-- Atualizar eventos existentes que não têm PIN
UPDATE events 
SET pin = generate_unique_pin() 
WHERE pin IS NULL;

-- Criar índice para busca por PIN
CREATE INDEX IF NOT EXISTS idx_events_pin ON events(pin);

-- Política RLS para permitir acesso por PIN
CREATE POLICY "Anyone can view events by PIN" ON events
  FOR SELECT USING (true);

-- Função para buscar evento por PIN
CREATE OR REPLACE FUNCTION get_event_by_pin(pin_code VARCHAR(6))
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  date TIMESTAMP WITH TIME ZONE,
  emoji VARCHAR(10),
  theme VARCHAR(100),
  custom_message TEXT,
  created_by UUID,
  is_active BOOLEAN,
  pin VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.date,
    e.emoji,
    e.theme,
    e.custom_message,
    e.created_by,
    e.is_active,
    e.pin,
    e.created_at,
    e.updated_at
  FROM events e
  WHERE e.pin = pin_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 