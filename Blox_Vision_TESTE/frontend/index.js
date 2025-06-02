const API_BASE = "http://localhost:3000/api/users";
const apiBaseUrl = "http://localhost:3000/api/videos/";
let userId = "";

// DOM Elements - Consistent with HTML
const headerProfilePicture = document.getElementById("headerProfilePicture");
const headerUsername = document.getElementById("headerUsername");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get stored user data first
    const user = ProfileCommon.getStoredUser();
    if (user.profilePicture) {
      headerProfilePicture.src = ProfileCommon.resolveAvatar(user.profilePicture);
    }
    if (user.username) {
      headerUsername.textContent = user.username;
    }
    
    // Then load fresh data from API
    await loadUserData();
    
    // Then proceed with other operations
    await fetchVideos();
    await loadFriendsForIndex();
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
  }
});

async function loadFriendsForIndex() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("Not logged in");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/friends/friend`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error("Failed to fetch friends");
        }
        
        const data = await res.json();
        const amigos = data.friends || [];
        
        // Update friends count
        document.getElementById('friendsCount').textContent = amigos.length;
        
        // Clear existing friends (except the "add friend" button)
        const carousel = document.getElementById('friendsCarousel');
        while (carousel.children.length > 1) {
            carousel.removeChild(carousel.lastChild);
        }
        
        // Add friends to carousel
        amigos.forEach(amigo => {
          const friendElement = document.createElement('div');
          friendElement.className = 'friend';
          friendElement.innerHTML = `
              <img src="${amigo.avatar ? ProfileCommon.resolveAvatar(amigo.avatar) : ProfileCommon.DEFAULT_AVATAR}" 
                  alt="${amigo.username}" />
              <strong>
                  <p>${amigo.username}</p>
              </strong>
          `;
            friendElement.addEventListener('click', () => {
                window.location.href = `./user_profile/user_profile.html?id=${amigo._id}`;
            });
            carousel.appendChild(friendElement);
        });
        
    } catch (error) {
        console.error("Error loading friends:", error);
    }
}

async function loadUserData() {
    // Try to get from localStorage first
    const savedUsername = localStorage.getItem("username");
    const savedProfilePic = localStorage.getItem("profilePicture");
    
    if (savedUsername) headerUsername.textContent = savedUsername;
    if (savedProfilePic) {
        headerProfilePicture.src = ProfileCommon.resolveAvatar(savedProfilePic);
        headerProfilePicture.onerror = function() {
            this.src = ProfileCommon.DEFAULT_AVATAR;
        };
    }
    
    // Then fetch fresh data from API
    const user = await fetchUserId();
    if (user) {
        ProfileCommon.storeUser(user);
    }
}

async function fetchUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, user not logged in");
      return;
    }

    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await res.json();
    userId = user._id || user.userId;  // Handle both _id and userId cases

    // Update UI with fresh user data
    if (user.username) {
      headerUsername.textContent = user.username;
      localStorage.setItem("username", user.username);
    }
    if (user.profilePicture) {
        headerProfilePicture.src = ProfileCommon.resolveAvatar(user.profilePicture);
        localStorage.setItem("profilePicture", user.profilePicture);
    }
    return user;
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    // Fallback to default values if API fails
    headerUsername.textContent = localStorage.getItem("username") || "Usuário";
    return null;
  }
}

async function fetchVideos() {
  const res = await fetch(apiBaseUrl);
  const videos = await res.json();
  renderVideos(videos);
}

function renderVideos(videos) {
  const topLongContainer = document.getElementById("longVideosTop");
  const shortContainer = document.getElementById("shortVideosRow");
  const restLongContainer = document.getElementById("longVideosRest");

  topLongContainer.innerHTML = "";
  shortContainer.innerHTML = "";
  restLongContainer.innerHTML = "";

  const longs = videos.filter((v) => v.type === "long");
  const shorts = videos.filter((v) => v.type === "short");

  const topLongs = longs.slice(0, 3);
  const restLongs = longs.slice(3);
  const topShorts = shorts.slice(0, 4);

  topLongs.forEach((v) => topLongContainer.appendChild(createVideoCard(v)));
  topShorts.forEach((v) => shortContainer.appendChild(createVideoCard(v)));
  restLongs.forEach((v) => restLongContainer.appendChild(createVideoCard(v)));
}

function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  card.innerHTML = `
        <a href="${
          video.type === "short"
            ? "./video_page/short/short.html"
            : "./video_page/long/video.html"
        }?id=${video._id}" class="video-hover-container">
          <img class="thumbnail" src="${
            video.thumbnailUrl || "default-thumbnail.jpg"
          }" alt="Thumbnail">
          <video class="video" muted loop style="display: none;">
            <source src="${video.videoUrl}" type="video/mp4">
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        </a>
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      `;

  const hoverContainer = card.querySelector(".video-hover-container");
  const videoElement = hoverContainer.querySelector("video");
  const thumbnail = hoverContainer.querySelector(".thumbnail");

  hoverContainer.addEventListener("mouseenter", () => {
    thumbnail.style.display = "none";
    videoElement.style.display = "block";
    videoElement.play();
  });

  hoverContainer.addEventListener("mouseleave", () => {
    videoElement.pause();
    videoElement.style.display = "none";
    thumbnail.style.display = "block";
  });

  return card;
}

function setupEventListeners() {
  // Profile dropdown functionality
  profileDropdown.addEventListener("click", function (e) {
    if (e.target.tagName === "A") return;
    document.querySelector(".dropdown-content").classList.toggle("show");
  });

  // Close dropdown when clicking outside
  window.addEventListener("click", function (event) {
    if (
      !event.target.matches(".profile") &&
      !event.target.closest(".profile")
    ) {
      const dropdowns = document.getElementsByClassName("dropdown-content");
      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show");
        }
      }
    }
  });

  // Logout functionality
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("profilePic");

      // Redirect to login page
      alert("Logout realizado com sucesso.");
      window.location.href = "./authentication/login/login.html";
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, clear local storage and redirect
      localStorage.clear();
      window.location.href = "./authentication/login/login.html";
    }
  });
}