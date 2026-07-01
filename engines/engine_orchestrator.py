import time
import requests
from datetime import datetime, timedelta

ENGINE_URL = "https://canguess-engines.onrender.com"

# cache simples em memória (evita spam no Render)
_last_run_cache = {}

# janela de wake (Render costuma ficar vivo ~10-15 min)
WAKE_WINDOW_SECONDS = 900


# =========================
# WAKE ENGINE
# =========================
def wake_engine():
    try:
        requests.get(
            f"{ENGINE_URL}/health",
            timeout=5
        )
    except:
        pass


# =========================
# CHECK CACHE (debounce)
# =========================
def can_run(code):
    last = _last_run_cache.get(code)

    if not last:
        return True

    if time.time() - last > WAKE_WINDOW_SECONDS:
        return True

    return False


def mark_run(code):
    _last_run_cache[code] = time.time()


# =========================
# CORE CALL WITH RETRY
# =========================
def call_engine(code, max_retries=6):

    url = f"{ENGINE_URL}/run?code={code}"

    for attempt in range(max_retries):

        try:
            r = requests.get(url, timeout=30)

            if r.status_code == 200:
                return r.json()

        except Exception as e:
            print(f"[ENGINE] tentativa {attempt+1} falhou: {e}")

        # backoff exponencial leve
        sleep_time = 2 * (attempt + 1)
        time.sleep(sleep_time)

    raise Exception("Engine não respondeu após retries")


# =========================
# MAIN ORCHESTRATION FLOW
# =========================
def run_orchestrated(code, force=False):

    print(f"\n🚀 ORCHESTRATOR START - {code}")

    # 1. debounce inteligente
    if not force and not can_run(code):
        print("⏱️ Skip: dentro da janela de wake")
        return {
            "status": "skipped",
            "reason": "wake_window_active"
        }

    # 2. wake (leve)
    print("🟡 Waking engine...")
    wake_engine()

    time.sleep(2)

    # 3. execução com retry
    print("⚙️ Executando engine...")
    result = call_engine(code)

    # 4. marca execução
    mark_run(code)

    print("✅ ORCHESTRATOR DONE")

    return result


# =========================
# CLI TEST
# =========================
if __name__ == "__main__":

    import sys

    if len(sys.argv) < 2:
        print("Uso: python engine_orchestrator.py CODIGO")
        exit(1)

    code = sys.argv[1]

    res = run_orchestrated(code)

    print("\nRESULT:")
    print(res)
