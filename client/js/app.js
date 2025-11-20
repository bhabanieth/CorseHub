// Global configuration
const API_BASE = 'https://corsehub.onrender.com/api';
let currentUser = null;
let isAdmin = false;

// Theme management
const THEMES = ['cyberpunk', 'light', 'retro', 'steampunk', 'neon', 'minimal', 'dark-purple'];
let currentTheme = localStorage.getItem('selected_theme') || 'cyberpunk';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Load saved theme
  loadTheme(currentTheme);
  
  // Check if admin is logged in
  const token = localStorage.getItem('admin_token');
  if (token) {
    isAdmin = true;
    currentUser = 'admin';
  }

  renderNavbar();
  
  // Check current page and render appropriate content
  const path = window.location.hash || '#home';
  handleNavigation(path);

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    const newPath = window.location.hash;
    handleNavigation(newPath);
  });
}

// Theme management functions
function loadTheme(theme) {
  // Remove all theme classes
  THEMES.forEach(t => document.body.classList.remove(`${t}-theme`));
  
  // Add the selected theme
  if (theme !== 'cyberpunk') {
    document.body.classList.add(`${theme}-theme`);
  }
  
  currentTheme = theme;
  localStorage.setItem('selected_theme', theme);
}

function changeTheme(theme) {
  loadTheme(theme);
}

function renderNavbar() {
  const navbar = document.getElementById('navbar');
  const themeOptions = THEMES.map(theme => 
    `<option value="${theme}" ${currentTheme === theme ? 'selected' : ''}>${theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}</option>`
  ).join('');
  
  navbar.innerHTML = `
    <div class="d-flex justify-content-between align-items-center w-100">
      <a href="#home" class="navbar-brand">
        <i class="fas fa-book-open"></i>
        CourseShare
      </a>
      <div class="d-flex align-items-center gap-3">
        <select class="form-select theme-selector" id="themeSelector" style="max-width: 150px;">
          ${themeOptions}
        </select>
        ${!isAdmin ? `
          <button class="nav-button" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="fas fa-sign-in-alt"></i> Admin Login
          </button>
        ` : `
          <span style="color: var(--primary); font-weight: 600;">Admin Mode</span>
          <button class="nav-button" onclick="logoutAdmin()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        `}
      </div>
    </div>
  `;

  // Add event listener for theme selector
  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
  }

  // Add login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      isAdmin = true;
      currentUser = 'admin';
      
      // Close modal and refresh
      const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      modal.hide();
      
      renderNavbar();
      window.location.hash = '#admin';
      showAlert('Logged in successfully!', 'success');
    } else {
      showAlert('Invalid credentials', 'danger');
    }
  } catch (error) {
    showAlert('Login failed: ' + error.message, 'danger');
  }
}

function logoutAdmin() {
  localStorage.removeItem('admin_token');
  isAdmin = false;
  currentUser = null;
  renderNavbar();
  window.location.hash = '#home';
  showAlert('Logged out successfully', 'success');
}

function handleNavigation(path) {
  const mainContent = document.getElementById('main-content');
  
  // Check if user is trying to access admin panel without login
  if (path.startsWith('#admin') && !isAdmin) {
    window.location.hash = '#home';
    showAlert('Please login as admin to access this page', 'warning');
    return;
  }

  switch (true) {
    case path === '#home' || path === '':
      renderClientHome();
      break;
    case path.startsWith('#course/'):
      const courseId = path.split('/')[1];
      renderCoursePage(courseId);
      break;
    case path.startsWith('#chapter/'):
      const chapterId = path.split('/')[1];
      renderChapterPage(chapterId);
      break;
    case path === '#admin':
      renderAdminDashboard();
      break;
    case path === '#admin/courses':
      renderAdminCourses();
      break;
    case path === '#admin/announcements':
      renderAdminAnnouncements();
      break;
    default:
      renderClientHome();
  }
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <span>${message}</span>
      <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;
  
  const mainContent = document.getElementById('main-content');
  mainContent.insertBefore(alert, mainContent.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) alert.remove();
  }, 5000);
}

// Utility to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Utility to get time ago
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  
  return formatDate(dateString);
}
