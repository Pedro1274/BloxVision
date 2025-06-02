// UI Toggle Functions
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const sign_in_btn2 = document.querySelector("#sign-in-btn2");
const sign_up_btn2 = document.querySelector("#sign-up-btn2");

if (sign_up_btn) {
    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });
}

if (sign_in_btn) {
    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });
}

if (sign_up_btn2) {
    sign_up_btn2.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });
}

if (sign_in_btn2) {
    sign_in_btn2.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });
}

// Your existing API functions (keep them as is)
const API_BASE = "http://localhost:3000/api/users";

// Updated Register Form Handler
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!username || !email || !password) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Cadastro realizado com sucesso!");
                container.classList.remove("sign-up-mode"); // Switch to login after registration
            } else {
                alert(data.message || "Erro ao registrar.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor.");
        }
    });
}

// Updated Login Form Handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Verifica se já está logado
        if (localStorage.getItem("token")) {
            alert("Você já está logado.");
            window.location.href = "../../index.html";
            return;
        }

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user.id);
                alert("Login bem-sucedido!");
                window.location.href = "../../index.html";
            } else {
                alert(data.message || "Erro ao fazer login.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor.");
        }
    });
}

// Logout Button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        alert("Logout realizado com sucesso.");
        window.location.href = "./login.html";
    });
    
    // Hide logout button if not logged in
    if (!localStorage.getItem("token")) {
        logoutBtn.style.display = "none";
    }
}