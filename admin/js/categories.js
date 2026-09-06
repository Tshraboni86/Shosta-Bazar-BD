// ==========================================
// CATEGORIES - DIRECT API CALLS
// ==========================================

const API_BASE = 'https://shosta-bazar-bd.onrender.com/api';

// Fetch and display categories
async function fetchCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">Loading categories...</td></tr>';
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();
        renderCategories(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">Failed to load categories. <button onclick="fetchCategories()" style="padding:6px 16px; background:#320e17; color:#fff; border:none; border-radius:4px; cursor:pointer;">Retry</button></td></tr>';
    }
}

function renderCategories(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">No categories found</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(cat => {
        const statusClass = cat.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
        const imageUrl = cat.image || 'https://via.placeholder.com/50?text=No+Image';
        return `
            <tr>
                <td><img src="${imageUrl}" alt="${cat.name}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/50?text=No+Image'"></td>
                <td><strong>${cat.name}</strong></td>
                <td>${cat.designsCount || '0 Designs'}</td>
                <td><span class="badge ${statusClass}">${cat.status || 'ACTIVE'}</span></td>
                <td>
                    <button class="btn-admin-secondary" style="padding:4px 12px; font-size:12px; margin-right:4px;" onclick="editCategory('${cat._id}')">✏️ Edit</button>
                    <button class="btn-admin" style="padding:4px 12px; font-size:12px; background:#dc3545;" onclick="confirmDelete('${cat._id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}