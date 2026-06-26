import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

STATE_PRIORITY = ["OPEN", "STRUCTURE", "DONE"]


# =========================
# WORKSPACES
# =========================
def fetch_workspaces():
    res = supabase.table("workspaces").select("id, workspace_name").execute()
    return res.data or []


# =========================
# EVENTS BY WORKSPACE
# =========================
def fetch_events_by_workspace(workspace_id):
    res = (
        supabase.table("events")
        .select("*")
        .eq("workspace_uuid", workspace_id)
        .execute()
    )
    return res.data or []


# =========================
# RESOLVER EVENTO
# =========================
def resolve_event(events):
    """
    pega o primeiro evento válido por prioridade:
    OPEN > STRUCTURE > DONE
    """

    events_by_status = {}

    for e in events:
        status = e.get("status")

        if status is None:
            continue

        status = str(status).upper()

        if status not in STATE_PRIORITY:
            continue

        # guarda o primeiro de cada status
        if status not in events_by_status:
            events_by_status[status] = e

    for state in STATE_PRIORITY:
        if state in events_by_status:
            return events_by_status[state]

    return None


# =========================
# ENGINE
# =========================
def build_engine():
    workspaces = fetch_workspaces()

    output = []

    for ws in workspaces:
        ws_id = ws.get("id")

        events = fetch_events_by_workspace(ws_id)
        event = resolve_event(events)

        if event is None:
            output.append({
                "workspace": ws.get("workspace_name"),
                "workspace_id": ws_id,
                "event": None,
                "code": "NULL"
            })
        else:
            output.append({
                "workspace": ws.get("workspace_name"),
                "workspace_id": ws_id,
                "event": {
                    "id": event.get("id"),
                    "name": event.get("event_name"),
                    "status": str(event.get("status")).upper(),
                    "code": event.get("event_code")
                }
            })

    return output


# =========================
# SAVE
# =========================
def save(data):
    path = "../frontend/public/data/workspaces.json"

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("OK -> JSON gerado")


if __name__ == "__main__":
    data = build_engine()
    save(data)
