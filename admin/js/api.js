// admin/js/api.js
// ==========================================
// API CONFIGURATION - RENDER BACKEND
// ==========================================
const API_BASE = 'https://shosta-bazar-bd.onrender.com/api';

console.log('🔗 API_BASE:', API_BASE);

// ==========================================
// CATEGORY DROPDOWN POPULATOR
// ==========================================
async function populateCategoryDropdown() {
  const dropdown = document.getElementById('productCategory');
  if (!dropdown) {
    console.log('⚠️ Category dropdown not found on this page');
    return;
  }

  try {
    console.log('📡 Fetching categories from:', `${API_BASE}/categories`);
    
    const response = await fetch(`${API_BASE}/categories`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    console.log('✅ Categories loaded:', categories.length);
    
    // Clear existing options
    while (dropdown.options.length > 0) {
      dropdown.remove(0);
    }
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'General';
    defaultOption.textContent = '-- Select Category --';
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
  if (!form) {
    console.log('⚠️ Product form not found on this page');
    return;
  }
  
  // Skip if this is not a product form
  if (form.id === 'categoryForm' || form.id === 'galleryForm') {
    console.log('⏭️ Skipping non-product form');
    return;
  }
  if (form.dataset && (form.dataset.formType === 'category' || form.dataset.formType === 'gallery')) {
    console.log('⏭️ Skipping non-product form (data attribute)');
    return;
  }

  console.log('📝 Setting up product form submit handler');

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
      console.log('📡 Sending product to:', `${API_BASE}/products`);
      
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
// LOAD PRODUCTS TABLE
// ==========================================
async function loadProductsTable() {
  const tableBody = document.getElementById('productsTableBody') || document.querySelector('tbody');
  if (!tableBody) {
    console.log('⚠️ Products table body not found');
    return;
  }

  try {
    console.log('📡 Fetching products from:', `${API_BASE}/products`);
    
    const response = await fetch(`${API_BASE}/products`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json();
    console.log('✅ Products loaded:', products.length);

    if (!Array.isArray(products) || products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">No products found.</td></tr>';
      return;
    }

    tableBody.innerHTML = products.map(prod => `
      <tr>
        <td>
          <div style="width:50px; height:50px; background:#f0f0f0; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            ${prod.image ? `<img src="${prod.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">` : '<span style="color:#ccc; font-size:10px;">No image</span>'}
          </div>
        </td>
        <td style="font-weight:600;">${prod.name}</td>
        <td>${prod.category || 'General'}</td>
        <td>৳${prod.price} ${prod.oldPrice ? `<del style="color:#888; font-size:0.85em; margin-left:4px;">৳${prod.oldPrice}</del>` : ''}</td>
        <td><span style="color:${prod.status === 'ACTIVE' ? '#28a745' : '#dc3545'}; font-weight:bold;">${prod.status || 'ACTIVE'}</span></td>
        <td>
          <button onclick="deleteProduct('${prod._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500; padding:4px 8px;">Delete</button>
          <button onclick="editProduct('${prod._id}')" style="color:#007bff; background:none; border:none; cursor:pointer; font-weight:500; padding:4px 8px;">Edit</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('❌ Error loading products:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load products. Make sure server is running.
          <br>
          <button onclick="loadProductsTable()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// ==========================================
// DELETE PRODUCT
// ==========================================
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('✅ Product deleted successfully!');
      loadProductsTable();
    } else {
      const err = await response.json();
      alert(`❌ Error: ${err.error || 'Failed to delete product'}`);
    }
  } catch (err) {
    console.error('❌ Delete error:', err);
    alert('❌ Failed to delete product.');
  }
}

// ==========================================
// EDIT PRODUCT
// ==========================================
async function editProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    
    const product = await response.json();
    
    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const categoryEl = document.getElementById('productCategory');
    const oldPriceEl = document.getElementById('productOldPrice');
    const imageEl = document.getElementById('productImage');
    const descEl = document.getElementById('productDescription');
    
    if (nameEl) nameEl.value = product.name;
    if (priceEl) priceEl.value = product.price;
    if (categoryEl) categoryEl.value = product.category || 'General';
    if (oldPriceEl) oldPriceEl.value = product.oldPrice || '';
    if (imageEl) imageEl.value = product.image || '';
    if (descEl) descEl.value = product.description || '';
    
    const form = document.getElementById('addProductForm') || document.querySelector('form');
    if (form) {
      const formTitle = document.querySelector('h2, h3');
      if (formTitle) formTitle.textContent = '✏️ Edit Product';
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Update Product';
      
      form.dataset.editId = id;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (err) {
    console.error('❌ Edit error:', err);
    alert('❌ Failed to load product details for editing.');
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================
async function updateProduct(id) {
  const nameEl = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const categoryEl = document.getElementById('productCategory');
  const oldPriceEl = document.getElementById('productOldPrice');
  const imageEl = document.getElementById('productImage');
  const descEl = document.getElementById('productDescription');

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

  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : 'Update';
  if (submitBtn) {
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
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
      alert('✅ Product updated successfully!');
      window.location.href = 'products.html';
    } else {
      const errData = await response.json();
      alert(`❌ Error: ${errData.error || 'Failed to update product.'}`);
    }
  } catch (err) {
    console.error('❌ Update error:', err);
    alert('❌ Cannot connect to backend server. Make sure your Render server is running!');
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 API.js initialized');
  console.log('🔗 API_BASE:', API_BASE);
  
  // Populate category dropdown if it exists
  if (document.getElementById('productCategory')) {
    populateCategoryDropdown();
  }
  
  // Setup product form
  setupProductForm();
  
  // Load products table if it exists
  if (document.getElementById('productsTableBody') || document.querySelector('tbody')) {
    loadProductsTable();
  }
});

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.populateCategoryDropdown = populateCategoryDropdown;
window.loadProductsTable = loadProductsTable;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.updateProduct = updateProduct;
