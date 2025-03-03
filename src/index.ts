import { WebSocketServer, WebSocket } from "ws";
import {
  getRoomInfo,
  handleCreate,
  handleJoin,
  leaveRoom,
} from "./handlers/handlers";

const wss = new WebSocketServer({ port: 8080 });

export interface MessagePayload {
  action: "create" | "join" | "send-message" | "get_roomInfo" | "leave";
  roomId: string;
  message?: string;
  username?: string;
}

export interface User {
  ws: WebSocket;
  username?: string;
  isHost?: boolean;
}

export interface Room {
  roomId: string;
  users: User[];
}

const rooms: Room[] = [];

wss.on("connection", (ws, req) => {
  console.log("new user connected");

  if (!req.url) {
    ws.close();
  }

  ws.on("message", (data) => {
    const parsedData: MessagePayload = JSON.parse(data.toString());
    console.log(parsedData);

    switch (parsedData.action) {
      case "create":
        handleCreate(rooms, parsedData, ws);
        break;
      case "join":
        handleJoin(rooms, parsedData, ws);
        break;
      case "get_roomInfo":
        getRoomInfo(rooms, parsedData, ws);
        break;
      case "leave":
        leaveRoom(rooms, parsedData, ws);
        break;
      default:
        break;
    }
  });
});
