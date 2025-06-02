const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/:videoId/status', authMiddleware, reactionController.getReactionStatus);

router.post("/:id/like", authMiddleware, reactionController.likeVideo);
router.post("/:id/favorite", authMiddleware, reactionController.favoriteVideo);

router.get("/liked", authMiddleware, reactionController.getLikedVideos);
router.get("/favorited", authMiddleware, reactionController.getFavoritedVideos);

module.exports = router;