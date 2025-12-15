-- WhatsApp Sessions Table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  phone_number TEXT,
  phone_number_id TEXT,
  waba_id TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'qr-required', 'connected', 'error')),
  access_token_encrypted TEXT,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Chats Table
CREATE TABLE IF NOT EXISTS whatsapp_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  profile_picture_url TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  wa_message_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  media_type TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_sessions
CREATE POLICY "Users can view own sessions"
  ON whatsapp_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON whatsapp_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON whatsapp_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON whatsapp_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_chats (via session ownership)
CREATE POLICY "Users can view own chats"
  ON whatsapp_chats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM whatsapp_sessions 
    WHERE whatsapp_sessions.id = whatsapp_chats.session_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own chats"
  ON whatsapp_chats FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM whatsapp_sessions 
    WHERE whatsapp_sessions.id = session_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own chats"
  ON whatsapp_chats FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM whatsapp_sessions 
    WHERE whatsapp_sessions.id = whatsapp_chats.session_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own chats"
  ON whatsapp_chats FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM whatsapp_sessions 
    WHERE whatsapp_sessions.id = whatsapp_chats.session_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

-- RLS Policies for whatsapp_messages (via chat -> session ownership)
CREATE POLICY "Users can view own messages"
  ON whatsapp_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM whatsapp_chats
    JOIN whatsapp_sessions ON whatsapp_sessions.id = whatsapp_chats.session_id
    WHERE whatsapp_chats.id = whatsapp_messages.chat_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM whatsapp_chats
    JOIN whatsapp_sessions ON whatsapp_sessions.id = whatsapp_chats.session_id
    WHERE whatsapp_chats.id = chat_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own messages"
  ON whatsapp_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM whatsapp_chats
    JOIN whatsapp_sessions ON whatsapp_sessions.id = whatsapp_chats.session_id
    WHERE whatsapp_chats.id = whatsapp_messages.chat_id 
    AND whatsapp_sessions.user_id = auth.uid()
  ));

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;

-- Indexes for performance
CREATE INDEX idx_whatsapp_sessions_user ON whatsapp_sessions(user_id);
CREATE INDEX idx_whatsapp_chats_session ON whatsapp_chats(session_id);
CREATE INDEX idx_whatsapp_messages_chat ON whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_chats_updated_at
  BEFORE UPDATE ON whatsapp_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();