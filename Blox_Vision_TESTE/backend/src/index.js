require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./database");
const initSocket = require("./sockets/socket");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initSocket(io);

const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});