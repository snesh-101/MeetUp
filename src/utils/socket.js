const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    path: "/api/socket.io", // ✅ This must match frontend config
    cors: {
      origin: [
        "http://localhost:5173",
        "https://meetup-frontend-y5rn.onrender.com"
      ],
      credentials: true,
    },
  });
  

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Save messages to the database
        if (!userId || !targetUserId) {
            console.error("Invalid userId or targetUserId");
            return;  // Prevent further processing if IDs are invalid
          }
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);
          console.log("Sender ID:", userId); // Debugging log
    console.log("Target User ID:", targetUserId); // Debugging log

          // TODO: Check if userId & targetUserId are friends

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;