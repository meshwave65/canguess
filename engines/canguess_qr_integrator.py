import qrcode
import os
from PIL import Image, ImageDraw, ImageFont

def generate_event_qr(event_code, output_path):
    """Gera um QR Code para o link do evento Canguess."""
    event_url = f"https://Canguess.com/?code={event_code}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(event_url)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="#0B3C49", back_color="white").convert('RGB')
    qr_img.save(output_path)
    return qr_img

def add_qr_to_banner(banner_path, qr_img, output_path):
    """Insere o QR Code gerado no banner do evento."""
    banner = Image.open(banner_path).convert('RGB')
    
    # Redimensionar QR Code para caber no banner (ex: 200x200)
    qr_size = 200
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    
    # Posição: Canto inferior direito com margem de 20px
    position = (banner.width - qr_size - 20, banner.height - qr_size - 20)
    
    banner.paste(qr_img, position)
    banner.save(output_path)
    print(f"✅ Banner com QR Code salvo em: {output_path}")

def generate_whatsapp_payload(phone, event_code):
    """Gera a mensagem e o link para o WhatsApp (Simulação do whatsapp.js)."""
    message = f"Olá! Participe do nosso bolão no CanGuess! Link do evento: https://Canguess.com/?code={event_code}"
    # No ambiente real, isso seria passado para o whatsapp.js
    print(f"📱 WhatsApp Payload para {phone}: {message}")
    return message

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Uso: python canguess_qr_integrator.py CODIGO TELEFONE")
        sys.exit(1)
        
    code = sys.argv[1]
    phone = sys.argv[2]
    
    # 1. Gerar QR Code
    qr_temp_path = f"qr_{code}.png"
    qr_img = generate_event_qr(code, qr_temp_path)
    
    # 2. Simular integração com banner (usando o placeholder se o real não existir)
    # No ambiente real, o banner real seria usado.
    dummy_banner_path = f"banner_temp_{code}.png"
    # Criar um banner temporário para teste se não existir
    img = Image.new("RGB", (1200, 300), color=(11, 60, 73))
    img.save(dummy_banner_path)
    
    final_banner_path = f"final_banner_{code}.png"
    add_qr_to_banner(dummy_banner_path, qr_img, final_banner_path)
    
    # 3. Gerar mensagem de WhatsApp
    generate_whatsapp_payload(phone, code)
    
    print(f"🚀 Processo concluído para o evento {code}")
