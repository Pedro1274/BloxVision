const userService = require("../services/userService");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const response = await userService.registerUser(username, email, password);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await userService.loginUser(email, password);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor." });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsersExcept(req.user.userId);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
};

// In userController.js
exports.searchUsers = async (req, res) => {
  try {
    const { q: searchQuery = '', page = 1, limit = 10 } = req.query;
    
    const result = await userService.searchUsers({
      userId: req.user.userId,
      searchQuery,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages
      }
    });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const response = await userService.updateUser(req.user.userId, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
};