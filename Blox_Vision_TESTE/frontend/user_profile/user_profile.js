// user_profile.js
document.addEventListener('DOMContentLoaded', async () => {
    if (!ProfileCommon.checkAuth()) return;

    // DOM Elements
    const elements = {
        headerProfilePicture: document.getElementById('headerProfilePicture'),
        headerUsername: document.getElementById('headerUsername'),
        profilePicture: document.getElementById('profilePicture'),
        profileUsername: document.getElementById('profileUsername'),
        profileBio: document.getElementById('profileBio'),
        friendsCount: document.getElementById('friendsCount'),
        videosCount: document.getElementById('videosCount'),
        joinDate: document.getElementById('joinDate'),
        addFriendBtn: document.getElementById('addFriendBtn'),
        messageBtn: document.getElementById('messageBtn'),
        userVideosContainer: document.getElementById('userVideos'),
        logoutBtn: document.getElementById('logoutBtn'),
        friendsStat: document.getElementById('friendsStat'),
        videosStat: document.getElementById('videosStat')
    };

    // First load the logged-in user's data for the header
    const currentUser = await ProfileCommon.loadHeaderProfile();
    if (currentUser) {
        if (currentUser.username && elements.headerUsername) {
            elements.headerUsername.textContent = currentUser.username;
        }
        if (currentUser.profilePicture && elements.headerProfilePicture) {
            elements.headerProfilePicture.src = currentUser.profilePicture;
        }
    }

    // Get user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('id');
    
    if (!profileUserId) {
        window.location.href = 'my_profile.html';
        return;
    }

    // Load user data - this should only update the profile section, not the header
    async function loadUserData(userId) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${ProfileCommon.USERS_API}/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch user data');
            
            const user = await res.json();
            
            // Update only profile UI, not header
            if (user.username) {
                elements.profileUsername.textContent = user.username;
            }
            if (user.profilePic) {
                elements.profilePicture.src = user.profilePic;
            }
            if (user.bio) elements.profileBio.textContent = user.bio;
            if (user.createdAt) {
                elements.joinDate.textContent = `Membro desde: ${ProfileCommon.formatDate(user.createdAt)}`;
            }

            return user._id;
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            elements.profileUsername.textContent = "Usuário não encontrado";
            return null;
        }
    }

    // Check friendship status
    async function checkFriendshipStatus() {
        try {
            const res = await fetch(`${ProfileCommon.FRIENDS_API}/friend`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!res.ok) throw new Error('Failed to fetch friendship status');
            
            const data = await res.json();
            
            if (data.friends?.some(f => f._id === profileUserId)) return 'friends';
            if (data.requests?.some(r => r._id === profileUserId)) return 'pending';
            return 'none';
        } catch (err) {
            console.error('Error checking friendship status:', err);
            return 'none';
        }
    }

    // Update friend button based on status
    async function updateFriendButton() {
        const status = await checkFriendshipStatus();
        elements.addFriendBtn.disabled = false;
        elements.addFriendBtn.className = 'add-friend-btn';
        
        switch (status) {
            case 'friends':
                elements.addFriendBtn.textContent = 'Amigos';
                elements.addFriendBtn.classList.add('friends-state');
                elements.addFriendBtn.onclick = () => removeFriend();
                break;
            case 'pending':
                elements.addFriendBtn.textContent = 'Pedido Enviado';
                elements.addFriendBtn.classList.add('pending-state');
                elements.addFriendBtn.disabled = true;
                break;
            default:
                elements.addFriendBtn.textContent = 'Adicionar Amigo';
                elements.addFriendBtn.onclick = () => sendFriendRequest();
        }
    }

    // Send friend request
    async function sendFriendRequest() {
        try {
            setButtonLoading(elements.addFriendBtn, 'Enviando...');
            
            const res = await fetch(`${ProfileCommon.FRIENDS_API}/request/${profileUserId}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erro ao enviar pedido de amizade");
            }
            
            showToast("Pedido de amizade enviado com sucesso!");
            await updateFriendButton();
        } catch (err) {
            console.error('Error sending friend request:', err);
            showToast(err.message, 'error');
            await updateFriendButton();
        }
    }

    // Remove friend
    async function removeFriend() {
        if (!confirm("Tem certeza que deseja remover este amigo?")) return;
        
        try {
            setButtonLoading(elements.addFriendBtn, 'Removendo...');
            
            const res = await fetch(`${ProfileCommon.FRIENDS_API}/remove/${profileUserId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erro ao remover amigo");
            }
            
            showToast("Amigo removido com sucesso!");
            await updateFriendButton();
            await fetchUserStats(profileUserId);
        } catch (err) {
            console.error('Error removing friend:', err);
            showToast(err.message, 'error');
            await updateFriendButton();
        }
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
                const data = await friendsRes.json();
                elements.friendsCount.textContent = data.friends?.length || 0;
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

    // Helper functions
    function setButtonLoading(button, text) {
        button.classList.add('loading-state');
        button.disabled = true;
        button.textContent = text;
    }

    function showToast(message, type = 'success') {
        // Implement your toast notification system here
        console.log(`${type}: ${message}`);
        alert(message); // Temporary fallback
    }

    // Initialize page
    const userId = await loadUserData(profileUserId);
    if (userId) {
        await Promise.all([
            fetchUserStats(userId),
            updateFriendButton()
        ]);
        
        // Fetch user videos
        try {
            const res = await fetch(`${ProfileCommon.VIDEOS_API}/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (res.ok) {
                const userVideos = await res.json();
                ProfileCommon.renderVideos(userVideos, elements.userVideosContainer);
            } else {
                elements.userVideosContainer.innerHTML = '<p class="no-videos">Nenhum vídeo encontrado.</p>';
            }
        } catch (err) {
            console.error('Error fetching videos:', err);
            elements.userVideosContainer.innerHTML = '<p class="error">Erro ao carregar vídeos.</p>';
        }
    }

    // Event listeners
    elements.messageBtn?.addEventListener('click', () => {
        window.location.href = `../private_chat/private_chat.html?userId=${profileUserId}`;
    });

    elements.friendsStat?.addEventListener('click', () => {
        window.location.href = `../friends/friend.html?userId=${profileUserId}`;
    });

    elements.videosStat?.addEventListener('click', () => {
        elements.userVideosContainer.scrollIntoView({ behavior: 'smooth' });
    });

    ProfileCommon.setupLogout(elements.logoutBtn);

    function setupDropdown() {
        const profileDropdown = document.getElementById('profileDropdown');
        if (!profileDropdown) return;

        // Toggle dropdown when clicking on profile picture or username
        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('active');
        });
    }

    // Call this function at the end of your DOMContentLoaded event listener
    setupDropdown();
});