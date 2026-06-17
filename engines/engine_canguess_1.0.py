import os
import requests
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("ENV VITE_BOLAO_SUPABASE_URL ou VITE_BOLAO_SUPABASE_ANON_KEY não definido")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

OUTPUT_FILE = "/mnt/hd1tb/projetos/canguess/frontend/public/data/bolao.json"


# -----------------------------
# HELPERS
# -----------------------------
def fetch_event(event_uuid):
    url = f"{SUPABASE_URL}/rest/v1/events?id=eq.{event_uuid}&select=name,workspace_uuid"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    return data[0] if data else None


def fetch_workspace(workspace_uuid):
    url = f"{SUPABASE_URL}/rest/v1/workspaces?id=eq.{workspace_uuid}&select=name"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    return data[0]["name"] if data else None


def fetch_rounds(phase_uuid):
    url = (
        f"{SUPABASE_URL}/rest/v1/event_rounds"
        f"?select=*"
        f"&event_phase_uuid=eq.{phase_uuid}"
        f"&order=created_at"
    )

    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()


def fetch_parts(round_uuid):
    url = (
        f"{SUPABASE_URL}/rest/v1/event_parts"
        f"?select=id,sequence_part,value,team_uuid,teams(code,name)"
        f"&round_uuid=eq.{round_uuid}"
        f"&order=sequence_part"
    )

    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()


# -----------------------------
# SCORE BASE
# -----------------------------
def build_score(parts):
    parts_sorted = sorted(parts, key=lambda x: x.get("sequence_part") or 0)

    if len(parts_sorted) < 2:
        return None

    home = parts_sorted[0].get("value")
    away = parts_sorted[1].get("value")

    if home is None or away is None:
        return None

    return f"{home}-{away}"


# -----------------------------
# RESULT (1 X 2)
# -----------------------------
def calc_result(score):
    if not score:
        return None

    try:
        home, away = score.split("-")
        home = int(home)
        away = int(away)

        if home > away:
            return "1"
        elif home < away:
            return "2"
        else:
            return "X"
    except:
        return None


# -----------------------------
# ENGINE CORE
# -----------------------------
def run_engine(event_uuid, phase_uuid):
    print("ENGINE ONLINE")

    event = fetch_event(event_uuid)
    event_name = event["name"] if event else None
    workspace_name = None

    if event and event.get("workspace_uuid"):
        workspace_name = fetch_workspace(event["workspace_uuid"])

    rounds = fetch_rounds(phase_uuid)
    output_rounds = []

    for r in rounds:
        parts = fetch_parts(r["id"])

        normalized_parts = []
        for p in parts:
            if not p.get("sequence_part"):
                continue

            normalized_parts.append({
                "sequence_part": p.get("sequence_part"),
                "team_code": p["teams"]["code"] if p.get("teams") else None,
                "team_name": p["teams"]["name"] if p.get("teams") else None,
                "value": p.get("value")
            })

        score = build_score(normalized_parts)

        output_rounds.append({
            "round_uuid": r["id"],
            "round_name": r.get("round_name"),

            "round_date": r.get("round_date"),
            "time_round": r.get("time_round"),
            "local": r.get("local"),

            "score": score,
            "result": calc_result(score),

            "parts": normalized_parts
        })

    output = {
        "event_uuid": event_uuid,
        "event_name": event_name,
        "workspace_name": workspace_name,
        "phase_uuid": phase_uuid,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "rounds": output_rounds
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"JSON atualizado: {len(output_rounds)} rounds")


if __name__ == "__main__":
    EVENT_UUID = "e6a5c1df-2a11-4d03-9456-45e71706b3f1"
    PHASE_UUID = "73cc0474-726e-454e-b0c4-20ca7f9c28e6"

    run_engine(EVENT_UUID, PHASE_UUID)
