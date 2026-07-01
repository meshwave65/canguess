import os
import sys
import requests
import json

from dotenv import load_dotenv
from collections import defaultdict


load_dotenv("/mnt/hd1tb/projetos/.env")


# =========================
# CONFIG
# =========================

SUPABASE_URL = os.getenv(
    "VITE_BOLAO_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "VITE_BOLAO_SUPABASE_ANON_KEY"
)


HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


OUTPUT_DIR = (
    "/mnt/hd1tb/projetos/canguess/frontend/public/data"
)



# =========================
# EVENT RESOLVE
# =========================

def resolve_event(code):

    with open(
        os.path.join(
            OUTPUT_DIR,
            "events-index.json"
        ),
        encoding="utf-8"
    ) as f:

        index = json.load(f)



    for e in index:

        if e["code"] == code:
            return e



    raise Exception(
        f"Evento não encontrado: {code}"
    )




# =========================
# DETAILS
# =========================

def fetch_event_details(event_uuid):

    try:

        r = requests.get(

            f"{SUPABASE_URL}/rest/v1/events"
            f"?id=eq.{event_uuid}"
            f"&select=event_name,is_open",

            headers=HEADERS
        )


        data = r.json()


        if data:

            return {
                "event_name":
                    data[0].get("event_name"),

                "is_open":
                    data[0].get("is_open", False)
            }


    except Exception:

        pass


    return {}





def fetch_workspace_name(workspace_uuid):

    if not workspace_uuid:
        return "-"


    try:

        r = requests.get(

            f"{SUPABASE_URL}/rest/v1/workspaces"
            f"?id=eq.{workspace_uuid}"
            f"&select=workspace_name",

            headers=HEADERS

        )


        data = r.json()


        if data:

            return data[0].get(
                "workspace_name",
                "-"
            )


    except Exception:

        pass


    return "-"

# =======================================================
# CONFIRM_PHONE DO WORKSPACE
# =======================================================

def fetch_workspace_phone(workspace_uuid):

    if not workspace_uuid:
        return "-"


    try:

        r = requests.get(

            f"{SUPABASE_URL}/rest/v1/workspaces"
            f"?id=eq.{workspace_uuid}"
            f"&select=confirm_phone",

            headers=HEADERS

        )


        data = r.json()


        if data:

            return data[0].get(
                "confirm_phone",
                "-"
            )


    except Exception:

        pass


    return "-"



# =========================
# FETCHERS
# =========================


def fetch_rounds(phase_uuid):

    r = requests.get(

        f"{SUPABASE_URL}/rest/v1/event_rounds"
        f"?event_phase_uuid=eq.{phase_uuid}"
        f"&select=*,id,result_round"
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
        f"&select=user_uuid,round_index,prediction",

        headers=HEADERS

    )


    return r.json()




def fetch_users():

    r = requests.get(

        f"{SUPABASE_URL}/rest/v1/users"
        f"?select=id,user_name",

        headers=HEADERS

    )


    return r.json()

# =========================
# SCORE
# =========================

def normalize_score(result_round):

    if not result_round:
        return None


    score = str(
        result_round
    ).strip()


    if "x" not in score.lower():

        return None


    return score.lower()




# =========================
# LEGACY FALLBACK
# =========================

def build_score_from_parts(parts):

    ordered = sorted(

        parts,

        key=lambda x:
            int(
                x.get("sequence_part") or 0
            )

    )


    if len(ordered) < 2:

        return None



    first = ordered[0].get(
        "value"
    )

    second = ordered[1].get(
        "value"
    )


    if first is None or second is None:

        return None



    return (
        f"{str(first).strip()}"
        f"x"
        f"{str(second).strip()}"
    )





# =========================
# RESULT
# =========================

def calc_result(score):

    if not score:

        return None



    try:

        home, away = score.split("x")


        home = int(
            home.strip()
        )

        away = int(
            away.strip()
        )


        if home > away:

            return "1"


        elif home < away:

            return "2"


        else:

            return "X"



    except Exception:

        return None






# =========================
# SYNC EVENT PARTS
# =========================

def sync_parts_values(
        round_uuid,
        score
):


    if not score:

        return



    try:

        home, away = score.split("x")


    except Exception:

        return




    parts = fetch_parts(
        round_uuid
    )



    for part in parts:


        sequence = part.get(
            "sequence_part"
        )



        if sequence == 1:

            value = home


        elif sequence == 2:

            value = away


        else:

            continue




        # evita update desnecessário

        if str(
            part.get("value")
        ) == str(value):

            continue





        requests.patch(

            f"{SUPABASE_URL}/rest/v1/event_parts"
            f"?id=eq.{part['id']}",


            json={

                "value":
                    int(value)

            },


            headers=HEADERS

        )


        print(

            f"PART UPDATE "
            f"{part['id']} = {value}"

        )





# =========================
# POINTS
# =========================

def calculate_points(
        prediction,
        real_result,
        round_index
):

    if round_index == 11:

        return 0



    if (
        not prediction
        or not real_result
        or prediction == "-"
    ):

        return 0



    clean = prediction



    if prediction.endswith("B"):

        clean = prediction[0]



    return (
        1
        if clean == real_result
        else 0
    )

# =========================
# ENGINE CORE
# =========================

