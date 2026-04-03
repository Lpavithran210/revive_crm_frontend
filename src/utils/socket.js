import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8080", {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});