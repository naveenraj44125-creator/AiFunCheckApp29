// API Configuration
const API_BASE = window.location.origin;

// State Management
const state = {
    token: localStorage.getItem('token'),
    user: null,
    currentPage: 'auth'
};

// Utility Functions
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function getInitials(username) {
    return username.substring(0, 2).toUpperCase();
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Auth Functions
async function register(email, username, password) {
    const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password })
    });
    return data;
}

async function login(email, password) {
    const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    state.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
}

async function logout() {
    try {
        await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    showPage('auth');
    updateNav();
}

// Post Functions
async function createPost(content, visibility) {
    const data = await apiCall('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
            content: { type: 'text', text: content },
            visibility
        })
    });
    return data;
}

async function getFeed() {
    const data = await apiCall('/api/feed');
    return data;
}

// Friends Functions
async function getFriends() {
    const data = await apiCall('/api/friends');
    return data;
}

// UI Functions
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}Page`);
    if (page) {
        page.classList.add('active');
        state.currentPage = pageName;
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Load page data
    if (pageName === 'feed') {
        loadFeed();
    } else if (pageName === 'friends') {
        loadFriends();
    }
}

function updateNav() {
    const navMenu = document.getElementById('navMenu');
    const navAuth = document.getElementById('navAuth');
    
    if (state.token) {
        navMenu.classList.remove('hidden');
        navAuth.classList.add('hidden');
    } else {
        navMenu.classList.add('hidden');
        navAuth.classList.remove('hidden');
    }
}

function renderPost(post) {
    const authorInitials = getInitials(post.authorId.substring(0, 8));
    const visibilityBadge = post.visibility === 'public' ? 
        '<span class="post-badge badge-public">Public</span>' :
        '<span class="post-badge badge-friends">Friends Only</span>';
    
    return `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">${authorInitials}</div>
                    <div class="author-info">
                        <h3>User ${post.authorId.substring(0, 8)}</h3>
                        <p>${formatDate(post.createdAt)}</p>
                    </div>
                </div>
                ${visibilityBadge}
            </div>
            <div class="post-content">
                ${post.content.text}
            </div>
            <div class="post-footer">
                <div class="post-actions">
                    <button class="post-action">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        Like
                    </button>
                    <button class="post-action">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Comment
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function loadFeed() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = '<div class="loading">Loading posts...</div>';
    
    try {
        const data = await getFeed();
        
        if (data.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No posts yet</h3>
                    <p>Be the first to share your AI story!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = data.posts.map(post => renderPost(post)).join('');
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading feed</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function loadFriends() {
    const container = document.getElementById('friendsContainer');
    container.innerHTML = '<div class="loading">Loading friends...</div>';
    
    try {
        const data = await getFriends();
        
        if (data.friends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No friends yet</h3>
                    <p>Start connecting with other AI enthusiasts!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = data.friends.map(friend => `
            <div class="friend-card">
                <div class="friend-avatar">${getInitials(friend.username)}</div>
                <h3>${friend.username}</h3>
                <p>${friend.email}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading friends</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (state.token) {
        showPage('feed');
    } else {
        showPage('auth');
    }
    updateNav();
    
    // Auth form toggles
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await login(email, password);
            showToast('Login successful!', 'success');
            showPage('feed');
            updateNav();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            await register(email, username, password);
            showToast('Registration successful! Please login.', 'success');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('loginEmail').value = email;
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Create post form
    document.getElementById('createPostForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('postContent').value;
        const visibility = document.getElementById('postVisibility').value;
        
        try {
            await createPost(content, visibility);
            showToast('Post created successfully!', 'success');
            document.getElementById('postContent').value = '';
            showPage('feed');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Nav auth buttons
    document.getElementById('loginNavBtn').addEventListener('click', () => {
        showPage('auth');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });
    
    document.getElementById('registerNavBtn').addEventListener('click', () => {
        showPage('auth');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    });
});
