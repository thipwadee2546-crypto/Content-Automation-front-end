// ========================================
// Frontend Configuration
// ========================================

// เปลี่ยนค่า API_BASE ตามที่คุณรันเซิร์ฟเวอร์ Backend
const CONFIG = {
    // API Base URL
    API_BASE: "https://itzel-unfoiled-diphtheritically.ngrok-free.dev",

    // Token storage key
    TOKEN_KEY: "access_token",
    USERNAME_KEY: "username",

    // ตั้งค่า timeout (milliseconds)
    REQUEST_TIMEOUT: 30000,

    // URLs
    LOGIN_URL: "index.html",
    DASHBOARD_URL: "dashboard.html",

    // Default settings
    TOKEN_EXPIRY_MINUTES: 30
};

// Helper function เพื่อให้ได้ API endpoint
function getApiUrl(path) {
    return CONFIG.API_BASE + path;
}

// Helper function เพื่อเก็บ token
function saveToken(token, username) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USERNAME_KEY, username);
}

// Helper function เพื่อดึง token
function getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
}

// Helper function เพื่อดึงชื่อผู้ใช้
function getUsername() {
    return localStorage.getItem(CONFIG.USERNAME_KEY);
}

// Helper function เพื่อลบ token
function clearToken() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USERNAME_KEY);
}

// Helper function ตรวจสอบล็อกอิน
function isLoggedIn() {
    return !!getToken();
}

// Helper function สำหรับ API calls พร้อม headers
async function apiCall(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...options.headers
    };

    // เพิ่ม Authorization token ถ้ามี
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            timeout: CONFIG.REQUEST_TIMEOUT
        });

        // ถ้า 401 Unauthorized ให้ redirect ไป login
        if (response.status === 401) {
            clearToken();
            window.location.href = CONFIG.LOGIN_URL;
        }

        return response;
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
}
