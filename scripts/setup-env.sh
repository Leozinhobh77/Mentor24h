#!/bin/bash

# Mentor24h — Environment Setup Helper
# Este script guia você na coleta de todas as variáveis de ambiente

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Mentor24h — Setup de Variáveis de Ambiente                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Este script vai guiar você na coleta de todas as variáveis."
echo "Você vai precisar de contas em: Supabase, Twilio, Anthropic, Inngest"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local já existe. Faça backup antes de continuar."
    read -p "Deseja continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo "═══════════════════════════════════════════════════════════════════"
echo "📍 PASSO 1: SUPABASE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Acesse: https://app.supabase.com"
echo "2. Selecione seu projeto (ou crie um novo)"
echo "3. Vá em: Settings → API"
echo "4. Copie: Project URL, anon (public) key, service_role (secret) key"
echo ""
read -p "Cole a URL do Supabase (https://...supabase.co): " SUPABASE_URL
read -p "Cole a Anon Key: " SUPABASE_ANON_KEY
read -p "Cole a Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Cole a CONNECTION STRING (postgresql://...): " DATABASE_URL

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📱 PASSO 2: TWILIO"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Acesse: https://www.twilio.com/console"
echo "2. Copie: Account SID e Auth Token (no topo)"
echo "3. Vá em: Messaging → Try it out → Send an SMS"
echo "4. Crie um número WhatsApp (ou use sandbox para dev)"
echo ""
read -p "Cole o Twilio Account SID: " TWILIO_ACCOUNT_SID
read -p "Cole o Twilio Auth Token: " TWILIO_AUTH_TOKEN
read -p "Cole o Twilio Phone Number (com +): " TWILIO_PHONE_NUMBER

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🤖 PASSO 3: ANTHROPIC (Claude API)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Acesse: https://console.anthropic.com/account/keys"
echo "2. Crie uma API key (ou copie uma existente)"
echo ""
read -p "Cole a Claude API Key (sk-ant-...): " CLAUDE_API_KEY

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📨 PASSO 4: INNGEST"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Acesse: https://app.inngest.com"
echo "2. Vá em: Settings → API Keys"
echo "3. Copie: Event Key e Signing Key"
echo ""
read -p "Cole a Inngest Event Key: " INNGEST_EVENT_KEY
read -p "Cole a Inngest Signing Key: " INNGEST_SIGNING_KEY

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✍️  Salvando .env.local..."
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Update .env.local with actual values
sed -i "s|https://xxxxxxxxxx.supabase.co|$SUPABASE_URL|g" .env.local
sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|g" .env.local
sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY|g" .env.local
sed -i "s|postgresql://.*|$DATABASE_URL|g" .env.local
sed -i "s|TWILIO_ACCOUNT_SID=.*|TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID|g" .env.local
sed -i "s|TWILIO_AUTH_TOKEN=.*|TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN|g" .env.local
sed -i "s|TWILIO_PHONE_NUMBER=.*|TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER|g" .env.local
sed -i "s|CLAUDE_API_KEY=.*|CLAUDE_API_KEY=$CLAUDE_API_KEY|g" .env.local
sed -i "s|INNGEST_EVENT_KEY=.*|INNGEST_EVENT_KEY=$INNGEST_EVENT_KEY|g" .env.local
sed -i "s|INNGEST_SIGNING_KEY=.*|INNGEST_SIGNING_KEY=$INNGEST_SIGNING_KEY|g" .env.local

echo "✅ .env.local atualizado com sucesso!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🚀 Próximos passos:"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Verifique que .env.local tem todos os valores corretos:"
echo "   cat .env.local | grep -v '^#'"
echo ""
echo "2. Inicie o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""
echo "3. Acesse: http://localhost:3000"
echo ""
echo "⚠️  IMPORTANTE: Nunca commit .env.local no git!"
echo "   (.gitignore já está configurado para isso)"
echo ""
