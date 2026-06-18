import os
import sys
import requests
import json
from dotenv import load_dotenv

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("ENV não carregado corretamente")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = "/mnt/hd1tb/projetos/canguess/frontend/public/data"


# =========================
# INDEX
# =========================
def resolve_event(code):
    path = os.path.join(OUTPUT_DIR, "events-index.json")

    with open(path, "r") as f:
        index = json.load(f)

    for e in index:
        if e["code"] == code:
            return e

    raise Exception("Event code não encontrado")


# =========================
# SUPABASE
# =========================
def fetch_event(event_uuid):
    url = f"{SUPABASE_URL}/rest/v1/events?id=eq.{event_uuid}&select=*"
    r = requests.get(url, headers=HEADERS)
    return r.json()[0]


def fetch_rounds(phase_uuid):
    url = f"{SUPABASE_URL}/rest/v1/event_rounds?event_phase_uuid=eq.{phase_uuid}&select=*"
    r = requests.get(url, headers=HEADERS)
    return r.json()


def fetch_parts(round_uuid):
    url = f"{SUPABASE_URL}/rest/v1/event_parts?round_uuid=eq.{round_uuid}&select=*,teams(code,name)&order=sequence_part"
    r = requests.get(url, headers=HEADERS)
    return r.json()


def fetch_predicts(event_uuid):
    url = f"{SUPABASE_URL}/rest/v1/predicts?event_uuid=eq.{event_uuid}&select=*"
    r = requests.get(url, headers=HEADERS)
    return r.json()


def fetch_users():
    url = f"{SUPABASE_URL}/rest/v1/users?select=id,user_name"
    r = requests.get(url, headers=HEADERS)
    return r.json()


# =========================
# HELPERS
# =========================
def build_score(parts):
    clean = [p for p in parts if p.get("sequence_part") is not None]
    clean.sort(key=lambda x: int(x.get("sequence_part") or 0))

    if len(clean) < 2:
        return None

    a = clean[0].get("value")
    b = clean[1].get("value")

    if a is None or b is None:
        return None

    return f"{a}-{b}"


def calc_result(score):
    if not score:
        return None

    try:
        a, b = score.split("-")
        a, b = int(a), int(b)

        if a > b:
            return "1"
        elif a < b:
            return "2"
        return "X"
    except:
        return None


# =========================
# ENGINE CORE
# =========================
def run_engine(code):
    print(f"ENGINE ONLINE - {code}")

    ref = resolve_event(code)

    event_uuid = ref["event_uuid"]
    workspace_uuid = ref["workspace"]
    phase_uuid = ref["phase_uuid"]

    event = fetch_event(event_uuid)

    # =========================
    # ROUNDS (GABARITO)
    # =========================
    rounds_raw = fetch_rounds(phase_uuid)

    rounds = []
    for r in rounds_raw:
        parts = fetch_parts(r["id"])
        score = build_score(parts)

        rounds.append({
            "round_uuid": r["id"],
            "round_name": r.get("round_name"),
            "round_date": r.get("round_date"),
            "time_round": r.get("time_round"),
            "local": r.get("local"),
            "status": r.get("status"),
            "score": score,
            "result": calc_result(score)
        })

    # =========================
    # PREDICTS RAW
    # =========================
    predicts_raw = fetch_predicts(event_uuid)
    users = fetch_users()

    user_map = {u["id"]: u["user_name"] for u in users}

    # =========================
    # GROUP BY USER
    # =========================
    grouped = {}

    for p in predicts_raw:
        uid = p.get("user_uuid")
        if not uid:
            continue

        idx = p.get("round_index")
        pred = p.get("prediction")

        if uid not in grouped:
            grouped[uid] = {
                "user_uuid": uid,
                "user_name": user_map.get(uid, "-"),
                "predictions": {},
                "points": 0
            }

        grouped[uid]["predictions"][idx] = pred

    # =========================
    # SCORE USERS
    # =========================
    users_out = []

    for uid, u in grouped.items():
        enriched = []
        points = 0

        for i, r in enumerate(rounds, start=1):
            pred = u["predictions"].get(i, "")
            result = r["result"]

            if pred and result and pred == result:
                enriched.append(f"{pred}B")
                points += 1
            else:
                enriched.append(pred if pred else "")

        users_out.append({
            "user_uuid": uid,
            "user_name": u["user_name"],
            "predictions": enriched,
            "points": points
        })

    users_out.sort(key=lambda x: -x["points"])

    # =========================
    # OUTPUT EVENT
    # =========================
    event_json = {
        "code": code,
        "event_uuid": event_uuid,
        "workspace_uuid": workspace_uuid,
        "workspace_name": event.get("workspace_name"),
        "is_open": event.get("is_open"),
        "status": event.get("status"),
        "rounds": rounds
    }

    predicts_json = {
        "code": code,
        "event_uuid": event_uuid,
        "users": users_out,
        "users_count": len(users_out)
    }

    # =========================
    # SAVE
    # =========================
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(f"{OUTPUT_DIR}/{code}.event.json", "w") as f:
        json.dump(event_json, f, indent=2, ensure_ascii=False)

    with open(f"{OUTPUT_DIR}/{code}.predicts.json", "w") as f:
        json.dump(predicts_json, f, indent=2, ensure_ascii=False)

    print("✔ ENGINE DONE")
    print("rounds:", len(rounds))
    print("users:", len(users_out))


if __name__ == "__main__":
    run_engine(sys.argv[1])
