const Message = require("../models/Message");

function initSocket(io) {
  const users = {};

  io.on("connection", (socket) => {
    console.log("Novo usuário conectado:", socket.id);

    socket.on("register", (userId) => {
      users[userId] = socket.id;
    });

    socket.on("private_message", async ({ from, to, message }) => {
      const targetSocket = users[to];

      try {
        await Message.create({ sender: from, receiver: to, content: message });

        if (targetSocket) {
          io.to(targetSocket).emit("private_message", { from, message });
        }
      } catch (err) {
        console.error("Erro ao salvar mensagem:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id);
      for (const [uid, sid] of Object.entries(users)) {
        if (sid === socket.id) {
          delete users[uid];
          break;
        }
      }
    });
  });
}

module.exports = initSocket;