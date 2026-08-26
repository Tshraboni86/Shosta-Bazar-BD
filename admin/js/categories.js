// admin/js/categories.js
// ==========================================
// CATEGORIES API
// ==========================================

// API_BASE is defined in config.js - DO NOT redefine it here!

const CATEGORY_API_URL = `${API_BASE}/categories`;

// Category Dropdown Populator
async function populateCategoryDropdown() {
  const dropdown = document.getElementById('productCategory');
  if (!dropdown) return;

  try {
    const response = await fetch(CATEGORY_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const categories = await response.json();
    
    while (dropdown.options.length > 0) dropdown.remove(0);
    
    const defaultOption = document.createElement('option');
    defaultOption.value = 'General';
    defaultOption.textContent = '-- Select Category --';
    dropdown.appendChild(defaultOption);
    
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
    const fallback = ['General', 'Sarees', 'Lehenga', 'Gowns', 'Bridal', 'Salwar Kameez', 'Accessories'];
    fallback.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      dropdown.appendChild(option);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productCategory')) {
    populateCategoryDropdown();
  }
});
