#!/bin/bash

# Mentor24h — Database Push Script
# Executa as migrations no Supabase PostgreSQL

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Mentor24h — Database Migration                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está definida em .env.local"
    echo ""
    echo "Configure o arquivo .env.local com a DATABASE_URL do Supabase:"
    echo "  DATABASE_URL=postgresql://postgres.[xxx]:password@db.[xxx].supabase.co:5432/postgres"
    echo ""
    exit 1
fi

echo "📍 Conectando ao Supabase PostgreSQL..."
echo ""

# Run migrations using psql
echo "🔧 Aplicando schema inicial..."
psql "$DATABASE_URL" -f src/lib/db/migrations/0001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema criado com sucesso!"
    echo ""
    echo "📊 Próximos passos:"
    echo "  1. npm run seed:categories  (seed 42 categorias)"
    echo "  2. npm run dev              (inicia servidor)"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar schema"
    echo "   Verifique a DATABASE_URL e tente novamente"
    exit 1
fi
