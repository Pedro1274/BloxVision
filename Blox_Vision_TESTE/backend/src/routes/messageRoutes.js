const express = require("express");
const router = express.Router();
const { getMessagesWithUser, sendMessage } = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware"); // middleware de autenticação

router.get("/:friendId", auth, getMessagesWithUser);
router.post("/:friendId", auth, sendMessage);

module.exports = router;