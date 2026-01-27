/**
 * Shared Authentication & RBAC Functions
 * Include this file in all pages after config.js
 */

const AUTH = {
    getToken: function () {
        return localStorage.getItem('access_token');
    },

    isLoggedIn: function () {
        return !!this.getToken();
    },

    logout: function () {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    },

    // Show admin-only navigation items for admin
    showAdminOnlyLinks: function () {
        const navJobs = document.getElementById('nav-jobs');
        const navUsers = document.getElementById('nav-users');
        const navAdminHeader = document.getElementById('nav-admin-header');

        if (navJobs) navJobs.style.display = '';
        if (navUsers) navUsers.style.display = '';
        if (navAdminHeader) navAdminHeader.style.display = '';
    },

    // Load user info and apply RBAC
    loadUserInfoWithRBAC: async function (callback) {
        const API_BASE = typeof CONFIG !== 'undefined' ? CONFIG.API_BASE : 'http://localhost:8000';

        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });

            if (!response.ok) throw new Error('Unauthorized');

            const user = await response.json();

            // Store user info globally
            window.currentUser = user;

            // Update UI elements if they exist
            const userDisplay = document.getElementById('userDisplay');
            const userInitial = document.getElementById('userInitial');

            if (userDisplay) userDisplay.textContent = user.username;
            if (userInitial) userInitial.textContent = user.username.charAt(0).toUpperCase();

            // Show admin-only links for admin
            if (user.role === 'admin') {
                this.showAdminOnlyLinks();
            }

            // Execute callback if provided
            if (callback) callback(user);

            return user;

        } catch (error) {
            console.error('Failed to load user info:', error);
            this.logout();
            return null;
        }
    },

    // Check authentication and redirect to login if not authenticated
    checkAuth: function (callback) {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        } else {
            this.loadUserInfoWithRBAC(callback);
        }
    }
};

// Convenience functions for backward compatibility
function getToken() { return AUTH.getToken(); }
function isLoggedIn() { return AUTH.isLoggedIn(); }
function logout() { AUTH.logout(); }
function showAdminOnlyLinks() { AUTH.showAdminOnlyLinks(); }
