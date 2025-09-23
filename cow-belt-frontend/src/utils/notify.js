export async function ensurePermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    try { const res = await Notification.requestPermission(); return res === 'granted'; } catch { return false; }
  }
  return false;
}

export async function notify({ title, body, icon }) {
  try {
    const ok = await ensurePermission();
    if (!ok) return;
    new Notification(title || 'Alert', { body, icon });
  } catch {}
}




