const CommentService = require("../services/commentService");

exports.createComment = async (req, res) => {
  try {
    const { text, videoId, parentId } = req.body;
    const userId = req.user.userId;

    const comment = await CommentService.createComment({ text, videoId, userId, parentId });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCommentsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await CommentService.getCommentsByVideo(videoId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    await CommentService.deleteComment(commentId, userId);
    res.json({ message: "Comentário deletado com sucesso" });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};