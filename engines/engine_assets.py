import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont


# =========================================================
# PATH BASE (FUNCIONA LOCAL + RENDER)
# =========================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

ASSETS_DIR = os.path.join(
    BASE_DIR,
    "frontend",
    "public",
    "assets"
)

SYSTEM_BANNER_DEFAULT = os.path.join(
    ASSETS_DIR,
    "system",
    "defaults",
    "Banner_default.png"
)


# =========================================================
# QR GENERATOR
# =========================================================

def generate_qr(event_code: str):
    url = f"https://canguess.com.br/?code={event_code}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )

    qr.add_data(url)
    qr.make(fit=True)

    return qr.make_image(
        fill_color="#0B3C49",
        back_color="white"
    ).convert("RGB")


# =========================================================
# QR BLOCK (com texto)
# =========================================================

def build_qr_block(workspace_name, event_code, qr_img):
    qr_w, qr_h = qr_img.size

    padding = 40
    block_w = qr_w + padding
    block_h = qr_h + 140

    block = Image.new("RGB", (block_w, block_h), "white")
    draw = ImageDraw.Draw(block)

    # font fallback
    try:
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        font_title = ImageFont.truetype(font_path, 24)
        font_code = ImageFont.truetype(font_path, 30)
    except:
        font_title = ImageFont.load_default()
        font_code = ImageFont.load_default()

    # TITLE
    title = workspace_name.upper()
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]

    draw.text(
        ((block_w - tw) // 2, 10),
        title,
        fill="#0B3C49",
        font=font_title
    )

    # QR
    block.paste(qr_img, (padding // 2, 50))

    # CODE
    code_text = f"CODE: {event_code}"
    bbox = draw.textbbox((0, 0), code_text, font=font_code)
    cw = bbox[2] - bbox[0]

    draw.text(
        ((block_w - cw) // 2, qr_h + 70),
        code_text,
        fill="#D92525",
        font=font_code
    )

    return block


# =========================================================
# BANNER ENGINE
# =========================================================

def load_banner(event_code):
    """
    tenta pegar banner do evento,
    senão usa default
    """

    event_banner = os.path.join(
        ASSETS_DIR,
        "events",
        event_code,
        f"Banner.{event_code}.png"
    )

    if os.path.exists(event_banner):
        return Image.open(event_banner).convert("RGB")

    if os.path.exists(SYSTEM_BANNER_DEFAULT):
        return Image.open(SYSTEM_BANNER_DEFAULT).convert("RGB")

    raise Exception("Nenhum banner encontrado (nem default)")


def merge_banner_with_qr(banner, qr_block, output_path):
    bw, bh = banner.size

    # resize proporcional
    target_h = int(bh * 0.35)
    ratio = qr_block.width / qr_block.height
    target_w = int(target_h * ratio)

    qr_resized = qr_block.resize(
        (target_w, target_h),
        Image.Resampling.LANCZOS
    )

    # posição: canto superior direito
    margin = 40
    x = bw - target_w - margin
    y = margin

    banner.paste(qr_resized, (x, y))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    banner.save(output_path, quality=95)

    print(f"✅ Banner gerado: {output_path}")


# =========================================================
# ENGINE MAIN
# =========================================================

def run_assets_engine(event_code, workspace_name):

    print("\n🚀 ENGINE ASSETS START")
    print(f"CODE: {event_code}")
    print(f"WORKSPACE: {workspace_name}")

    # 1. QR
    qr = generate_qr(event_code)

    # 2. bloco visual
    qr_block = build_qr_block(workspace_name, event_code, qr)

    # 3. banner input resolve (fallback automático)
    banner = load_banner(event_code)

    # 4. output path
    output_path = os.path.join(
        ASSETS_DIR,
        "events",
        event_code,
        f"Banner.{event_code}.png"
    )

    # 5. merge final
    merge_banner_with_qr(banner, qr_block, output_path)


# =========================================================
# CLI
# =========================================================

if __name__ == "__main__":

    if len(sys.argv) < 3:
        print("Uso: python engine_assets.py <CODE> <WORKSPACE>")
        sys.exit(1)

    code = sys.argv[1]
    workspace = sys.argv[2]

    run_assets_engine(code, workspace)
