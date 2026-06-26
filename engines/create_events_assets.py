import os
import sys
import shutil
from PIL import Image, ImageDraw, ImageFont

# =========================
# PATHS BASE
# =========================

BASE_DIR = "/mnt/hd1tb/projetos/canguess/frontend/public/assets/events"
SYSTEM_DEFAULT_BANNER = "/mnt/hd1tb/projetos/canguess/frontend/public/assets/system/defaults/Banner_default.png"
OUTPUT_MANIFEST_DIR = "/mnt/hd1tb/projetos/canguess/frontend/public/data/events"


# =========================
# BANNER GENERATOR SAFE
# =========================

def create_banner_placeholder(path, code):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    img = Image.new("RGB", (1200, 300), color=(11, 60, 73))
    draw = ImageDraw.Draw(img)

    text = f"{code}\nEVENTO EM CONFIGURAÇÃO"

    try:
        font = ImageFont.load_default()
    except:
        font = None

    draw.text((40, 120), text, fill=(255, 255, 255), font=font)

    img.save(path, "PNG")


# =========================
# ENSURE DEFAULT EXISTS
# =========================

def ensure_default_banner():
    if not os.path.exists(SYSTEM_DEFAULT_BANNER):
        print("⚠️ Banner default não encontrado. Criando fallback...")

        create_banner_placeholder(SYSTEM_DEFAULT_BANNER, "DEFAULT")


# =========================
# CREATE EVENT BANNER
# =========================

def create_event_banner(code, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    ensure_default_banner()

    try:
        shutil.copy(SYSTEM_DEFAULT_BANNER, target_path)
        print(f"📌 Banner default copiado: {target_path}")

    except Exception as e:
        print(f"⚠️ Falha ao copiar banner default: {e}")
        print("🔧 Criando banner diretamente...")

        create_banner_placeholder(target_path, code)


# =========================
# CREATE MD FILES
# =========================

def create_md(path, title):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"# {title}\n\n")
            f.write("Conteúdo ainda não definido.\n")
            f.write("Solicite informações ao administrador do evento.\n")


# =========================
# CREATE MANIFEST
# =========================

def create_manifest(code):
    os.makedirs(OUTPUT_MANIFEST_DIR, exist_ok=True)

    manifest = {
        "code": code,
        "banner": f"/assets/events/{code}/Banner.{code}.png",
        "intro": f"/assets/events/{code}/Intro.{code}.md",
        "rules": f"/assets/events/{code}/Rules.{code}.md",
        "general": f"/assets/events/{code}/General.{code}.md"
    }

    path = f"{OUTPUT_MANIFEST_DIR}/Manifest.{code}.json"

    with open(path, "w", encoding="utf-8") as f:
        import json
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"📄 Manifest criado: {path}")


# =========================
# MAIN
# =========================

def run(code):
    print(f"🚀 Criando evento: {code}")

    event_dir = os.path.join(BASE_DIR, code)

    print("📁 Criando estrutura de assets...")

    # BANNER
    banner_path = os.path.join(event_dir, f"Banner.{code}.png")
    create_event_banner(code, banner_path)

    # MD FILES
    intro_path = os.path.join(event_dir, f"Intro.{code}.md")
    rules_path = os.path.join(event_dir, f"Rules.{code}.md")
    general_path = os.path.join(event_dir, f"General.{code}.md")

    create_md(intro_path, "Apresentação do Evento")
    create_md(rules_path, "Regras de Participação")
    create_md(general_path, "Informações Gerais")

    # MANIFEST
    create_manifest(code)

    print("✅ EVENTO CRIADO COM SUCESSO")
    print(f"   Banner   : {banner_path}")
    print(f"   Intro    : {intro_path}")
    print(f"   Rules    : {rules_path}")
    print(f"   General  : {general_path}")
    print(f"   Manifest : {OUTPUT_MANIFEST_DIR}/Manifest.{code}.json")


# =========================
# ENTRYPOINT
# =========================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python create_events_assets.py CODIGO")
        sys.exit(1)

    run(sys.argv[1])
