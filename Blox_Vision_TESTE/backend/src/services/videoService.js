const Video = require("../models/Video");
const cloudinary = require("../cloudinary");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfprobePath("C:/Users/pedro/Downloads/ffmpeg-7.1.1-essentials_build/ffmpeg-7.1.1-essentials_build/bin/ffprobe.exe");
const fs = require("fs");

class VideoService {
  static async getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration);
      });
    });
  }

  static async uploadVideo(file, { title, description, userId }) {
    const publicId = file.filename || file.public_id;

    // Verifica se o vídeo foi salvo localmente (caso contrário, file.path é undefined)
    const videoPath = file.path || file.url; // path local ou url pública

    // 1. Pega a duração
    let duration = 0;
    try {
      duration = await this.getVideoDuration(videoPath);
    } catch (error) {
      console.error("Erro ao obter duração do vídeo:", error);
    }

    let uploadedVideo;
    if (!file.url) {
      // 2.1 Se vídeo ainda não foi enviado, envia agora para Cloudinary
      try {
        uploadedVideo = await cloudinary.uploader.upload(videoPath, {
          resource_type: "video",
          public_id: publicId,
          folder: "videos",
        });
      } catch (error) {
        console.error("Erro ao fazer upload para Cloudinary:", error);
        throw new Error("Falha no upload do vídeo.");
      }

      // 3. Deleta o arquivo local (só se existir)
      if (fs.existsSync(videoPath)) {
        fs.unlink(videoPath, (err) => {
          if (err) console.warn("Erro ao deletar arquivo local:", err.message);
        });
      }
    } else {
      // 2.2 Se já está no Cloudinary (multer-storage-cloudinary), usa direto
      uploadedVideo = {
        secure_url: file.url,
        public_id: publicId,
      };
    }

    // 4. Gera a thumbnail
    const thumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
      resource_type: "video",
      format: "jpg",
      width: 200,
      height: 200,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    });

    // 5. Define tipo
    const type = duration > 60 ? "long" : "short";

    // 6. Salva no banco
    const newVideo = new Video({
      title,
      description,
      videoUrl: uploadedVideo.secure_url,
      thumbnailUrl,
      userId,
      type,
      duration,
      publicId: uploadedVideo.public_id,
    });

    await newVideo.save();
    return newVideo;
  }

  static async getAllVideos() {
    return await Video.find()
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
  }

  static async getAllVideosSearch({ searchQuery = '', typeFilter = null, sortBy = 'recent', page = 1, limit = 10 }) {
    const query = {};
    
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (typeFilter) {
      query.type = typeFilter;
    }

    const skip = (page - 1) * limit;
    
    let sortOption = { createdAt: -1 }; // default: recent first
    if (sortBy === 'views') {
      sortOption = { views: -1 };
    }

    const videos = await Video.find(query)
      .populate("userId", "username profilePicture")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

    return {
      videos,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    };
  }

  static async getVideoById(id) {
    return await Video.findById(id).populate("userId", "username profilePicture");
  }

  static async getVideosByType(type) {
    return await Video.find({ type })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
  }

  static async getVideosByUser(userId) {
    return await Video.find({ userId });
  }
}

module.exports = VideoService;