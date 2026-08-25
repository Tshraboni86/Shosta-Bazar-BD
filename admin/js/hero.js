const HERO_API_URL = 'http://localhost:5000/api/slides';

document.addEventListener('DOMContentLoaded', () => {
  loadSlides();

  // Handle Add Slide Form Submission
  const slideForm = document.getElementById('addSlideForm');
  if (slideForm) {
    slideForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const order = document.getElementById('slideOrder')?.value || 1;
      const title = document.getElementById('slideTitle')?.value.trim();
      const subtitle = document.getElementById('slideSubtitle')?.value.trim();
      const buttonText = document.getElementById('slideButtonText')?.value.trim() || 'Shop Now';
      const buttonLink = document.getElementById('slideButtonLink')?.value.trim() || '/shop';
      const image = document.getElementById('slideImage')?.value.trim() || '';

      if (!title) {
        alert('Please enter a Slide Title.');
        return;
      }

      try {
        const response = await fetch(HERO_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: Number(order),
            title,
            subtitle,
            buttonText,
            buttonLink,
            image,
            status: 'ACTIVE'
          })
        });

        if (response.ok) {
          alert('✅ Hero slide saved successfully!');
          document.getElementById('addSlideModal').style.display = 'none';
          slideForm.reset();
          loadSlides();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save slide.'}`);
        }
      } catch (err) {
        console.error('Save slide error:', err);
        alert('❌ Server offline. Run "node server.js".');
      }
    });
  }
});

// Universal event delegation for Modal display
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('#addSlideBtn') || (e.target.innerText && e.target.innerText.includes('ADD SLIDE'));
  const modal = document.getElementById('addSlideModal');
  const closeBtn = e.target.closest('#closeSlideModalBtn');

  if (addBtn && modal) {
    e.preventDefault();
    modal.style.display = 'flex';
  }

  if ((closeBtn || e.target === modal) && modal) {
    modal.style.display = 'none';
    document.getElementById('addSlideForm')?.reset();
  }
});

// Fetch & Display Slides
async function loadSlides() {
  const tableBody = document.getElementById('heroTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(HERO_API_URL);
    const slides = await res.json();

    if (!Array.isArray(slides) || slides.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hero slides found in database. Click "+ ADD SLIDE" to create one.</td></tr>';
      return;
    }

    tableBody.innerHTML = slides.map(item => `
      <tr>
        <td style="font-weight:600;">${item.order || 1}</td>
        <td style="font-weight:600;">${item.title}</td>
        <td>${item.subtitle || '-'}</td>
        <td>${item.buttonText || 'Shop Now'}</td>
        <td><span style="background:#d4edda; color:#155724; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.85rem;">${item.status || 'ACTIVE'}</span></td>
        <td>
          <button onclick="deleteSlide('${item._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading slides:', err);
  }
}

// Delete Slide Handler
async function deleteSlide(id) {
  if (!confirm('Are you sure you want to delete this hero slide?')) return;

  try {
    const res = await fetch(`${HERO_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) loadSlides();
  } catch (err) {
    console.error('Delete error:', err);
  }
}