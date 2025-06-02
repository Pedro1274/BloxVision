const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);