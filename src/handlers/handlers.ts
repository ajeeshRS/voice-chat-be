import { WebSocket } from "ws";
import { MessagePayload, Room } from "..";

export const handleCreate = (
  rooms: Room[],
  parsedData: MessagePayload,
  ws: WebSocket
) => {
  if (rooms.find((r) => r.roomId === parsedData.roomId)) {
    ws.send(JSON.stringify({ error: "Room already exists" }));
  } else {
    rooms.push({
      roomId: parsedData.roomId,
      users: [{ ws, username: parsedData?.username as string, isHost: true }],
    });

    console.log("users after creating", rooms[0].users);
    ws.send(
      JSON.stringify({
        type: "created",
        roomId: parsedData.roomId,
      })
    );

    console.log(`Room ${parsedData.roomId} created.`);
  }
};

export const handleJoin = (
  rooms: Room[],
  parsedData: MessagePayload,
  ws: WebSocket
) => {
  if (!rooms.find((r) => r.roomId === parsedData.roomId)) {
    ws.send(JSON.stringify({ error: "Room doesn't exist" }));
  } else {
    const roomIndex = rooms.findIndex((r) => r.roomId === parsedData.roomId);

    console.log("roomindex :", roomIndex);

    if (rooms[roomIndex].users.find((u) => u.ws === ws)) {
      ws.send(JSON.stringify({ error: "user already joined" }));
      console.log("user already joined");
      return;
    }

    console.log("pushing user to room...");
    rooms[roomIndex].users.push({
      ws,
      username: parsedData.username,
      isHost: false,
    });

    console.log("room after pushing the user", rooms[roomIndex].users);

    ws.send(
      JSON.stringify({
        type: "joined",
        message: `Joined ${parsedData.roomId}`,
        roomId: parsedData.roomId,
      })
    );

    const otherUsers = rooms[roomIndex].users.filter((u) => u.ws !== ws);

    otherUsers.forEach((u) => {
      u.ws.send(
        JSON.stringify({
          success: `${ws} joined ${parsedData.roomId}`,
        })
      );
    });
  }
};

export const getRoomInfo = (
  rooms: Room[],
  parsedData: MessagePayload,
  ws: WebSocket
) => {
  if (!rooms.find((r) => r.roomId === parsedData.roomId)) {
    ws.send(JSON.stringify({ error: "Room doesn't exist" }));
  } else {
    console.log(parsedData);
    const roomIndex = rooms.findIndex((r) => r.roomId === parsedData.roomId);
    console.log(roomIndex);
    const participants = rooms[roomIndex].users;

    console.log({ participants });
    ws.send(
      JSON.stringify({
        type: "room_details",
        participantCount: participants.length,
        users: participants,
      })
    );
  }
};

export const leaveRoom = (
  rooms: Room[],
  parsedData: MessagePayload,
  ws: WebSocket
) => {
  if (!rooms.find((r) => r.roomId === parsedData.roomId)) {
    ws.send(JSON.stringify({ error: "Room doesn't exist" }));
  }

  const roomIndex = rooms.findIndex((r) => r.roomId === parsedData.roomId);

  const updatedRoom = rooms[roomIndex].users.filter(
    (u) => u.username === parsedData.username
  );

  rooms[roomIndex].users = updatedRoom;
  ws.send(JSON.stringify({ type: "left" }));
};
