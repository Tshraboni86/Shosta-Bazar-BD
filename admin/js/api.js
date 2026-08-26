// admin/js/api.js
// Use Render API - NO localhost
const API_BASE = 'https://shosta-bazar-bd.onrender.com/api';

// ==========================================
// CATEGORY DROPDOWN POPULATOR
// ==========================================
async function populateCategoryDropdown() {
  const dropdown = document.getElementById('productCategory');
  if (!dropdown) return;

  try {
    console.log('📡 Fetching categories from:', `${API_BASE}/categories`);
    const response = await fetch(`${API_BASE}/categories`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const categories = await response.json();
    console.log('✅ Categories loaded:', categories.length);
    
    // Clear existing options
    while (dropdown.options.length > 0) {
      dropdown.remove(0);
    }
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'General';
    defaultOption.textContent = 'General';
    dropdown.appendChild(defaultOption);
    
    // Add categories from database
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name || cat;
        option.textContent = cat.name || cat;
        dropdown.appendChild(option);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    // Add fallback options if API fails
    if (dropdown.options.length === 0) {
      const fallback = ['General', 'Sarees', 'Lehenga', 'Gowns', 'Bridal', 'Salwar Kameez', 'Accessories'];
      fallback.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        dropdown.appendChild(option);
      });
    }
  }
}

// ==========================================
// PRODUCT FORM SUBMIT HANDLER
// ==========================================
function setupProductForm() {
  const form = document.getElementById('addProductForm') || document.querySelector('form');
  if (!form) return;
  
  // Skip if this is not a product form
  if (form.id === 'categoryForm' || form.id === 'galleryForm') return;
  if (form.dataset && (form.dataset.formType === 'category' || form.dataset.formType === 'gallery')) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl = document.getElementById('productName') || document.querySelector('input[type="text"]');
    const priceEl = document.getElementById('productPrice') || document.querySelector('input[type="number"]');
    const categoryEl = document.getElementById('productCategory') || document.querySelector('select');
    const oldPriceEl = document.getElementById('productOldPrice');
    const imageEl = document.getElementById('productImage');
    const descEl = document.getElementById('productDescription') || document.querySelector('textarea');

    const name = nameEl ? nameEl.value.trim() : '';
    const price = priceEl ? priceEl.value.trim() : '';
    const category = categoryEl ? categoryEl.value : 'General';
    const oldPrice = oldPriceEl ? oldPriceEl.value.trim() : 0;
    const image = imageEl ? imageEl.value.trim() : '';
    const description = descEl ? descEl.value.trim() : '';

    if (!name || !price) {
      alert('Please fill out Product Name and Price.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Save';
    if (submitBtn) {
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;
    }

    try {
      console.log('📡 Sending to:', `${API_BASE}/products`);
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          oldPrice: Number(oldPrice) || 0,
          image,
          description,
          status: 'ACTIVE'
        })
      });

      if (response.ok) {
        const savedProduct = await response.json();
        console.log('✅ Product saved:', savedProduct);
        alert('✅ Product saved successfully!');
        
        if (form.id === 'addProductForm' || !form.id) {
          form.reset();
          const previewEl = document.getElementById('imagePreview');
          if (previewEl) previewEl.innerHTML = '';
        } else {
          window.location.href = 'products.html';
        }
        
        // Reload products table if visible
        if (typeof loadProducts === 'function') {
          loadProducts();
        }
      } else {
        const errData = await response.json();
        alert(`❌ Error: ${errData.error || 'Failed to save product.'}`);
      }
    } catch (err) {
      console.error('❌ Save error:', err);
      alert('❌ Cannot connect to backend server. Make sure your Render server is running!');
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  });
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 API.js initialized with API_BASE:', API_BASE);
  
  // Populate category dropdown if it exists
  if (document.getElementById('productCategory')) {
    populateCategoryDropdown();
  }
  
  // Setup product form
  setupProductForm();
});

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.populateCategoryDropdown = populateCategoryDropdown;
