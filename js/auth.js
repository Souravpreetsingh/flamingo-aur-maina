const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8000" : "/api";

const AuthAPI = {
    setToken(data) {
        localStorage.setItem("lx_access_token", data.access_token);
        localStorage.setItem("lx_user", JSON.stringify(data.user));
    },

    getToken() {
        return localStorage.getItem("lx_access_token");
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem("lx_user"));
        } catch {
            return null;
        }
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    clearSession() {
        localStorage.removeItem("lx_access_token");
        localStorage.removeItem("lx_user");
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = { "Content-Type": "application/json", ...options.headers };
        const token = this.getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        if (!response.ok) throw { status: response.status, ...data };
        return data;
    },

    async register(fullName, email, phone, password) {
        const data = await this.request("/register", {
            method: "POST",
            body: JSON.stringify({ full_name: fullName, email, phone: phone || null, password }),
        });
        this.setToken(data);
        return data;
    },

    async login(email, password) {
        const data = await this.request("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data);
        return data;
    },

    async logout() {
        this.clearSession();
    },

    async getProfile() {
        return await this.request("/profile");
    },
};

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const existing = input.parentElement.querySelector(".field-error");
    if (existing) existing.remove();
    const error = document.createElement("p");
    error.className = "field-error text-xs text-red-500 mt-1";
    error.textContent = message;
    input.parentElement.appendChild(error);
    input.classList.add("border-red-400");
}

function clearFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll(".field-error").forEach((e) => e.remove());
    form.querySelectorAll(".border-red-400").forEach((e) => e.classList.remove("border-red-400"));
}

function setLoading(buttonId, loading = true, text = "Processing...") {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> ${text}`;
        btn.disabled = true;
        btn.classList.add("opacity-80", "cursor-not-allowed");
    } else {
        btn.innerHTML = btn.dataset.originalText || "Submit";
        btn.disabled = false;
        btn.classList.remove("opacity-80", "cursor-not-allowed");
    }
}

function showAlert(message, type = "error") {
    const colors = { error: "bg-red-50 text-red-700 border-red-200", success: "bg-green-50 text-green-700 border-green-200", info: "bg-blue-50 text-blue-700 border-blue-200" };
    const existing = document.querySelector(".auth-alert");
    if (existing) existing.remove();
    const alert = document.createElement("div");
    alert.className = `auth-alert ${colors[type] || colors.info} border rounded-lg p-4 mb-6 text-sm font-body-md`;
    alert.textContent = message;
    const form = document.querySelector("form");
    if (form) form.parentElement.insertBefore(alert, form);
    setTimeout(() => alert.remove(), 5000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireAuth() {
    if (!AuthAPI.isAuthenticated()) {
        window.location.href = "/pages/login/index.html";
    }
}

function handleLogout() {
    AuthAPI.logout();
    window.location.href = "/index.html";
}

// Auth guard for login/register pages
if (window.location.pathname.includes("/login/") || window.location.pathname.includes("/auth/")) {
    if (AuthAPI.isAuthenticated()) {
        window.location.href = "../profile/index.html";
    }
}
