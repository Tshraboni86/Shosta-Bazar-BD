const CATEGORY_API_URL = 'http://localhost:5000/api/categories';

// Add this to your admin/js/categories.js if it doesn't exist

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});

// Universal Click Handler (Fixes non-responsive buttons)
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('#addCategoryBtn') || (e.target.innerText && e.target.innerText.includes('ADD CATEGORY'));
  const modal = document.getElementById('addCategoryModal');
  const closeBtn = e.target.closest('#closeCategoryModalBtn');

  // Open Modal
  if (addBtn) {
    e.preventDefault();
    if (modal) {
      modal.style.display = 'flex';
    } else {
      console.error('Modal element #addCategoryModal was not found in HTML.');
    }
  }

  // Close Modal
  if (closeBtn || e.target === modal) {
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('addCategoryForm')?.reset();
    }
  }
});

  // Load live categories on startup
  loadCategories();

  // Open Modal on + ADD CATEGORY Click
  if (addBtn && modal) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  }

  // Close Modal Handler
  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close when clicking backdrop outside container
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Submit Category Form to MongoDB
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('catNameInput').value.trim();
      const designsCount = document.getElementById('catDesignsInput').value.trim() || '0 Designs';
      const image = document.getElementById('catImageInput').value.trim();
      const status = document.getElementById('catStatusInput').value;

      if (!name) {
        alert('Please enter a category name.');
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, designsCount, image, status })
        });

        if (response.ok) {
          closeModal();
          loadCategories(); // Refresh table list
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save category.'}`);
        }
      } catch (err) {
        console.error('Save error:', err);
        alert('❌ Server unreachable. Make sure "node server.js" is running!');
      }
    });
  }


// Fetch & Render Categories from MongoDB
async function loadCategories() {
  const tableBody = document.getElementById('categoriesTableBody') || document.querySelector('tbody');
  if (!tableBody) return;

  try {
    const res = await fetch(API_URL);
    const categories = await res.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No categories found in database. Click "+ ADD CATEGORY" to add one.</td></tr>';
      return;
    }

    tableBody.innerHTML = categories.map(cat => `
      <tr>
        <td>
          <div style="width:40px; height:40px; background:#e0e0e0; border-radius:4px; overflow:hidden;">
            ${cat.image ? `<img src="${cat.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">` : ''}
          </div>
        </td>
        <td style="font-weight:600;">${cat.name}</td>
        <td>${cat.designsCount || '0 Designs'}</td>
        <td><span style="color:${cat.status === 'INACTIVE' ? '#dc3545' : '#28a745'}; font-weight:bold;">${cat.status || 'ACTIVE'}</span></td>
        <td>
          <button onclick="deleteCategory('${cat._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// Delete Category Handler
async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadCategories();
    } else {
      alert('Failed to delete category.');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
}