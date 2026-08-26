// admin/js/gallery.js
// ==========================================
// GALLERY API
// ==========================================

// API_BASE comes from config.js
const GALLERY_API_URL = `${API_BASE}/gallery`;

console.log('🔗 GALLERY_API_URL:', GALLERY_API_URL);

// ==========================================
// COMPRESS IMAGE BEFORE UPLOAD
// ==========================================
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// ==========================================
// HANDLE IMAGE UPLOAD WITH COMPRESSION
// ==========================================
async function handleGalleryImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  // Check file size (limit to 5MB before compression)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image is too large! Please choose an image under 5MB.');
    input.value = '';
    return;
  }

  try {
    // Show loading state
    const preview = document.getElementById('galleryPreview');
    preview.innerHTML = '<span class="placeholder">Compressing image...</span>';
    
    // Compress the image
    const compressedDataUrl = await compressImage(file, 800, 800, 0.7);
    
    // Update preview
    preview.innerHTML = `<img src="${compressedDataUrl}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById('galleryImageUrl').value = compressedDataUrl;
    
    console.log('✅ Image compressed and ready for upload');
  } catch (error) {
    console.error('Error compressing image:', error);
    alert('Error processing image. Please try again.');
    input.value = '';
  }
}

// ==========================================
// OPEN MODAL
// ==========================================
function openGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('galleryForm').reset();
    document.getElementById('galleryPreview').innerHTML = '<span class="placeholder">No image selected</span>';
    document.getElementById('galleryImageUrl').value = '';
    document.getElementById('galleryFileInput').value = '';
  }
}

// ==========================================
// CLOSE MODAL
// ==========================================
function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('galleryForm').reset();
  }
}

// ==========================================
// LOAD GALLERY IMAGES
// ==========================================
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  try {
    grid.innerHTML = '<div class="empty-gallery">Loading images...</div>';

    console.log('📡 Fetching from:', GALLERY_API_URL);
    
    const res = await fetch(GALLERY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const images = await res.json();
    console.log('✅ Gallery images loaded:', images.length);

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
    console.error('❌ Error loading gallery:', err);
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
  console.log('🚀 Gallery.js initialized');
  console.log('🔗 GALLERY_API_URL:', GALLERY_API_URL);
  
  loadGallery();

  // Add Image Button
  const addBtn = document.getElementById('addGalleryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('➕ Add Image button clicked');
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

  // Submit Form
  const form = document.getElementById('galleryForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

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
        console.log('📡 Sending to:', GALLERY_API_URL);
        
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
        console.error('❌ Save error:', err);
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
