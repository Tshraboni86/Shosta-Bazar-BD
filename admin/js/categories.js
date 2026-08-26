const API_BASE = window.API_BASE || 'http://localhost:5000/api';
const CATEGORY_API_URL = `${API_BASE}/categories`;
let deleteCategoryId = null;

// ==========================================
// HANDLE IMAGE UPLOAD
// ==========================================
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById('catImage').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==========================================
// OPEN MODAL
// ==========================================
function openModal() {
  document.getElementById('categoryModal').style.display = 'flex';
  document.getElementById('categoryForm').reset();
  document.getElementById('imagePreview').innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
  document.getElementById('modalTitle').textContent = 'Add New Category';
  document.getElementById('saveCategoryBtn').textContent = 'Save Category';
  document.getElementById('categoryForm').dataset.editId = '';
  document.getElementById('catImage').value = '';
}

// ==========================================
// CLOSE MODAL
// ==========================================
function closeModal() {
  document.getElementById('categoryModal').style.display = 'none';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryForm').dataset.editId = '';
}

// ==========================================
// LOAD CATEGORIES
// ==========================================
async function loadCategories() {
  const tableBody = document.getElementById('categoriesTableBody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Loading...</td></tr>';

    const res = await fetch(CATEGORY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const categories = await res.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">No categories found.</td></tr>';
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
          <button onclick="confirmDelete('${cat._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading categories:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load categories.
          <br>
          <button onclick="loadCategories()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
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
    console.error('Error loading category for edit:', err);
    alert('❌ Failed to load category details.');
  }
}

// ==========================================
// CONFIRM DELETE
// ==========================================
function confirmDelete(id) {
  deleteCategoryId = id;
  document.getElementById('deleteMessage').textContent = 'Are you sure you want to delete this category?';
  document.getElementById('deleteModal').style.display = 'flex';
}

// ==========================================
// PERFORM DELETE
// ==========================================
async function performDelete(id) {
  try {
    const res = await fetch(`${CATEGORY_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Category deleted successfully!');
      loadCategories();
    } else {
      const err = await res.json();
      alert(`❌ Error: ${err.error || 'Failed to delete category'}`);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ Failed to delete category.');
  }
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();

  // Add Category Link
  const addLink = document.getElementById('addCategoryLink');
  if (addLink) {
    addLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Opening category modal');
      openModal();
    });
  }

  // Close Modal Button
  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('categoryModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }

  // Delete Modal buttons
  const deleteCancel = document.getElementById('deleteCancelBtn');
  if (deleteCancel) {
    deleteCancel.addEventListener('click', function() {
      document.getElementById('deleteModal').style.display = 'none';
      deleteCategoryId = null;
    });
  }

  const deleteConfirm = document.getElementById('deleteConfirmBtn');
  if (deleteConfirm) {
    deleteConfirm.addEventListener('click', function() {
      if (deleteCategoryId) {
        performDelete(deleteCategoryId);
        document.getElementById('deleteModal').style.display = 'none';
        deleteCategoryId = null;
      }
    });
  }

  const deleteModal = document.getElementById('deleteModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        deleteCategoryId = null;
      }
    });
  }

  // ==========================================
  // CATEGORY FORM SUBMIT - FIXED
  // ==========================================
  const form = document.getElementById('categoryForm');
  if (form) {
    // Remove any existing submit listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Stop event from bubbling to products.js
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }
      
      console.log('Category form submitted');
      
      const name = document.getElementById('catName').value.trim();
      const designsCount = document.getElementById('catDesigns').value.trim() || '0 Designs';
      const image = document.getElementById('catImage').value.trim();
      const status = document.getElementById('catStatus').value;
      const editId = this.dataset.editId;

      console.log('Category data:', { name, designsCount, image, status, editId });

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
          alert(editId ? '✅ Category updated successfully!' : '✅ Category added successfully!');
          closeModal();
          loadCategories();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save category.'}`);
        }
      } catch (err) {
        console.error('Save error:', err);
        alert('❌ Server unreachable. Make sure "node server.js" is running!');
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
window.handleImageUpload = handleImageUpload;
window.editCategory = editCategory;
window.confirmDelete = confirmDelete;
window.openModal = openModal;
window.closeModal = closeModal;
window.loadCategories = loadCategories;
