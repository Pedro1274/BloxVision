const userIdFR = localStorage.getItem("userId");

const API_BASE_FRIENDS = "http://localhost:3000/api/friends";

async function carregarUsuarios() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        return;
    }
    const res = await fetch(`${API_BASE_FRIENDS}/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        return;
    }
    const users = await res.json();

    const container = document.getElementById("usuarios");
    container.innerHTML = "";

    users.forEach(user => {
        if (user._id === userIdFR) return;

        const card = document.createElement("div");
        card.className = "usuario-card";
        card.innerHTML = `
            <img src="${user.avatar || '../icons/default-avatar.webp'}" class="user-avatar" alt="${user.username}">
            <div class="user-info">
                <h3 class="user-name">${user.username}</h3>
                <p class="user-email">${user.email}</p>
            </div>
            <div class="user-actions">
                <button class="add-button" onclick="enviarSolicitacao('${user._id}')">Adicionar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function enviarSolicitacao(toId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        return;
    }
  const res = await fetch(`${API_BASE_FRIENDS}/friends/request/${toId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  alert(data.message || "Solicitação enviada!");
  carregarTudo();
}

async function carregarAmigosESolicitacoes() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        return;
    }
    const res = await fetch(`${API_BASE_FRIENDS}/friend`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        return;
    }
    const data = await res.json();
    
    const amigos = data.friends || [];
    const pendentes = data.friendRequests || [];
    
    // Update friends list
    const containerAmigos = document.getElementById("friends-list");
    containerAmigos.innerHTML = "";
    
    if (amigos.length === 0) {
        containerAmigos.innerHTML = `
            <div class="empty-state">
                <img src="../icons/no-friends.webp" alt="Sem amigos">
                <p>Você ainda não tem amigos adicionados</p>
            </div>
        `;
    } else {
        amigos.forEach(amigo => {
            const card = document.createElement("div");
            card.className = "friend-card";
            card.innerHTML = `
                <img src="${amigo.avatar || '../icons/default-avatar.webp'}" 
                     class="friend-avatar" 
                     alt="${amigo.username}">
                <div class="friend-info">
                    <h3 class="friend-name">${amigo.username}</h3>
                    <p class="friend-status ${amigo.online ? 'online' : 'offline'}">
                        <span class="friend-status-indicator"></span>
                        ${amigo.online ? 'Online' : 'Offline'}
                    </p>
                </div>
                <div class="friend-actions">
                    <button class="chat-btn" onclick="irParaChat('${amigo._id}')">
                        Conversar
                    </button>
                </div>
            `;
            containerAmigos.appendChild(card);
        });
    }
  
    // Update friend requests (keep your existing implementation)
    const containerSolicitacoes = document.getElementById("solicitacoes");
    containerSolicitacoes.innerHTML = "";
    pendentes.forEach(user => {
        const div = document.createElement("div");
        div.className = "usuario-card";
        div.innerHTML = `
            <strong>${user.username}</strong>
            <button onclick="aceitarAmizade('${user._id}')">Aceitar</button>
        `;
        containerSolicitacoes.appendChild(div);
    });
}

async function aceitarAmizade(fromId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Você precisa estar logado.");
        return;
    }
  const res = await fetch(`${API_BASE_FRIENDS}/friends/accept/${fromId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  alert(data.message || "Amizade aceita!");
  carregarTudo();
}

function irParaChat(idAmigo) {
  window.location.href = `../private_chat/private_chat.html?amigo=${idAmigo}`;
}

function carregarTudo() {
  carregarUsuarios();
  carregarAmigosESolicitacoes();
}

carregarTudo();