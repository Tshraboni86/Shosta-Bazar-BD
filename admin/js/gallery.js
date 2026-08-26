const API_BASE = 'https://shosta-bazar-bd.onrender.com/api';
const GALLERY_API_URL = `${API_BASE}/gallery`;

// ==========================================
// HANDLE IMAGE UPLOAD
// ==========================================
function handleGalleryImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('galleryPreview');
    preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById('galleryImageUrl').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==========================================
// OPEN MODAL
// ==========================================
function openGalleryModal() {
  document.getElementById('galleryModal').style.display = 'flex';
  document.getElementById('galleryForm').reset();
  document.getElementById('galleryPreview').innerHTML = '<span class="placeholder">No image selected</span>';
  document.getElementById('galleryImageUrl').value = '';
}

// ==========================================
// CLOSE MODAL
// ==========================================
function closeGalleryModal() {
  document.getElementById('galleryModal').style.display = 'none';
  document.getElementById('galleryForm').reset();
}

// ==========================================
// LOAD GALLERY IMAGES
// ==========================================
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  try {
    grid.innerHTML = '<div class="empty-gallery">Loading images...</div>';

    const res = await fetch(GALLERY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const images = await res.json();

    if (!Array.isArray(images) || images.length === 0) {
      grid.innerHTML = `
        <div class="empty-gallery">
          <div style="font-size: 48px; margin-bottom: 10px;">🖼️</div>
          <h3>No gallery images yet</h3>
          <p style="color: #888;">Click "+ ADD IMAGE" to add your first gallery image.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = images.map(img => `
      <div class="gallery-item">
        ${img.imageUrl ? `<img src="${img.imageUrl}" alt="${img.title || 'Gallery image'}" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;\\'>Invalid image</div>'">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;">No image</div>'}
        ${img.title ? `<div class="title">${img.title}</div>` : ''}
        <button class="delete-btn" onclick="deleteGalleryImage('${img._id}')" title="Delete image">×</button>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading gallery:', err);
    grid.innerHTML = `
      <div class="empty-gallery" style="color:#dc3545;">
        ⚠️ Failed to load gallery images.
        <br>
        <button onclick="loadGallery()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
      </div>
    `;
  }
}

// ==========================================
// DELETE GALLERY IMAGE
// ==========================================
async function deleteGalleryImage(id) {
  if (!confirm('Are you sure you want to delete this image?')) return;

  try {
    const res = await fetch(`${GALLERY_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Image deleted successfully!');
      loadGallery();
    } else {
      const err = await res.json();
      alert(`❌ Error: ${err.error || 'Failed to delete image'}`);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ Failed to delete image.');
  }
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  loadGallery();

  // Add Image Button
  const addBtn = document.getElementById('addGalleryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openGalleryModal();
    });
  }

  // Close Modal Button
  const closeBtn = document.getElementById('closeGalleryModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeGalleryModal();
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeGalleryModal();
      }
    });
  }

  // ==========================================
  // GALLERY FORM SUBMIT - FIXED
  // ==========================================
  const form = document.getElementById('galleryForm');
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
      
      console.log('Gallery form submitted');

      const title = document.getElementById('galleryTitle').value.trim();
      const imageUrl = document.getElementById('galleryImageUrl').value.trim();

      if (!imageUrl) {
        alert('Please select an image or enter an image URL.');
        return;
      }

      const submitBtn = document.getElementById('saveGalleryBtn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const response = await fetch(GALLERY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, imageUrl })
        });

        if (response.ok) {
          alert('✅ Gallery image added successfully!');
          closeGalleryModal();
          loadGallery();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save image.'}`);
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
window.handleGalleryImageUpload = handleGalleryImageUpload;
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;
window.deleteGalleryImage = deleteGalleryImage;
window.loadGallery = loadGallery;
