#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hnkfwwgsbrzyzhtsrwtc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2Z3d2dzYnJ6eXpodHNyd3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NTUxNCwiZXhwIjoyMDkzMjUxNTE0fQ.bOYUJk1xpQ1uKpVl4D8WxxKrywzOV81zYye7ghMqBPA';

async function runMigrations() {
  try {
    console.log('🚀 Conectando ao Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Ler migrations
    const migration1 = fs.readFileSync(path.join(__dirname, 'src/lib/db/migrations/0001_initial_schema.sql'), 'utf8');
    const migration2 = fs.readFileSync(path.join(__dirname, 'src/lib/db/migrations/0002_add_crisis_fields.sql'), 'utf8');

    console.log('📋 Executando migration 0001_initial_schema.sql...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 }).catch(() => ({ error: 'RPC não disponível' }));

    if (error1) {
      console.warn('⚠️  Método RPC não disponível. Use o SQL Editor do Supabase manualmente.');
      console.log('\n📍 Alternativa: SQL Editor no Dashboard');
      console.log('1. Vá para https://supabase.com/dashboard');
      console.log('2. Clique em "SQL Editor"');
      console.log('3. Clique em "New Query"');
      console.log('4. Cole o conteúdo de src/lib/db/migrations/0001_initial_schema.sql');
      console.log('5. Clique "Run"');
      console.log('6. Repita para 0002_add_crisis_fields.sql');
      process.exit(1);
    }

    console.log('✅ Migration 0001 executada!');

    console.log('📋 Executando migration 0002_add_crisis_fields.sql...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 }).catch(() => ({ error: 'RPC não disponível' }));

    if (!error2) {
      console.log('✅ Migration 0002 executada!');
      console.log('\n🎉 Banco de dados configurado com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

runMigrations();
