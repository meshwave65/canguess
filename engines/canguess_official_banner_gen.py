import qrcode
import os
from PIL import Image, ImageDraw, ImageFont

def generate_custom_qr_block(workspace_name, event_code, qr_color="#0B3C49"):
    """
    Cria um bloco vertical contendo:
    - Nome do Workspace (Topo)
    - QR Code (Meio)
    - Código do Evento (Base)
    """
    event_url = f"https://Canguess.com/?code={event_code}"
    
    # 1. Gerar QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=1,
    )
    qr.add_data(event_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=qr_color, back_color="white").convert('RGB')
    
    # 2. Configurar Canvas para o Bloco
    qr_w, qr_h = qr_img.size
    padding = 40
    block_w = qr_w + padding
    block_h = qr_h + 120 # Espaço extra para textos
    
    block = Image.new("RGB", (block_w, block_h), color="white")
    draw = ImageDraw.Draw(block)
    
    # 3. Carregar Fonte
    try:
        # Tenta carregar uma fonte sans-serif do sistema
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if not os.path.exists(font_path):
            font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        
        font_title = ImageFont.truetype(font_path, 24)
        font_code = ImageFont.truetype(font_path, 32)
    except:
        font_title = ImageFont.load_default()
        font_code = ImageFont.load_default()

    # 4. Desenhar Textos
    # Workspace (Topo)
    title_bbox = draw.textbbox((0, 0), workspace_name, font=font_title)
    title_w = title_bbox[2] - title_bbox[0]
    draw.text(((block_w - title_w) // 2, 15), workspace_name, fill=qr_color, font=font_title)
    
    # QR Code (Centro)
    block.paste(qr_img, (padding // 2, 50))
    
    # Event Code (Base)
    code_text = f"CODE: {event_code}"
    code_bbox = draw.textbbox((0, 0), code_text, font=font_code)
    code_w = code_bbox[2] - code_bbox[0]
    draw.text(((block_w - code_w) // 2, qr_h + 60), code_text, fill="#D92525", font=font_code)
    
    return block

def integrate_into_official_banner(banner_path, qr_block, output_path):
    """
    Insere o bloco de QR Code no banner oficial enviado.
    """
    banner = Image.open(banner_path).convert('RGB')
    
    # Redimensionar o bloco se necessário (mantendo proporção)
    # Vamos assumir que o banner tem ~1920px de largura
    target_h = int(banner.height * 0.4) # Ocupa 40% da altura do banner
    aspect_ratio = qr_block.width / qr_block.height
    target_w = int(target_h * aspect_ratio)
    
    qr_block_resized = qr_block.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Posição: Lateral direita, centralizado verticalmente ou em um ponto estratégico
    # No banner enviado, o lado direito tem espaço sobre a imagem das pessoas
    # Vamos colocar no canto superior direito com margem
    margin = 50
    position = (banner.width - target_w - margin, margin + 50)
    
    # Opcional: Adicionar uma borda ou sombra suave ao bloco para destacar do fundo
    # Aqui apenas colamos o bloco branco
    banner.paste(qr_block_resized, position)
    
    banner.save(output_path, quality=95)
    print(f"✅ Banner oficial processado: {output_path}")

if __name__ == "__main__":
    import sys
    # Parâmetros: <workspace> <event_code> <banner_input> <output>
    workspace = "WORKAMANIA"
    code = "RMF97G3"
    input_banner = "/home/ubuntu/upload/74531824-83aa-4b91-80ac-dcaee21fb560.jpg"
    output_banner = "/home/ubuntu/canguess_banner_final.jpg"
    
    if not os.path.exists(input_banner):
        print(f"❌ Erro: Banner de entrada não encontrado em {input_banner}")
        sys.exit(1)

    # 1. Gerar bloco de QR Code
    qr_block = generate_custom_qr_block(workspace, code)
    
    # 2. Integrar no banner oficial
    integrate_into_official_banner(input_banner, qr_block, output_banner)
