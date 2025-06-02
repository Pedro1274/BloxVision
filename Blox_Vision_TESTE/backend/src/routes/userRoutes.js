// In userRoutes.js
const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  getUserById,
  updateUser,
  getAllUsers,
  searchUsers
} = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Registro e login
router.post("/register", register);
router.post("/login", login);

// Obter dados do usuário logado
router.get("/me", auth, getCurrentUser);

// Atualizar usuário
router.patch("/me", auth, updateUser); // Add this line

// Obter usuário
router.get("/:userId", auth, getUserById);

// Obter todos os usuários (exceto o logado)
router.get("/", auth, getAllUsers);

// Buscar usuários
router.get("/search/users", auth, searchUsers);

module.exports = router;