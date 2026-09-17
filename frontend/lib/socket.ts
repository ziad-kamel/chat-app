import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000", {
      auth: { token },
      autoConnect: false,
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
