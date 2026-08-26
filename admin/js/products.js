// admin/js/products.js
// Use Render API
const API_BASE = 'https://shosta-bazar-bd.onrender.com/api';
const PRODUCT_API_URL = `${API_BASE}/products`;

document.addEventListener('DOMContentLoaded', () => {
  // Load products table if present
  loadProducts();

  // Handle Form Submission
  const form = document.getElementById('addProductForm') || document.querySelector('form');

  // Skip product validation for other forms
  if (form) {
    if (form.id === 'categoryForm' || form.id === 'galleryForm') {
      return;
    }
    if (form.dataset && (form.dataset.formType === 'category' || form.dataset.formType === 'gallery')) {
      return;
    }
  }

  if (form) {
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
        console.log('📤 Sending to:', PRODUCT_API_URL);
        console.log('📦 Data:', { name, category, price, oldPrice, image, description });

        const response = await fetch(PRODUCT_API_URL, {
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
          
          loadProducts();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save product.'}`);
        }
      } catch (err) {
        console.error('❌ Save Product Error:', err);
        alert('❌ Cannot connect to backend server. Make sure your Render server is running!');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});

// Fetch & Display Products
async function loadProducts() {
  const tableBody = document.getElementById('productsTableBody') || document.querySelector('tbody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Loading products...</td></tr>';

    const res = await fetch(PRODUCT_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const products = await res.json();

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
    console.error('Error loading products:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load products. Make sure server is running.
          <br>
          <button onclick="loadProducts()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// Delete Product Handler
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${PRODUCT_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Product deleted successfully!');
      loadProducts();
    } else {
      const err = await res.json();
      alert(`❌ Error: ${err.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ Failed to delete product.');
  }
}

// Edit Product Handler
async function editProduct(id) {
  try {
    const res = await fetch(`${PRODUCT_API_URL}/${id}`);
    if (!res.ok) throw new Error('Product not found');
    
    const product = await res.json();
    
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
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const editId = this.dataset.editId;
        if (editId) await updateProduct(editId);
      }, { once: true });
      
      const idDisplay = document.getElementById('productIdDisplay');
      if (idDisplay) {
        idDisplay.textContent = `Editing: ${product.name}`;
        idDisplay.style.display = 'block';
      }
      
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
  } catch (err) {
    console.error('Error loading product for edit:', err);
    alert('❌ Failed to load product details for editing.');
  }
}

// Update Product Handler
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
    const response = await fetch(`${PRODUCT_API_URL}/${id}`, {
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
    console.error('Update Product Error:', err);
    alert('❌ Cannot connect to backend server. Make sure your Render server is running!');
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

// Load products when page loads if table exists
if (document.getElementById('productsTableBody') || document.querySelector('tbody')) {
  loadProducts();
}
