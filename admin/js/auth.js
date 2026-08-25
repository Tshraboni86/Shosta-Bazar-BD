// admin/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle Logout Click
  document.addEventListener('click', (e) => {
    // Finds any button or link with class "logout-btn", ID "logoutBtn", or text containing "Logout"
    const target = e.target.closest('a, button');
    
    if (target && (
      target.classList.contains('logout-btn') || 
      target.id === 'logoutBtn' || 
      target.textContent.trim().toLowerCase().includes('logout')
    )) {
      e.preventDefault();
      
      // Clear login session token
      localStorage.removeItem('adminLoggedIn');
      
      // Redirect to login page
      window.location.href = 'login.html';
    }
  });

  // 2. Protect Admin Pages (Redirect to login if not logged in)
  const currentPage = window.location.pathname.split('/').pop();
  const isLoggedIn = localStorage.getItem('adminLoggedIn');

  // If user is NOT logged in and trying to access any page other than login.html
  if (!isLoggedIn && currentPage !== 'login.html' && currentPage !== '') {
    window.location.href = 'login.html';
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');

  // Clear pre-filled credentials on load
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';

  // Toggle Password Visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      // Switch icon classes
      togglePassword.classList.toggle('fa-eye', !isPassword);
      togglePassword.classList.toggle('fa-eye-slash', isPassword);
    });
  }
});