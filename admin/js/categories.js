// admin/js/categories.js
// ==========================================
// CATEGORIES API
// ==========================================

const CATEGORY_API_URL = `${API_BASE}/categories`;

// ==========================================
// LOAD CATEGORIES
// ==========================================
async function loadCategories() {
  const tableBody = document.getElementById('categoriesTableBody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Loading categories...</td></tr>';

    const response = await fetch(CATEGORY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const categories = await response.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">No categories found. Click "+ ADD CATEGORY" to add one.</td></tr>';
      return;
    }

    tableBody.innerHTML = categories.map(cat => `
      <tr>
        <td>
          <div style="width:50px; height:50px; background:#f0f0f0; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            ${cat.image ? `<img src="${cat.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:12px; color:#ccc;\\'>No img</span>'">` : '<span style="font-size:12px; color:#ccc;">No img</span>'}
          </div>
        </td>
        <td style="font-weight:600;">${cat.name}</td>
        <td>${cat.designsCount || '0 Designs'}</td>
        <td><span style="color:${cat.status === 'INACTIVE' ? '#dc3545' : '#28a745'}; font-weight:bold;">${cat.status || 'ACTIVE'}</span></td>
        <td>
          <button onclick="editCategory('${cat._id}')" style="color:#007bff; background:none; border:none; cursor:pointer; font-weight:500; margin-right:10px;">Edit</button>
          <button onclick="deleteCategory('${cat._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('❌ Error loading categories:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load categories. Make sure server is running.
          <br>
          <button onclick="loadCategories()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// ==========================================
// OPEN MODAL
// ==========================================
function openCategoryModal() {
  document.getElementById('categoryModal').style.display = 'flex';
  document.getElementById('categoryForm').reset();
  document.getElementById('imagePreview').innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
  document.getElementById('modalTitle').textContent = 'Add New Category';
  document.getElementById('saveCategoryBtn').textContent = 'Save Category';
  document.getElementById('categoryForm').dataset.editId = '';
}

// ==========================================
// CLOSE MODAL
// ==========================================
function closeCategoryModal() {
  document.getElementById('categoryModal').style.display = 'none';
  document.getElementById('categoryForm').reset();
}

// ==========================================
// EDIT CATEGORY
// ==========================================
async function editCategory(id) {
  try {
    const response = await fetch(`${CATEGORY_API_URL}/${id}`);
    if (!response.ok) throw new Error('Category not found');
    const category = await response.json();

    document.getElementById('modalTitle').textContent = 'Edit Category';
    document.getElementById('saveCategoryBtn').textContent = 'Update Category';
    document.getElementById('catName').value = category.name || '';
    document.getElementById('catDesigns').value = category.designsCount || '';
    document.getElementById('catImage').value = category.image || '';
    document.getElementById('catStatus').value = category.status || 'ACTIVE';
    document.getElementById('categoryForm').dataset.editId = id;

    if (category.image) {
      document.getElementById('imagePreview').innerHTML = `<img src="${category.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:#aaa; font-size:0.75rem;\\'>Invalid</span>'">`;
    } else {
      document.getElementById('imagePreview').innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
    }

    document.getElementById('categoryModal').style.display = 'flex';
  } catch (err) {
    alert('❌ Failed to load category details.');
  }
}

// ==========================================
// DELETE CATEGORY
// ==========================================
async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const response = await fetch(`${CATEGORY_API_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('✅ Category deleted successfully!');
      loadCategories();
    } else {
      const err = await response.json();
      alert(`❌ Error: ${err.error || 'Failed to delete category'}`);
    }
  } catch (err) {
    alert('❌ Failed to delete category.');
  }
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();

  // Add Category Button
  const addBtn = document.getElementById('addCategoryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openCategoryModal();
    });
  }

  // Close Modal Button
  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeCategoryModal();
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('categoryModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeCategoryModal();
      }
    });
  }

  // Delete Modal buttons
  const deleteCancel = document.getElementById('deleteCancelBtn');
  if (deleteCancel) {
    deleteCancel.addEventListener('click', function() {
      document.getElementById('deleteModal').style.display = 'none';
    });
  }

  const deleteConfirm = document.getElementById('deleteConfirmBtn');
  if (deleteConfirm) {
    deleteConfirm.addEventListener('click', function() {
      document.getElementById('deleteModal').style.display = 'none';
    });
  }

  // Submit Category Form
  const form = document.getElementById('categoryForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name = document.getElementById('catName').value.trim();
      const designsCount = document.getElementById('catDesigns').value.trim() || '0 Designs';
      const image = document.getElementById('catImage').value.trim();
      const status = document.getElementById('catStatus').value;
      const editId = this.dataset.editId;

      if (!name) {
        alert('Please enter a category name.');
        return;
      }

      const submitBtn = document.getElementById('saveCategoryBtn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const url = editId ? `${CATEGORY_API_URL}/${editId}` : CATEGORY_API_URL;
        const method = editId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, designsCount, image, status })
        });

        if (response.ok) {
          alert(editId ? '✅ Category updated!' : '✅ Category added!');
          closeCategoryModal();
          loadCategories();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save category.'}`);
        }
      } catch (err) {
        console.error('Save error:', err);
        alert('❌ Cannot connect to backend server. Make sure Render is running!');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.loadCategories = loadCategories;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
