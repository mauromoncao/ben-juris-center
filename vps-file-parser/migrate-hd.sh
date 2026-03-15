#!/usr/bin/env bash
# ============================================================
# BEN KNOWLEDGE BASE — Script de Migração HD Local → Pinecone
# Execute este script no computador do escritório com os documentos
# Requer: rclone, curl
# Versão: 1.0.0 — 2026-03-15
# ============================================================

set -e

# ── Configuração ──────────────────────────────────────────────
VPS_URL="${VPS_URL:-http://181.215.135.202:3010}"
VPS_TOKEN="${VPS_TOKEN:-ben-parser-2026}"
BATCH_SIZE=5           # arquivos por lote (evitar timeout)
MAX_FILE_MB=200
DELAY_BETWEEN=1        # segundos entre arquivos

# ── Cores ─────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  BEN KNOWLEDGE BASE — Migração de Documentos             ║${NC}"
echo -e "${BOLD}║  Escritório Mauro Monção Advogados Associados            ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Verifica dependências ─────────────────────────────────────
check_deps() {
  for cmd in curl base64 find; do
    if ! command -v $cmd &> /dev/null; then
      echo -e "${RED}❌ Dependência ausente: $cmd${NC}"
      exit 1
    fi
  done
  echo -e "${GREEN}✅ Dependências OK${NC}"
}

# ── Detecta categoria pelo caminho/nome ───────────────────────
detect_category() {
  local path="$1"
  local lower="${path,,}"
  
  [[ "$lower" =~ processo|acao|reclamacao|mandado|petição|peticio ]] && echo "processos" && return
  [[ "$lower" =~ contrato|nda|acordo|distrato|aditivo ]]             && echo "contratos" && return
  [[ "$lower" =~ jurisprudencia|acordao|decisao|stj|stf|trf|tj|tst ]] && echo "jurisprudencias" && return
  [[ "$lower" =~ livro|doutrina|biblioteca|artigo|parecer|monografia ]] && echo "biblioteca" && return
  [[ "$lower" =~ cliente|honorario|proposta ]]                         && echo "clientes" && return
  echo "geral"
}

# ── Converte arquivo para base64 e envia ─────────────────────
index_file() {
  local filepath="$1"
  local category="$2"
  local client_id="$3"
  local process_id="$4"
  local filename
  filename=$(basename "$filepath")
  
  # Verifica tamanho
  local size_bytes
  size_bytes=$(wc -c < "$filepath" 2>/dev/null || stat -f%z "$filepath" 2>/dev/null || echo 0)
  local size_mb=$(echo "scale=1; $size_bytes/1024/1024" | bc 2>/dev/null || echo "?")
  
  if [ "$size_bytes" -gt $((MAX_FILE_MB * 1024 * 1024)) ]; then
    echo -e "  ${YELLOW}⚠️  Pulando (>$MAX_FILE_MB MB): $filename${NC}"
    return 1
  fi
  
  echo -e "  📄 $filename (${size_mb}MB) → $category..."
  
  # Lê arquivo como base64
  local base64_content
  base64_content=$(base64 -w 0 "$filepath" 2>/dev/null || base64 "$filepath" 2>/dev/null)
  
  if [ -z "$base64_content" ]; then
    echo -e "  ${RED}❌ Falha ao ler: $filename${NC}"
    return 1
  fi
  
  # Detecta mimetype básico
  local ext="${filename##*.}"
  local mimetype
  case "${ext,,}" in
    pdf)   mimetype="application/pdf" ;;
    docx)  mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document" ;;
    doc)   mimetype="application/msword" ;;
    xlsx)  mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ;;
    xls)   mimetype="application/vnd.ms-excel" ;;
    csv)   mimetype="text/csv" ;;
    txt)   mimetype="text/plain" ;;
    jpg|jpeg) mimetype="image/jpeg" ;;
    png)   mimetype="image/png" ;;
    mp4)   mimetype="video/mp4" ;;
    mp3)   mimetype="audio/mpeg" ;;
    m4a)   mimetype="audio/mp4" ;;
    wav)   mimetype="audio/wav" ;;
    *)     mimetype="application/octet-stream" ;;
  esac
  
  # Monta namespace
  local namespace="kb-${category}"
  [ -n "$client_id" ]  && namespace="kb-cliente-${client_id}"
  [ -n "$process_id" ] && namespace="kb-processo-$(echo "$process_id" | tr -dc 'a-z0-9' | tr '.' '_')"
  
  # Envia para VPS Parser
  local response
  response=$(curl -s -X POST "${VPS_URL}/extract" \
    -H "Content-Type: application/json" \
    -H "x-parser-token: ${VPS_TOKEN}" \
    -d "{
      \"base64\": \"${base64_content}\",
      \"filename\": \"${filename}\",
      \"mimetype\": \"${mimetype}\",
      \"index_rag\": true,
      \"namespace\": \"${namespace}\",
      \"agent_id\": \"ben-bulk-migrator\"
    }" \
    --max-time 120 2>/dev/null)
  
  if echo "$response" | grep -q '"success":true'; then
    local chunks
    chunks=$(echo "$response" | grep -o '"chunks":[0-9]*' | grep -o '[0-9]*' | head -1)
    local indexed
    indexed=$(echo "$response" | grep -o '"indexed":[0-9]*' | grep -o '[0-9]*' | head -1)
    echo -e "  ${GREEN}✅ $filename — ${chunks:-?} chunks, ${indexed:-?} vetores indexados${NC}"
    return 0
  else
    local error
    error=$(echo "$response" | grep -o '"error":"[^"]*"' | head -1)
    echo -e "  ${RED}❌ $filename — ${error:-resposta inválida}${NC}"
    return 1
  fi
}

