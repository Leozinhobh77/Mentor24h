-- Mentor24h — Complete Database Schema
-- Execute this entire script in Supabase SQL Editor
-- Steps:
-- 1. Vá para https://supabase.com/dashboard
-- 2. Clique em "SQL Editor"
-- 3. Clique em "New Query"
-- 4. Cole TODO este arquivo aqui
-- 5. Clique "Run" (botão verde)
-- 6. Aguarde conclusão (deve levar 2-3 segundos)

-- ============================================
-- MIGRATION 0001: Initial Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE message_status AS ENUM ('received', 'processing', 'responded');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE pillar AS ENUM ('organization', 'inspiration', 'entertainment', 'wellbeing');
CREATE TYPE routine_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  supabase_id VARCHAR(36) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  whatsapp_number VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  preferred_assistant VARCHAR(50) NOT NULL DEFAULT 'Mateus',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_rls_select ON users FOR SELECT
  USING (auth.uid()::text = supabase_id);
CREATE POLICY users_rls_update ON users FOR UPDATE
  USING (auth.uid()::text = supabase_id)
  WITH CHECK (auth.uid()::text = supabase_id);
CREATE POLICY users_rls_delete ON users FOR DELETE
  USING (auth.uid()::text = supabase_id);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  whatsapp_message_id VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'received',
  severity INTEGER NOT NULL DEFAULT 0,
  is_crisis BOOLEAN NOT NULL DEFAULT false,
  crisis_confidence INTEGER,
  detected_patterns JSONB,
  responded_with VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  responded_at TIMESTAMP
);

-- Indexes for messages (critical for crisis detection)
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_severity ON messages(severity) WHERE severity >= 8;
CREATE INDEX idx_messages_crisis ON messages(is_crisis) WHERE is_crisis = true;

-- Row Level Security for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_rls_select ON messages FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
CREATE POLICY messages_rls_insert ON messages FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  pillar pillar NOT NULL,
  "order" INTEGER NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, pillar)
);

-- User categories junction table
CREATE TABLE user_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id, category_id)
);

-- Row Level Security for user_categories
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_categories_rls ON user_categories FOR ALL
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Audios table
CREATE TABLE audios (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  audio_url VARCHAR(500) NOT NULL,
  duration INTEGER NOT NULL,
  instructor VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Routines table
CREATE TABLE routines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type routine_type NOT NULL,
  name VARCHAR(100) NOT NULL,
  schedule VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMP,
  next_execution TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security for routines
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY routines_rls ON routines FOR ALL
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Crisis audit log (immutable append-only)
CREATE TABLE crisis_audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  message_id INTEGER NOT NULL REFERENCES messages(id),
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  severity severity_level NOT NULL,
  patterns JSONB NOT NULL,
  response_given VARCHAR(255) NOT NULL,
  follow_up_needed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

-- Row Level Security for crisis_audit_log
ALTER TABLE crisis_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY crisis_audit_log_rls ON crisis_audit_log FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Create index on crisis_audit_log for user queries
CREATE INDEX idx_crisis_audit_log_user_created ON crisis_audit_log(user_id, detected_at DESC);

-- Soft delete trigger for users (delete_at)
CREATE OR REPLACE FUNCTION soft_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete_user
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION soft_delete_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_routines_updated_at
BEFORE UPDATE ON routines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_whatsapp ON users(whatsapp_number);
CREATE INDEX idx_categories_pillar ON categories(pillar);
CREATE INDEX idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX idx_audios_category ON audios(category_id);
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_next_execution ON routines(next_execution) WHERE enabled = true;

-- Grant permissions (Supabase auth users)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- MIGRATION 0002: Add Crisis Detection Fields
-- ============================================

BEGIN;

-- Add new columns to messages table
ALTER TABLE messages
ADD COLUMN crisis_keywords TEXT[] DEFAULT NULL,
ADD COLUMN crisis_detected_at TIMESTAMP DEFAULT NULL,
ADD COLUMN crisis_response_sent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN crisis_response_type VARCHAR(50) DEFAULT NULL,
ADD COLUMN processed_by VARCHAR(50) DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();

-- Create indices for crisis detection queries
CREATE INDEX idx_messages_is_crisis ON messages(is_crisis) WHERE is_crisis = true;
CREATE INDEX idx_messages_severity ON messages(severity) WHERE severity >= 8;
CREATE INDEX idx_messages_crisis_detected ON messages(crisis_detected_at);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Create RLS (Row Level Security) policies for messages table
-- Only users can see their own messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own messages
CREATE POLICY messages_select_own ON messages
FOR SELECT
USING (auth.uid()::integer = user_id);

-- Policy: Users can insert messages (via webhook)
CREATE POLICY messages_insert ON messages
FOR INSERT
WITH CHECK (true);

-- Policy: Only system/admin can update messages (via Inngest workflow)
CREATE POLICY messages_update_admin ON messages
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_messages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_messages_timestamp_trigger ON messages;
CREATE TRIGGER update_messages_timestamp_trigger
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_timestamp();

-- Create index on user_id for foreign key constraint
CREATE INDEX idx_messages_user_fk ON messages(user_id);

COMMIT;

-- ============================================
-- ✅ Schema setup complete!
-- ============================================
