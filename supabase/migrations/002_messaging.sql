-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id, listing_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid()::text OR conversations.user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid()::text OR conversations.user2_id = auth.uid()::text)
    )
  );