def run_engine(code):

    print(
        f"🚀 ENGINE ONLINE - {code}"
    )


    ref = resolve_event(code)


    event_uuid = ref["event_uuid"]
    phase_uuid = ref["phase_uuid"]
    workspace_uuid = ref["workspace"]



    event_details = fetch_event_details(
        event_uuid
    )
    
    is_open = event_details.get(
        "is_open",
        False
    )

    workspace_name = fetch_workspace_name(
        workspace_uuid
    )

    confirm_phone = fetch_workspace_phone(
        workspace_uuid
    )


    # =========================
    # ROUNDS
    # =========================

    rounds_raw = fetch_rounds(
        phase_uuid
    )


    rounds = []



    for r in rounds_raw:


        parts = fetch_parts(
            r["id"]
        )



        # 1 - NOVO MODELO
        score = normalize_score(
            r.get("result_round")
        )



        # 2 - COMPATIBILIDADE LEGADO
        if not score:

            score = build_score_from_parts(
                parts
            )



        result = calc_result(
            score
        )



        # atualiza event_parts
        # somente quando existe placar

        if score:

            sync_parts_values(
                r["id"],
                score
            )



        round_index = (
            r.get("round_order")
            or
            (len(rounds) + 1)
        )



        rounds.append({

            "round_uuid":
                r["id"],

            "round_name":
                r.get("round_name"),


            "round_order":
                r.get("round_order"),


            "round_index":
                round_index,


            "local":
                r.get("local"),


            "round_date":
                r.get("round_date"),


            "time_round":
                r.get("time_round"),


            "score":
                score,


            "result":
                result,


            "parts":
                parts

        })




    rounds.sort(

        key=lambda x:
            x["round_index"]

    )



    # DEBUG TEMPORÁRIO
    print("\nRESULTADOS DOS JOGOS")

    for r in rounds:

        print(

            r["round_index"],
            r["round_name"],
            r["score"],
            r["result"]

        )





    # =========================
    # PREDICTS
    # =========================

    predicts_raw = fetch_predicts(
        event_uuid
    )


    print(
        f"📥 Palpites: {len(predicts_raw)}"
    )



    user_data = defaultdict(
        lambda:
        {
            "predictions":[]
        }
    )



    for p in predicts_raw:


        uid = p.get(
            "user_uuid"
        )


        if uid:

            user_data[uid][
                "predictions"
            ].append({

                "round_index":
                    p.get("round_index"),


                "prediction":
                    p.get("prediction")

            })





    users_raw = fetch_users()



    user_map = {

        u["id"]:
            u.get(
                "user_name",
                "-"
            )

        for u in users_raw

    }





    # =========================
    # RANKING
    # =========================

    users_out = []



    for uid, data in user_data.items():


        predictions = [
            "-"
        ] * len(rounds)



        for p in data["predictions"]:


            idx = (
                p["round_index"]
                -
                1
            )


            if (
                idx >= 0
                and
                idx < len(predictions)
            ):

                if is_open:

                    predictions[idx] = (
                        p["prediction"]
                    )

                else:

                    predictions[idx] = "-"



            points = 0

            if not is_open:
                points = 0



        for i, pred in enumerate(predictions):


            points += calculate_points(

                pred,


                rounds[i]["result"],


                rounds[i]["round_index"]

            )





        users_out.append({

            "user_uuid":
                uid,


            "user_name":
                user_map.get(
                    uid,
                    "-"
                ),


            "predictions":
                predictions,


            "points":
                points

        })





    users_out.sort(

        key=lambda x:
            x["points"],

        reverse=True

    )





    # =========================
    # JSON EVENT
    # =========================

    event_json = {

        "code":
            code,


        "event_uuid":
            event_uuid,

        "is_open":
            is_open,


        "event_name":
            (
                event_details.get(
                    "event_name"
                )
                or
                f"Bolão {code}"
            ),


        "workspace_name":
            workspace_name,

        "confirm_phone":
            confirm_phone,


        "workspace_uuid":
            workspace_uuid,


        "phase_uuid":
            phase_uuid,


        "rounds":
            rounds

    }





    # =========================
    # JSON PREDICTS
    # =========================

    predicts_json = {

        "code":
            code,


        "event_uuid":
            event_uuid,


        "users":
            users_out,


        "users_count":
            len(users_out)

    }





    # =========================
    # SAVE
    # =========================

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )



    with open(

        f"{OUTPUT_DIR}/{code}.event.json",

        "w",

        encoding="utf-8"

    ) as f:


        json.dump(

            event_json,

            f,

            indent=2,

            ensure_ascii=False

        )




    with open(

        f"{OUTPUT_DIR}/{code}.predicts.json",

        "w",

        encoding="utf-8"

    ) as f:


        json.dump(

            predicts_json,

            f,

            indent=2,

            ensure_ascii=False

        )





    print(
        "✅ ENGINE FINALIZADA"
    )


    print(
        f"Rounds: {len(rounds)}"
    )


    print(
        f"Users: {len(users_out)}"
    )





# =========================
# CLI
# =========================

if __name__ == "__main__":


    if len(sys.argv) < 2:

        print(
            "Uso: python engine_canguess_2_0.py CODIGO"
        )

        sys.exit(1)



    run_engine(
        sys.argv[1]
    )
