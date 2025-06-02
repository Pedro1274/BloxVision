const token = localStorage.getItem("token");
console.log("Token atual:", token);
const userIdDM = localStorage.getItem("userId");

const API_BASEDM = "http://localhost:3000/api";

const urlParams = new URLSearchParams(window.location.search);
let amigoId = urlParams.get("amigo"); // ID do amigo clicado

async function carregarAmigos() {
  const res = await fetch(`${API_BASEDM}/friends/friend`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log("Resposta da API:", data); 
  const amigos = data.friends;

  const lista = document.getElementById("lista-amigos");
  lista.innerHTML = "";

  amigos.forEach(amigo => {
    const li = document.createElement("li");
    li.textContent = amigo.username;
    li.onclick = () => {
      window.location.href = `private_chat.html?amigo=${amigo._id}`;
    };
    lista.appendChild(li);
  });

  // Define título
  if (amigoId) {
    const amigoAtual = amigos.find(a => a._id === amigoId);
    if (amigoAtual) {
      document.getElementById("chat-header").textContent = `Chat com ${amigoAtual.username}`;
    }
  }
}

async function carregarMensagens() {
  if (!amigoId) return;

  const res = await fetch(`${API_BASEDM}/messages/${amigoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const mensagens = await res.json();
  const container = document.getElementById("mensagens");
  container.innerHTML = "";

  mensagens.forEach(msg => {
    const div = document.createElement("div");
    div.className = "mensagem";
    div.innerHTML = `
      <span>${msg.sender._id === userIdDM ? "Você" : msg.sender.username}:</span> ${msg.content}
    `;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}

async function enviarMensagem(event) {
  event.preventDefault();
  const input = document.getElementById("mensagem");
  const conteudo = input.value.trim();

  if (!conteudo || !amigoId) return;

  await fetch(`${API_BASEDM}/messages/${amigoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content: conteudo })
  });

  input.value = "";
  carregarMensagens();
}

document.getElementById("form-msg").addEventListener("submit", enviarMensagem);

// Carregar tudo
carregarAmigos();
carregarMensagens();

// Recarrega mensagens a cada 5s
setInterval(carregarMensagens, 5000);