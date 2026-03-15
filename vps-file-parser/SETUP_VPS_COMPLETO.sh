#!/bin/bash
# ============================================================
# BEN FILE PARSER v3.0 — Setup Completo VPS Hostinger
# Execute: bash SETUP_VPS_COMPLETO.sh
# ============================================================

set -e
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   BEN FILE PARSER v3.0 — Setup VPS Hostinger         ║${NC}"
echo -e "${BOLD}║   IP: 181.215.135.202  |  Porta: 3010                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Detectar diretório do parser ─────────────────────────
PARSER_DIR="$HOME/ben-juris-center/vps-file-parser"
if [ ! -d "$PARSER_DIR" ]; then
  PARSER_DIR="$HOME/ben-file-parser"
fi
if [ ! -d "$PARSER_DIR" ]; then
  err "Diretório do parser não encontrado!"
  info "Buscando em todo o home..."
  PARSER_DIR=$(find ~ -name "server.js" -path "*/vps-file-parser/*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null)
fi
if [ -z "$PARSER_DIR" ]; then
  err "Parser não encontrado. Clone o repositório primeiro:"
  echo "  git clone https://github.com/mauromoncao/ben-juris-center.git"
  exit 1
fi
log "Parser encontrado em: $PARSER_DIR"
cd "$PARSER_DIR"

# ── Verificar Node.js ────────────────────────────────────
NODE_VER=$(node -v 2>/dev/null | tr -d 'v' | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  err "Node.js 18+ necessário. Instalando..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
log "Node.js $(node -v)"

# ── Instalar/verificar PM2 ───────────────────────────────
if ! command -v pm2 &>/dev/null; then
  info "Instalando PM2..."
  npm install -g pm2
fi
log "PM2 $(pm2 -v)"

# ── Instalar dependências ────────────────────────────────
info "Instalando dependências npm..."
npm install --production 2>&1 | tail -5

# Verifica opcionais para áudio/vídeo
if ! node -e "require('fluent-ffmpeg')" 2>/dev/null; then
  warn "fluent-ffmpeg não instalado (áudio/vídeo). Instalando..."
  npm install fluent-ffmpeg 2>/dev/null || warn "fluente-ffmpeg opcional — ignorado"
fi

log "Dependências instaladas"

# ── Configurar .env ──────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ CONFIGURAÇÃO DE CHAVES API ━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ENV_FILE="$PARSER_DIR/.env"

# Lê chaves existentes se já tiver .env
EXISTING_OPENAI=""
EXISTING_ANTHROPIC=""
EXISTING_PINECONE_KEY=""
EXISTING_PINECONE_HOST=""
if [ -f "$ENV_FILE" ]; then
  EXISTING_OPENAI=$(grep "^OPENAI_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
  EXISTING_ANTHROPIC=$(grep "^ANTHROPIC_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
  EXISTING_PINECONE_KEY=$(grep "^PINECONE_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
  EXISTING_PINECONE_HOST=$(grep "^PINECONE_INDEX_HOST=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
  warn "Arquivo .env existente encontrado — valores atuais serão mantidos se não informar novos."
fi

# Solicitar chaves
echo "Pressione ENTER para manter o valor atual (se existir)."
echo ""

read -p "OpenAI API Key [${EXISTING_OPENAI:0:8}...]: " NEW_OPENAI
OPENAI_KEY="${NEW_OPENAI:-$EXISTING_OPENAI}"

read -p "Anthropic API Key [${EXISTING_ANTHROPIC:0:8}...]: " NEW_ANTHROPIC
ANTHROPIC_KEY="${NEW_ANTHROPIC:-$EXISTING_ANTHROPIC}"

read -p "Pinecone API Key [${EXISTING_PINECONE_KEY:0:8}...]: " NEW_PINECONE_KEY
PINECONE_KEY="${NEW_PINECONE_KEY:-$EXISTING_PINECONE_KEY}"

read -p "Pinecone Index Host (ex: https://ben-xxx.svc.pinecone.io) [${EXISTING_PINECONE_HOST}]: " NEW_PINECONE_HOST
PINECONE_HOST="${NEW_PINECONE_HOST:-$EXISTING_PINECONE_HOST}"

# Escrever .env
cat > "$ENV_FILE" << ENV_EOF
# BEN File Parser — Chaves API
# Gerado em: $(date '+%Y-%m-%d %H:%M:%S')
PORT=3010
NODE_ENV=production
FILE_PARSER_TOKEN=ben-parser-2026
VPS_KB_TOKEN=ben-kb-2026

# OpenAI — embeddings (text-embedding-3-small) + GPT-4o Vision
OPENAI_API_KEY=${OPENAI_KEY}

# Anthropic Claude — análise de imagens / documentos complexos
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}

# Pinecone — armazenamento vetorial RAG
PINECONE_API_KEY=${PINECONE_KEY}
PINECONE_INDEX_HOST=${PINECONE_HOST}

# Configurações do parser
MAX_FILE_SIZE_MB=100
CHUNK_SIZE=1800
CHUNK_OVERLAP=200
ENV_EOF

chmod 600 "$ENV_FILE"
log ".env configurado em $ENV_FILE"

# ── Parar instância anterior ────────────────────────────
info "Parando instâncias anteriores..."
pm2 stop ben-file-parser 2>/dev/null && pm2 delete ben-file-parser 2>/dev/null || true

# ── Iniciar com PM2 ─────────────────────────────────────
info "Iniciando ben-file-parser na porta 3010..."

# Se tiver ecosystem.config.js, usa ele; senão inicia direto
if [ -f "ecosystem.config.js" ]; then
  pm2 start ecosystem.config.js --env production
else
  pm2 start server.js --name ben-file-parser \
    --env PORT=3010 \
    --max-memory-restart 512M \
    --log /var/log/ben-file-parser-out.log \
    --error /var/log/ben-file-parser-error.log
fi

# Passa as chaves como env vars ao processo PM2
pm2 set ben-file-parser:OPENAI_API_KEY "$OPENAI_KEY" 2>/dev/null || true
pm2 set ben-file-parser:ANTHROPIC_API_KEY "$ANTHROPIC_KEY" 2>/dev/null || true
pm2 set ben-file-parser:PINECONE_API_KEY "$PINECONE_KEY" 2>/dev/null || true
pm2 set ben-file-parser:PINECONE_INDEX_HOST "$PINECONE_HOST" 2>/dev/null || true

# Salvar e auto-iniciar
pm2 save
pm2 startup 2>/dev/null | grep "sudo" | bash 2>/dev/null || \
  warn "Execute manualmente: pm2 startup (para reinício automático)"

log "Serviço iniciado!"

# ── Health Check ────────────────────────────────────────
sleep 2
echo ""
info "Verificando serviço..."
HEALTH=$(curl -s --max-time 5 http://localhost:3010/health 2>/dev/null || echo '{"status":"timeout"}')
echo "Health check: $HEALTH" | python3 -m json.tool 2>/dev/null || echo "Health: $HEALTH"

# ── Status Final ────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ STATUS PM2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pm2 list

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  ✅ BEN File Parser v3.0 instalado com sucesso!       ║${NC}"
echo -e "${BOLD}║                                                        ║${NC}"
echo -e "${BOLD}║  URL Health: http://181.215.135.202:3010/health        ║${NC}"
echo -e "${BOLD}║  Porta: 3010                                           ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Comandos úteis:"
echo "  pm2 logs ben-file-parser       # ver logs em tempo real"
echo "  pm2 restart ben-file-parser    # reiniciar"
echo "  pm2 stop ben-file-parser       # parar"
echo "  curl http://localhost:3010/health  # testar"
echo ""
