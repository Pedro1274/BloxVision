const API_BASEFR = "http://localhost:3000/api";
const userId_DISPONIVEL = localStorage.getItem("userId");
let allUsers = [];
let currentSearchTerm = "";

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem("token")) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../index.html";
    return;
  }

  loadAvailableUsers();

  // Setup search functionality with debounce
  const searchInput = document.getElementById('search-users');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim().toLowerCase();
      debouncedFilterUsers();
    });
  }
});

// Debounce function to prevent too many rapid searches
const debouncedFilterUsers = debounce(() => {
  filterUsers(currentSearchTerm);
}, 300);

// Simple debounce implementation
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Load available users
async function loadAvailableUsers() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const usuariosContainer = document.getElementById('usuarios');

  // Show loading state
  usuariosContainer.innerHTML = `
    <div class="loading-state">
      <img src="../icons/loading-spinner.webp" alt="Carregando">
      <p>Carregando usuários...</p>
    </div>
  `;

  try {
    // Fetch both all users and friends list in parallel
    const [allUsersResponse, friendsResponse] = await Promise.all([
      fetch(`${API_BASEFR}/friends/all`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASEFR}/friends/friend`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    // Handle unauthorized cases
    if (allUsersResponse.status === 401 || friendsResponse.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "../index.html";
      return;
    }

    if (!allUsersResponse.ok) {
      throw new Error("Erro ao carregar usuários");
    }

    // Get the data from responses
    const allUsersData = await allUsersResponse.json();
    const friendsData = friendsResponse.ok ? await friendsResponse.json() : { friends: [] };

    // Extract friend IDs
    const friendIds = friendsData.friends.map(friend => friend._id);

    // Filter users:
    // 1. Remove current user
    // 2. Remove existing friends
    allUsers = allUsersData.filter(user => 
      user._id !== userId && 
      !friendIds.includes(user._id)
    );

    if (allUsers.length === 0) {
      showEmptyState("Nenhum usuário disponível no momento.");
    } else {
      displayUsers(allUsers);
    }

  } catch (error) {
    console.error("Error:", error);
    showErrorState(error.message);
  }
}

// Display users in grid
function displayUsers(users) {
  const container = document.getElementById('usuarios');
  container.innerHTML = '';

  if (users.length === 0) {
    showEmptyState("Nenhum usuário encontrado para sua pesquisa.");
    return;
  }

  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <img src="${user.avatar || '../icons/default-avatar.webp'}" 
           class="user-avatar" 
           alt="Avatar de ${user.username}">
      <div class="user-info">
        <h3 class="user-name">${user.username}</h3>
        <p class="user-status ${user.online ? 'online' : 'offline'}">
          <span class="user-status-indicator"></span>
          ${user.online ? 'Online' : 'Offline'}
        </p>
        ${user.email ? `<p class="user-email">${user.email}</p>` : ''}
      </div>
      <div class="user-actions">
        <button class="add-friend-btn" onclick="sendFriendRequest('${user._id}', this)">
          <span class="btn-icon">
          </span>
          Adicionar
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Example function to display friends in the amigos tab
function displayFriends(friends) {
  const friendsList = document.getElementById('friends-list');
  friendsList.innerHTML = '';

  if (friends.length === 0) {
    friendsList.innerHTML = `
      <div class="empty-state">
        <img src="../icons/no-friends.webp" alt="Sem amigos">
        <p>Você ainda não tem amigos adicionados</p>
      </div>
    `;
    return;
  }

  friends.forEach(friend => {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.innerHTML = `
      <img src="${friend.avatar || '../icons/default-avatar.webp'}" 
           class="friend-avatar" 
           alt="Avatar de ${friend.username}">
      <div class="friend-info">
        <h3 class="friend-name">${friend.username}</h3>
        <p class="friend-status ${friend.online ? 'online' : 'offline'}">
          <span class="friend-status-indicator"></span>
          ${friend.online ? 'Online' : 'Offline'}
        </p>
      </div>
      <div class="friend-actions">
        <button class="friend-action-btn chat-btn" onclick="startChat('${friend._id}')">
          <img src="../icons/chat-icon.webp" alt="Chat">
          Chat
        </button>
        <button class="friend-action-btn remove-btn" onclick="removeFriend('${friend._id}')">
          <img src="../icons/remove-icon.webp" alt="Remover">
          Remover
        </button>
      </div>
    `;
    friendsList.appendChild(card);
  });
}

// Filter users based on search input
function filterUsers(searchTerm) {
  if (!searchTerm) {
    // If search is empty, show all users
    displayUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter(user => {
    // Safely check for username and email
    const username = user.username ? user.username.toLowerCase() : '';
    const email = user.email ? user.email.toLowerCase() : '';
    
    return username.includes(searchTerm) || email.includes(searchTerm);
  });

  displayUsers(filtered);
}

// Show empty state message
function showEmptyState(message) {
  const container = document.getElementById('usuarios');
  container.innerHTML = `
    <div class="empty-state">
      <img src="../icons/no-results.webp">
      <p>${message}</p>
    </div>
  `;
}

// Show error state
function showErrorState(message) {
  const container = document.getElementById('usuarios');
  container.innerHTML = `
    <div class="error-state">
      <img src="../icons/error-icon.webp" alt="Erro">
      <p>${message}</p>
      <button onclick="loadAvailableUsers()">Tentar novamente</button>
    </div>
  `;
}

// Send friend request
async function sendFriendRequest(toId, button) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado.");
    return;
  }

  button.disabled = true;
  button.innerHTML = `
    Enviando...
  `;

  try {
    const response = await fetch(`${API_BASEFR}/friends/friends/request/${toId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        const text = await response.text();
        errorMsg = text || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();

    button.innerHTML = `
      <img src="../icons/checkmark.webp" alt="Solicitação enviada">
      Enviada
    `;

    // Remove the card from both the DOM and allUsers array
    const card = button.closest('.user-card');
    const userIdToRemove = toId;
    allUsers = allUsers.filter(user => user._id !== userIdToRemove);
    
    setTimeout(() => {
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
    }, 1000);

  } catch (error) {
    console.error("Error:", error);
    button.disabled = false;
    button.innerHTML = `
      <img src="../icons/add-friend-icon.webp">
      Adicionar
    `;
    alert(`Falha ao enviar solicitação: ${error.message}`);
  }
}