# ── Processa diretório recursivamente ─────────────────────────
process_directory() {
  local dir="$1"
  local category="${2:-}"
  local client_id="${3:-}"
  local process_id="${4:-}"
  
  if [ ! -d "$dir" ]; then
    echo -e "${RED}❌ Diretório não encontrado: $dir${NC}"
    return 1
  fi
  
  echo ""
  echo -e "${BOLD}📁 Processando: $dir${NC}"
  echo -e "   Categoria: ${category:-auto-detectar}"
  
  # Extensões suportadas
  local exts=("*.pdf" "*.docx" "*.doc" "*.xlsx" "*.xls" "*.csv" "*.txt"
               "*.jpg" "*.jpeg" "*.png" "*.webp"
               "*.mp4" "*.mp3" "*.m4a" "*.wav")
  
  local total=0
  local success=0
  local failed=0
  
  for ext in "${exts[@]}"; do
    while IFS= read -r -d '' file; do
      total=$((total + 1))
      local cat="${category:-$(detect_category "$file")}"
      
      if index_file "$file" "$cat" "$client_id" "$process_id"; then
        success=$((success + 1))
      else
        failed=$((failed + 1))
      fi
      
      sleep "$DELAY_BETWEEN"
    done < <(find "$dir" -name "$ext" -type f -print0 2>/dev/null)
  done
  
  echo ""
  echo -e "  ${BOLD}Resultado: ${GREEN}${success} ok${NC}${BOLD} / ${RED}${failed} erro(s)${NC}${BOLD} de ${total} total${NC}"
}

# ── Menu interativo ──────────────────────────────────────────
show_menu() {
  echo ""
  echo -e "${BOLD}Selecione o modo de migração:${NC}"
  echo ""
  echo "  1) Migrar UMA pasta específica"
  echo "  2) Migrar pasta de PROCESSOS"
  echo "  3) Migrar pasta de BIBLIOTECA (livros/doutrinas)"
  echo "  4) Migrar pasta de CONTRATOS"
  echo "  5) Migrar pasta de JURISPRUDÊNCIAS"
  echo "  6) Migrar TODO o HD (mapeamento automático)"
  echo "  7) Testar conexão com VPS Parser"
  echo "  q) Sair"
  echo ""
  read -rp "Opção: " option
  
  case "$option" in
    1)
      read -rp "Caminho da pasta: " folder
      read -rp "Categoria (processos/contratos/biblioteca/jurisprudencias/geral): " cat
      process_directory "$folder" "$cat"
      ;;
    2)
      read -rp "Caminho da pasta de processos: " folder
      process_directory "$folder" "processos"
      ;;
    3)
      read -rp "Caminho da biblioteca: " folder
      process_directory "$folder" "biblioteca"
      ;;
    4)
      read -rp "Caminho dos contratos: " folder
      process_directory "$folder" "contratos"
      ;;
    5)
      read -rp "Caminho das jurisprudências: " folder
      process_directory "$folder" "jurisprudencias"
      ;;
    6)
      echo ""
      echo "Defina o mapeamento de pastas:"
      read -rp "Pasta raiz dos documentos: " root
      process_directory "$root/Processos"       "processos"
      process_directory "$root/Contratos"       "contratos"
      process_directory "$root/Biblioteca"      "biblioteca"
      process_directory "$root/Jurisprudencias" "jurisprudencias"
      process_directory "$root"                 "geral"
      ;;
    7)
      echo ""
      echo -e "Testando conexão com ${VPS_URL}..."
      response=$(curl -s "${VPS_URL}/health" --max-time 5 2>/dev/null)
      if echo "$response" | grep -q '"status":"ok"'; then
        echo -e "${GREEN}✅ VPS Parser online e respondendo${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
      else
        echo -e "${RED}❌ VPS Parser não respondeu. Verifique se está rodando.${NC}"
        echo "   URL: $VPS_URL"
        echo "   Inicie com: pm2 start server.js --name ben-file-parser"
      fi
      ;;
    q|Q) echo "Saindo."; exit 0 ;;
    *) echo "Opção inválida." ;;
  esac
}

# ── Main ──────────────────────────────────────────────────────
check_deps
echo ""
echo -e "VPS Parser: ${BOLD}${VPS_URL}${NC}"
echo -e "Token: ${BOLD}${VPS_TOKEN}${NC}"

# Se argumentos passados, processa direto
if [ $# -ge 1 ]; then
  process_directory "$1" "${2:-}" "${3:-}" "${4:-}"
else
  while true; do
    show_menu
    echo ""
  done
fi
