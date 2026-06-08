#!/bin/bash

set -e

echo "⚽ Inicializando Seed da Copa do Mundo..."

BASE_DIR="seed"
VENV_DIR="$BASE_DIR/venv"

# -----------------------
# 1. Criar estrutura
# -----------------------
mkdir -p $BASE_DIR/dataset
mkdir -p $BASE_DIR/engine

# -----------------------
# 2. Criar virtualenv (OBRIGATÓRIO no Ubuntu moderno)
# -----------------------
echo "🐍 Configurando ambiente Python..."

if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv $VENV_DIR
fi

source $VENV_DIR/bin/activate

# -----------------------
# 3. Atualizar pip
# -----------------------
pip install --upgrade pip

# -----------------------
# 4. Dependências
# -----------------------
pip install supabase

# -----------------------
# 5. Export Supabase config
# -----------------------
export SUPABASE_URL="https://yammlvegwwfndpbhoxff.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbW1sdmVnd3dmbmRwYmhveGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTEwODAsImV4cCI6MjA5NTg4NzA4MH0.9iawLMChb69wCBaZD83p_pf1UsPFizd_kyuWPE9Bb-c"

# -----------------------
# 6. Executar seed
# -----------------------
echo "🚀 Rodando engine de seed..."

python3 $BASE_DIR/main.py

echo "🎉 Seed concluído com sucesso!"
