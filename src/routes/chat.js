const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

// Get or create a chat between logged-in user and target user
chatRouter.get("/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    // Look for an existing chat with both participants
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    // If chat doesn't exist, create one
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error in fetching/creating chat:", err.message);
    res.status(500).json({ error: "Failed to load or create chat" });
  }
});

module.exports = chatRouter;
