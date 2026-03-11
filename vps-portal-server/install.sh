#!/bin/bash
# ============================================================
# BEN Portal Cliente API v2.0 — Script de Instalação na VPS
# Porta: 3600 | VPS Hostinger: 181.215.135.202
# ============================================================

set -e

echo "🚀 Instalando BEN Portal Cliente API v2.0..."

# Diretório de instalação
INSTALL_DIR="/opt/ben-portal-server"
mkdir -p "$INSTALL_DIR"

# Copiar arquivos
cp server.js "$INSTALL_DIR/"
cp package.json "$INSTALL_DIR/"

# Criar arquivo .env se não existir
if [ ! -f "$INSTALL_DIR/.env" ]; then
  cat > "$INSTALL_DIR/.env" << 'ENV'
# BEN Portal Cliente API — Configurações
PORT=3600
JWT_SECRET=ben-portal-secret-2026-@moncao

# Z-API (MARA — 5586999484761)
MARA_ZAPI_INSTANCE_ID=SUA_INSTANCIA_MARA
MARA_ZAPI_TOKEN=SEU_TOKEN_MARA
MARA_ZAPI_CLIENT_TOKEN=SEU_CLIENT_TOKEN_MARA
PLANTONISTA_WHATSAPP=5586999484761

# SMTP (Gmail — mauromoncaoadv.escritorio@gmail.com)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mauromoncaoadv.escritorio@gmail.com
SMTP_PASS=SUA_APP_PASSWORD_GMAIL
SMTP_FROM="Mauro Monção Advogados" <mauromoncaoadv.escritorio@gmail.com>
ENV
  echo "✅ Arquivo .env criado em $INSTALL_DIR/.env"
  echo "⚠️  Configure as variáveis de ambiente antes de iniciar!"
fi

# Instalar dependências
cd "$INSTALL_DIR"
npm install

# Instalar PM2 globalmente se não estiver instalado
if ! command -v pm2 &> /dev/null; then
  echo "📦 Instalando PM2..."
  npm install -g pm2
fi

# Parar instância antiga se existir
pm2 stop ben-portal 2>/dev/null || true
pm2 delete ben-portal 2>/dev/null || true

# Iniciar com PM2
pm2 start server.js \
  --name ben-portal \
  --restart-delay 3000 \
  --max-memory-restart 512M \
  --env production

# Salvar configuração PM2 para reinicialização automática
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "✅ BEN Portal Cliente API v2.0 instalado com sucesso!"
echo "   Porta: 3600"
echo "   PM2: pm2 status"
echo "   Logs: pm2 logs ben-portal"
echo "   Teste: curl http://localhost:3600/health"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "   1. Edite $INSTALL_DIR/.env com suas credenciais"
echo "   2. Configure webhook Z-API: POST /webhook/whatsapp"
echo "   3. Teste: curl http://181.215.135.202:3600/health"
