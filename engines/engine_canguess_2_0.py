import os
import sys
import requests
import json
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_BOLAO_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = "/mnt/hd1tb/projetos/canguess/frontend/public/data"

# =========================
# EVENT RESOLVE
# =========================
def resolve_event(code):
    with open(os.path.join(OUTPUT_DIR, "events-index.json")) as f:
        index = json.load(f)
    for e in index:
        if e["code"] == code:
            return e
    raise Exception(f"Event code {code} não encontrado")

# =========================
# BUSCA REAL DOS NOMES
# =========================
def fetch_event_details(event_uuid):
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/events?id=eq.{event_uuid}&select=event_name",
            headers=HEADERS
        )
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            item = data[0]
            return {
                "event_name": item.get("event_name") or item.get("name")
            }
        return {}
    except:
        return {}

def fetch_workspace_name(workspace_uuid):
    if not workspace_uuid:
        return "-"
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/workspaces?id=eq.{workspace_uuid}&select=workspace_name",
            headers=HEADERS
        )
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            item = data[0]
            return item.get("workspace_name") or item.get("name") or "-"
        return "-"
    except:
        return "-"

# =========================
# FETCHERS
# =========================
def fetch_rounds(phase_uuid):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/event_rounds"
        f"?event_phase_uuid=eq.{phase_uuid}"
        f"&select=*,local,round_date,time_round,round_name,round_order,id"
        f"&order=round_order",
        headers=HEADERS
    )
    return r.json()

def fetch_parts(round_uuid):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/event_parts"
        f"?round_uuid=eq.{round_uuid}"
        f"&select=*,teams(teams_code,teams_name)"
        f"&order=sequence_part",
        headers=HEADERS
    )
    return r.json()

def fetch_predicts(event_uuid):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/predicts"
        f"?event_uuid=eq.{event_uuid}"
        f"&select=user_uuid,round_index,prediction,ref_workspace",
        headers=HEADERS
    )
    return r.json()

def fetch_users():
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?select=id,user_name",
        headers=HEADERS
    )
    return r.json()

# =========================
# SCORE BUILD
# =========================
def build_score(parts):
    clean = sorted(
        [p for p in parts if p.get("sequence_part") is not None],
        key=lambda x: int(x.get("sequence_part") or 0)
    )
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
        a, b = map(int, score.split("-"))
        if a > b:
            return "1"
        elif a < b:
            return "2"
        else:
            return "X"
    except:
        return None

# =========================
# POINTS
# =========================
def calculate_points(prediction, real_result, round_index):
    if round_index == 11: # jogo reserva
        return 0
    if not prediction or not real_result or prediction == "-":
        return 0
    clean_pred = prediction[0] if prediction.endswith("B") else prediction
    return 1 if clean_pred == real_result else 0

# =========================
# ENGINE CORE
# =========================
def run_engine(code):
    print(f"🚀 ENGINE ONLINE - {code}")
    ref = resolve_event(code)
    event_uuid = ref["event_uuid"]
    phase_uuid = ref["phase_uuid"]
    workspace_uuid = ref["workspace"]

    # Busca nomes reais
    event_details = fetch_event_details(event_uuid)
    workspace_name = fetch_workspace_name(workspace_uuid)

    # =========================
    # ROUNDS
    # =========================
    rounds_raw = fetch_rounds(phase_uuid)
    rounds = []
    for r in rounds_raw:
        parts = fetch_parts(r["id"])
        score = build_score(parts)
        result = calc_result(score)
        round_index = r.get("round_order") or (len(rounds) + 1)

        rounds.append({
            "round_uuid": r["id"],
            "round_name": r.get("round_name"),
            "round_order": r.get("round_order"),
            "round_index": round_index,
            "local": r.get("local"),           # ← Novo
            "round_date": r.get("round_date"), # ← Novo
            "time_round": r.get("time_round"), # ← Novo
            "score": score,
            "result": result,
            "parts": parts
        })

    rounds.sort(key=lambda x: x["round_order"] or 0)

    # =========================
    # PREDICTS
    # =========================
    predicts_raw = fetch_predicts(event_uuid)
    print(f"📥 Palpites brutos: {len(predicts_raw)}")
    user_data = defaultdict(lambda: {"predictions": []})
    for p in predicts_raw:
        uid = p.get("user_uuid")
        if uid:
            user_data[uid]["predictions"].append({
                "round_index": p.get("round_index"),
                "prediction": p.get("prediction")
            })
    users_raw = fetch_users()
    user_map = {u["id"]: u.get("user_name", "-") for u in users_raw}

    # =========================
    # USERS BUILD
    # =========================
    users_out = []
    for uid, data in user_data.items():
        preds_list = sorted(
            data["predictions"],
            key=lambda x: x["round_index"]
        )
        predictions = ["-"] * len(rounds)
        for p in preds_list:
            idx = p["round_index"] - 1
            if 0 <= idx < len(predictions):
                predictions[idx] = p["prediction"]
        total_points = 0
        for i, pred in enumerate(predictions):
            if i < len(rounds):
                round_idx = rounds[i]["round_index"]
                total_points += calculate_points(
                    pred,
                    rounds[i]["result"],
                    round_idx
                )
        users_out.append({
            "user_uuid": uid,
            "user_name": user_map.get(uid, "-"),
            "predictions": predictions,
            "points": total_points
        })
    users_out.sort(key=lambda x: x["points"], reverse=True)

    # =========================
    # EVENT JSON
    # =========================
    event_json = {
        "code": code,
        "event_uuid": event_uuid,
        "event_name": event_details.get("event_name") or f"Bolão {code}",
        "workspace_name": workspace_name,
        "workspace_uuid": workspace_uuid,
        "phase_uuid": phase_uuid,
        "rounds": rounds
    }

    # =========================
    # PREDICTS JSON
    # =========================
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
    with open(f"{OUTPUT_DIR}/{code}.event.json", "w", encoding="utf-8") as f:
        json.dump(event_json, f, indent=2, ensure_ascii=False)
    with open(f"{OUTPUT_DIR}/{code}.predicts.json", "w", encoding="utf-8") as f:
        json.dump(predicts_json, f, indent=2, ensure_ascii=False)

    print("✅ ENGINE CONCLUÍDO")
    print(f"   Event Name     : {event_json['event_name']}")
    print(f"   Workspace      : {workspace_name}")
    print(f"   Workspace_uuid : {workspace_uuid}")
    print(f"   Rounds         : {len(rounds)}")
    print(f"   Usuários       : {len(users_out)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python engine.py CODIGO")
        sys.exit(1)
    run_engine(sys.argv[1])
