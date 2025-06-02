const express = require("express");
const {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendsAndRequests,
  getUserFriends,
} = require("../controllers/friendController");
const {
    getAllUsers,
    searchUsers
} = require("../controllers/userController");

const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Rotas amigos
router.get("/all", auth, getAllUsers);
router.get("/search", auth, searchUsers);
router.post("/friends/request/:receiverId", auth, sendFriendRequest);
router.patch("/friends/accept/:senderId", auth, acceptFriendRequest);
router.delete("/friends/remove/:friendId", auth, removeFriend);
router.get("/friend", auth, getFriendsAndRequests);
router.get("/user/:userId/friends", auth, getUserFriends);

module.exports = router;