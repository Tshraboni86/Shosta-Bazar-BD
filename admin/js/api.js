const API_URL = 'http://localhost:5000/api';

// ==========================================
// 1. INITIALIZATION ON PAGE LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  populateCategoryDropdown();
});

// ==========================================
// 2. CATEGORIES LOGIC
// ==========================================
async function loadCategories() {
  const tableBody = document.getElementById('categoriesTableBody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/categories`);
    const categories = await response.json();

    if (!categories || categories.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px;">
            No categories found in MongoDB. Click <strong>+ ADD CATEGORY</strong> to create one.
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = categories.map(cat => `
      <tr>
        <td><div style="width:30px; height:30px; background:#c5a059; border-radius:4px;"></div></td>
        <td><strong>${cat.name}</strong></td>
        <td>0 Designs</td>
        <td><span style="background:#e6f4ea; color:#137333; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">ACTIVE</span></td>
        <td>
          <button onclick="deleteCategory('${cat._id}')" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Fetch categories error:', err);
  }
}

async function deleteCategory(id) {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      loadCategories();
      populateCategoryDropdown();
    } catch (err) {
      alert('Failed to delete category.');
    }
  }
}

// Global click delegation for Category modal / prompt trigger
document.addEventListener('click', async (e) => {
  const target = e.target.closest('button, a');
  if (target && (target.id === 'addCategoryBtn' || target.textContent.includes('ADD CATEGORY'))) {
    e.preventDefault();
    const categoryName = prompt('Enter new category name:');
    if (!categoryName || categoryName.trim() === '') return;

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName.trim() })
      });

      if (response.ok) {
        alert('✅ Category saved to Database!');
        loadCategories();
        populateCategoryDropdown();
      } else {
        alert('❌ Failed to save category to database.');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      alert('❌ Cannot connect to backend server!');
    }
  }
});

// ==========================================
// 3. PRODUCTS LOGIC
// ==========================================

// Populate Category <select> dropdown in product form dynamically from MongoDB
async function populateCategoryDropdown() {
  const categorySelect = document.getElementById('productCategory') || document.querySelector('select[name="category"]');
  if (!categorySelect) return;

  try {
    const res = await fetch(`${API_URL}/categories`);
    const categories = await res.json();

    categorySelect.innerHTML = '<option value="">Select Category</option>' + 
      categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
  } catch (err) {
    console.error('Error fetching categories for dropdown:', err);
  }
}

// Load and display products from MongoDB into table
async function loadProducts() {
  const tableBody = document.getElementById('productsTableBody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();

    if (!products || products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px;">
            No products found in database. Add a product to get started.
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = products.map(prod => `
      <tr>
        <td>
          <img src="${prod.image || 'https://via.placeholder.com/40'}" 
               alt="${prod.name}" 
               style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
        </td>
        <td><strong>${prod.name}</strong></td>
        <td>${prod.category || 'N/A'}</td>
        <td>৳${prod.price}</td>
        <td>
          <button onclick="deleteProduct('${prod._id}')" 
                  style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// Delete product from MongoDB
async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  }
}

// High-priority Form Listener (Captures submit event before mock JS handles it)
document.addEventListener('submit', async (e) => {
  const form = e.target;

  // Intercept form submission if form contains product fields or has addProductForm ID
  if (form && (form.id === 'addProductForm' || form.querySelector('#productName') || form.action.includes('product'))) {
    e.preventDefault();
    e.stopImmediatePropagation(); // Stops mock-data.js or admin.js from firing

    // Utility function to extract value from inputs dynamically
    const getValue = (selector) => {
      const el = form.querySelector(selector);
      return el ? el.value.trim() : '';
    };

    const productData = {
      name: getValue('#productName') || getValue('input[name="name"]') || getValue('input[placeholder*="Name"]'),
      price: Number(getValue('#productPrice') || getValue('input[name="price"]') || getValue('input[placeholder*="Price"]')),
      category: getValue('#productCategory') || getValue('select[name="category"]') || getValue('select'),
      image: getValue('#productImage') || getValue('input[name="image"]') || getValue('input[type="text"][placeholder*="Image"]'),
      description: getValue('#productDescription') || getValue('textarea')
    };

    if (!productData.name || !productData.price) {
      alert('Please fill out Product Name and Price.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        alert('✅ Product saved directly to MongoDB!');
        form.reset();
        loadProducts();
      } else {
        const errorData = await response.json();
        alert(`❌ Database Error: ${errorData.error || 'Failed to save product.'}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Cannot connect to backend server. Make sure "node server.js" is running!');
    }
  }
}, true); // Captured phase active
// Dynamic Form Listener for Add Product
document.addEventListener('submit', async (e) => {
  const form = e.target;
  
  // Intercept if form contains a submit button or is on product-add page
  if (form && (form.id === 'addProductForm' || form.querySelector('button[type="submit"]') || form.querySelector('#productName'))) {
    e.preventDefault();

    // Helper function to search input fields by ID, Name, or Placeholder
    const getInputValue = (query) => {
      const el = form.querySelector(query);
      return el ? el.value.trim() : '';
    };

    // Grab field values dynamically using multiple selector fallbacks
    const name = getInputValue('#productName') || 
                 getInputValue('[name="name"]') || 
                 getInputValue('[name="title"]') || 
                 getInputValue('input[placeholder*="Name"]') || 
                 getInputValue('input[type="text"]');

    const priceVal = getInputValue('#productPrice') || 
                     getInputValue('[name="price"]') || 
                     getInputValue('input[placeholder*="Price"]');

    const category = getInputValue('#productCategory') || 
                     getInputValue('[name="category"]') || 
                     getInputValue('select');

    const image = getInputValue('#productImage') || 
                  getInputValue('[name="image"]') || 
                  getInputValue('input[type="text"][placeholder*="Image"]') || '';

    const description = getInputValue('#productDescription') || 
                        getInputValue('[name="description"]') || 
                        getInputValue('textarea') || '';

    const price = Number(priceVal);

    // Validation check
    if (!name || isNaN(price) || price <= 0) {
      alert('Please fill out Product Name and a valid Price.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          price, 
          category: category || 'General', 
          image, 
          description 
        })
      });

      if (response.ok) {
        alert('✅ Product saved directly to MongoDB!');
        window.location.href = 'products.html'; // Redirect to products table
      } else {
        const err = await response.json();
        alert(`❌ Error: ${err.error || 'Failed to save product'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('❌ Cannot reach backend server. Ensure "node server.js" is running!');
    }
  }
});