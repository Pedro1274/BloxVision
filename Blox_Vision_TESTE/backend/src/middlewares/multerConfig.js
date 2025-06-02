const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

// Configuração do Multer para usar o Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",
    public_id: (req, file) => `${file.originalname.split(".")[0]}-${Date.now()}`,
  },
});

const upload = multer({ storage });

module.exports = upload;
