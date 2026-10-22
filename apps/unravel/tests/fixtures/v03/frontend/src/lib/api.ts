export async function streamChat() {
  return fetch("/chat/stream", { method: "POST" });
}
