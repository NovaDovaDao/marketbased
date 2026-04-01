import type { Server, Socket } from "socket.io";

export interface SocketData {
  userId: string;
}

// Narrowed socket type with our data shape
export type ServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export type ServerInstance = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export interface ServerToClientEvents {
  message: (msg: ChatMessage) => void;
  typing: (payload: { userId: string; isTyping: boolean }) => void;
  "read-receipt": (payload: { userId: string; lastMessageId: string; readAt: string }) => void;
  presence: (payload: { userId: string; online: boolean }) => void;
  "message-deleted": (payload: { messageId: string }) => void;
  "room-closed": (payload: { tradeRoomId: string; reason: string }) => void;
  "new-trade-room": (payload: { tradeRoomId: string; listingName: string; buyerUsername: string }) => void;
  error: (payload: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  "join-room": (payload: { tradeRoomId: string }) => void;
  "send-message": (payload: { tradeRoomId: string; content: string }) => void;
  "typing-start": (payload: { tradeRoomId: string }) => void;
  "typing-stop": (payload: { tradeRoomId: string }) => void;
  "mark-read": (payload: { tradeRoomId: string; lastMessageId: string }) => void;
  ping: () => void;
}

export interface ChatMessage {
  id: string;
  tradeRoomId: string;
  senderId: string;
  content: string;
  type: "text" | "system";
  createdAt: string;
}
