// NEW CATEGORIES JS - Completely separate from admin.js conflicts
const CATEGORY_API_URL = 'http://localhost:5000/api/categories';
let deleteCategoryId = null;

// ==========================================
// HANDLE IMAGE UPLOAD
// ==========================================
function handleNewImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const previewContainer = document.getElementById('newImagePreviewContainer');
    previewContainer.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById('newCatImageInput').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==========================================
// OPEN ADD CATEGORY MODAL
// ==========================================
function openNewCategoryModal() {
  console.log('🔵 Opening NEW modal...');
  const modal = document.getElementById('newCategoryModal');
  if (modal) {
    document.getElementById('newModalTitle').textContent = 'Add New Category';
    document.getElementById('newSubmitCategoryBtn').textContent = 'Save Category';
    document.getElementById('newCategoryForm').reset();
    document.getElementById('newCategoryForm').dataset.editId = '';
    document.getElementById('newCatImageInput').value = '';
    document.getElementById('newCatImageFileInput').value = '';
    document.getElementById('newImagePreviewContainer').innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
    modal.style.display = 'flex';
    console.log('✅ New modal opened');
  } else {
    console.error('❌ New modal not found!');
  }
}

// ==========================================
// CLOSE CATEGORY MODAL
// ==========================================
function closeNewCategoryModal() {
  const modal = document.getElementById('newCategoryModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('newCategoryForm').reset();
    document.getElementById('newCategoryForm').dataset.editId = '';
    document.getElementById('newCatImageInput').value = '';
    document.getElementById('newCatImageFileInput').value = '';
    document.getElementById('newImagePreviewContainer').innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
  }
}

// ==========================================
// LOAD CATEGORIES FROM DATABASE
// ==========================================
async function loadNewCategories() {
  const tableBody = document.getElementById('categoriesTableBody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Loading categories...</td></tr>';

    const res = await fetch(CATEGORY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const categories = await res.json();

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
          <button onclick="editNewCategory('${cat._id}')" style="color:#007bff; background:none; border:none; cursor:pointer; font-weight:500; margin-right:10px;">Edit</button>
          <button onclick="confirmNewDelete('${cat._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading categories:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load categories. Make sure server is running.
          <br>
          <button onclick="loadNewCategories()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// ==========================================
// EDIT CATEGORY
// ==========================================
async function editNewCategory(id) {
  try {
    const response = await fetch(`${CATEGORY_API_URL}/${id}`);
    if (!response.ok) throw new Error('Category not found');
    
    const category = await response.json();
    
    document.getElementById('newModalTitle').textContent = 'Edit Category';
    document.getElementById('newSubmitCategoryBtn').textContent = 'Update Category';
    document.getElementById('newCatNameInput').value = category.name || '';
    document.getElementById('newCatDesignsInput').value = category.designsCount || '';
    document.getElementById('newCatImageInput').value = category.image || '';
    document.getElementById('newCatStatusInput').value = category.status || 'ACTIVE';
    document.getElementById('newCategoryForm').dataset.editId = id;
    
    const previewContainer = document.getElementById('newImagePreviewContainer');
    if (category.image) {
      previewContainer.innerHTML = `<img src="${category.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:#aaa; font-size:0.75rem;\\'>Invalid</span>'">`;
    } else {
      previewContainer.innerHTML = '<span style="color:#aaa; font-size:0.75rem;">No image</span>';
    }
    
    document.getElementById('newCategoryModal').style.display = 'flex';
    
  } catch (err) {
    console.error('Error loading category for edit:', err);
    alert('❌ Failed to load category details.');
  }
}

// ==========================================
// CONFIRM DELETE
// ==========================================
function confirmNewDelete(id) {
  deleteCategoryId = id;
  const modal = document.getElementById('newConfirmModal');
  if (modal) {
    document.getElementById('newModalMessage').textContent = 'Are you sure you want to delete this category?';
    modal.style.display = 'flex';
  }
}

// ==========================================
// PERFORM DELETE
// ==========================================
async function performNewDelete(id) {
  try {
    const res = await fetch(`${CATEGORY_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Category deleted successfully!');
      loadNewCategories();
    } else {
      const err = await res.json();
      alert(`❌ Error: ${err.error || 'Failed to delete category'}`);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ Failed to delete category. Make sure server is running.');
  }
}

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  // Load categories
  loadNewCategories();

  // Add Category Button
  const addBtn = document.getElementById('newAddCategoryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🟢 NEW button clicked');
      openNewCategoryModal();
    });
  }

  // Close Modal Button
  const closeBtn = document.getElementById('newCloseModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeNewCategoryModal();
    });
  }

  // Cancel Button in Delete Modal
  const cancelBtn = document.getElementById('newModalCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      document.getElementById('newConfirmModal').style.display = 'none';
      deleteCategoryId = null;
    });
  }

  // Confirm Delete Button
  const confirmBtn = document.getElementById('newModalConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      if (deleteCategoryId) {
        performNewDelete(deleteCategoryId);
        document.getElementById('newConfirmModal').style.display = 'none';
        deleteCategoryId = null;
      }
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('newCategoryModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeNewCategoryModal();
      }
    });
  }

  const deleteModal = document.getElementById('newConfirmModal');
  if (deleteModal) {
    deleteModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        deleteCategoryId = null;
      }
    });
  }

  // Submit Form
  const form = document.getElementById('newCategoryForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name = document.getElementById('newCatNameInput').value.trim();
      const designsCount = document.getElementById('newCatDesignsInput').value.trim() || '0 Designs';
      const image = document.getElementById('newCatImageInput').value.trim();
      const status = document.getElementById('newCatStatusInput').value;
      const editId = this.dataset.editId;

      if (!name) {
        alert('Please enter a category name.');
        return;
      }

      const submitBtn = document.getElementById('newSubmitCategoryBtn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const url = editId ? `${CATEGORY_API_URL}/${editId}` : CATEGORY_API_URL;
        const method = editId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            designsCount, 
            image, 
            status 
          })
        });

        if (response.ok) {
          alert(editId ? '✅ Category updated successfully!' : '✅ Category added successfully!');
          closeNewCategoryModal();
          loadNewCategories();
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
window.openNewCategoryModal = openNewCategoryModal;
window.closeNewCategoryModal = closeNewCategoryModal;
window.editNewCategory = editNewCategory;
window.confirmNewDelete = confirmNewDelete;
window.loadNewCategories = loadNewCategories;
window.handleNewImageUpload = handleNewImageUpload;