const Video = require("../models/Video");

async function toggleLike(videoId, userId) {
  const video = await Video.findById(videoId);
  if (!video) throw new Error("Vídeo não encontrado");

  const index = video.likes.indexOf(userId);
  if (index === -1) {
    video.likes.push(userId); // Like
  } else {
    video.likes.splice(index, 1); // Remover Like
  }

  await video.save();
  return {
    liked: index === -1,
    totalLikes: video.likes.length,
  };
}

async function toggleFavorite(videoId, userId) {
  const video = await Video.findById(videoId);
  if (!video) throw new Error("Vídeo não encontrado");

  const index = video.favorites.indexOf(userId);
  if (index === -1) {
    video.favorites.push(userId); // Favoritar
  } else {
    video.favorites.splice(index, 1); // Desfavoritar
  }

  await video.save();
  return {
    favorited: index === -1,
  };
}

async function getReactionStatus(videoId, userId) {
    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error('Video not found');
        }

        const isLiked = video.likes.includes(userId);
        const isFavorited = video.favorites.includes(userId);
        
        return {
            isLiked,
            isFavorited,
            totalLikes: video.likes.length
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
  toggleLike,
  toggleFavorite,
  getReactionStatus
};