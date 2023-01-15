import { MessagePayload } from "./types";

export const sendMessage = (
  ws: WebSocket | null,
  type: string,
  message: string
) => {
  if (ws) {
    const payload: MessagePayload = {
      message: message,
      type: type,
    };
    ws.send(JSON.stringify(payload));
  }
};
