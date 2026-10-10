import { streamChat } from "@/lib/api";
export function ChatInterface() {
  return <button onClick={() => streamChat()}>Send message</button>;
}
