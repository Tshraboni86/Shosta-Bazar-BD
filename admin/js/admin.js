// Base UI Components, Modal Handlers, Sidebars & Toast System

document.addEventListener("DOMContentLoaded", () => {
  // Check auth on secure pages
  if (!window.location.pathname.includes("login.html")) {
    checkAuth();
  }

  // Sidebar toggle
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".admin-sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  // Dropdown UI
  const profileDropdown = document.getElementById("profileDropdownToggle");
  const profileMenu = document.getElementById("profileDropdownMenu");
  if (profileDropdown && profileMenu) {
    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("show");
    });
    document.addEventListener("click", () => profileMenu.classList.remove("show"));
  }
});

function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const msgEl = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");

  if (!modal) return;

  msgEl.textContent = message;
  modal.classList.add("show");

  const close = () => {
    modal.classList.remove("show");
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  confirmBtn.onclick = () => {
    onConfirm();
    close();
  };
  cancelBtn.onclick = close;
}
// Generic function to save data into localStorage
function saveItem(key, newData) {
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.push(newData);
  localStorage.setItem(key, JSON.stringify(existing));
}

// 1. ADD CATEGORY
const categoryForm = document.getElementById('addCategoryForm');
if (categoryForm) {
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    saveItem('categories', { id: Date.now(), name });
    alert('Category Added Successfully!');
    location.reload(); // Refreshes to display new item
  });
}

// 2. ADD HERO SLIDER / GALLERY / OFFERS / PRODUCTS
// Apply the same pattern to your other forms:
// Use e.preventDefault(), gather input values, and save to localStorage!