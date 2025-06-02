const ProfileCommon = {
    // Shared constants with consistent naming
    API_BASE_URL: "http://localhost:3000/api",
    get USERS_API() { return `${this.API_BASE_URL}/users`; },
    get FRIENDS_API() { return `${this.API_BASE_URL}/friends`; },
    get VIDEOS_API() { return `${this.API_BASE_URL}/videos`; },

    resolvePath: function(path) {
        if (!path) return "";
        
        // If already absolute path or URL, return as-is
        if (path.startsWith('/') || path.startsWith('http')) {
            return path;
        }

        // Calculate relative path based on current page depth
        const currentDepth = window.location.pathname.split('/').length - 2;
        const basePath = currentDepth > 0 ? '../'.repeat(currentDepth) : './';
        
        // Clean up path and combine
        const cleanPath = path.replace(/^(\.\.\/|\.\/)/, '');
        return `${basePath}${cleanPath}`.replace(/\/+/g, '/');
    },

        // Use ABSOLUTE paths from root
    AVATAR_BASE_PATH: "/frontend/icons/avatars/",

    // System avatars with full paths
    systemAvatars: [1, 2, 3, 4, 5, 6, 7, 8].map(num => 
        `/frontend/icons/avatars/avatar${num}.webp`
    ),

    DEFAULT_AVATAR: "/frontend/icons/avatars/avatar1.webp",

    // Simplified avatar resolver
    resolveAvatar: function(path) {
        if (!path) return this.DEFAULT_AVATAR;
        
        // If already a full path, use as-is
        if (path.startsWith('/') || path.startsWith('http')) {
            return path;
        }
        
        // If it's just a filename (avatar1.webp)
        if (path.includes('avatar') && !path.includes('/')) {
            return `${this.AVATAR_BASE_PATH}${path}`;
        }
        
        // For any other relative paths
        return `${this.AVATAR_BASE_PATH}${path.replace(/^.*[\\\/]/, '')}`;
    },

    // Utility functions
    formatDate: function(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    },

    createVideoCard: function(video) {
        if (!video) return document.createElement("div");
        
        const card = document.createElement("div");
        card.className = "video-card";

        card.innerHTML = `
            <a href="${video.type === 'short' ? '../video_page/short/short.html' : '../video_page/long/video.html'}?id=${video._id}" 
            class="video-hover-container"
            aria-label="${video.title || 'Video sem título'}">
                <img class="thumbnail" 
                    src="${video.thumbnailUrl || '/default-thumbnail.jpg'}" 
                    alt="${video.title || 'Thumbnail do vídeo'}"
                    loading="lazy">
                <video class="video" muted loop style="display: none;" aria-hidden="true">
                    <source src="${video.videoUrl}" type="video/mp4">
                    Seu navegador não suporta a reprodução deste vídeo.
                </video>
            </a>
            <h3>${video.title || 'Sem título'}</h3>
            <p>${video.description || ''}</p>
            <div class="video-stats">
                <span>${video.views || 0} visualizações</span>
                <span>•</span>
                <span>${this.formatDate(video.createdAt)}</span>
            </div>
        `;

        const hoverContainer = card.querySelector(".video-hover-container");
        const videoElement = hoverContainer.querySelector("video");
        const thumbnail = hoverContainer.querySelector(".thumbnail");

        hoverContainer.addEventListener("mouseenter", () => {
            thumbnail.style.display = "none";
            videoElement.style.display = "block";
            videoElement.play().catch(e => console.error("Video play error:", e));
        });

        hoverContainer.addEventListener("mouseleave", () => {
            videoElement.pause();
            videoElement.style.display = "none";
            thumbnail.style.display = "block";
        });

        return card;
    },

    renderVideos: function(videos, container) {
        if (!container) return;
        
        container.innerHTML = "";
        
        if (!videos || videos.length === 0) {
            container.innerHTML = '<p class="no-videos">Nenhum vídeo encontrado.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        videos.forEach(video => {
            const card = this.createVideoCard(video);
            if (card) fragment.appendChild(card);
        });
        container.appendChild(fragment);
    },

    // Common authentication check
    checkAuth: function() {
        if (!localStorage.getItem("token")) {
            window.location.href = "../authentication/login/login.html";
            return false;
        }
        return true;
    },

    // Common logout function
    setupLogout: function(logoutBtn) {
        if (!logoutBtn) return;
        
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "../authentication/login/login.html";
        });
    },

    loadHeaderProfile: async function() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            const res = await fetch(`${this.USERS_API}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch user data');
            
            const user = await res.json();
            
            // Only look for header elements
            const headerProfilePic = document.getElementById('headerProfilePicture');
            const headerUsername = document.getElementById('headerUsername');
            
            if (headerProfilePic) {
                const finalPath = user.profilePicture 
                    ? this.resolveAvatar(user.profilePicture)
                    : this.DEFAULT_AVATAR;
                
                headerProfilePic.src = finalPath;
                headerProfilePic.onerror = () => {
                    headerProfilePic.src = this.DEFAULT_AVATAR;
                };
            }
            
            if (headerUsername) {
                headerUsername.textContent = user.username || 'Usuário';
            }
            
            // Update localStorage
            if (user.username) localStorage.setItem('username', user.username);
            if (user.profilePicture) localStorage.setItem('profilePicture', user.profilePicture);
            
            return user;
        } catch (err) {
            console.error('Error loading header profile:', err);
            // Fallback handling
            const headerProfilePic = document.getElementById('headerProfilePicture');
            const headerUsername = document.getElementById('headerUsername');
            
            if (headerProfilePic) {
                headerProfilePic.src = localStorage.getItem('profilePicture') || this.DEFAULT_AVATAR;
                headerProfilePic.onerror = function() {
                    this.src = ProfileCommon.DEFAULT_AVATAR;
                };
            }
            if (headerUsername) {
                headerUsername.textContent = localStorage.getItem('username') || 'Usuário';
            }
        }
    },

    // Initialize common dropdown functionality
    initDropdowns: function() {
        document.addEventListener('DOMContentLoaded', () => {
            const profileDropdown = document.getElementById("profileDropdown");
            if (profileDropdown) {
                profileDropdown.addEventListener("click", function (e) {
                    if (e.target.tagName === 'A') return;
                    document.querySelector(".dropdown-content").classList.toggle("show");
                });

                window.addEventListener("click", function (event) {
                    if (!event.target.matches('.profile') && !event.target.closest('.profile')) {
                        const dropdowns = document.getElementsByClassName("dropdown-content");
                        for (let dropdown of dropdowns) {
                            dropdown.classList.remove('show');
                        }
                    }
                });
            }
        });
    },

    getStoredUser: function() {
        return {
            username: localStorage.getItem('username'),
            profilePicture: localStorage.getItem('profilePicture')
        };
    },

    storeUser: function(user) {
        if (user.username) localStorage.setItem('username', user.username);
        if (user.profilePicture) localStorage.setItem('profilePicture', user.profilePicture);
    },
};