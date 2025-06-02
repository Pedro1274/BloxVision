const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "default.png" },
  bio: { type: String },
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  favoritedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: Date,
});

module.exports = mongoose.model("User", UserSchema);