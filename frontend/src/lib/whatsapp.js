export function sendWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, "_blank");
}
