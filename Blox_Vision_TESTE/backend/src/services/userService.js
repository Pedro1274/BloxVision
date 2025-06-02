const User = require("../models/User");
const { hashPassword, comparePasswords } = require("../utils/passwordUtil");
const { generateToken } = require("../utils/jwtUtil");

exports.registerUser = async (username, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 400, data: { message: "Email já cadastrado." } };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  return { status: 201, data: { message: "Usuário registrado com sucesso." } };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { status: 404, data: { message: "Usuário não encontrado." } };
  }

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    return { status: 400, data: { message: "Senha incorreta." } };
  }

  const token = generateToken({ userId: user._id });

  return {
    status: 200,
    data: {
      message: "Login bem-sucedido.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  };
};

exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

exports.getAllUsersExcept = async (userId) => {
  return await User.find({ _id: { $ne: userId } }).select("username email");
};

exports.updateUser = async (userId, updateData) => {
  // Remove password from updateData if present (password updates should be handled separately)
  if (updateData.password) {
    delete updateData.password;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return { status: 404, data: { message: "Usuário não encontrado." } };
  }

  return { status: 200, data: updatedUser };
};

exports.searchUsers = async ({ userId, searchQuery = '', page = 1, limit = 10 }) => {
  const query = {
    _id: { $ne: userId },
    username: { $regex: searchQuery, $options: 'i' }
  };

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("username email profilePicture")
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};