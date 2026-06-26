from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import os
import sys
import requests
import uuid


# =========================
# ENGINE PATH
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINES_DIR = os.path.join(BASE_DIR, "engines")

sys.path.append(ENGINES_DIR)


# =========================
# ENGINES
# =========================

import engine_canguess_2_0
import engine_workspaces
import create_events_assets

# =========================================================
# ENV
# =========================================================

load_dotenv()  # ou ajusta depois se quiser local

VITE_BOLAO_SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
VITE_BOLAO_SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": VITE_BOLAO_SUPABASE_KEY,
    "Authorization": f"Bearer {VITE_BOLAO_SUPABASE_KEY}",
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
        f"{VITE_BOLAO_SUPABASE_URL}/rest/v1/countries?select=*",
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
        f"{VITE_BOLAO_SUPABASE_URL}/rest/v1/countries",
        json=data,
        headers=HEADERS
    )

    if r.status_code not in [200, 201]:
        raise HTTPException(status_code=400, detail=r.text)

    return {"ok": True, "data": data}

@app.post("/webhook/round-result")
async def round_result(req: Request):
    data = await req.json()

    code = data.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="missing code")

    engine_canguess_2_0.run_engine(code)

    return {"ok": True}

@app.post("/webhook/workspace")
async def workspace(req: Request):
    engine_workspaces.run_engine()

    return {"ok": True}

@app.post("/webhook/event-created")
async def event_created(req: Request):
    data = await req.json()

    code = data.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="missing code")

    create_event_assets.run(code)

    return {"ok": True}
