const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticate = require("../middlewares/authMiddleware"); // middleware para proteger as rotas

// Criar comentário
router.post("/", authenticate, commentController.createComment);

// Pegar comentários do vídeo
router.get("/:videoId", commentController.getCommentsByVideo);

// Deletar comentário (só o dono)
router.delete("/:commentId", authenticate, commentController.deleteComment);

module.exports = router;