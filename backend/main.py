from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import requests
import uuid

# =========================================================
# ENV
# =========================================================

load_dotenv("/mnt/hd1tb/projetos/.env")  # ou ajusta depois se quiser local

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# =========================================================
# APP
# =========================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# HEALTH
# =========================================================

@app.get("/")
def root():
    return {"status": "bolao-backend-ok"}

# =========================================================
# COUNTRIES
# =========================================================

@app.get("/countries")
def get_countries():
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/countries?select=*",
        headers=HEADERS
    )

    return r.json()


@app.post("/countries")
async def create_country(payload: dict):
    data = {
        "id": str(uuid.uuid4()),
        "code": payload.get("code"),
        "name": payload.get("name")
    }

    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/countries",
        json=data,
        headers=HEADERS
    )

    if r.status_code not in [200, 201]:
        raise HTTPException(status_code=400, detail=r.text)

    return {"ok": True, "data": data}
