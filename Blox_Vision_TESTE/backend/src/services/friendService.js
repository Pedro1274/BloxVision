// friendService.js
const User = require("../models/User");

class FriendService {
  async sendFriendRequest(senderId, receiverId) {
    if (senderId === receiverId) throw new Error("Você não pode se adicionar.");

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) throw new Error("Usuário não encontrado.");

    if (receiver.friendRequests.includes(senderId) || receiver.friends.includes(senderId)) {
      throw new Error("Pedido já enviado ou já são amigos.");
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();
    return "Pedido de amizade enviado.";
  }

  async acceptFriendRequest(userId, senderId) {
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) throw new Error("Usuário não encontrado.");

    if (!user.friendRequests.includes(senderId)) {
      throw new Error("Nenhum pedido pendente deste usuário.");
    }

    user.friends.push(senderId);
    sender.friends.push(userId);
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);

    await user.save();
    await sender.save();
    return "Pedido aceito com sucesso.";
  }

  async removeFriend(userId, friendId) {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) throw new Error("Usuário não encontrado.");

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await user.save();
    await friend.save();
    return "Amizade removida com sucesso.";
  }

  async getFriendsAndRequests(userId) {
    const user = await User.findById(userId)
      .populate("friends", "username email")
      .populate("friendRequests", "username email");

    if (!user) throw new Error("Usuário não encontrado.");

    return {
      friends: user.friends,
      friendRequests: user.friendRequests,
    };
  }
}

module.exports = new FriendService();