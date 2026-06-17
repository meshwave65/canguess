export function sendWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message);

  // força app mobile/desktop
  const url = `whatsapp://send?phone=${phone}&text=${encoded}`;

  window.location.href = url;
}
