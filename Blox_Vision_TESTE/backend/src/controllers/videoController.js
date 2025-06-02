const VideoService = require("../services/videoService");

exports.uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum vídeo enviado." });
  }
  
  console.log("Arquivo enviado:", req.file); 
  console.log("Public ID para buscar duração:", req.file.filename); // <<< aqui

  const { title, description, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Título, descrição e ID do usuário são obrigatórios." });
  }

  try {
    const newVideo = await VideoService.uploadVideo(req.file, { title, description, userId });

    res.status(201).json({
      message: "Vídeo enviado com sucesso.",
      video: newVideo,
      public_id: newVideo.publicId,
    });
  } catch (err) {
    console.error("Erro ao enviar vídeo:", err);
    res.status(500).json({ message: err.message || "Erro ao enviar vídeo." });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await VideoService.getAllVideos();
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar vídeos." });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await VideoService.getVideoById(req.params.id);
    if (!video) return res.status(404).json({ message: "Vídeo não encontrado." });
    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar vídeo." });
  }
};

exports.getVideosByUser = async (req, res) => {
  try {
    const videos = await VideoService.getVideosByUser(req.params.userId);
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar vídeos do usuário." });
  }
};

exports.getVideosByType = async (req, res) => {
  try {
    const videos = await VideoService.getVideosByType(req.params.type);
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar vídeos por tipo." });
  }
};

exports.getAllVideosSearch = async (req, res) => {
  try {
    const { q: searchQuery = '', type, page = 1, limit = 10 } = req.query;
    
    const result = await VideoService.getAllVideosSearch({
      searchQuery,
      typeFilter: type,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      videos: result.videos,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages
      }
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: "Erro ao buscar vídeos." });
  }
};

exports.getAllVideosSimple = (req, res) => {
  const mockVideos = [
    {
      id: "1",
      title: "Vídeo de Exemplo 1",
      url: "https://example.com/video1.mp4",
      userId: "user123",
      type: "tutorial",
    },
    {
      id: "2",
      title: "Vídeo de Exemplo 2",
      url: "https://example.com/video2.mp4",
      userId: "user456",
      type: "entretenimento",
    },
  ];

  return res.status(200).json({
    message: "Dados mockados de vídeos",
    videos: mockVideos,
  });
};