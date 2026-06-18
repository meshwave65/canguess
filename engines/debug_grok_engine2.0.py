import os
import sys
import requests
import json
from dotenv import load_dotenv

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = "/mnt/hd1tb/projetos/canguess/frontend/public/data"

def debug_predicts(event_uuid):
    print(f"\n🔎 DEBUG COMPLETO - event_uuid: {event_uuid}")
    
    # 1. Busca normal
    url = f"{SUPABASE_URL}/rest/v1/predicts?event_uuid=eq.{event_uuid}&select=*"
    print(f"URL: {url}")
    
    r = requests.get(url, headers=HEADERS)
    print(f"Status: {r.status_code}")
    print(f"Resposta: {r.text}")
    
    # 2. Tenta sem filtro (ver se consegue ver alguma coisa)
    print("\n--- Tentando buscar TODOS os predicts ---")
    r2 = requests.get(f"{SUPABASE_URL}/rest/v1/predicts?select=count", headers=HEADERS)
    print(f"Total de registros na tabela: {r2.text}")
    
    # 3. Tenta com service_role (se você tiver a chave)
    # Descomente se quiser testar depois:
    # HEADERS_SERVICE = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python debug.py CODIGO")
        sys.exit(1)
    
    # Pega o event_uuid
    code = sys.argv[1]
    path = os.path.join(OUTPUT_DIR, "events-index.json")
    with open(path, "r") as f:
        index = json.load(f)
    
    ref = next((e for e in index if e["code"] == code), None)
    if not ref:
        print("❌ Event code não encontrado")
        sys.exit(1)
    
    event_uuid = ref["event_uuid"]
    debug_predicts(event_uuid)
