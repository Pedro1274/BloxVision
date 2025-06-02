const Comment = require("../models/Comment");

class CommentService {
  static async createComment({ text, videoId, userId, parentId = null }) {
    const comment = new Comment({ text, videoId, userId, parentId });
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username");

    return populatedComment;
  }

    static async getCommentsByVideo(videoId) {
        const comments = await Comment.find({ videoId })
        .populate("userId", "username profilePicture")
        .sort({ createdAt: 1 });

        const commentMap = {};
        const rootComments = [];

        // First pass: create map and initialize replies array
        comments.forEach(comment => {
        const commentObj = comment.toObject();
        commentObj.replies = [];
        commentMap[commentObj._id.toString()] = commentObj;
        });

        // Second pass: build hierarchy
        comments.forEach(comment => {
        const commentObj = commentMap[comment._id.toString()];
        if (comment.parentId) {
            const parentIdStr = comment.parentId.toString();
            if (commentMap[parentIdStr]) {
            commentMap[parentIdStr].replies.push(commentObj);
            }
        } else {
            rootComments.push(commentObj);
        }
        });

        return rootComments;
    }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comentário não encontrado");
    if (comment.userId.toString() !== userId.toString()) throw new Error("Permissão negada");

    await Comment.deleteMany({ parentId: commentId });
    await Comment.findByIdAndDelete(commentId);

    return true;
  }
}

module.exports = CommentService;