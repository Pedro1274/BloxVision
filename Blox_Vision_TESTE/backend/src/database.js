const mongoose = require("mongoose");

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.error("Erro ao conectar MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;