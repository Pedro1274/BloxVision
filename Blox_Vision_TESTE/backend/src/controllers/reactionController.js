const reactionService = require("../services/reactionService");
const Video = require("../models/Video");

async function likeVideo(req, res) {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.userId;

    const result = await reactionService.toggleLike(videoId, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function favoriteVideo(req, res) {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.userId;

    const result = await reactionService.toggleFavorite(videoId, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Retornar vídeos curtidos
async function getLikedVideos(req, res) {
  try {
    const videos = await Video.find({ likes: req.user.userId });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar vídeos curtidos" });
  }
}

// Retornar vídeos favoritados
async function getFavoritedVideos(req, res) {
  try {
    const videos = await Video.find({ favorites: req.user.userId });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar vídeos favoritados" });
  }
}

async function getReactionStatus (req, res) {
    try {
        const { videoId } = req.params;
        const userId = req.user.userId;
        
        const status = await reactionService.getReactionStatus(videoId, userId);
        
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  likeVideo,
  favoriteVideo,
  getLikedVideos,
  getFavoritedVideos,
  getReactionStatus
};