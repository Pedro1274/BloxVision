const express = require("express");
const upload = require("../middlewares/multerConfig");
const {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosByUser,
  getVideosByType,
  getAllVideosSimple,
  getAllVideosSearch,
} = require("../controllers/videoController");

const router = express.Router();

// Rota para upload de vídeos
router.post("/upload", upload.single("video"), uploadVideo);

// Rota para buscar todos os vídeos
router.get("/", getAllVideos);

// Rota para buscar todos os vídeos no sistema de busca
router.get("/search", getAllVideosSearch);

// ✅ Coloque esta rota ANTES da rota com ":id"
router.get("/user/:userId", getVideosByUser);

router.get("/type/:type", getVideosByType);

// Rota para buscar um vídeo pelo ID
router.get("/:id", getVideoById);

module.exports = router;