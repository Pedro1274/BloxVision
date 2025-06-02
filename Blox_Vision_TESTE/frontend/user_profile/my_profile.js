document.addEventListener('DOMContentLoaded', async () => {
    if (!ProfileCommon.checkAuth()) return;

    // DOM Elements - Updated to match your HTML structure
    const elements = {
        headerProfilePicture: document.getElementById('headerProfilePicture'),
        headerUsername: document.getElementById('headerUsername'),
        profilePicture: document.getElementById('profilePicture'), // For profile page only
        profileUsername: document.getElementById('profileUsername'),
        profileBio: document.getElementById('profileBio'),
        friendsCount: document.getElementById('friendsCount'),
        videosCount: document.getElementById('videosCount'),
        joinDate: document.getElementById('joinDate'),
        editProfileBtn: document.getElementById('editProfileBtn'),
        userVideosContainer: document.getElementById('userVideos'),
        logoutBtn: document.getElementById('logoutBtn'),
        friendsStat: document.getElementById('friendsStat'),
        videosStat: document.getElementById('videosStat'),
        // Modal elements
        editProfileModal: document.getElementById('editProfileModal'),
        editUsername: document.getElementById('editUsername'),
        editBio: document.getElementById('editBio'),
        avatarGrid: document.getElementById('avatarGrid'),
        closeBtn: document.querySelector('.close-btn'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),
        saveProfileBtn: document.getElementById('saveProfileBtn')
    };

    let currentAvatar = "";

    // Main initialization
    const user = await ProfileCommon.loadHeaderProfile();
    if (!user) return;

    // Load profile-specific data
    await loadProfileData(user._id);
    setupEventListeners();

    async function loadProfileData(userId) {
        try {
             // Use resolveAvatarPath for all avatar URLs
            currentAvatar = user.profilePicture 
                ? ProfileCommon.resolveAvatar(user.profilePicture)  // Changed from resolveAvatarPath
                : ProfileCommon.DEFAULT_AVATAR;
            
            // Update UI elements with proper paths
            if (user.profilePicture) {
                elements.profilePicture.src = ProfileCommon.resolveAvatar(user.profilePicture);  // Changed here
                elements.profilePicture.onerror = () => {
                    elements.profilePicture.src = ProfileCommon.DEFAULT_AVATAR;
                };
            }
            // Update UI elements
            if (user.username) elements.profileUsername.textContent = user.username;
            if (user.bio) elements.profileBio.textContent = user.bio;
            if (user.createdAt) {
                elements.joinDate.textContent = `Membro desde: ${ProfileCommon.formatDate(user.createdAt)}`;
            }

            // Load additional data
            await Promise.all([
                fetchUserStats(userId),
                fetchUserVideos(userId)
            ]);
        } catch (err) {
            console.error('Failed to load profile data:', err);
            showToast("Erro ao carregar perfil", 'error');
        }
    }

    async function fetchUserVideos(userId) {
        try {
            const res = await fetch(`${ProfileCommon.VIDEOS_API}/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (res.ok) {
                const userVideos = await res.json();
                ProfileCommon.renderVideos(userVideos, elements.userVideosContainer);
            }
        } catch (err) {
            console.error('Error fetching videos:', err);
            elements.userVideosContainer.innerHTML = '<p class="error">Erro ao carregar vídeos.</p>';
        }
    }

    // Load user data
    async function loadUserData() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${ProfileCommon.USERS_API}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch user data');
            
            const user = await res.json();
            currentAvatar = user.profilePicture || ProfileCommon.systemAvatars[0];

            ProfileCommon.storeUser(user);
            
            // Update UI
            if (user.username) {
                elements.profileUsername.textContent = user.username;
                elements.headerUsername.textContent = user.username;
                localStorage.setItem('username', user.username);
            }
            if (user.profilePicture) {
                elements.profilePicture.src = user.profilePicture;
                elements.headerProfilePicture.src = user.profilePicture;
                localStorage.setItem('profilePicture', user.profilePicture);
            }
            if (user.bio) elements.profileBio.textContent = user.bio;
            if (user.createdAt) {
                elements.joinDate.textContent = `Membro desde: ${ProfileCommon.formatDate(user.createdAt)}`;
            }

            return user._id;
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            showToast("Erro ao carregar perfil", 'error');
            return null;
        }
    }

    // Populate avatar grid for editing
    function populateAvatarGrid() {
        console.log("Avatar paths:", ProfileCommon.systemAvatars);
        console.log("Current avatar:", currentAvatar);
        elements.avatarGrid.innerHTML = "";
        
        ProfileCommon.systemAvatars.forEach(avatarPath => {
            const img = document.createElement("img");
            // Use the full path directly
            img.src = avatarPath;
            img.className = "avatar-option";
            img.alt = "Avatar option";
            img.loading = "lazy";
            
            // Compare full paths when checking selection
            if (currentAvatar && currentAvatar.includes(avatarPath.split('/').pop())) {
                img.classList.add("selected");
            }
            
            img.addEventListener("click", () => {
                document.querySelectorAll(".avatar-option").forEach(opt => {
                    opt.classList.remove("selected");
                });
                img.classList.add("selected");
                // Store the full path
                currentAvatar = avatarPath;
            });
            
            // Add error fallback
            img.onerror = function() {
                this.src = ProfileCommon.DEFAULT_AVATAR;
            };
            
            elements.avatarGrid.appendChild(img);
        });
    }

    // Fetch user stats
    async function fetchUserStats(userId) {
        try {
            const token = localStorage.getItem("token");
            
            // Fetch friend count
            const friendsRes = await fetch(`${ProfileCommon.FRIENDS_API}/friend`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (friendsRes.ok) {
                const friendsData = await friendsRes.json();
                elements.friendsCount.textContent = friendsData.friends?.length || 0;
            }

            // Fetch video count
            const videosRes = await fetch(`${ProfileCommon.VIDEOS_API}/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (videosRes.ok) {
                const videosData = await videosRes.json();
                elements.videosCount.textContent = videosData.length || 0;
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    }

    // Save profile changes
    async function saveProfileChanges(userId) {
        try {
            const newUsername = elements.editUsername.value.trim();
            const newBio = elements.editBio.value.trim();

            // Client-side validation
            if (!newUsername) {
                showToast("Username is required", 'error');
                return;
            }
            
            if (newUsername.length > 30) {
                showToast("Username must be less than 30 characters", 'error');
                return;
            }
            
            if (newBio.length > 200) {
                showToast("Bio must be less than 200 characters", 'error');
                return;
            }

                const response = await fetch(`${ProfileCommon.USERS_API}/me`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                // Store just the filename (avatar1.webp) not full path
                body: JSON.stringify({
                    username: newUsername,
                    bio: newBio,
                    profilePicture: currentAvatar.split('/').pop() // Just the filename
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Update UI and local storage
            elements.profileUsername.textContent = newUsername;
            elements.headerUsername.textContent = newUsername;
            elements.profileBio.textContent = newBio;
            elements.profilePicture.src = currentAvatar;
            elements.headerProfilePicture.src = currentAvatar;

            localStorage.setItem('username', newUsername);
            localStorage.setItem('profilePic', currentAvatar);

            elements.editProfileModal.style.display = "none";
            showToast("Profile updated successfully!");
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast(err.message, 'error');
        }
    }

    // Helper function
    function showToast(message, type = 'success') {
        // Implement your toast notification system here
        console.log(`${type}: ${message}`);
        alert(message); // Temporary fallback
    }

    // Initialize page
    const userId = await loadUserData();
    if (userId) {
        await Promise.all([
            fetchUserStats(userId),
            // Load user videos
            (async () => {
                try {
                    const res = await fetch(`${ProfileCommon.VIDEOS_API}/user/${userId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    
                    if (res.ok) {
                        const userVideos = await res.json();
                        ProfileCommon.renderVideos(userVideos, elements.userVideosContainer);
                    }
                } catch (err) {
                    console.error('Error fetching videos:', err);
                    elements.userVideosContainer.innerHTML = '<p class="error">Erro ao carregar vídeos.</p>';
                }
            })()
        ]);
    }

    // Event listeners
    elements.editProfileBtn?.addEventListener('click', () => {
        elements.editUsername.value = elements.profileUsername.textContent;
        elements.editBio.value = elements.profileBio.textContent;
        populateAvatarGrid();
        elements.editProfileModal.style.display = "block";
    });

    elements.closeBtn?.addEventListener('click', () => {
        elements.editProfileModal.style.display = "none";
    });

    elements.cancelEditBtn?.addEventListener('click', () => {
        elements.editProfileModal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === elements.editProfileModal) {
            elements.editProfileModal.style.display = "none";
        }
    });

    elements.saveProfileBtn?.addEventListener('click', async () => {
        await saveProfileChanges(userId);
    });

    elements.friendsStat?.addEventListener('click', () => {
        window.location.href = "../friends/friend.html";
    });

    elements.videosStat?.addEventListener('click', () => {
        elements.userVideosContainer.scrollIntoView({ behavior: 'smooth' });
    });

    ProfileCommon.setupLogout(elements.logoutBtn);
});