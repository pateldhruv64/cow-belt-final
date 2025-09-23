export function connectLive({ url, onMessage, onOpen, onClose }) {
  let ws;
  try {
    ws = new WebSocket(url);
  } catch (e) {
    return { close: () => {} };
  }
  ws.onopen = () => {
    onOpen && onOpen();
  };
  ws.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      onMessage && onMessage(payload);
    } catch (_) {}
  };
ws.onclose = () => {
    onClose && onClose();
  };
  ws.onerror = () => {
    // ignore; fallback is polling
  };
  return {
  close: () => {
    // Check karein ki WebSocket object hai aur connection ban chuka hai
    if (ws && ws.readyState === WebSocket.OPEN) { // Only close if the connection is open
      ws.close();
    }
  }
};
}




