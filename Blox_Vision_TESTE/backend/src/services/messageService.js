const Message = require("../models/Message");

class MessageService {
  static async getMessagesBetweenUsers(userId, friendId) {
    return await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    })
    .sort("timestamp")
    .populate("sender", "username")
    .populate("receiver", "username");
  }

  static async sendMessage(senderId, receiverId, content) {
    if (!content || content.trim() === "") {
      throw new Error("Mensagem vazia não permitida.");
    }

    return await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: new Date(),
    });
  }
}

module.exports = MessageService;