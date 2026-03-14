#!/bin/bash
# ============================================================
# BEN File Parser — Script de instalação VPS Hostinger
# Porta: 3010 | Node.js + PM2
# ============================================================

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  BEN FILE PARSER — Instalação VPS                    ║"
echo "╚═══════════════════════════════════════════════════════╝"

# Verifica Node.js
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js não encontrado. Instale Node.js 18+ primeiro."
  exit 1
fi
echo "[OK] Node.js $(node -v)"

# Instala PM2 globalmente se não tiver
if ! command -v pm2 &> /dev/null; then
  echo "[INFO] Instalando PM2..."
  npm install -g pm2
fi
echo "[OK] PM2 $(pm2 -v)"

# Vai para o diretório do parser
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
echo "[INFO] Diretório: $SCRIPT_DIR"

# Instala dependências
echo "[INFO] Instalando dependências npm..."
npm install --production 2>&1

echo "[INFO] Verificando dependências críticas..."
node -e "require('pdf-parse')" 2>/dev/null  && echo "[OK] pdf-parse" || echo "[WARN] pdf-parse falhou"
node -e "require('mammoth')"   2>/dev/null  && echo "[OK] mammoth"   || echo "[WARN] mammoth falhou"
node -e "require('xlsx')"      2>/dev/null  && echo "[OK] xlsx"      || echo "[WARN] xlsx falhou"
node -e "require('multer')"    2>/dev/null  && echo "[OK] multer"    || echo "[WARN] multer falhou"

# Para instância anterior se existir
pm2 stop ben-file-parser 2>/dev/null || true
pm2 delete ben-file-parser 2>/dev/null || true

# Inicia com PM2
echo "[INFO] Iniciando ben-file-parser na porta 3010..."
pm2 start ecosystem.config.js

# Salva configuração PM2
pm2 save

# Setup auto-restart on reboot
pm2 startup 2>/dev/null || echo "[INFO] Execute 'pm2 startup' manualmente para auto-restart"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ BEN File Parser instalado com sucesso!            ║"
echo "║  Porta: 3010                                          ║"
echo "║  URL: http://$(hostname -I | awk '{print $1}'):3010/health            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "  pm2 status         # verificar status"
echo "  pm2 logs ben-file-parser  # ver logs"
echo "  pm2 restart ben-file-parser  # reiniciar"
