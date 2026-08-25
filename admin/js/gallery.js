const API_URL = 'http://localhost:5000/api/gallery';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('galleryModal');
  const addBtn = document.querySelector('.btn-add-image') || document.querySelector('button');
  const closeBtn = document.getElementById('closeGalleryModal');
  const cancelBtn = document.getElementById('cancelGalleryModal');
  const form = document.getElementById('uploadGalleryForm');

  // Load existing gallery images from MongoDB
  loadGallery();

  // Open Modal on "+ ADD IMAGE" Click
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-add-image') || e.target.innerText.includes('ADD IMAGE')) {
      e.preventDefault();
      modal.style.display = 'flex';
    }
  });

  // Close Modal functions
  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking outside modal box
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Form Submit Handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('galleryTitle').value.trim();
      const imageUrl = document.getElementById('galleryImageUrl').value.trim();

      if (!imageUrl) {
        alert('Please enter a valid Image URL.');
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, imageUrl })
        });

        if (response.ok) {
          closeModal();
          loadGallery(); // Refresh the grid
        } else {
          const err = await response.json();
          alert(`❌ Error: ${err.error || 'Failed to save image'}`);
        }
      } catch (err) {
        console.error(err);
        alert('❌ Cannot reach backend server. Ensure "node server.js" is running!');
      }
    });
  }
});

// Fetch & Display Images from MongoDB
async function loadGallery() {
  const grid = document.getElementById('galleryGrid') || document.querySelector('.gallery-grid') || document.querySelector('.content-body');
  if (!grid) return;

  try {
    const res = await fetch(API_URL);
    const images = await res.json();

    if (images.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:#777; width:100%;">No gallery images found in MongoDB. Click "+ ADD IMAGE" to upload.</p>';
      return;
    }

    grid.innerHTML = images.map(img => `
      <div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
        <img src="${img.imageUrl}" alt="${img.title || 'Gallery'}" style="width:100%; height:220px; object-fit:cover; display:block;" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:500; font-size:14px; color:#333;">${img.title || 'Untitled'}</span>
          <button onclick="deleteGalleryImage('${img._id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading gallery:', err);
  }
}

// Delete Image Handler
async function deleteGalleryImage(id) {
  if (!confirm('Are you sure you want to delete this gallery image?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) loadGallery();
  } catch (err) {
    console.error(err);
  }
}