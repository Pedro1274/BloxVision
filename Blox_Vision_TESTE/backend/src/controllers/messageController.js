const MessageService = require("../services/messageService");

exports.getMessagesWithUser = async (req, res) => {
  try {
    const messages = await MessageService.getMessagesBetweenUsers(req.user.userId, req.params.friendId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message || "Erro ao buscar mensagens." });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const newMessage = await MessageService.sendMessage(req.user.userId, req.params.friendId, req.body.content);
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message || "Erro ao enviar mensagem." });
  }
};