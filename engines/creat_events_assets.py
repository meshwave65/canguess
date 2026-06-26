import os
import sys
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv
from supabase import create_client

# =========================
# ENV
# =========================

load_dotenv("/mnt/hd1tb/projetos/.env")

SUPABASE_URL = os.getenv("VITE_BOLAO_SUPABASE_STORAGE_URL")
SUPABASE_KEY = os.getenv("SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing SUPABASE_URL or SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET = "events-assets"


# =========================
# IMAGE GENERATOR
# =========================

def generate_banner(code: str):
    img = Image.new("RGB", (1200, 300), color=(11, 60, 73))
    draw = ImageDraw.Draw(img)

    text = f"{code}\nEVENTO EM CONFIGURAÇÃO"

    try:
        font = ImageFont.load_default()
    except:
        font = None

    draw.text((40, 120), text, fill=(255, 255, 255), font=font)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer


# =========================
# MD GENERATOR
# =========================

def generate_md(title: str):
    content = f"# {title}\n\nConteúdo ainda não definido.\nSolicite informações ao administrador do evento.\n"
    buffer = BytesIO(content.encode("utf-8"))
    return buffer


# =========================
# UPLOAD HELPERS
# =========================

def upload_file(path: str, file_obj, content_type: str):
    supabase.storage.from_(BUCKET).upload(
        path,
        file_obj,
        {
            "content-type": content_type,
            "upsert": "true"
        }
    )


def public_url(path: str):
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"


# =========================
# MAIN PROCESS
# =========================

def run(code: str):
    print(f"🚀 Criando assets do evento: {code}")

    base = f"{code}"

    # -------------------------
    # 1. BANNER
    # -------------------------
    banner_path = f"{base}/Banner.{code}.png"
    banner_file = generate_banner(code)
    upload_file(banner_path, banner_file, "image/png")

    # -------------------------
    # 2. MARKDOWN FILES
    # -------------------------

    intro_path = f"{base}/Intro.{code}.md"
    rules_path = f"{base}/Rules.{code}.md"
    general_path = f"{base}/General.{code}.md"

    upload_file(intro_path, generate_md("Apresentação do Evento"), "text/markdown")
    upload_file(rules_path, generate_md("Regras de Participação"), "text/markdown")
    upload_file(general_path, generate_md("Informações Gerais"), "text/markdown")

    # -------------------------
    # 3. MANIFEST
    # -------------------------

    manifest = {
        "code": code,
        "banner": public_url(banner_path),
        "intro": public_url(intro_path),
        "rules": public_url(rules_path),
        "general": public_url(general_path)
    }

    manifest_path = f"{base}/Manifest.{code}.json"

    manifest_file = BytesIO(json.dumps(manifest, indent=2, ensure_ascii=False).encode("utf-8"))

    upload_file(manifest_path, manifest_file, "application/json")

    print("✅ ASSETS CRIADOS COM SUCESSO")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


# =========================
# ENTRYPOINT
# =========================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python create_events_assets.py CODIGO")
        sys.exit(1)

    run(sys.argv[1])
