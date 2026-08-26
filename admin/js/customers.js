const API_BASE = window.API_BASE || 'http://localhost:5000/api';
const CUSTOMERS_API_URL = `${API_BASE}/customers`;
let allCustomers = [];

// ==========================================
// LOAD CUSTOMERS
// ==========================================
async function loadCustomers() {
  const tableBody = document.getElementById('customersTableBody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">Loading customers...</td></tr>';

    const res = await fetch(CUSTOMERS_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    allCustomers = await res.json();
    console.log('✅ Customers loaded:', allCustomers.length);

    if (!Array.isArray(allCustomers) || allCustomers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">No customers found. Customers will appear here after they place orders.</td></tr>';
      updateStats([]);
      return;
    }

    updateStats(allCustomers);

    tableBody.innerHTML = allCustomers.map(customer => {
      const status = customer.status || 'NEW';
      const statusClass = status === 'VIP' ? 'high' : status === 'REGULAR' ? 'medium' : 'low';
      
      return `
        <tr class="customer-row" onclick="viewCustomer('${customer.phone}')">
          <td><strong>${customer.name || 'N/A'}</strong></td>
          <td>${customer.phone}</td>
          <td><span class="badge">${customer.totalOrders || 0}</span></td>
          <td>৳${(customer.totalSpent || 0).toLocaleString()}</td>
          <td>${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
          <td>
            <button onclick="event.stopPropagation(); viewCustomer('${customer.phone}')" style="color:#007bff; background:none; border:none; cursor:pointer;">View</button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading customers:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load customers. Make sure server is running.
          <br>
          <button onclick="loadCustomers()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// ==========================================
// UPDATE STATISTICS
// ==========================================
function updateStats(customers) {
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('totalRevenue').textContent = `৳${totalRevenue.toLocaleString()}`;
  document.getElementById('avgSpent').textContent = `৳${avgSpent.toLocaleString()}`;
}

// ==========================================
// SEARCH CUSTOMERS
// ==========================================
function searchCustomers() {
  const query = document.getElementById('customerSearch').value.toLowerCase().trim();
  const tableBody = document.getElementById('customersTableBody');
  
  if (!query) {
    loadCustomers();
    return;
  }

  const filtered = allCustomers.filter(c => 
    (c.name && c.name.toLowerCase().includes(query)) ||
    (c.phone && c.phone.includes(query)) ||
    (c.email && c.email.toLowerCase().includes(query))
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">No customers found matching your search.</td></tr>';
    return;
  }

  tableBody.innerHTML = filtered.map(customer => {
    const status = customer.status || 'NEW';
    const statusClass = status === 'VIP' ? 'high' : status === 'REGULAR' ? 'medium' : 'low';
    
    return `
      <tr class="customer-row" onclick="viewCustomer('${customer.phone}')">
        <td><strong>${customer.name || 'N/A'}</strong></td>
        <td>${customer.phone}</td>
        <td><span class="badge">${customer.totalOrders || 0}</span></td>
        <td>৳${(customer.totalSpent || 0).toLocaleString()}</td>
        <td>${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td>
          <button onclick="event.stopPropagation(); viewCustomer('${customer.phone}')" style="color:#007bff; background:none; border:none; cursor:pointer;">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// CLEAR SEARCH
// ==========================================
function clearSearch() {
  document.getElementById('customerSearch').value = '';
  loadCustomers();
}

// ==========================================
// VIEW CUSTOMER DETAILS
// ==========================================
async function viewCustomer(phone) {
  try {
    // Get customer info
    const customerRes = await fetch(`${CUSTOMERS_API_URL}/${phone}`);
    if (!customerRes.ok) throw new Error('Customer not found');
    const customer = await customerRes.json();
    
    // Get customer orders
    const ordersRes = await fetch(`${CUSTOMERS_API_URL}/${phone}/orders`);
    if (!ordersRes.ok) throw new Error('No orders found');
    const orders = await ordersRes.json();
    
    document.getElementById('detailCustomerName').textContent = `👤 ${customer.name}`;
    
    const content = document.getElementById('customerDetailContent');
    content.innerHTML = `
      <div class="detail-section">
        <h4>Customer Information</h4>
        <div class="detail-grid">
          <div><span class="label">Name</span><br><span class="value">${customer.name}</span></div>
          <div><span class="label">Phone</span><br><span class="value">${customer.phone}</span></div>
          <div><span class="label">Email</span><br><span class="value">${customer.email || 'N/A'}</span></div>
          <div><span class="label">Address</span><br><span class="value">${customer.address || 'N/A'}</span></div>
          <div><span class="label">Total Orders</span><br><span class="value">${customer.totalOrders || 0}</span></div>
          <div><span class="label">Total Spent</span><br><span class="value">৳${(customer.totalSpent || 0).toLocaleString()}</span></div>
          <div><span class="label">Status</span><br><span class="value"><span class="badge ${customer.status === 'VIP' ? 'high' : customer.status === 'REGULAR' ? 'medium' : 'low'}">${customer.status || 'NEW'}</span></span></div>
          <div><span class="label">Member Since</span><br><span class="value">${customer.firstOrderDate ? new Date(customer.firstOrderDate).toLocaleDateString() : 'N/A'}</span></div>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Order History (${orders.length} orders)</h4>
        ${orders.length === 0 ? '<p style="color:#888;">No orders found.</p>' : `
          <table class="order-history-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td><strong>${order.orderId}</strong></td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.items.length} items</td>
                  <td>৳${order.total.toLocaleString()}</td>
                  <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
    
    document.getElementById('customerDetailModal').style.display = 'flex';
    
  } catch (err) {
    console.error('Error loading customer details:', err);
    alert('❌ Failed to load customer details.');
  }
}

// ==========================================
// CLOSE CUSTOMER DETAIL
// ==========================================
function closeCustomerDetail() {
  document.getElementById('customerDetailModal').style.display = 'none';
}

// ==========================================
// ENTER KEY SEARCH
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('customerSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchCustomers();
      }
    });
  }
  
  const modal = document.getElementById('customerDetailModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeCustomerDetail();
      }
    });
  }
  
  loadCustomers();
});

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.loadCustomers = loadCustomers;
window.searchCustomers = searchCustomers;
window.clearSearch = clearSearch;
window.viewCustomer = viewCustomer;
window.closeCustomerDetail = closeCustomerDetail;
