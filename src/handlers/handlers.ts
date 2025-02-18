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

    if (rooms[roomIndex].users.find((u) => u.ws === ws)) {
      ws.send(JSON.stringify({ error: "user already joined" }));
      return;
    }
    rooms[roomIndex].users.push({
      ws,
      username: parsedData.username,
      isHost: false,
    });

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

// export const handleSendMessage = (
//   rooms: Room[],
//   parsedData: MessagePayload,
//   ws: WebSocket
// ) => {
//   if (!rooms.find((r) => r.roomId === parsedData.roomId)) {
//     ws.send(JSON.stringify({ error: "Room doesn't exist" }));
//   } else {
//     const roomIndex = rooms.findIndex((r) => r.roomId === parsedData.roomId);

//     if (!rooms[roomIndex].users.includes({ ws, username: "" })) {
//       ws.send("you need to join the room in order to send a message");
//       return;
//     }

//     const otherUsers = rooms[roomIndex].users.filter((u) => u.ws !== ws);
//     otherUsers.forEach((u) => {
//       u.ws.send(
//         JSON.stringify({
//           message: `${parsedData.message}`,
//         })
//       );
//     });

//     ws.send(
//       JSON.stringify({
//         success: `message sent to ${parsedData.roomId}`,
//       })
//     );
//   }
// };

export const getRoomInfo = (
  rooms: Room[],
  parsedData: MessagePayload,
  ws: WebSocket
) => {
  if (!rooms.find((r) => r.roomId === parsedData.roomId)) {
    ws.send(JSON.stringify({ error: "Room doesn't exist" }));
  } else {
    const roomIndex = rooms.findIndex((r) => r.roomId === parsedData.roomId);
    const participants = rooms[roomIndex].users;

    console.log(participants);
    ws.send(
      JSON.stringify({
        type: "room_details",
        participantCount: participants.length,
        users: participants,
      })
    );
  }
};
