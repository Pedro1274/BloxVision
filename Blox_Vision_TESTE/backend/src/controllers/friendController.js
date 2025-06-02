const FriendService = require("../services/friendService");

exports.sendFriendRequest = async (req, res) => {
  try {
    const message = await FriendService.sendFriendRequest(req.user.userId, req.params.receiverId);
    res.status(200).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const message = await FriendService.acceptFriendRequest(req.user.userId, req.params.senderId);
    res.status(200).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const message = await FriendService.removeFriend(req.user.userId, req.params.friendId);
    res.status(200).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getFriendsAndRequests = async (req, res) => {
  try {
    const data = await FriendService.getFriendsAndRequests(req.user.userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserFriends = async (req, res) => {
  try {
    const data = await FriendService.getFriendsAndRequests(req.params.userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};